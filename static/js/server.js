(function(){
    "use strict";
    
    window.addEventListener('load', function(){
        api.onServerUpdate(function(username){
            if (username) {
                localStorage.setItem("signedIn", "");
            }
            let header = document.querySelector("header");
            let userInfo = document.createElement("div");
            userInfo.className = "userInfo";
            if (username) {
                userInfo.innerHTML = "Welcome " + username;
                let signout = document.createElement("div");
                signout.className = "signout";
                signout.innerHTML = "Sign Out";
                signout.addEventListener("click", function (e) {
                    window.location.href = '/signout/';
                });
                header.append(signout);
            } else {
                userInfo.innerHTML = "Sign In / Sign Up";
            }
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
                if (username) {
                    window.location.href = '/drawshare.html';
                    localStorage.setItem("signedIn", "");
                } else {
                    localStorage.setItem("signedIn", "**You must be signed in to generate board**");
                    window.location.href = '/login.html';
                }
            });

            document.querySelector('#joinBoard').addEventListener('click', function (e){
                let id = document.querySelector('#serverKey').value.trim();
                alert(id);
                window.location.href = '/drawshare.html?lobby=' + id;
            });

            userInfo.addEventListener('click', function (e) {
                localStorage.setItem("signedIn", "");
                window.location.href = '/login.html';
            });
        });
    });

}());