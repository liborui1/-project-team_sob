let api = (function(){
 
    let module = {};
    // for local server
    //{host: 'localhost', port:'3000', path: '/peerjs'}
    let peer = new Peer();
    let connectedPeer = [];
    let localData = {groupName:"testGroup1"};
  
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

    module.createLobby = function(addStrokes, syncData) {
    
        peer.on('open', function(id) {
            console.log(peer);
            document.querySelector('#peerIddisplay').innerHTML = id
        });
        document.querySelector('#peerIddisplay').innerHTML = peer.id
        // lobby created, waiting for connections
        peer.on('connection', function (dataConnection){
            // When connected expect incomming strokes in the data
             dataConnection.on('data', function (data){
                let strokes = data.strokes || []
                console.log(strokes)
                addStrokes(strokes)
            })
            // On the initial connect send a list of all other connected users and all the points in the lobby
            dataConnection.on('open', function (){
                let allUserId = []
                //   collect all the currentIds to send to the new peer to connect to
                connectedPeer.forEach(function(con){
                    allUserId.push(con.peer)
                })
                dataConnection.send({users:allUserId, strokes: syncData})
                // keep track of all the current connected peers -- api suggested to do it by ourselves
                connectedPeer.push(dataConnection);
            })
            dataConnection.on('disconnect', function (){
                // remove the peer that disconnected
                removePeer(dataConnection);
            });
        })
    }


    module.connectToBoard = function(res, addStrokes) {
        // connect to peer
        let board = peer.connect(res.trim());
        connectedPeer.push(board);
        // When finished connecting wait for peer to send strokes
        peer.on('connection', function (newConnection){
            console.log("new connection")
            newConnection.on('data', function(data) {
                let strokes = data.strokes || [[]]
                addStrokes(strokes);
            })
            connectedPeer.push(newConnection);
        });

        board.on('data', function (data){
            let users = data.users || [];
            let strokes = data.strokes || [[]];
            // initial sync of strokes
            addStrokes(strokes);
            // connect to all the new users
    
            // users is empty when we're done initilizing
            users.forEach(function(usrId){
                console.log(usrId)
                let newPeer = peer.connect(usrId)    
                connectedPeer.push(newPeer);
                // all new peers can disconnect
                newPeer.on('open', function (){
                    // all new peers can add to the local board
                    newPeer.on('data', function (newPeerdata){
                        let strokes = newPeerdata.strokes || []
                        addStrokes(strokes);
                    });
                });
                newPeer.on('disconnect', function (){
                    removePeer(newPeer);
                });
            });
        });
        
        board.on('disconnect', function (){
            removePeer(board);
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
        console.log("sdasd ", data)
        connectedPeer.forEach( function (connPeer){
            console.log("sneding Strokes to:", connPeer)
            connPeer.send({strokes: data})
        });
    }

    module.storeImageURI = function(imageURI, groupName = "testGroup1") {
        localData.groupName = groupName;
        send("POST", "/api/imageURI/", {imageURI: imageURI, groupName: groupName}, function (err){
            if (err) return notifyErrorListeners("Image was unable to be added");
        });
    };

    module.getImageURI = function(groupName = null) {
        if (groupName == null) {
            groupName = localData.groupName;
        }
        send("GET", "/api/imageURI/" + groupName + "/", function (err, img){
            if (err) return notifyErrorListeners("Image was unable to get Image");
            return res.json(img);
        });
    };



    return module;

})();

