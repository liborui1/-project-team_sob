let api = (function(){
 
    let module = {};
    // for local server
    //{host: 'localhost', port:'3000', path: '/peerjs'}
    //{secure: true, host: 'draw-share.herokuapp.com', path: '/peerjs'}
    let peer = new Peer({secure: true, host: 'draw-share.herokuapp.com', path: '/peerjs'});
    let connectedPeer = [];
    let peerIdToUserName = {};
    let localData = {groupName:""};
  
    function sendFiles(method, url, data, callback){
        let formdata = new FormData();
        Object.keys(data).forEach(function(key){
            let value = data[key];
            formdata.append(key, value);
        });
        let xhr = new XMLHttpRequest();
        xhr.onload = function() {
            if (xhr.status !== 200) callback("[" + xhr.status + "]" + xhr.responseText, null);
            else callback(null, JSON.parse(xhr.responseText));
        };
        xhr.open(method, url, true);
        xhr.send(formdata);
    }


    function send(method, url, data, callback){
        let xhr = new XMLHttpRequest();
        xhr.onload = function() {
            if (xhr.status !== 200) callback("(" + xhr.status + ")" + xhr.responseText, null);
            else callback(null, JSON.parse(xhr.responseText));
        };
        xhr.open(method, url, true);
        if (!data) xhr.send();
        else{
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.send(JSON.stringify(data));
        }
    }

    let userListeners = [];
    
    let getUsername = function(){
        return document.cookie.replace(/(?:(?:^|.*;\s*)username\s*\=\s*([^;]*).*$)|^.*$/, "$1");
    };

    function notifyUserListeners(username){
        userListeners.forEach(function(listener){
            listener(username);
        });
    }
    
    module.onUserUpdate = function(listener){
        userListeners.push(listener);
        listener(getUsername());
    };
    
    module.signin = function(username, password){
        send("POST", "/signin/", {username, password}, function(err, res){
             if (err) return notifyErrorListeners(err);
             notifyUserListeners(getUsername());
             api.showUsers(0);
        });
    };
    
    module.signup = function(username, password){
        send("POST", "/signup/", {username, password}, function(err, res){
             if (err) return notifyErrorListeners(err);
             notifyUserListeners(getUsername());
             api.showUsers(0);
        });
    };

    let errorListeners = [];
    
    function notifyErrorListeners(err){
        errorListeners.forEach(function(listener){
            listener(err);
        });
    }
    
    module.onError = function(listener){
        errorListeners.push(listener);
    };

    let requestCreateLobby = function (id, lobbyName, lobbyPass){
        send("POST", "/createLobby/", {peerId: id, name: lobbyName , password: lobbyPass}, function(err, res){
            if (err) return notifyErrorListeners(err);
       });
    }

    module.createLobby = function(callBack, syncData, lobbyName, lobbyPass) {
         let sentRequest = false;
        if (peer.id){
            requestCreateLobby (peer.id, lobbyName, lobbyPass);
            sentRequest = true;
        }
        peer.on('open', function(id) {
            if (!sentRequest) requestCreateLobby (id, lobbyName, lobbyPass);
            document.querySelector('#peerIddisplay').innerHTML = peer.id
        });
        document.querySelector('#peerIddisplay').innerHTML = peer.id
        // lobby created, waiting for connections
        peer.on('connection', function (dataConnection){
            addPeer(dataConnection)
             dataConnection.on('open', function (){
                dataConnection.send({action: "initialSync", initialSync: syncData})
                // changing to webrtc logic because peerjs destroy bug
                let dataChannel =  dataConnection.dataChannel
                let peerConnection =  dataConnection.peerConnection
                dataChannel.onclose = function () {
                    removePeer(dataConnection);
                };
                peerConnection.oniceconnectionstatechange = function() {
                    if(peerConnection.iceConnectionState == 'disconnected') {
                        removePeer(dataConnection);
                    }
                }
            });
            // When connected expect incomming strokes in the data
             dataConnection.on('data', function (data){
                callBack(data)
            });
        });
        
    }

    let requestJoinLobby= function (id, lobbyName, lobbyPass, callback){
        send("POST", "/joinLobby/", {peerId: id, name: lobbyName , password: lobbyPass}, function(err, res){
            if (err) return notifyErrorListeners(err);
           
            res.forEach( function(newPeerId, index) {
                let newPeer = peer.connect(newPeerId)    
                // all new peers can disconnect
                    // all new peers can add to the local board
                newPeer.on('data', function (newPeerdata){
                    // so that it only syncs with one user rather than all connecting users
                    if (index === res.length - 1 && newPeerdata.action === "initialSync"){
                        callback(newPeerdata)
                      
                    } else if (newPeerdata.action !== "initialSync"){
                        callback(newPeerdata);
                    }
                });
               
                newPeer.on('open', function (){
                    addPeer(newPeer);
                    let dataChannel =  newPeer.dataChannel
                    let peerConnection =  newPeer.peerConnection
                    dataChannel.onclose = function () {
                        redirect(lobbyName);
                        removePeer(newPeer);
                    };
                    peerConnection.oniceconnectionstatechange = function() {
                        if(peerConnection.iceConnectionState == 'disconnected') {
                            redirect(lobbyName);
                            removePeer(newPeer);
                        }
                    }
                });
            });
       });
    }

    module.connectToBoard = function(callBack, getSyncData ,lobbyName, lobbyPass) {
   
        let sentRequest = false;
        if (peer.id){
            requestJoinLobby(peer.id, lobbyName, lobbyPass, callBack)
            sentRequest = true;
        }

         // waiting for peer to be opened
        peer.on('open', function (id){
            if (!sentRequest) requestJoinLobby(id, lobbyName, lobbyPass, callBack);
        });
        // When finished connecting wait for peer to send strokes
        
        peer.on('connection', function (newConnection){
            addPeer(newConnection);
            newConnection.on('open', function() {
                newConnection.send({action: "initialSync", initialSync : getSyncData()})

                let dataChannel =  newConnection.dataChannel
                let peerConnection =  newConnection.peerConnection
                dataChannel.onclose = function () {
                    redirect(lobbyName);
                    removePeer(newConnection);
                };
                peerConnection.oniceconnectionstatechange = function() {
                    if(peerConnection.iceConnectionState == 'disconnected') {
                        redirect(lobbyName);
                        removePeer(newConnection);
                    }
                }
              
            });
            newConnection.on('data', function(data) {
                callBack(data);
            })
        
             
        });
    }

    let addPeer = function (newConnection){
        connectedPeer.push(newConnection)
        send("GET", "/peerToUser/" + newConnection.peer , null, function(err, res){
            if (err) return notifyErrorListeners(err);
            peerIdToUserName[newConnection.peer] = (res !== "")?  res: newConnection.peer;
            notifyConnectedUsersListeners();
        });
    }

    let removePeer = function (newConnection){
        for (let i = 0; i < connectedPeer.length; i++){
            if (connectedPeer[i].peer === newConnection.peer){
                connectedPeer[i].close();
                connectedPeer.splice(i, 1);
                break;
            }
        }
        console.log("removed: ", newConnection.peer)
      
        notifyConnectedUsersListeners();
    }
    
    module.sendStrokes = function(data) {
        connectedPeer.forEach( function (connPeer){
            connPeer.send({action: "addStrokes", strokes: data})
        });
    };

    module.sendMouseData = function(mouseDataHandler) {
        connectedPeer.forEach( function (connPeer){
            let userName = (getUsername() !== "")? getUsername() : peer.id;
            let data = mouseDataHandler(userName, peer.id)
       
            connPeer.send({action: "mouseData", mouseData: data})
    
        });
    };

    module.sendRemoveStrokes = function(data) {
        connectedPeer.forEach( function (connPeer){
            connPeer.send({action: "removeStrokes", strokes: data})
        });
    };
 
    module.sendResyncBoard = function(data) {
        connectedPeer.forEach( function (connPeer){
            connPeer.send({action: "reSync", reSync: data})
        });
    };

    sendUpdatePeerList = function() {
        connectedPeer.forEach( function (connPeer){
            connPeer.send({action: "updatePeerList"})
        });
    };

    module.saveBoard = function(boardData, boardName) {
        send("POST", "/api/saveboard/", {boardData, name: boardName}, function (err,res){
            if (err) return notifyErrorListeners("Board was unable to be added");
            alert(res);
        });
    };
    let loadSaveListener = [];

    function notifyLoadSaveListeners(){
        loadSaveListener.forEach(function(handler){
            getSave(handler);
        });
    }

    let getSave = function(index, callback){
        send("GET", "/api/saveboard/" + index, null, callback);
    } 
 
    module.onLoadSave = function(index, handler){
        historyListeners.push(handler);
        getSave(index, function (err, save){
            if (err) return notifyErrorListeners(err);
            handler(save);
        });
    }
 
    let getAllSaves= function(callback) {
        send("GET", "/api/boadnames/", null, callback);
    };

    let historyListeners = [];

    function notifyHistoryListeners(){
        historyListeners.forEach(function(handler){
            handler();
        });
    }

    module.onHistoryUpdate = function(handler){
        historyListeners.push(handler);
       // if ((localData.groupName != "") && (localData.groupName != null)) {
        getAllSaves(function(err, saves) {
                if (err) return notifyErrorListeners(err);
                if (saves) {
                    handler(saves);
                }
            });
        //} else {
        //    handler([]);
        //}
    };
    let serverListeners = [];

    module.onServerUpdate = function (handler) {
        serverListeners.push(handler);
        handler(getUsername());
    };

    let getConnectedUsers = function(){
        let users = {};
        connectedPeer.forEach( function (connPeer){
        
            let id = peerIdToUserName[connPeer.peer]
            users[connPeer.peer] = ((id)? id : connPeer.peer);
    
        });
        return users
    }
    let connectedUserListeners = [];

    function notifyConnectedUsersListeners(){
        connectedUserListeners.forEach(function(handler){
            handler(getConnectedUsers());
        });
    }

    module.onConnectedUserUpdate = function(handler){
        connectedUserListeners.push(handler);
       // if ((localData.groupName != "") && (localData.groupName != null)) {
       handler(getConnectedUsers())
    };

    // Server side kicking 
    module.kickPeer = function (peerId){
        send("PATCH", "/lobby/kick/" + peerId, null, function(err,res){
            if (err) return notifyErrorListeners(err);
            // after kicking the peer remove connection and signal every other peer to update their peerlist
            let foundConnection = connectedPeer.find(function (connection) {return connection.peer === peerId})
            if (foundConnection) removePeer(foundConnection);
            sendUpdatePeerList();
            notifyUserListeners();
        });
    }

    let redirect= function(lobbyName){
        send("GET", "/lobby/list/" + lobbyName , null, function(err, peerIds){
            peerIds = peerIds || [] 
            if (peerIds.indexOf(peer.id) === -1) window.location.href = '/index.html';;
        });
    }
    module.updatePeerList= function(lobbyName){
        send("GET", "/lobby/list/" + lobbyName , null, function(err, peerIds){
            if (err) return notifyErrorListeners(err);
            redirect(lobbyName);
            connectedPeer.forEach( function(conn){
                let index = peerIds.indexOf(conn.peer)
                if (index === -1){
                    conn.close();
                    removePeer(conn);
                }
            })
            notifyUserListeners();
        });
    }
    module.isPasswordProtected = function(lobbyName, callback){
        send("GET", "/lobby/passwordprotected/" + lobbyName , null, function(err, ispp){
            if (err) return notifyErrorListeners(err);
            callback(ispp)
        });
    }

    return module;
})();


 