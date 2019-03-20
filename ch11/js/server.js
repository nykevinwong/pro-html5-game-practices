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
                joinRoom(websocket, clientMessage.roomId);
                sendRoomList(sockets);
                break;
                case "leave_room":
                leaveRoom(websocket, clientMessage.roomId);
                sendRoomList(sockets);
                break;
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
    room.players.push(socket);   
    var color = updateRoomStatus(room);
    socket.color = color;

    console.log("connection [" + socket.id  + "] joined the room.");
    socket.send(JSON.stringify({type:"joined_room", roomId: roomId, color: socket.color}));
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