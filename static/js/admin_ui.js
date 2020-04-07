(function(){
    "use strict";

    window.addEventListener('load', function(){
        let lastNumUsers = 0;
        let badgeReset = false;
        function myFunction() {
            let popup = document.getElementById("myPopup");
            popup.classList.toggle("show");
          }

        let admin = document.getElementById("admin");
        admin.addEventListener("click", function() {
            let popup = document.getElementById("myPopup");
            popup.classList.toggle("show");
            document.getElementById('badge').innerHTML = 0;
            document.getElementById('badge').style.visibility = "hidden";
            let elem = document.getElementById("admin");
            if (elem.innerHTML=="Admin") {
                elem.innerHTML = "Close";
            }
            else {
                elem.innerHTML = "Admin";
            }
        });
        
        api.onConnectedUserUpdate(function(users){
            
            let newNewNumUsers = Object.keys(users).length - lastNumUsers
            lastNumUsers = Object.keys(users).length
            if (newNewNumUsers > 0 ){
                document.getElementById('badge').style.visibility = "visible";
                let prevnum = parseInt(document.getElementById('badge').innerHTML)
                document.getElementById('badge').innerHTML = prevnum + newNewNumUsers;
            } 
             
            document.getElementById('myPopup').innerHTML = '';
            for (let peerid in users) {
                let username = users[peerid];
                let cmnt_element = document.createElement('div');
                cmnt_element.className = "user";
                cmnt_element.innerHTML = `
                ${username}
                <div>
                        <button id= "${peerid}">Kick</button>
                        <label class="switch">
                            <input type="checkbox">
                            <span class="slider round"></span>
                        </label>
                    </div>
                `;

            
                document.querySelector('#myPopup').append(cmnt_element);
                document.getElementById(peerid).addEventListener("click", function(e){
                    api.kickPeer(peerid);
                });
            }
        });
        
        
    });
}());
