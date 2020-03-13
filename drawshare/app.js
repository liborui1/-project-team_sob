const path = require('path');
const session = require('express-session');
const crypto = require('crypto');
const cookie = require('cookie');
const express = require('express');

const { ExpressPeerServer } = require('peer');

const app = express();
let multer  = require('multer');
let fs  = require('fs');
let upload = multer({ dest: path.join(__dirname, 'uploads')});
let bodyParser = require('body-parser');
let Datastore = require('nedb');

const options = {
    debug: true,
    path: '/peerjs'
}
 
let imageDB = new Datastore({ filename: './db/images.db', autoload: true, timestampData : true });
let allPeers = [];


app.use(bodyParser.urlencoded({ extended: false }));

// image object
let Image = (function() {
    return function item(image) {
        this.groupName  = image.groupName ;
        this.imageURI = image.imageURI;
    };
}());


app.use(bodyParser.json());
app.use(express.static('static'));

let users = new Datastore({ filename: 'db/users.db', autoload: true, timestampData : true });

app.use(session({
    secret: 'peasandcarrots',  ////change this -----------------------------------------------------------
    resave: false,
    saveUninitialized: true,
}));
 
app.use(function (req, res, next){
    req.user = ('user' in req.session)? req.session.user : null;
    let username = (req.user)? req.user._id : '';
    req.username = username;
    res.setHeader('Set-Cookie', cookie.serialize('username', username, {
          path : '/', 
          maxAge: 60 * 60 * 24 * 7 // 1 week in number of seconds
    }));
    console.log("HTTP request", req.method, req.url, req.body);
    next();
});

app.post('/signup/', function (req, res, next) {
    let username = req.body.username;
    let password = req.body.password;
    users.findOne({_id: username}, function(err, user){
        if (err) return res.status(500).end(err);
        if (user) return res.status(409).end("username " + username + " already exists");
        let salt = crypto.randomBytes(16).toString('base64');
        let hash = crypto.createHmac('sha512', salt);
        hash.update(password);
        let saltedHash = hash.digest('base64');
        users.update({_id: username},{_id: username, password: saltedHash, salt: salt}, {upsert: true}, function(err){
            if (err) return res.status(500).end(err);
            res.setHeader('Set-Cookie', cookie.serialize('username', username, {
                  path : '/', 
                  maxAge: 60 * 60 * 24 * 7
            }));
            users.findOne({_id: username}, function(err, user){
                req.session.user = user;
                return res.json("user " + username + " signed up");
            });
        });
    });
});

// curl -H "Content-Type: application/json" -X POST -d '{"username":"alice","password":"alice"}' -c cookie.txt localhost:3000/signin/
app.post('/signin/', function (req, res, next) {
    let username = req.body.username;
    let password = req.body.password;
    // retrieve user from the database
    users.findOne({_id: username}, function(err, user){
        if (err) return res.status(500).end(err);
        if (!user) return res.status(401).end("access denied");
        let salt = user.salt;
        let hash = crypto.createHmac('sha512', salt);
        hash.update(password);
        let saltedHash = hash.digest('base64');
        if (user.password !== saltedHash) return res.status(401).end("access denied"); 
        req.session.user = user;
        // initialize cookie
        res.setHeader('Set-Cookie', cookie.serialize('username', username, {
              path : '/', 
              maxAge: 60 * 60 * 24 * 7
        }));
        return res.json("user " + username + " signed in");
    });
});

app.get('/signout/', function (req, res, next) {
    req.session.destroy();
    res.setHeader('Set-Cookie', cookie.serialize('username', '', {
          path : '/', 
          maxAge: 60 * 60 * 24 * 7 // 1 week in number of seconds
    }));
    res.redirect('/');
});



app.post('/', function (req, res, next) {
     
});

app.post('/ConnectPeer/:id', function (req, res, next) {
    allPeers.push();
});

app.post('/api/imageURI/', function(req,res, next){
    imageDB.insert(new Image(req.body), function (err, img) {
        if (err) return res.status(500).end("unable to post image");
        return res.json(img);
    });
});

app.get('/api/imageURI/:groupName/', function(req, res, next){
    imageDB.find({groupName: req.params.groupName}, function (err, img){
        if (err) return res.status(500).end("unable to get image");
        
        return res.json(img);
    });
});

 
 
 // Change to Https with certificate, ask how to get certificate
const http = require('http');
const PORT = 3000;

const server = http.createServer(app).listen(PORT, function (err) {
    if (err) console.log(err);
    else console.log("HTTP server on http://localhost:%s", PORT);
});
const peerserver = ExpressPeerServer(server, options);
app.use(options.path, peerserver);