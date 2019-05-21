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
    .listen(8080);
    console.log('listening on port 8080');
