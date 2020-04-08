(function(){
    "use strict";
    
    window.addEventListener('load', function(){
        let chatMin = true;
        let name = "";
        api.onChatUpdate(function(username){
            console.log(username);
        
            document.querySelector("#collapsBtn").addEventListener('click', function(e) {
                let chatHeader = document.querySelector("#chat_header");
                let chatBtn = document.querySelector("#collapsBtn");
                let chat = document.querySelector("#chat");
                let messagebox = document.querySelector("#messagebox");
                if (chatMin) {
                    chatHeader.style.bottom = "510px";
                    chatBtn.className = "down-icon collapsBtn";
                    chat.style.visibility="visible";
                    messagebox.style.visibility="visible";
                    chatMin = false;
                } else {
                    chatHeader.style.bottom = "5px";
                    chatBtn.className = "up-icon collapsBtn";
                    chat.style.visibility="hidden";
                    messagebox.style.visibility="hidden";
                    chatMin = true;
                }
            });
            document.querySelector("#msgBox").addEventListener('keyup', function(e) {
                if (e.keyCode === 13) {
                    createMessage();
                    
                }
            });

            document.querySelector("#sendBtn").addEventListener('click', function(e) {
                    createMessage();
            });

            function createMessage() {
                let chat = document.querySelector("#chat");
                let msg = document.querySelector("#msgBox").value;
                    if (msg.replace(/\s/g,'') != "") {
                        let box = document.querySelector("#chat");
                        let msg_box = document.createElement('div');
                        msg_box.className = "message-container";
                        let msg_name = document.createElement('div');
                        msg_name.className = "message-name";
                        msg_name.innerHTML = username;
                        let message = document.createElement('div');
                        message.className = "mymessage";
                        message.innerHTML = msg;
                        msg_box.append(msg_name);
                        msg_box.append(message);
                        box.append(msg_box);
                        api.sendMessage(msg);
                        chat.scrollTop = chat.scrollHeight - chat.clientHeight;
                    }
                    document.querySelector("#msgBox").value= "";
            }
        
        });
    });
}());
