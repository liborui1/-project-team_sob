window.onload = (function() {
    "use strict";

    const SCALEFACTOR = 1.1;
    let canvas;
    let context;
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
    };

    document.querySelector('#dload').addEventListener('click', function (){
        let dataURI = canvas.toDataURL('image/png', 0.5);
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
   
    let onIncommingData = function(data){
        let checkedData = data.strokes || [];
        if (isLoad){
            isLoad = false
            // if we want to load in strokes to everyone else, then wait for the initialsync and reload
            api.sendResyncBoard(strokes)
        } else if (data.action === "initialSync"){
            strokes = data.initialSync
        } else if (data.action === "reSync"){
            strokes = data.reSync
        } else if (data.action === "removeStrokes"){
            
            checkedData.forEach(function (stroke) {
                removeStroke(stroke);
            });
        } else if (data.action === "addStrokes"){
            checkedData.forEach(function (stroke) {
                strokes.splice(strokes.length - 1, 0 , stroke )
            })
        }
        redraw();
    }


    let sendSyncData = function(){
        return strokes
    }
 
    let removeStroke = function (stroke){
        let index = strokes.findIndex( function (item) {
            return  JSON.stringify(item) === JSON.stringify(stroke);
        });
        if (index !== -1) strokes.splice(index, 1);

        if (strokes.length === 0) strokes.push([])
        redraw();
    }
    
    let removeLastStroke = function(){
        if (lastStrokes.length !== 0){
            let mostRecentStroke = lastStrokes[lastStrokes.length - 1];
            lastStrokes.splice(lastStrokes.length - 1, 1)
            api.sendRemoveStrokes([mostRecentStroke]);
            removeStroke(mostRecentStroke);
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
        canvas = document.querySelector('#whiteBoard > canvas');
        let canvasWrapper = document.querySelector('#whiteBoard');
        canvas = document.querySelector('#whiteBoard > canvas');
        canvas.height = canvasWrapper.clientHeight;
        canvas.width = canvasWrapper.clientWidth;
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
                addPoint(newX , newY, false);
            } else if (currentAction === "move"){
                lastClick = {x:newX, y: newY};
                prevPan = {panX, panY};
                move = true;
            } else if (currentAction === "erase") {
                paint = true;
                currentColor = "#F5F5F5";
                addPoint(newX , newY, false);
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
            let lastStroke = strokes[strokes.length - 1]
            if (lastStroke.length !== 0){
                let lastPoint = lastStroke[lastStroke.length-1]
                // clone last point
                lastStroke.push({...lastPoint})
                // set last point dragging to false
                lastStroke[lastStroke.length-1].isDragging = false
            }
            // send to all users the last stroke made
            api.sendStrokes([lastStroke]);

            lastStrokes.push(lastStroke)
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
   
        context.lineWidth = 5 ;
   
        for(let i=0; i < strokes.length; i++){
            let currentStroke = strokes[i];

            for(let j=0; j < currentStroke.length; j++){
                context.beginPath();
                let pointA = currentStroke[j]
                let pointB = currentStroke[j - 1]
                if(pointA.isDragging){
                   
                    context.moveTo(pointB.x - panX, pointB.y - panY);
                    context.lineTo(pointA.x - panX, pointA.y - panY);
                } else {
                    context.moveTo(pointA.x - panX, pointA.y - panY);
                    context.lineTo(pointA.x - panX, pointA.y - panY);
                }
                context.lineWidth = pointA.font;
                context.closePath();
                context.strokeStyle = pointA.color;
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