(function(){
    "use strict";

    window.addEventListener('load', function(){
        let lastNumUsers = 0;
  
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
        /*
        api.onConnectedUserUpdate(function(users){
            
            let newNewNumUsers = Object.keys(users).length - lastNumUsers
            lastNumUsers = Object.keys(users).length
            if (newNewNumUsers > 0 ){
                document.getElementById('badge').style.visibility = "visible";
                let prevnum = parseInt(document.getElementById('badge').innerHTML)
                document.getElementById('badge').innerHTML = prevnum + newNewNumUsers;
            } 
            let readOnly = api.getReadOnlyUsers();
  
            document.getElementById('myPopup').innerHTML = '';
            
            for (let peerid in users) {
                let username = users[peerid];
                let cmnt_element = document.createElement('div');
                // if in readonly then indicate with red that its in readonly
                cmnt_element.className = "user";
                if (api.isOwner()){      
                    cmnt_element.innerHTML =  `
                    ${username}
                    <divid= "container_${peerid}">
                            <button id= "${peerid}">Kick</button>
                            <label class="switch">
                                <input id="editSlider" type="checkbox">
                                <span class="slider round"></span>
                            </label>
                        </div>
                    `;
                    let cb = cmnt_element.querySelector("#editSlider");
                    cb.checked = (readOnly.indexOf(peerid) !== -1)
                
                    document.querySelector('#myPopup').append(cmnt_element);
                    cmnt_element.querySelector("#editSlider").addEventListener("click", function(){
                        let cb = cmnt_element.querySelector("#editSlider");
                        if (cb.checked){
                            // api calls to server to add to cant edit
                            //gray out the pencil/eraser/ability to load/reload
                            api.setReadOnly( peerid, localStorage.getItem('lobby'), "add")
                         
                        } else {
                            // api calls to server to remove  cant edit
                            api.setReadOnly( peerid, localStorage.getItem('lobby'), "remove")
                      
                        }
                    })
                    document.getElementById(peerid).addEventListener("click", function(e){
                        api.kickPeer(peerid, localStorage.getItem('lobby'));
                    });
                } else {
                    cmnt_element.innerHTML = username
                    document.querySelector('#myPopup').append(cmnt_element);
                }
            }
        });
        */
        
    });
}());
