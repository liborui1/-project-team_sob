window.onload = (function() {
    "use strict";
 
    let canvas;
    let context;
    let clickX = [];
    let clickY = [];
    let clickDrag = [];
    let clickColor = [];
    let paint = false;
    let move = false;
    let lastClick = null;
    let prevPan = {panX: 0, panY: 0}
    let panX = 0
    let panY = 0;
    let currentAction = "draw";
    let currentColor = "#000000";
      
    document.querySelector('#draw').addEventListener('click', function (e){
        currentAction = "draw"
    });
    document.querySelector('#move').addEventListener('click', function (e){
        currentAction = "move"
    });

    let addClick = function(x, y, dragging)
    {
      clickX.push(x);
      clickY.push(y);
      clickDrag.push(dragging);
      clickColor.push(currentColor);
    };

    let prepareCanvas = function(){
        let canvasWrapper = document.querySelector('#whiteBoard');
        canvas = document.querySelector('#whiteBoard > canvas');
        canvas.height = canvasWrapper.clientHeight;
        canvas.width = canvasWrapper.clientWidth;
        
        context = canvas.getContext("2d");
        // clearCanvas();
        clickX = [];
        clickY = [];
        clickDrag = [];
        clickColor = [];

        canvas.onmousedown = function(e){
            let newX = e.pageX - this.offsetLeft;
            let newY = e.pageY - this.offsetTop;
            if (currentAction === "draw"){
                paint = true;
                addClick(newX + panX , newY + panY, false);
            } else if (currentAction === "move"){
                lastClick = {x:newX, y: newY}
                prevPan = {panX, panY}
                move = true;
            }
            redraw();
        };

        canvas.onmousemove = function(e){
            let newX = e.pageX - this.offsetLeft;
            let newY = e.pageY - this.offsetTop;
            if(paint){
                addClick(newX+ panX, newY + panY, true);
                redraw();
            } else if (move){
                panCanvas(lastClick, {x: newX, y: newY})
            }
        };

        canvas.onmouseup = function(e){
          paint = false;
          move = false;
          prevPan = {panX, panY}
        };

        canvas.onmouseleave = function(e){
          paint = false;
          move = false;
          prevPan = {panX, panY}
        };
    };

    let redraw = function(){
        clearCanvas();
        context.lineJoin = "round";
        context.lineCap = "round";
        context.lineWidth = 5;
        for(let i=0; i < clickX.length; i++){
            context.beginPath();
            let pointA = {x: clickX[i] - panX, y: clickY[i] - panY}
            if(clickDrag[i]){
                context.moveTo(clickX[i-1] - panX, clickY[i-1] - panY);
                context.lineTo(pointA.x, pointA.y);
            } else {
                context.moveTo(pointA.x, pointA.y);
                context.lineTo(pointA.x, pointA.y);
            }
            context.closePath();
            context.strokeStyle = clickColor[i];
            context.stroke();
        }
    };

    let clearCanvas = function(){
        context.clearRect(0, 0, canvas.width*4, canvas.height*4);
    };

    let panCanvas = function(panFrom, panTo){
        panX = prevPan.panX + panFrom.x - panTo.x
        panY = prevPan.panY + panFrom.y - panTo.y
        redraw();
    }


    window.addEventListener('load', function(){
        prepareCanvas();
    });
    window.addEventListener('resize', function(){
        let canvasWrapper = document.querySelector('#whiteBoard');
        canvas = document.querySelector('#whiteBoard > canvas');
        canvas.height = canvasWrapper.clientHeight;
        canvas.width = canvasWrapper.clientWidth;
        redraw();
    });


    


    window.addEventListener('load', function(){
        prepareCanvas();
    });

}());
