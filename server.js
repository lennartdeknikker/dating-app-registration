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
    /* .post('/information', save) */
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
    db.collection('information').find().toArray(done);

    function done(err, data) {
        if (err) {
            next(err);
        } else {
            res.render('pages/information', {
                headerText: headerText,
                backLink: backLink,
                data: data[0],
                dogBreeds: dogBreeds,
                catBreeds: catBreeds
            });
        }
    }

    var headerText = "Change / Add Information";
    var backLink = "/profile";

    // request dog breeds from an external API and save them as an array in 'dogBreeds'.
    var dogBreeds = [];
    request('https://dog.ceo/api/breeds/list/all', function (error, response, body) {
        if (!error && response.statusCode == 200) {
            console.log('statusCode:', response && response.statusCode);
            var dogBreedsJSON = JSON.parse(body).message;
            for (var breed in dogBreedsJSON) {
                dogBreeds.push(breed);
            }
        } else {
            console.log('error', error, response && response.statusCode);
        }
    });

    // request cat breeds from an external API and save them as an array in 'catBreeds'.
    var catBreeds = [];
    request('https://api.thecatapi.com/v1/breeds', {
            'x-api-key': process.env.API_KEY_CATBREEDS
        },
        function (error, response, body) {
            if (!error && response.statusCode == 200) {
                var catBreedsJSON = JSON.parse(body);
                for (var breed of catBreedsJSON) {
                    catBreeds.push(breed.name);
                }
            } else {
                console.log('error', error, response && response.statusCode);
            }
        });
}
/*
function save(req, res) {
    var name = slug(req.body.name);
    fake_data = req.body;
    if (fake_data.animal === "dog") {
        fake_data.catBreed = "";
    } else {
        fake_data.dogBreed = "";
    }

    client.connect(err => {
        const collection = client.db("Users").collection("information").find({});
        try {
            console.log(fake_data);
            collection.updateOne({
                    name: "Lennart de Knikker"
                }, {
                    $set: {
                        "name": "String(req.body.name)"
                    }  JSON.stringify(fake_data)  ,
                })
                .then(function (result) {
                    console.log(result);
                });
        } catch (e) {
            console.log(e);
        }
        client.close();
    });

    res.redirect('/profile');
}
*/

function available(req, res) {
    userAvailability = true;
    res.render('pages/index', {
        userAvailability: userAvailability
    });
}

function pageNotFound(req, res) {
    res.status(404).send('The requested page does not exist.');
}