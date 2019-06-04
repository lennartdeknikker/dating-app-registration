// REQUIRED MODULES
const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const multer = require('multer');
const session = require('express-session');

// GLOBAL VARIABLES
const userId = "5cf6bef51c9d440000db960c";

// MULTER SETUP (for uploading images)
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

// MONGODB SETUP
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

/* AUTHENTICATION MIDDLEWARE
source: https://www.codexpedia.com/node-js/a-very-basic-session-auth-in-node-js-with-express-js/ */
function auth(req, res, next) {
    if (req.session && req.session.user === "lennartdeknikker" && req.session.admin)
        return next();
    else
        res.redirect('/login');
};

/* function auth(req, res, next) {
    console.log(req.session.user);
    db.collection('login').find({
        username: req.session.user
    }).toArray(done);
    function done(err, data) {
        console.log(data);
        if (err) {
            next(err);
        } else if (req.session && req.session.user === data[0].username && req.session.admin) {
            return next();
        } else {
        res.redirect('/login');
        }
}
} */

// EXPRESS ROUTING SETUP
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
        console.log('listening on port: ' + process.env.PORT);
    });


// GET ROUTE FUNCTIONS

// Login
function loginPage(req, res) {

    res.render('pages/login', {
        headerText: "Log In"
    });
}

// Home
function home(req, res) {
    res.render('pages/index', {
        userAvailability: false
    });
}

// Available
function available(req, res) {
    res.render('pages/index', {
        userAvailability: true
    });
}

// Profile
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

// Information
function information(req, res, next) {
    let dogBreeds = [""];
    let catBreeds = [""];

    // Request dog breeds from an external API and save them as an array in 'dogBreeds'.
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

    // Request cat breeds from an external API and save them as an array in 'catBreeds'.
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

    // Get User Info from MongoDB,
    function getInformation() {
        db.collection('information').find({
            _id: new mongo.ObjectID(userId)
        }).toArray(done);

        // then render the page.
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

// Picture
function picture(req, res) {
    db.collection('information').find({
        _id: new mongo.ObjectID(userId)
    }).toArray(done);

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

// Settings
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


// 404
function pageNotFound(req, res) {
    res.status(404).render('pages/404');
}

// POST ROUTE FUNCTIONS

// Login
function login(req, res) {
    db.collection('login').find({
        username: req.body.username
    }).toArray(done);

    function done(err, data) {
        if (!req.body.username || !req.body.password) {
            res.send('login failed');
        } else if (err) {
            next(err);
        } else if (data[0].password === req.body.password) {
            req.session.user = req.body.username;
            req.session.information_id = data[0].information_id;
            req.session.admin = true;
            res.redirect('/');
        }
    }
}

// Logout
function logout(req, res) {
    req.session.destroy();
    res.redirect('/login');
}

// Save information
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

// Save profile picture
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

// DELETE ROUTE FUNCTIONS

// Remove profile from database.
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