(function(){
    "use strict";
    window.addEventListener('load', function() {
        api.onHistoryUpdate(function(saves) {
            document.querySelector('#saved_list').innerHTML = '';
            if(saves) {
                document.querySelector('#title').innerHTML = "History: " + saves[0].groupName;
                saves.forEach(function(save) {
                    let box = document.createElement('div');
                    box.className = "sml_container";
                    box.innerHTML = save.createdAt;
                    document.querySelector('#saved_list').prepend(box);
                });
            }
        });
    });
    
}());

