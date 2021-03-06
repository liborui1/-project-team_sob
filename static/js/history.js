(function(){
    "use strict";
    window.addEventListener('load', function() {
        if ((localStorage.getItem("signedIn") != "")) {
            localStorage.setItem("signedIn", "**You must be signed in to load save**");
            window.location.href = '/login.html';
        }
        api.onHistoryUpdate(function(saves) {
            document.querySelector('#saved_list').innerHTML = '';
            if(saves) {
                saves.forEach(function(save, index) {
                    let box = document.createElement('button');
                    box.className = "sml_container";
                    box.innerHTML = save;
                    box.addEventListener("click", function (e){
                        localStorage.setItem('loadSave', index);
                        if (localStorage.getItem('lobby')){
                            window.location.href = '/drawshare.html?lobby=' + localStorage.getItem('lobby');
                        } else {
                            window.location.href = '/drawshare.html' ;
                        }
                    });
                    document.querySelector('#saved_list').prepend(box);
                });
            }
        });
    });
}());