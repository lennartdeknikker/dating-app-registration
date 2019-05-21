var express = require('express');
var slug = require('slug');
var bodyParser = require('body-parser');

var userAvailability = true;
var data = [{
    id: 'lennart',
    name: 'Lennart de Knikker',
    birthday: '29/08/1994',
    introduction: 'In my experience conversations in dating apps are really superficial. It’s too easy to forget to answer for a day or two or just lose interest when someone doesn’t answer right away. Because of that it’s not always easy to go from starting a conversation to planning a date, but there’s even more obstacles. People don’t always live in the same city and they’re not always available.',
    music: 'Love it',
    movies: 'Neutral',
    books: 'Like it',
    animal: 'Cat',
    dogBreed: 'Golden Retriever',
    catBreed: undefined
}];
var idCounter = 0;

express()
    .set('view engine', 'ejs')
    .use(express.static(__dirname + '/static'))
    .use(bodyParser.urlencoded({
        extended: true
    }))
    .get('/', home)
    .get('/profile', profile)
    .get('/information', information)
    .post('/information', change)
    .get('/available', available)
    .get('*', pageNotFound)
    .listen(8080);
console.log('listening on port 8080');


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
    res.render('pages/information', {
        headerText: headerText,
        backLink: backLink,
        data: data
    });
}

function change(req, res) {
    var name = slug(req.body.name);
    data[0] = req.body;
    data[0].id = idCounter++;
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