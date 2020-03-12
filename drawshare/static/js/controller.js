window.onload = (function() {
    "use strict";

    const SCALEFACTOR = 1.1;
    let canvas;
    let context;
    let points = []; // xy pan zoom
    let strokes = [];
    let paint = false;
    let move = false;
    let lastClick = null;
    let prevPan = {panX: 0, panY: 0};
    let panX = 0;
    let panY = 0;
    let currentAction = "draw";
    let currentColor = "#000000";
    document.querySelector('#color').style.background = currentColor;
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

        api.createLobby(addIncommingPoints, points);
      
    });

    document.querySelector('#connectbtn').addEventListener('click', function (e){
        let id = document.querySelector('#peerId').value;
        api.connectToBoard(id, addIncommingPoints);
    });
    document.querySelector('#colorPalette').addEventListener('click', function (e){
        let id = document.querySelector('#colorId').value.trim();
        currentColor = id;
         if (id == "") {
             id = '#000000';
         }
         document.querySelector('#color').style.background = id;
    });
    
    let addPoint = function(x, y, dragging){
        let singlePoint = new Point(Math.floor(x/currentScale) + panX, Math.floor(y/currentScale) + panY, panX, panY, currentScale, currentColor, dragging);
        points.push(singlePoint);
        strokes.push(singlePoint);
        console.log(points);
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
        canvas.scale(1/100, 1/100);
        canvas.stroke();
        let dataURI = canvas.toDataURL('image/jepg', 1.0);
        api.storeImageURI(dataURI, "testGroup1");
    });


    let addClick = function(x, y, dragging){
        points.push(new Point((x/ currentScale) + panX  , (y/currentScale) + panY, panX, panY, currentScale, currentColor, dragging));
    };

    let addIncommingPoints = function(data){
        data.forEach(function (pt) {
            let {x, y, panX, panY, scaleFactor, color, isDragging} = pt;
            let singlePoint = new Point(x, y, panX, panY, scaleFactor, color, isDragging);
            points.push(singlePoint);
        });
        redraw();
    };
    let prepareCanvas = function(){
        canvas = document.querySelector('#whiteBoard > canvas');
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
       
            api.sendStrokes(strokes);
            strokes = [];
        };

        canvas.onmouseleave = function(e){
            paint = false;
            move = false;
        };

        canvas.addEventListener("wheel", function(e){
            if (event.deltaY < 0){
                context.scale(SCALEFACTOR, SCALEFACTOR);
                currentScale =  SCALEFACTOR * currentScale;
                redraw();
                
            }else if (event.deltaY > 0) {
                context.scale(1/SCALEFACTOR, 1/SCALEFACTOR);
                currentScale =  1/SCALEFACTOR * currentScale;
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
    
        for(let i=0; i < points.length; i++){
            context.beginPath();
            let pointA = points[i];
            let pointB = points[i - 1];
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
        context.clearRect(0, 0, canvas.width/currentScale , canvas.height/currentScale );
    };

    let panCanvas = function(panFrom, panTo){
        panX = prevPan.panX + (panFrom.x - panTo.x)/currentScale;
        panY = prevPan.panY + (panFrom.y - panTo.y)/currentScale;
    };
    window.addEventListener("resize", function(e){
        let canvasWrapper = document.querySelector('#whiteBoard');
        canvas = document.querySelector('#whiteBoard > canvas');
        canvas.height = canvasWrapper.clientHeight;
        canvas.width = canvasWrapper.clientWidth;
        context.scale(currentScale, currentScale);
        redraw();
    });
    prepareCanvas();

}());
