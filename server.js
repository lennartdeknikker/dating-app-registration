var express = require('express');

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
    .get('*', function(req, res){
        res.send('The requested page does not exist.', 404);
    })
    .listen(8080);
    console.log('listening on port 8080');
