(function(){
    "use strict";
    
    window.addEventListener('load', function(){
        api.onServerUpdate(function(username){
            let header = document.querySelector("header");
            let userInfo = document.createElement("div");
            userInfo.className = "userInfo";
            let headerbtn = document.createElement("div");
            if (username) {
                headerbtn.className = "headerbtn";
                headerbtn.innerHTML = "Welcome " + username;
            } else {
                headerbtn.className = "headerbtn";
                headerbtn.innerHTML = "SignIn / SignOut";
            }
            userInfo.append(headerbtn);
            header.append(userInfo);
            document.querySelector("#user_input").innerHTML = "";
            let createJ = document.createElement('div');
            createJ.className = "twin_container";
            createJ.id = "join";
            createJ.innerHTML = "<input class='desplay_container' id='serverKey'>" +
            "<div class='btn' id='joinBoard'>Join</div>";
            document.querySelector('#user_input').prepend(createJ);
            //able to create server
            let createB = document.createElement('div'); 
            createB.className = "twin_container";
            createB.id = "generate";
            createB.innerHTML = "<div class='btn' id='genBoard'>Generate Board</div>";
            document.querySelector('#user_input').prepend(createB);
            

            document.querySelector("#genBoard").addEventListener('click', function(e){
                window.location.href = '/drawshare.html';
            });

            document.querySelector('#joinBoard').addEventListener('click', function (e){
                let id = document.querySelector('#serverKey').value;
                alert(id);
                window.location.href = '/drawshare.html?lobby=' + id;
            });

            headerbtn.addEventListener('click', function (e) {
                window.location.href = '/login.html';
            });
        });
    });

}());