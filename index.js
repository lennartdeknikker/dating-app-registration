var express = require('express');
var bodyParser = require('body-parser');

express()
    .use(express.static('static'))
    .use(bodyParser.urlencoded({extended: true}))
    .set()
    ;