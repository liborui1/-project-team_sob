(function(){
    "use strict";
    
    window.addEventListener('load', function(){

        function myFunction() {
            var popup = document.getElementById("myPopup");
            popup.classList.toggle("show");
          }

        let admin = document.getElementById("admin");
        admin.addEventListener("click", function() {
            var popup = document.getElementById("myPopup");
            popup.classList.toggle("show");
            });

        api.onConnectedUserUpdate(function(users){
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

                document.querySelector('#myPopup').prepend(cmnt_element);
            }
        });

        
        
    });
}());
