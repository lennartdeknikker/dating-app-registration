var express = require('express');
var slug = require('slug');
var bodyParser = require('body-parser');

var userAvailability = true;
var data = [];

express()
    .set('view engine', 'ejs')
    .use(express.static(__dirname + '/static'))
    .use(bodyParser.urlencoded({extended: true}))
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
            backLink: backLink
        });
    }

    function change(req, res) {
        var name = slug(req.body.name);
        data.push({
            id: name.toLowerCase,
            name: name,
            birthday: req.body.birthday,
            introduction: req.body.introduction,
            music: req.body.music,
            movies: req.body.movies,
            books: req.body.books,
            animal: req.body.animal,
            dog_breed: req.body.dogBreed,
            catBreed: req.body.catBreed
        });
        console.log(data[0]);
        res.redirect('/profile');
    }

    function available(req, res) {
        userAvailability = true;
        res.render('pages/index', {
            userAvailability: userAvailability
        });
    }

    function pageNotFound(req, res){
        res.send('The requested page does not exist.', 404);
    }