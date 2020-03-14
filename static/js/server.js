(function(){
    "use strict";
    
    window.addEventListener('load', function(){
        api.onServerUpdate(function(username){
            localStorage.setItem("boardKey", "");
            document.querySelector("#user_input").innerHTML = "";
            let createJ = document.createElement('div');
            createJ.className = "twin_container";
            createJ.id = "join";
            createJ.innerHTML = "<input class='desplay_container' id='serverKey'>" +
            "<div class='btn' id='joinBoard'>Join</div>";
            document.querySelector('#user_input').prepend(createJ);
            if (username) {
               //able to create server
               let createB = document.createElement('div');
               createB.className = "twin_container";
               createB.id = "generate";
               createB.innerHTML = "<div class='btn' id='genBoard'>Generate Board</div>";
               document.querySelector('#user_input').prepend(createB);
            }

            document.querySelector("#genBoard").addEventListener('click', function(e){
                if (username) window.location.href = '/drawshare.html';
            });

            document.querySelector('#joinBoard').addEventListener('click', function (e){
                let id = document.querySelector('#serverKey').value;
                localStorage.setItem("boardKey", id);
                window.location.href = '/drawshare.html';
            });
        });
    });

}());