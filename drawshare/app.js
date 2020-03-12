const path = require('path');
const session = require('express-session');
const crypto = require('crypto');
const cookie = require('cookie');
const express = require('express');
// import Peer from 'peerjs';
// const peer = new Peer('pick-an-id'); 
const app = express();
let multer  = require('multer');
let fs  = require('fs');
let upload = multer({ dest: path.join(__dirname, 'uploads')});
let bodyParser = require('body-parser');
let Datastore = require('nedb');
let imageDB = new Datastore({ filename: './db/images.db', autoload: true, timestampData : true });
let allPeers = [];

// image object
let Image = (function() {
    return function item(image) {
        this.group = image.group;
        this.imageURI = image.imageURI;
    };
}());

app.use(bodyParser.json());
app.use(express.static('static'));
app.use(session({
    secret: 'peasandcarrots',  ////change this -----------------------------------------------------------
    resave: false,
    saveUninitialized: true,
}));
 
app.use(function (req, res, next){
    console.log("HTTP request", req.method, req.url, req.body);
    next();
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
    imageDB.findOne({group: req.params.groupName}).sort({createdAt:-1}).exec(function (err, img){
        if (err) return res.status(500).end("unable to get image");
        
        return res.json(img);
    });
});

 
 
 // Change to Https with certificate, ask how to get certificate
const http = require('http');
const PORT = 3000;

http.createServer(app).listen(PORT, function (err) {
    if (err) console.log(err);
    else console.log("HTTP server on http://localhost:%s", PORT);
});