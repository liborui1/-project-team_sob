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
        
        
    });
}());
