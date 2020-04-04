window.onload = (function() {
    "use strict";

    const SCALEFACTOR = 1.1;
    const MAXSCALEFACTOR = 100*SCALEFACTOR;
    const MINSCALEFACTOR =  SCALEFACTOR/100;
    // Top layer canvas for isolating drawing mousemovement vs drawings for better performace
    // Redrawing all points everytime a user moves their mouse is taxing therefore layering the canvas
    // only updates the top layer canvas while the users move their mouse
    let canvas;
    let context;
    // TopLayers responsibilities are to pass any mouse interaction to bottom layer from localside e.g. draw action should be 
    // drawen in the bottom layer
    //Toplayer should also be responsible for drwaing mouse movements for users in the lobby
    let drawingCanvasLayer;
    let drawingContext;

    let strokes = [[]]; // xy pan zoom
    let lastStrokes = []
    let paint = false;
    let move = false;
    let lastClick = null;
    let prevPan = {panX: 0, panY: 0};
    let panX = 0;
    let panY = 0;
    let currentAction = "draw";
    let currentFont = 5;
    let currentColor = "#000000";
    let currentLobbyName = '';
    let currentScale = 1;
    let userMice = {};

    localStorage.removeItem('lobby');
    api.onUserUpdate(function(username){
        if (username) {
            localStorage.setItem("signedIn", "");
        } else {
            localStorage.setItem("signedIn", "not signed in");
        }
    });
    let isLoad = false;
    let Point = (function(){
            return function point(x, y, panX, panY, scaleFactor, color, font, isDragging){
                return {x, y, panX, panY, scaleFactor, color, font, isDragging};
            };
        }());
        

    let addPoint = function(x, y, dragging){
        let singlePoint = new Point(x/currentScale + panX, y/currentScale + panY, panX, panY, currentScale, currentColor, currentFont / currentScale, dragging)
        strokes[strokes.length - 1].push(singlePoint);
        return singlePoint;
    };
 
    document.querySelector('#dload').addEventListener('click', function (){
        let dataURI = drawingCanvasLayer.toDataURL('image/png', 0.5);
        console.log(dataURI);
        let element = document.createElement('a');
        element.setAttribute('href', dataURI);
        element.setAttribute('download', "Image");
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    });

    document.querySelector('#save').addEventListener('click', function (e){
        if ((localStorage.getItem("signedIn") != "")) {
            localStorage.setItem("signedIn", "**You must be signed in to create save**");
            window.location.href = '/login.html';
        }
        // let name = document.querySelector("#saveName").value || "";
        // if (name !== ""){
        //     api.saveBoard(strokes, name);
        // }
        document.querySelector('#newSave').style.display = 'block';
    });
    
    document.querySelector('#move2').addEventListener('click',function(e) {
        if ((localStorage.getItem("signedIn") != "")) {
            localStorage.setItem("signedIn", "**You must be signed in to create lobby**");
            window.location.href = '/login.html';
        }
        if (currentLobbyName != "") {
            document.querySelector("#lobbyInfo").style.visibility = "visible";
            document.querySelector("#lobbylink").value = document.location.host + '/joinBoard/' + currentLobbyName;
        } else {
            document.querySelector("#lobbyInfo").style.visibility = "hidden";
            document.querySelector("#lobbylink").value = "";
        }
        document.querySelector('#newLobby').style.display = 'block';
    });

    document.querySelector('#exit').addEventListener('click',function(e) {
        document.querySelector('#newLobby').style.display = 'none';
        document.querySelector('#copied').style.visibility = "hidden";
    });
    
    document.querySelector("#Sboard").addEventListener('click', function(e) {
        document.querySelector('#copied').style.visibility = "hidden";
        let lobbyName = document.getElementById("boardName").value;
        let lobbyPass = '';
        document.querySelector('#newLobby').style.display = 'none';
        document.querySelector("#lobbyName").innerHTML = lobbyName;
        if (lobbyName !== '') {
            currentLobbyName = lobbyName;
            localStorage.setItem('lobby', lobbyName);
            api.createLobby(onIncommingData, strokes, lobbyName,lobbyPass);
        }
    });
    
    document.querySelector('#exitS').addEventListener('click',function(e) {
        document.querySelector('#newSave').style.display = 'none';
    });
    
    document.querySelector("#saveB").addEventListener('click', function(e) {
        document.querySelector('#newSave').style.display = 'none';
        let name = document.querySelector("#saveName").value || "";
        if (name !== ""){
            api.saveBoard(strokes, name);
        }
    });
    document.querySelector('#copyLink').addEventListener('click', function(e) {
        //https://www.w3schools.com/howto/tryit.asp?filename=tryhow_js_copy_clipboard
        document.querySelector('#copied').style.visibility = "visible";
        let copyText = document.querySelector("#lobbylink");
        copyText.select();
        copyText.setSelectionRange(0, 99999);
        document.execCommand("copy");
        
    });
    document.querySelector('#clearBoard').addEventListener('click', function(e) {
        //https://www.w3schools.com/howto/tryit.asp?filename=tryhow_js_copy_clipboard
        // empty data
        strokes = [[]]
        //send new empty data
        api.sendResyncBoard(strokes)
        redraw();
    });
    
    let onIncommingData = function(data){
        let checkedData = data.strokes || [];
        //console.log( "------------------Incomming----------------- "   ) 
        //console.log( "Incomming data Length: " + (checkedData.length)  ) 
       // console.log( "Incomming data : " +  (JSON.stringify(data))) 
        if (isLoad){
            isLoad = false
            // if we want to load in strokes to everyone else, then wait for the initialsync and reload
            api.sendResyncBoard(strokes)
        } else if (data.action === "initialSync"){
            strokes = data.initialSync
            redraw();
        } else if (data.action === "reSync"){
            strokes = data.reSync
            redraw();
        } else if (data.action === "removeStrokes"){
            checkedData.forEach(function (stroke) {
                removeIncommingStroke(stroke);
                redraw();
            });
        } else if (data.action === "addStrokes"){
            checkedData.forEach(function (stroke) {
                strokes.splice(strokes.length - 1, 0 , stroke );
                draw(stroke);
            })
        } else if (data.action === "mouseData"){
            let user = data.mouseData;
            //replace mousePosition

            userMice[user.userName] = user;
            topLayerRedraw();
        }
        // MouseData
    }


    let sendSyncData = function(){
        return strokes
    }
    // Incomming data is formatted different than local data therefore to parse it we use a different remove function
    let removeIncommingStroke = function (stroke){
        let i = 0;
        while (i < strokes.length){
            // find the stroke and delete it
             if (stroke.length === 0){
                break;
            // if the segment of the stroke is found then remove it and continue
             } else if ( JSON.stringify(strokes[i]) === JSON.stringify(stroke[0])){
                strokes.splice(i, 1);
                stroke.splice(0, 1);
                // accomidate for shift after splicing
                i--;
             }
            i++;
        }
        if (strokes.length === 0) strokes.push([])
        redraw();
    }
 
    let removeStrokeLocal = function (stroke){
        let i = 0;
        while (i < strokes.length){
            // find the stroke and delete it
             if (stroke.length === 0){
                break;
            // if the segment of the stroke is found then remove it and continue
             } else if ( strokes[i] === stroke){
                strokes.splice(i, 1);
             }
             i++;
        }
        if (strokes.length === 0) strokes.push([])
        redraw();
    }
    
    let removeLastStroke = function(){
        if (lastStrokes.length !== 0){
            let mostRecentStroke = lastStrokes[lastStrokes.length - 1];
            lastStrokes.splice(lastStrokes.length - 1, 1)
            // package Local Stroke into expected stroke for the peer
            let packagedStroke = []
            for (let i = 0; i < mostRecentStroke.length; i++){
                if (mostRecentStroke[i+1] !== null){
                    packagedStroke.push([mostRecentStroke[i],  mostRecentStroke[i+1]]);
                }
            }
            api.sendRemoveStrokes([packagedStroke]);
            removeStrokeLocal(mostRecentStroke);
        }
    };
    
    let loadSave = function (){
        if (localStorage.getItem('loadSave')){
            let loadIndex = localStorage.getItem('loadSave');
            //get saved strijes
            api.onLoadSave( loadIndex, function (save){
                strokes = save.boardData
                redraw();
            });
            isLoad = true;
            localStorage.removeItem('loadSave');
            localStorage.removeItem('lobby');
        }
    }


    let prepareCanvas = function(){
        canvas = document.querySelector('#whiteBoard > #canvasMouseMovements');
        drawingCanvasLayer = document.querySelector('#whiteBoard > #canvasdrawing');
        let canvasWrapper = document.querySelector('#whiteBoard');
 
        drawingCanvasLayer.height = canvasWrapper.clientHeight;
        drawingCanvasLayer.width = canvasWrapper.clientWidth;
        canvas.height = canvasWrapper.clientHeight;
        canvas.width = canvasWrapper.clientWidth;
        // draw on bottom layer and detect mouse activity on top layer
        drawingContext = drawingCanvasLayer.getContext("2d");
        context = canvas.getContext("2d");
        strokes = [[]]; 
   
        // https://stackoverflow.com/questions/16006583/capturing-ctrlz-key-combination-in-javascript
        function keyPressed(e) {
            if (e.code == 'KeyZ' && e.ctrlKey) removeLastStroke();
        }

        canvas.addEventListener("keydown", function (e){
            keyPressed(e)
        })
        canvas.onmousedown = function(e){
            let newX = e.pageX - this.offsetLeft;
            let newY = e.pageY - this.offsetTop;
            if (currentAction === "draw"){
                paint = true;
                currentFont = 5;
                // send dot
                api.sendStrokes([[addPoint(newX , newY, false), addPoint(newX , newY, false)]]);

            } else if (currentAction === "move"){
                lastClick = {x:newX, y: newY};
                prevPan = {panX, panY};
                move = true;
            } else if (currentAction === "erase") {
                paint = true;
                currentColor = "#F5F5F5";
                currentFont = 50;
                addPoint(newX , newY, false);
            }
            redraw();
        };

        canvas.onmousemove = function(e){
            let newX = e.pageX - canvas.offsetLeft;
            let newY = e.pageY - canvas.offsetTop;

            let sendMouseData = function(userName){
                return {userName: userName, mouseX:newX/currentScale + panX, mouseY: newY/currentScale + panY }
            }
            // give mouse data to other users so that they can track them on their end
            api.sendMouseData(sendMouseData)

            if(paint){
                // send bit by bit
                let prevStroke = strokes[strokes.length - 1];
                let lastPoint = prevStroke[prevStroke.length - 1];
                let newPoint = addPoint(newX, newY, true);
               draw([lastPoint, newPoint])
               api.sendStrokes([[lastPoint, newPoint]]);
            } else if (move){
                panCanvas(lastClick, {x: newX, y: newY});
                redraw();
            }
        };

        canvas.onmouseup = function(e){
            paint = false;
            move = false;
            let lastStroke = strokes[strokes.length - 1]
            // only add last stroke if we're drawing
            if (currentAction === "draw"){
                lastStrokes.push(lastStroke)
                strokes.push([]);
            }
          
        };

        canvas.onmouseleave = function(e){
            paint = false;
            move = false;
        };

        canvas.addEventListener("wheel", function(e){
            // Zoom out
            if (event.deltaY < 0 && currentScale < MAXSCALEFACTOR){
                drawingContext.scale(SCALEFACTOR, SCALEFACTOR);
                
                currentScale =  SCALEFACTOR * currentScale;
            //Zoom In
            }else if (event.deltaY > 0 && currentScale > MINSCALEFACTOR) {
                drawingContext.scale(1/SCALEFACTOR, 1/SCALEFACTOR);
             
                currentScale =  1/SCALEFACTOR * currentScale;
            }
 
            redraw();
        });
    };

    let topLayerRedraw = function(){
        clearCanvasTopLayer();
        context.font = "20px Verdana";
         for (let userName in userMice){
            let user = userMice[userName];
            context.beginPath();
            context.arc(user.mouseX*currentScale, user.mouseY*currentScale, 50, 0, 2 * Math.PI);
            context.stroke();
            context.fillText(user.userName, user.mouseX*currentScale, user.mouseY*currentScale);
        };
    }

    // Redraw is constly operation to do everytime we draw, therefore we use draw instead of redraw to add on to the current canvas rather than redrawing the entire canvas
    let redraw = function(){
        clearCanvas();
        drawingContext.lineJoin = "round";
        drawingContext.lineCap = "round";
        drawingContext.lineWidth = 5 ;
   
        for(let i=0; i < strokes.length; i++){
            let currentStroke = strokes[i];

            for(let j=0; j < currentStroke.length; j++){
                drawingContext.beginPath();
                let pointA = currentStroke[j]
                let pointB = currentStroke[j - 1]
                if(pointA.isDragging){
                   if (pointB){
                    drawingContext.moveTo(pointB.x - panX, pointB.y - panY);
                    drawingContext.lineTo(pointA.x - panX, pointA.y - panY);
                   } else{
                       console.log()
                   }
               
                } else {
                    drawingContext.moveTo(pointA.x - panX, pointA.y - panY);
                    drawingContext.lineTo(pointA.x - panX, pointA.y - panY);
                }
                drawingContext.lineWidth = pointA.font;
                drawingContext.closePath();
                drawingContext.strokeStyle = pointA.color;
                drawingContext.stroke();
            }
        }
    };

    let draw = function(stroke){
        drawingContext.lineJoin = "round";
        drawingContext.lineCap = "round";
        drawingContext.lineWidth = 5 ;
        let currentStroke = stroke;

        for(let j=0; j < currentStroke.length; j++){
            drawingContext.beginPath();
            let pointA = currentStroke[j]
            let pointB = currentStroke[j - 1]
            if(pointA.isDragging){
               if (pointB){
                drawingContext.moveTo(pointB.x - panX, pointB.y - panY);
                drawingContext.lineTo(pointA.x - panX, pointA.y - panY);
               } else{
                   console.log()
               }
            } else {
                drawingContext.moveTo(pointA.x - panX, pointA.y - panY);
                drawingContext.lineTo(pointA.x - panX, pointA.y - panY);
            }
            drawingContext.lineWidth = pointA.font;
            drawingContext.closePath();
            drawingContext.strokeStyle = pointA.color;
            drawingContext.stroke();
        }
    };

    let clearCanvas = function(){
        drawingContext.clearRect(0, 0, drawingCanvasLayer.width/currentScale , drawingCanvasLayer.height/currentScale );
    };
    let clearCanvasTopLayer = function(){
        context.clearRect(0, 0, canvas.width/currentScale , canvas.height/currentScale );
    };

    let panCanvas = function(panFrom, panTo){
        panX = prevPan.panX + (panFrom.x - panTo.x)/currentScale
        panY = prevPan.panY + (panFrom.y - panTo.y)/currentScale
    }
    window.addEventListener("resize", function(e){
        let canvasWrapper = document.querySelector('#whiteBoard');
        drawingCanvasLayer = document.querySelector('#whiteBoard > #canvasdrawing');
        canvas = document.querySelector('#whiteBoard > #canvasMouseMovements');

        drawingCanvasLayer.height = canvasWrapper.clientHeight;
        drawingCanvasLayer.width = canvasWrapper.clientWidth;

        canvas.height = canvasWrapper.clientHeight;
        canvas.width = canvasWrapper.clientWidth;
        drawingContext.scale(currentScale, currentScale)
        redraw();
    })
  
    loadSave();
    prepareCanvas();

    // https://html-online.com/articles/get-url-parameters-javascript/
    function getUrlVars() {
        let vars = {};
        let parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
            vars[key] = value;
        });
        return vars;
    }
    // Try connecting using URL
    if (getUrlVars()["lobby"]){
        let lobbyName = getUrlVars()["lobby"]; 
        // prompt user to give pass or something
        let lobbyPass = "";
        clearCanvas();
        strokes = [[]];
        if (lobbyName !== '') {
            currentLobbyName = lobbyName
            localStorage.setItem('lobby', lobbyName);
            api.connectToBoard(onIncommingData, sendSyncData, lobbyName, lobbyPass);
        }
    }
     
    document.querySelector('#color').style.background = currentColor;
    document.querySelector('#draw').addEventListener('click', function (e){
        let id = document.querySelector('#colorId').value;
        
         if ((id == "") || (id == null)) {
             id = '#000000';
         }
         currentColor = id;
        currentAction = "draw";
    });
    document.querySelector('#erase').addEventListener('click', function (e){
        currentAction = "erase";
    });
    document.querySelector('#move').addEventListener('click', function (e){
        currentAction = "move";
    });
    document.querySelector('#home').addEventListener('click', function (e){
        panX = 0;
        panY = 0;
        currentScale = 1;
        let canvasWrapper = document.querySelector('#whiteBoard');
        canvas.height = canvasWrapper.clientHeight;
        canvas.width = canvasWrapper.clientWidth;
        drawingCanvasLayer.height = canvasWrapper.clientHeight;
        drawingCanvasLayer.width = canvasWrapper.clientWidth;
        redraw();
    });
    // document.querySelector('#shareBoard').addEventListener('click', function (e){
    //     if (currentLobbyName != ""){
    //         alert(document.location.host + '/joinBoard/' + currentLobbyName)
    //     }
    // });

    document.querySelector('#colorPalette').addEventListener('click', function (e){
        let id = document.querySelector('#colorId').value.trim()
        currentColor = id;
        if ((id == "") || (id == null)) {
             id = '#000000';
         }
             document.querySelector('#color').style.background = id;
    });

    let header = document.getElementById("toolBar");
    let icons = header.getElementsByClassName("icon");
    console.log(icons.length);
    for (var i = 0; i < icons.length; i++) {
    icons[i].addEventListener("click", function() {
        var current = document.getElementsByClassName("active");
        current[0].className = current[0].className.replace(" active", "");
        this.className += " active";
        });
    }

}());