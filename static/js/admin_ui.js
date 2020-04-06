(function(){
    "use strict";

    window.addEventListener('load', function(){
        let lastNumUsers = 0;
        let badgeReset = false;
        function myFunction() {
            var popup = document.getElementById("myPopup");
            popup.classList.toggle("show");
          }

        let admin = document.getElementById("admin");
        admin.addEventListener("click", function() {
            var popup = document.getElementById("myPopup");
            popup.classList.toggle("show");
            document.getElementById('badge').innerHTML = 0;
            document.getElementById('badge').style.visibility = "hidden";
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
                        <button>Kick</button>
                        <button>Allow to draw</button>
                    </div>
                `;

                cmnt_element.addEventListener("click", function(e){
                    api.kickPeer(peerid);
                });
                document.querySelector('#myPopup').prepend(cmnt_element);
            }
        });
    });
}());
