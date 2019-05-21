var express = require('express');
var bodyParser = require('body-parser');
var ejs = require('ejs');

var data = [];

express()
    .set('view engine', 'ejs')
    .use(express.static(__dirname + '/static'))
    .get('/', function(req, res) {
        res.render('pages/index');
    })
    .get('/profile', function(req, res) {
        res.render('pages/profile');
    })
    .get('/information', function(req, res) {
        res.render('pages/information');
    })
    .get('/available', function(req, res) {
        res.render('pages/available');
    })
    .listen(8080);
    console.log('listening on port 8080');
