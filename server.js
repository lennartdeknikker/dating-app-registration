// required modules
var express = require('express');
var slug = require('slug');
var bodyParser = require('body-parser');
var request = require('request');

require('dotenv').config();

// mongoDB setup
const mongo = require('mongodb');
var db = null;
const url = 'mongodb+srv://' + process.env.DB_USER + ':' + process.env.DB_PASS + '@profiles-ttwoc.mongodb.net/test?retryWrites=true';

mongo.MongoClient.connect(url, {
    useNewUrlParser: true
}, function (err, client) {
    if (err) {
        throw err;
    }
    db = client.db(process.env.DB_NAME);
});

// global variables
var userAvailability = true;

// express setup
express()
    .set('view engine', 'ejs')
    .use(express.static(__dirname + '/static'))
    .use(bodyParser.json())
    .use(bodyParser.urlencoded({
        extended: true
    }))
    .get('/', home)
    .get('/profile', profile)
    .get('/information', information)
    .post('/information', save)
    .get('/available', available)
    .get('*', pageNotFound)
    .listen(8080, function () {
        console.log('listening on port 8080');
    });

// functions for rendering pages
function home(req, res) {
    userAvailability = false;
    res.render('pages/index', {
        userAvailability: userAvailability
    });
}

function profile(req, res) {
    var headerText = "My Profile";
    var backLink = "/";
    res.render('pages/profile', {
        headerText: headerText,
        backLink: backLink
    });
}

function information(req, res, next) {
    var dogBreeds = [""];
    var catBreeds = [""];

    // request dog breeds from an external API and save them as an array in 'dogBreeds'.
    request('https://dog.ceo/api/breeds/list/all', function (error, response, body) {
        if (!error && response.statusCode == 200) {
            console.log('statusCode:', response && response.statusCode);
            var dogBreedsJSON = JSON.parse(body).message;
            for (var breed in dogBreedsJSON) {
                dogBreeds.push(breed);
            }
            // then call getCats()
            getCats();
        } else {
            console.log('error', error, response && response.statusCode);
        }
    });

    // request cat breeds from an external API and save them as an array in 'catBreeds'.
    function getCats() {
        request('https://api.thecatapi.com/v1/breeds', {
                'x-api-key': process.env.API_KEY_CATBREEDS
            },
            function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    var catBreedsJSON = JSON.parse(body);
                    for (var breed of catBreedsJSON) {
                        catBreeds.push(breed.name.replace(/\s/g, "-"));
                    }
                    console.log(catBreeds);
                    // then call getInformation()
                    getInformation();
                } else {
                    console.log('error', error, response && response.statusCode);
                }
            });
    }

    // get User Info from MongoDB
    function getInformation() {
        db.collection('information').find().toArray(done);

        // then render the page
        function done(err, data) {
            if (err) {
                next(err);
            } else {
                res.render('pages/information', {
                    headerText: "Change / Add Information",
                    backLink: "/profile",
                    data: data[0],
                    dogBreeds: dogBreeds,
                    catBreeds: catBreeds
                });
            }
        }
    }

}

function save(req, res, next) {
    var savedData = req.body;
    if (savedData.animal === "dog") {
        savedData.catBreed = "";
    } else {
        savedData.dogBreed = "";
    }

    db.collection('information').updateOne({
        name: savedData.name
    }, {
        $set: savedData
    }, done);

    function done(err, data) {
        if (err) {
            next(err);
        } else {
            console.log(savedData);
            res.redirect('/information');
        }
    }
}

function available(req, res) {
    userAvailability = true;
    res.render('pages/index', {
        userAvailability: userAvailability
    });
}

function pageNotFound(req, res) {
    res.status(404).send('The requested page does not exist.');
}