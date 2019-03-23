var http = require('http');

var server = http.createServer(function(request, response){
    console.log('Received HTTP request for url:' + request.url);
    response.writeHead(200, { 'Content-Type':'text/plain'});
    response.end('This is a http server');
});

server.listen(8080, function() {
    console.log('Server has started listening on port 8080');
});

var WebSocketServer = require('websocket').server;
var wsServer = new WebSocketServer( 
    {httpServer: server,
     autoAcceptConnections: false} );

function connectionIsAllowed(request) {
    return true;
}
var sockets = new Array();
var count = 0;

// Initialize a set of rooms
var gameRooms = [];
for (var i=0; i < 10; i++) {
    gameRooms.push({status:"empty",players:[],roomId:i+1});
};
  

wsServer.on('request', function(request) {

    var websocket = request.accept();
    console.log('WebSocket Connectin from ' + request.remoteAddress + ' accepted.');
    websocket.id = ++count;
    sendRoomList([websocket]); // send the room list to first-time joinner.

    sockets.push(websocket);
    
    websocket.on('message', function(message){
        if(message.type === 'utf8') {
            console.log("Received Message [" + websocket.id  + "]:" + message.utf8Data);
            var clientMessage = JSON.parse(message.utf8Data);
            switch(clientMessage.type)
            {
                case "join_room":
                var room = joinRoom(websocket, clientMessage.roomId);
                sendRoomList(sockets);

                if(room.players.length==2) // start the game when at least 2 palyer is joined.
                {
                    initGame(room);
                }

                break;
                case "leave_room":
                leaveRoom(websocket, clientMessage.roomId);
                sendRoomList(sockets);
                break;
                case "initialized_level":
                websocket.room.playersReady++;
                if (websocket.room.playersReady==2){
                    startGame(websocket.room);
                }
                break;
                default:
                console.log("no actino for message type: " + clientMessage.type);
            }

        }
    });

    websocket.on('close', function(reasonCode, description)
    {
        console.log("connection [" + websocket.id  + "] is closed.");
        for(var i=sockets.length-1;i>=0;i--)
            {
                if(sockets[i]==websocket)
                    {
                        if(websocket.roomId)
                        leaveRoom(websocket, websocket.roomId);
                        sockets.splice(i,1);
                        sendRoomList(sockets);
                        break;
                    }
            }

            
    });



});

function joinRoom(socket, roomId) {
    var room = gameRooms[roomId-1];
    socket.roomId = roomId;
    socket.room = room;
    room.players.push(socket);   
    var color = updateRoomStatus(room);
    socket.color = color;

    console.log("connection [" + socket.id  + "] joined the room.");
    socket.send(JSON.stringify({type:"joined_room", roomId: roomId, color: socket.color}));
    return room;
}

function leaveRoom(socket, roomId) {
    var room = gameRooms[roomId-1];
    console.log("connection [" + socket.id  + "] leave the room.");
    for(var i=room.players.length-1;i>=0;i--)
    {
        if(room.players[i]==socket)
            {
                room.players.splice(i,1);                
            }
    }

    updateRoomStatus(room);
}

function updateRoomStatus(room)
{
    if(room.players.length==0)
        {
        room.status = "empty";
        return null;
        }    
    else if(room.players.length==1)
        {
        room.status = "waiting";
        return "blue";
    }
    else if(room.players.length==2)
        {
            room.status = "starting";
            return "green";
        }

        return null;
}


function sendRoomList(sockets) {
    var status = [];

    for(var i=0;i< gameRooms.length;i++)
    {
        status.push(gameRooms[i].status);
    }

    var clientMessage = { type:"room_list", status: status};

    for(var i=0;i<sockets.length;i++)
    sockets[i].send(JSON.stringify(clientMessage));
}

function sendRoomWebSocketMessage(room,messageObject){
    var messageString = JSON.stringify(messageObject);
    for (var i = room.players.length - 1; i >= 0; i--){
        room.players[i].send(messageString);
    };
}

function initGame(room)
{
    room.playersReady = 0;
    var locationCandidate = [0,1,2,3];
    var locations = { 
        "blue": locationCandidate.splice(Math.floor(Math.random()*locationCandidate.length) ,1),
        "green": locationCandidate.splice(Math.floor(Math.random()*locationCandidate.length) ,1)
    };
    var currentLevel = 0;
    sendRoomWebSocketMessage(room, { type:"init_level", spawnLocations: locations, level: currentLevel });
}

function startGame(room)
{
    room.status = "running";
    sendRoomList(sockets);
    sendRoomWebSocketMessage(room, { type:"start_game"});
    
}