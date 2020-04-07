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
 
let users = new Datastore({ filename: 'db/users.db', autoload: true, timestampData : true });
let imageDB = new Datastore({ filename: './db/images.db', autoload: true, timestampData : true });
let lobbies = new Datastore({ filename: 'db/lobbies.db', autoload: true, timestampData : true });
let userSaves = new Datastore({ filename: 'db/userSaves.db', autoload: true, timestampData : true });
let peerIdtoUser = new Datastore({ filename: 'db/peerIdtoUser.db', autoload: true, timestampData : true });

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
 
app.use(session({
    secret: 'peasandcarrots',  ////change this -----------------------------------------------------------
    resave: false,
    saveUninitialized: true,
}));


let isAuthenticated = function(req, res, next) {
    let id = (req.session.user)? req.session.user._id: null;
    users.findOne({_id: id}, function(err, user){
        if (err) return res.status(500).end(err);
        return (!user)? res.status(401).end("access denied") : next();  
    });
};
 
let isPartOfLobby = function(req, res, next) {
    let lobbyName = req.params.id;
 
    return (req.session.currentLobbies.indexOf(lobbyName) === -1) ? res.status(401).end("access denied") : next();  
};
 
 
app.use(function (req, res, next){
    req.user = ('user' in req.session)? req.session.user : null;
    let username = (req.user)? req.user._id : '';
    req.username = username;
    req.session.currentLobbies = req.session.currentLobbies || [];
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
        userSaves.update({_id: username},{_id: username,  savedBoards: []}, {upsert: true}, function(err){
            if (err) return res.status(500).end(err);
        });
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

app.get('/signout/',  function (req, res, next) {
    req.session.destroy();
    res.setHeader('Set-Cookie', cookie.serialize('username', '', {
          path : '/', 
          maxAge: 60 * 60 * 24 * 7 // 1 week in number of seconds
    }));
    res.redirect('/');
});


app.post('/createLobby/', isAuthenticated, function (req, res, next) {
    let peerId = req.body.peerId;
    let lobbyName = req.body.name;
    let lobbyPassword = req.body.password;

    lobbies.findOne({_id: lobbyName}, function(err, lobby){
        if (err) return res.status(500).end(err);
        if (lobby) return res.status(409).end("lobby " + lobby + " already exists");
        let salt = crypto.randomBytes(16).toString('base64');
        let hash = crypto.createHmac('sha512', salt);
        hash.update(lobbyPassword);
        let saltedHash = hash.digest('base64');
        let name = (req.username !== '')? req.username : peerId; 
        peerIdtoUser.update( {_id: peerId},{_id: peerId, userName: name}, {upsert: true}, function(err){
            if (err) return res.status(500).end(err);
        });

        req.session.currentLobbies.push(lobbyName);
        let pp = lobbyPassword !== "";
        lobbies.update({_id: lobbyName},{_id: lobbyName, connectedPeers: [peerId], password: saltedHash, salt: salt, owner:req.username, passwordProtected: pp, readOnly: [] }, {upsert: true}, function(err){
            if (err) return res.status(500).end(err);
            lobbies.findOne({_id: lobbyName}, function(err, user){
                return res.json("lobby " + lobbyName + " created");
            });
        });
    });
});

app.post('/joinLobby/', function (req, res, next) {
    let peerId = req.body.peerId;
    let lobbyName = req.body.name;
    let lobbyPassword = req.body.password;
    
    // retrieve user from the database
    lobbies.findOne({_id: lobbyName}, function(err, lobby){
        if (err) return res.status(500).end(err);
        if (!lobby) return res.status(404).end("Lobby not found");
        let salt = lobby.salt;
        let hash = crypto.createHmac('sha512', salt);
        hash.update(lobbyPassword);
        let saltedHash = hash.digest('base64');
        if (lobby.password !== saltedHash) return res.status(401).end("access denied inccorect password "); 
        let newConnections = [...lobby.connectedPeers]
        newConnections.push(peerId);
        let name = (req.username !== '')? req.username : peerId; 
        peerIdtoUser.update( {_id: peerId},{_id: peerId, userName: name}, {upsert: true}, function(err){
            if (err) return res.status(500).end(err);
        });
        req.session.currentLobbies.push(lobbyName) ;
        lobbies.update({_id: lobbyName},{ _id: lobbyName, connectedPeers: newConnections, password: saltedHash, salt: salt, owner:lobby.owner, passwordProtected: lobby.passwordProtected, readOnly: lobby.readOnly}, {upsert: true}, function(err){
            if (err) return res.status(500).end(err);
            return res.json({connectedPeers: lobby.connectedPeers, owner: lobby.owner});
        });
    });
});

app.get('/peerToUser/:peerId', function (req, res, next) {
    let peer = req.params.peerId;
    peerIdtoUser.findOne({_id: peer}, function (err,user){
        if (err) return res.status(500).end(err);
        let result = (user)? user.userName: "";
        return res.json(result);
    });
});

app.get('/joinBoard/:id', function (req, res, next) {
    // just a simpler way of joining the board
    res.redirect('/drawshare.html?lobby=' + req.params.id)
});

app.post('/api/saveboard/', isAuthenticated, function (req, res, next) {
    console.log(req.session.user._id)
    let username = req.session.user._id;
    userSaves.findOne({_id: username}, function(err, user){
        if (err) return res.status(500).end(err);

            // boards saved with names
        user.savedBoards.push({name : req.body.name, boardData: req.body.boardData});

        userSaves.update({_id: username},{_id: username,  savedBoards: user.savedBoards}, function(err){
            if (err) return res.status(500).end(err);
            res.json("Board saved")
        });
    });
});

app.get('/api/saveboard/:index', isAuthenticated, function (req, res, next) {
    userSaves.findOne({_id: req.session.user._id}, function(err, user){
        if (err) return res.status(500).end(err);
        console.log(parseInt(req.params.index))
        res.json(user.savedBoards[parseInt(req.params.index)])
    });
});

app.get('/api/boadnames/', isAuthenticated, function (req, res, next) {
    userSaves.findOne({_id: req.session.user._id}, function(err, user){
        if (err) return res.status(500).end(err);
        let bname = [];
        user.savedBoards.forEach(function (item){
            bname.push(item.name);
        });
        res.json(bname)
    });
});


app.patch('/lobby/kick/:id', isAuthenticated, function (req, res, next) {
    let client = req.params.id
    peerIdtoUser.remove( {_id: client}, {}, function(err){
    });
    let validated = false;
   lobbies.find({}, function(err, allLobbies){
        if (err) return res.status(500).end(err);
        // find lobby with unique peerid -- garenteed thers only one peerid in all popssible lobbies
       allLobbies.forEach(function (lobby){
           let newConnections = []
           // filter out all 
           lobby.connectedPeers.forEach (function (connId){
               if (connId !== client){
                    newConnections.push(connId)
                } else {
                    // verify is lobby owner
                    validated = (lobby.owner === req.username)
                }
           })
           if (validated){
            if (newConnections.length == 0){
                //delete unused lobby
                lobbies.remove({_id: lobby._id}, {},function(err, removedLobby){
                    if (err) return res.status(500).end(err);
                });
            } else {
                lobbies.update({_id: lobby._id},{ _id: lobby._id, connectedPeers: newConnections, password: lobby.password, salt: lobby.salt,  owner:lobby.owner, passwordProtected: lobby.passwordProtected, readOnly: lobby.readOnly}, {upsert: true}, function(err){
                    if (err) return res.status(500).end(err);
                });
            }
           }  
       });
       return (validated)? res.json("kicked") : res.status(401).end("access denied");
   });
});

app.get('/lobby/list/:id', isPartOfLobby, function (req, res, next) {
    lobbies.findOne({_id: req.params.id}, function(err, lobby){
        if (err) return res.status(500).end(err);
        if (!lobby) return res.status(404).end("Lobby not found");
        return res.json(lobby.connectedPeers)
    });
});

app.get('/lobby/passwordprotected/:id', function (req, res, next) {
    lobbies.findOne({_id: req.params.id}, function(err, lobby){
        if (err) return res.status(500).end(err);
        if (!lobby) return res.status(404).end("Lobby not found");
        return res.json(lobby.passwordProtected)
    });
});


app.get('/lobby/readOnly/:id', isPartOfLobby, function (req, res, next) {
    lobbies.findOne({_id: req.params.id}, function(err, lobby){
        if (err) return res.status(500).end(err);
        if (!lobby) return res.status(404).end("Lobby not found");
        return res.json(lobby.readOnly)
    });
});


app.patch('/lobby/readOnly/:id', isAuthenticated, function (req, res, next) {
    let client = req.params.id;
    let action = req.body.action;
    let lobbyName = req.body.lobby;
 
 
   lobbies.findOne({_id: lobbyName}, function(err, lobby){
        if (err) return res.status(500).end(err);
        // find lobby with unique peerid -- garenteed thers only one peerid in all popssible lobbies
        let newReadOnly = lobby.readOnly
        if (action === "add"){
            newReadOnly.push(client)
        } else if (action === "remove"){
            newReadOnly = lobby.readOnly.filter(peer => peer !== client);
        }
        // check for owner
        if (lobby.owner === req.username){
            lobbies.update({_id: lobby._id},{ _id: lobby._id, connectedPeers: lobby.connectedPeers, password: lobby.password, salt: lobby.salt,  owner:lobby.owner, passwordProtected: lobby.passwordProtected, readOnly: newReadOnly}, {upsert: true}, function(err){
                if (err) return res.status(500).end(err);
                return res.json(newReadOnly)
            });
        } else {
            return res.status(401).end("access denied");
        }
   });
});

// Change to Https with certificate, ask how to get certificate
const http = require('http');
const PORT = process.env.PORT || 3000;

const server = http.createServer(app).listen(PORT, function (err) {
    if (err) console.log(err);
    else console.log("HTTP server on http://localhost:%s", PORT);
});

const peerserver = ExpressPeerServer(server, options);
    peerserver.on('connection', (client) => { 
    
    });

peerserver.on('disconnect', (client) => { 
    peerIdtoUser.remove( {_id: client}, {}, function(err){
     });

    lobbies.find({}, function(err, allLobbies){
        allLobbies.forEach(function (lobby){
            let newConnections = []
            lobby.connectedPeers.forEach (function (connId){
                if (connId !== client) newConnections.push(connId)
            })
            if (newConnections.length == 0){
                //delete unused lobby
                lobbies.remove({_id: lobby._id}, {},function(err, res){
                });
            } else {
                lobbies.update({_id: lobby._id},{ _id: lobby._id, connectedPeers: newConnections, password: lobby.password, salt: lobby.salt,  owner:lobby.owner, passwordProtected: lobby.passwordProtected, readOnly: lobby.readOnly}, {upsert: true}, function(err){
                });
            }
        });
    })
});

app.use(options.path, peerserver);