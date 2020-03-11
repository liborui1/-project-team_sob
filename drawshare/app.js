const path = require('path');
const express = require('express');
const app = express();
let multer  = require('multer');
let fs  = require('fs');
let upload = multer({ dest: path.join(__dirname, 'uploads')});
let bodyParser = require('body-parser');
let Datastore = require('nedb');
const session = require('express-session');
const crypto = require('crypto');
const cookie = require('cookie');


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


 
 
 // Change to Https with certificate, ask how to get certificate
const http = require('http');
const PORT = 3000;

http.createServer(app).listen(PORT, function (err) {
    if (err) console.log(err);
    else console.log("HTTP server on http://localhost:%s", PORT);
});