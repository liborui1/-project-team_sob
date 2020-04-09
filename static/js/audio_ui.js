(function(){
    "use strict";

    window.addEventListener('load', function(){
        
        let audio = document.getElementById("audio");
        
        audio.addEventListener("click", function() {
            if (audio.classList == "audio-icon icon") {
                audio.classList = "no-audio-icon icon";
            } else {
                audio.classList = "audio-icon icon"
            }
        });

        let microphone = document.getElementById("microphone");
        
        microphone.addEventListener("click", function() {
            if (microphone.classList == "block-microphone-icon icon") {
                microphone.classList = "microphone-icon icon";
            } else {
                microphone.classList = "block-microphone-icon icon"
            }
        });
    });
}());
