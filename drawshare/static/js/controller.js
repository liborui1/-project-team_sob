window.onload = (function() {
    "use strict";

    const SCALEFACTOR = 1.1;
    let canvas;
    let context;
    let strokes = [[]]; // xy pan zoom
    let paint = false;
    let move = false;
    let lastClick = null;
    let prevPan = {panX: 0, panY: 0};
    let panX = 0;
    let panY = 0;
    let currentAction = "draw";
    let currentColor = "#00FF00";
    let currentScale = 1;
   let Point = (function(){
        return function point(x, y, panX, panY, scaleFactor, color, isDragging){
            return {x, y, panX, panY, scaleFactor, color, isDragging};
        };
    }());
    

    document.querySelector('#draw').addEventListener('click', function (e){
        currentAction = "draw";
    });
    document.querySelector('#move').addEventListener('click', function (e){
        currentAction = "move";
    });
    document.querySelector('#move2').addEventListener('click', function (e){

        api.createLobby(addIncommingPoints, strokes);
      
    });

    document.querySelector('#connectbtn').addEventListener('click', function (e){
        let id = document.querySelector('#peerId').value
        api.connectToBoard(id, addIncommingPoints);
    });
    document.querySelector('#colorbtn').addEventListener('click', function (e){
        let id = document.querySelector('#colorId').value.trim()
         currentColor = id;
    });
    
    let addPoint = function(x, y, dragging){
        let singlePoint = new Point(Math.floor(x/currentScale) + panX, Math.floor(y/currentScale) + panY, panX, panY, currentScale, currentColor, dragging)
       
        strokes[strokes.length - 1].push(singlePoint);

    };

    document.querySelector('#dload').addEventListener('click', function (){
        let dataURI = canvas.toDataURL('image/png', 0.5);
        console.log(dataURI);
        var element = document.createElement('a');
        element.setAttribute('href', dataURI);
        element.setAttribute('download', "Image");
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    });

    document.querySelector('#save').addEventListener('click', function (e){
        let dataURI = canvas.toDataURL('image/png', 0.5);
        api.storeImageURI(dataURI);
    });

    document.querySelector('#load').addEventListener('click', function (e){
        api.getImageURI("testGroup1", function (err, image) {
            console.log(image.imageURI);
        });
    });

 
    let addIncommingPoints = function(data){
       
        data.forEach(function (stroke) {
            strokes.push(stroke)
        })
        redraw();
    }
    let prepareCanvas = function(){
        canvas = document.querySelector('#whiteBoard > canvas');
        let canvasWrapper = document.querySelector('#whiteBoard');
        canvas = document.querySelector('#whiteBoard > canvas');
        canvas.height = canvasWrapper.clientHeight;
        canvas.width = canvasWrapper.clientWidth;
        context = canvas.getContext("2d");
        strokes = [[]]; 

        canvas.onmousedown = function(e){
            let newX = e.pageX - this.offsetLeft;
            let newY = e.pageY - this.offsetTop;
            if (currentAction === "draw"){
                paint = true;
                addPoint(newX , newY, false);
            } else if (currentAction === "move"){
                lastClick = {x:newX, y: newY};
                prevPan = {panX, panY};
                move = true;
            }
            redraw();
        };

        canvas.onmousemove = function(e){
            let newX = e.pageX - this.offsetLeft;
            let newY = e.pageY - this.offsetTop;
            if(paint){
                addPoint(newX, newY, true);
                redraw();
            } else if (move){
                panCanvas(lastClick, {x: newX, y: newY});
                redraw();
            }
        };

        canvas.onmouseup = function(e){
            paint = false;
            move = false;
            // pushes a new empty stroke
            let lastStroke = strokes[ strokes.length - 1 ]
            if (lastStroke.length !== 0){
                let lastPoint = lastStroke[lastStroke.length-1]
                // clone last point
                lastStroke.push({...lastPoint})
                // set last point dragging to false
                lastStroke[lastStroke.length-1].isDragging = false
            }
            api.sendStrokes([strokes[ strokes.length - 1 ]]);
            strokes.push([])
            redraw();
        };

        canvas.onmouseleave = function(e){
            paint = false;
            move = false;
        };

        canvas.addEventListener("wheel", function(e){
            if (event.deltaY < 0){
                context.scale(SCALEFACTOR, SCALEFACTOR)
                currentScale =  SCALEFACTOR * currentScale
                redraw();
                
            }else if (event.deltaY > 0) {
                context.scale(1/SCALEFACTOR, 1/SCALEFACTOR)
                currentScale =  1/SCALEFACTOR * currentScale
                redraw();
            }

            redraw();
        });
    };

    let redraw = function(){
        clearCanvas();
        context.lineJoin = "round";
        context.lineCap = "round";
        context.lineWidth = 5;
   
        for(let i=0; i < strokes.length; i++){
            let currentStroke = strokes[i];

            for(let j=0; j < currentStroke.length; j++){
                context.beginPath();
                let pointA = currentStroke[j]
                let pointB = currentStroke[j - 1]
                if(pointA.isDragging){
                    context.strokeStyle = "#000000";
                    context.moveTo(pointB.x - panX, pointB.y - panY);
                    context.lineTo(pointA.x - panX, pointA.y - panY);
                } else {
                    context.strokeStyle = pointA.color;
                    context.moveTo(pointA.x - panX, pointA.y - panY);
                    context.lineTo(pointA.x - panX, pointA.y - panY);
                }
                context.closePath();
                 
                context.stroke();
            }
        }
    };

    let clearCanvas = function(){
        context.clearRect(0, 0, canvas.width/currentScale , canvas.height/currentScale );
    };

    let panCanvas = function(panFrom, panTo){
        panX = prevPan.panX + (panFrom.x - panTo.x)/currentScale
        panY = prevPan.panY + (panFrom.y - panTo.y)/currentScale
    }
    window.addEventListener("resize", function(e){
        let canvasWrapper = document.querySelector('#whiteBoard');
        canvas = document.querySelector('#whiteBoard > canvas');
        canvas.height = canvasWrapper.clientHeight;
        canvas.width = canvasWrapper.clientWidth;
        context.scale(currentScale, currentScale)
        redraw();
    })
    prepareCanvas();

}());
