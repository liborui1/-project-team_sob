let api = (function(){
    let module = {};
    
    /*  ******* Data types *******
        image objects must have at least the following attributes:
            - (String) imageId 
            - (String) GroupId
            - (String) ImageURI
            - (Date) date
    
    ****************************** */ 
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

