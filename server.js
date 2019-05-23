// required modules
var express = require('express');
var slug = require('slug');
var bodyParser = require('body-parser');
var request = require('request');
var mongo = require('mongodb');

require('dotenv').config();

// global variables
var db = null;
var url = 'mongodb://' + process.env.DB_HOST + ':' + process.env.DB_PORT;

var userAvailability = true;
var idCounter = 0;
var data = [{
    id: 'lennart',
    name: 'Lennart de Knikker',
    birthday: '29/08/1994',
    introduction: 'In my experience conversations in dating apps are really superficial. It’s too easy to forget to answer for a day or two or just lose interest when someone doesn’t answer right away. Because of that it’s not always easy to go from starting a conversation to planning a date, but there’s even more obstacles. People don’t always live in the same city and they’re not always available.',
    music: 'Love it',
    movies: 'Neutral',
    books: 'Like it',
    animal: 'dog',
    dogBreed: 'Golden Retriever',
    catBreed: undefined
}];

// mongodb setup
/*
mongo.MongoClient.connect(url, function (err, client) {
    if (err) throw err;
    db = client.db(process.env.DB_NAME);
});

function personal_details(req, res, next) {
    db.collection('details').find().toArray(done);

    function done(err, data) {
        if (err) {
            next(err);
        } else {
            res.render('list.ejs', {
                data: data
            });
        }
    }
}

function add(req, res, next) {
    var name = slug(req.body.name);
    data[0] = req.body;
    data[0].id = String(idCounter++).padStart(4, "0");
    if (data[0].animal === "dog") {
        data[0].catBreed = "";
    } else {
        data[0].dogBreed = "";
    }
    db.collection('details').insertOne(data, done);

    function done(err, data) {
        if (err) {
            next(err);
        } else {
            res.redirect('/information');
        }
    }
}
*/

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

function information(req, res) {
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
    res.render('pages/information', {
        headerText: headerText,
        backLink: backLink,
        data: data,
        dogBreeds: dogBreeds,
        catBreeds: catBreeds
    });
}

function save(req, res) {
    var name = slug(req.body.name);
    data[0] = req.body;
    data[0].id = String(idCounter++).padStart(4, "0");
    if (data[0].animal === "dog") {
        data[0].catBreed = "";
    } else {
        data[0].dogBreed = "";
    }
    console.log(data[0]);
    res.redirect('/profile');
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