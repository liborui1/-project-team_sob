(function(){
    "use strict";
    
    window.addEventListener('load', function(){
        
        api.onError(function(err){
            console.error("[error]", err);
        });
    
        api.onError(function(err){
            let error_box = document.querySelector('#warning');
            if (err.includes("401")) {
                error_box.innerHTML = "Username or Password is incorrect";
                error_box.style.visibility = "visible";
            } else if (err.includes("409")) {
                error_box.innerHTML = "Username has already been taken";
                error_box.style.visibility = "visible";
            }
        });
        
        api.onUserUpdate(function(username){
            if (username && username !== "") {
                window.location.href = '/index.html';
                localStorage.setItem("username", username);
            } else {
                localStorage.setItem("username", "");
            }
        });
        
        function submit(){

            if (document.querySelector("form").checkValidity()){
                let username = document.querySelector("form [name=username]").value.trim();
                let password =document.querySelector("form [name=password]").value.trim();
                let action =document.querySelector("form [name=action]").value;
                api[action](username, password, function(err){
                    if (err) document.querySelector('.warning').innerHTML = err;
                });
            }
        }

        document.querySelector('#signin').addEventListener('click', function(e){
            document.querySelector("form [name=action]").value = 'signin';
            submit();
        });

        document.querySelector('#signup').addEventListener('click', function(e){
            document.querySelector("form [name=action]").value = 'signup';
            submit();
        });

        document.querySelector('form').addEventListener('submit', function(e){
            e.preventDefault();
        });
        if (localStorage.getItem("signedIn") != "") {
            this.document.querySelector("#warning").innerHTML = localStorage.getItem("signedIn");
        }
    });
}());


