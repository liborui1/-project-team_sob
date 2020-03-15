(function(){
    "use strict";
    
    window.addEventListener('load', function(){
        
        api.onError(function(err){
            console.error("[error]", err);
        });
    
        api.onError(function(err){
            let error_box = document.querySelector('#error_box');
            error_box.innerHTML = err;
            error_box.style.visibility = "visible";
        });
        
        api.onUserUpdate(function(username){
            if (username) window.location.href = '/index.html';
        });
        
        function submit(){

            if (document.querySelector("form").checkValidity()){
                let username = document.querySelector("form [name=username]").value;
                let password =document.querySelector("form [name=password]").value;
                let action =document.querySelector("form [name=action]").value;
                api[action](username, password, function(err){
                    if (err) document.querySelector('.error_box').innerHTML = err;
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
    });
}());


