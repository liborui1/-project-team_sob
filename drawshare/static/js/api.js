let api = (function(){
 
    let module = {};
    let peer = null;
    let connectedPeer = null;
  
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

    module.createLobby = function(incomingData) {
        peer = new Peer({initiator: true, trickle: false});
        peer.on('open', function(id) {
            console.log(id)
        });
        peer.on('connection', function (dataConnection){
             connectedPeer = dataConnection;
             connectedPeer.on('data', function (data){
                incomingData(data)
                console.log("new data: " + data)
            })
        })
    }


    module.connectToBoard = function(res, incomingData) {
        peer = new Peer({initiator: false, trickle: false});
        connectedPeer = peer.connect(res);
        connectedPeer.on('data', function (data){
            incomingData(data)
            console.log("new data: " + data)
        })
    }

    module.sendStrokes = function(data) {
        connectedPeer.send(data)
        connectedPeer.on
    }

    return module;

})();

