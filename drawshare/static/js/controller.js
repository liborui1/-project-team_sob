window.onload = (function() {
    "use strict";

    const SCALEFACTOR = 1.1;
    let canvas;
    let context;
    let points = []; // xy pan zoom
    let paint = false;
    let move = false;
    let lastClick = null;
    let prevPan = {panX: 0, panY: 0}
    let panX = 0
    let panY = 0;
    let currentAction = "draw";
    let currentColor = "#000000";
    let currentScale = 1;

   let Point = (function(){
        return function point(x, y, panX, panY, scaleFactor, color, isDragging){
            this.x = x;
            this.y = y;
            this.panX = panX;
            this.panY = panY;
            this.scaleFactor = scaleFactor;
            this.color = color;
            this.isDragging = isDragging;
        };
    }());
 
    document.querySelector('#draw').addEventListener('click', function (e){
        currentAction = "draw"
    });
    document.querySelector('#move').addEventListener('click', function (e){
        currentAction = "move"
    });
    document.querySelector('#move2').addEventListener('click', function (e){
        console.log(points)
    });

    let addClick = function(x, y, dragging){
        points.push(new Point((x/ currentScale) + panX  , (y/currentScale) + panY, panX, panY, currentScale, currentColor, dragging));
    };

    let prepareCanvas = function(){
        let canvasWrapper = document.querySelector('#whiteBoard');
        canvas = document.querySelector('#whiteBoard > canvas');
        canvas.height = canvasWrapper.clientHeight;
        canvas.width = canvasWrapper.clientWidth;
        
        context = canvas.getContext("2d");
        points = []; 

        canvas.onmousedown = function(e){
            let newX = e.pageX - this.offsetLeft;
            let newY = e.pageY - this.offsetTop;
            if (currentAction === "draw"){
                paint = true;
                addClick(newX , newY, false);
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
                addClick(newX, newY, true);
                redraw();
            } else if (move){
                panCanvas(lastClick, {x: newX, y: newY})
                redraw();
            }
        };

        canvas.onmouseup = function(e){
          paint = false;
          move = false;
        };

        canvas.onmouseleave = function(e){
          paint = false;
          move = false;
        };

        canvas.addEventListener("wheel", function(e){
            if (event.deltaY < 0){
                context.scale(SCALEFACTOR, SCALEFACTOR)
                currentScale =  SCALEFACTOR * currentScale
            }else if (event.deltaY > 0) {
                context.scale(1/SCALEFACTOR, 1/SCALEFACTOR)
                currentScale =  1/SCALEFACTOR * currentScale
            }
             redraw();
        });
    };

    let redraw = function(){
        clearCanvas();
        context.lineJoin = "round";
        context.lineCap = "round";
        context.lineWidth = 5;
    
        for(let i=0; i < points.length; i++){
            context.beginPath();
          
            let pointA = points[i]
            let pointB = points[i - 1]
            if(pointA.isDragging){
                context.moveTo(pointB.x - panX, pointB.y - panY);
                context.lineTo(pointA.x - panX, pointA.y - panY);
            } else {
                context.moveTo(pointA.x - panX, pointA.y - panY);
                context.lineTo(pointA.x - panX, pointA.y - panY);
            }
            context.closePath();
            context.strokeStyle = pointA.color;
            context.stroke();
        }
    };

    let clearCanvas = function(){
        context.clearRect(0, 0, canvas.width, canvas.height);
    };

    let panCanvas = function(panFrom, panTo){
        panX = prevPan.panX + panFrom.x - panTo.x
        panY = prevPan.panY + panFrom.y - panTo.y
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
