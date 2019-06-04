// required modules
const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const multer = require('multer');
const session = require('express-session');

const userId = "5cf6bef51c9d440000db960c";
let userAvailability = true;

// Multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './static/upload');
    },
    filename: function (req, file, cb) {
        cb(null, userId + '.jpg');
    }
});
const upload = multer({
    storage: storage
});

require('dotenv').config();

// mongoDB setup
const mongo = require('mongodb');
let db = null;
const url = 'mongodb+srv://' + process.env.DB_USER + ':' + process.env.DB_PASS + '@profiles-ttwoc.mongodb.net/test?retryWrites=true';

mongo.MongoClient.connect(url, {
    useNewUrlParser: true
}, function (err, client) {
    if (err) {
        throw err;
    }
    db = client.db(process.env.DB_NAME);
});

/* Authentication and Authorization Middleware
source: https://www.codexpedia.com/node-js/a-very-basic-session-auth-in-node-js-with-express-js/ */
var auth = function (req, res, next) {
    if (req.session && req.session.user === "len" && req.session.admin)
        return next();
    else
    res.redirect('/login');
};

// express setup
express()
    .set('view engine', 'ejs')
    .use(express.static(__dirname + '/static'))
    .use(bodyParser.json())
    .use(bodyParser.urlencoded({
        extended: true
    }))
    .use(session({
        secret: '2C44-4D44-WppQ38S',
        resave: true,
        saveUninitialized: true
    }))
    .get('/', auth, home)
    .get('/login', loginPage)
    .post('/login', login)
    .get('/logout', logout)
    .get('/profile', auth, profile)
    .get('/information', auth, information)
    .post('/information', auth, saveInformation)
    .get('/picture', auth, picture)
    .post('/picture', auth, upload.single('profilePicture'), savePicture)
    .get('/settings', auth, settings)
    .delete('/settings/:id', auth, remove)
    .get('/available', auth, available)
    .get('*', pageNotFound)
    .listen(process.env.PORT, function () {
        console.log('listening on port 8080');
    });


// functions for rendering pages
function loginPage(req, res) {

    res.render('pages/login', {
        headerText: "Log In"
    });
}

function login(req, res) {

    if (!req.body.username || !req.body.password) {
        res.send('login failed');
    } else if (req.body.username === "len" && req.body.password === "lennart") {
        req.session.user = "len";
        req.session.admin = true;
        res.redirect('/');
    }
}

function logout(req, res) {
    req.session.destroy();
    res.redirect('/login');
}

function home(req, res) {
    userAvailability = false;
    res.render('pages/index', {
        userAvailability: userAvailability
    });
}

function profile(req, res) {
    const headerText = "My Profile";
    const backLink = "/";
    db.collection('information').find({
        _id: new mongo.ObjectID(userId)
    }).toArray(done);

    function done(err, data) {
        if (err) {
            next(err);
        } else {
            res.render('pages/profile', {
                headerText: headerText,
                backLink: backLink,
                profilePictureUrl: data[0].profilePictureUrl,
                aboutText: data[0].introduction
            });
        }
    }
}

function information(req, res, next) {
    let dogBreeds = [""];
    let catBreeds = [""];

    // request dog breeds from an external API and save them as an array in 'dogBreeds'.
    request('https://dog.ceo/api/breeds/list/all', function (error, response, body) {
        if (!error && response.statusCode == 200) {
            console.log('statusCode external Dog API request:', response && response.statusCode);
            let dogBreedsJSON = JSON.parse(body).message;
            for (let breed in dogBreedsJSON) {
                dogBreeds.push(breed);
            }
            // then call getCats()
            getCats();
        } else {
            console.log('error', error, response && response.statusCode);
            dogBreeds = null;
            getCats();
        }
    });

    // request cat breeds from an external API and save them as an array in 'catBreeds'.
    function getCats() {
        request('https://api.thecatapi.com/v1/breeds', {
                'x-api-key': process.env.API_KEY_CATBREEDS
            },
            function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    console.log('statusCode external Cat API request:', response && response.statusCode);
                    let catBreedsJSON = JSON.parse(body);
                    for (let breed of catBreedsJSON) {
                        catBreeds.push(breed.name);
                    }
                    // then call getInformation()
                    getInformation();
                } else {
                    console.log('error', error, response && response.statusCode);
                    catBreeds = null;
                    getInformation();
                }
            });
    }

    // get User Info from MongoDB
    function getInformation() {
        db.collection('information').find({
            _id: new mongo.ObjectID(userId)
        }).toArray(done);

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

function saveInformation(req, res, next) {
    let savedData = req.body;
    if (savedData.animal === "dog") {
        savedData.catBreed = "";
    } else {
        savedData.dogBreed = "";
    }

    db.collection('information').updateOne({
        _id: new mongo.ObjectID(userId)
    }, {
        $set: savedData
    }, done);

    function done(err, data) {
        if (err) {
            next(err);
        } else {
            res.redirect('/profile');
        }
    }
}

function picture(req, res) {
    db.collection('information').find({
        _id: new mongo.ObjectID(userId)
    }).toArray(done);

    // then render the page
    function done(err, data) {
        if (err) {
            next(err);
        } else {
            res.render('pages/picture', {
                headerText: "Change picture",
                backLink: "/profile",
                profilePictureUrl: data[0].profilePictureUrl
            });
        }
    }
}

function savePicture(req, res) {
    db.collection('information').updateOne({
        _id: new mongo.ObjectID(userId)
    }, {
        $set: {
            profilePictureUrl: req.file ? req.file.filename : null
        }
    }, done);

    function done(err, data) {
        if (err) {
            next(err);
        } else {
            res.redirect('/profile');
        }
    }
}

function settings(req, res) {
    const headerText = "Settings";
    const backLink = "/profile";
    db.collection('information').find({
        _id: new mongo.ObjectID(userId)
    }).toArray(done);

    function done(err, data) {
        if (err) {
            next(err);
        } else {
            res.render('pages/settings', {
                headerText: headerText,
                backLink: backLink,
                id: data[0]._id
            });
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

function remove(req, res) {
    var id = req.params.id;
    console.log(id);
    db.collection('information').deleteOne({
        _id: new mongo.ObjectID(id)
    }, done);

    function done(err, data) {
        if (err) {
            next(err);
        } else {
            res.json({
                status: 'ok'
            });
        }
    }
}