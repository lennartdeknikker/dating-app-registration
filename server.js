var express = require('express');

var userAvailability = true;

express()
    .set('view engine', 'ejs')
    .use(express.static(__dirname + '/static'))
    .get('/', home)
    .get('/profile', profile)
    .get('/information', information)
    .get('/available', available)
    .get('*', pageNotFound)
    .listen(8080);
    console.log('listening on port 8080');


    function home(req, res) {
        userAvailability = true;
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

    function available(req, res) {
        userAvailability = false;
        res.render('pages/available', {
            userAvailability: userAvailability
        });
    }

    function pageNotFound(req, res){
        res.send('The requested page does not exist.', 404);
    }