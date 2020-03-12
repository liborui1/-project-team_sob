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
const { PeerServer } = require('peer');
const options = {
    debug: true,
    path: '/peerjs'
}
 
let allPeers = [];

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


app.post('/', function (req, res, next) {
     
});

app.post('/ConnectPeer/:id', function (req, res, next) {
    allPeers.push();
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