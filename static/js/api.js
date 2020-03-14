let api = (function(){
 
    let module = {};
    // for local server
    //{host: 'localhost', port:'3000', path: '/peerjs'}
    let peer = new Peer({secure: true, host: 'draw-share.herokuapp.com', path: '/peerjs'});
    let connectedPeer = [];
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
            // returns a custom lobby or something idk
            console.log(res)

       });
    }

    module.createLobby = function(callBack, syncData, lobbyName, lobbyPass) {
        lobbyPass = "";
 
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
            connectedPeer.push(dataConnection)
            dataConnection.on('open', function (){
                dataConnection.send({action: "initialSync", initialSync: syncData})
            });
            // When connected expect incomming strokes in the data
             dataConnection.on('data', function (data){
                callBack(data)
            })
            dataConnection.on('disconnect', function (){
                // remove the peer that disconnected
                removePeer(dataConnection);
            });
        })
    }

    let requestJoinLobby= function (id, lobbyName, lobbyPass, callback){
        send("POST", "/joinLobby/", {peerId: id, name: lobbyName , password: lobbyPass}, function(err, res){
            if (err) return notifyErrorListeners(err);
            let isSynced = false;

            res.forEach( function(newPeerId) {
                let newPeer = peer.connect(newPeerId)    
                connectedPeer.push(newPeer);
                console.log(newPeerId)
                // all new peers can disconnect
                    // all new peers can add to the local board
                newPeer.on('data', function (newPeerdata){
                    let initialSync = newPeerdata.initialSync;
                    // so that it only syncs with one user rather than all connecting users
                    if (!isSynced && initialSync){
                        callback(newPeerdata)
                        isSynced = true;
                    }
                    callback(newPeerdata);
                });
                newPeer.on('disconnect', function (){
                    removePeer(newPeer);
                });
            });
       });
    }

    module.connectToBoard = function(callBack, getSyncData ,lobbyName, lobbyPass) {
        lobbyPass = "";
   
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
            newConnection.on('open', function() {
                newConnection.send({action: "addStrokes", initialSync : getSyncData()})
            });
            newConnection.on('data', function(data) {
                callBack(data);
            })
            connectedPeer.push(newConnection);
        });
   

       
    }

    let removePeer = function (peer){
        for (let i = 0; i < connectedPeer.length; i++){
            if (connectedPeer[i] === peer){
                connectedPeer.splice(i, 1);
                break;
            }
        }
    }

    module.sendStrokes = function(data) {
        connectedPeer.forEach( function (connPeer){
            connPeer.send({action: "addStrokes", strokes: data})
        });
    }

    module.storeImageURI = function(imageURI, groupName = "testGroup1") {
        localData.groupName = groupName;
        send("POST", "/api/imageURI/", {imageURI: imageURI, groupName: groupName}, function (err,image){
            if (err) return notifyErrorListeners("Image was unable to be added");
            localData.groupName = image.groupName;
        });
    };

    //History

    let getHistory = function(groupName, callback) {
        send("GET", "/api/imageURI/" + groupName + "/", null, callback);
    };
    let historyListeners = [];

    function notifyHistoryListeners(groupName){
        historyListeners.forEach(function(handler){
            handler(groupName);
        });
    }

    module.onHistoryUpdate = function(handler){
        historyListeners.push(handler);
       // if ((localData.groupName != "") && (localData.groupName != null)) {
            getHistory("testGroup1",function(err, saves) {
                if (err) return notifyErrorListeners(err);
                if (saves) {
                    handler(saves);
                }
            });
        //} else {
        //    handler([]);
        //}
    };

    return module;

})();

