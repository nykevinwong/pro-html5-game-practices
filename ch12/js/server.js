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

    websocket.latencyTrips = new Array();
    measureLatency(websocket);

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
                case "latency_pong":
                
                    calculateAverageLatency(websocket);

                    if(websocket.latencyTrips.length < 3)
                    measureLatency(websocket);

                    break;
                case "command":
                    if(websocket.room && websocket.room.status == "running")
                     {
                        if(clientMessage.uids) {
                            websocket.room.commands.push({uids:clientMessage.uids, details:clientMessage.details});
                        }
                        websocket.room.lastTickConfirmed[websocket.color] =  clientMessage.currentTick + websocket.tickLag;
                        console.log("lastTickConfirmed[" + websocket.color + "]:" + websocket.room.lastTickConfirmed[websocket.color]);
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
    
    room.commands = [];
    room.lastTickConfirmed = {"blue":0,"green":0};
    room.currentTick = 0;
  
    // Calculate tick lag for room as the max of both player's tick lags
    var roomTickLag = Math.max(room.players[0].tickLag,room.players[1].tickLag);
    
    room.interval = setInterval(function(){
    // Confirm that both players have send in commands for up to present tick
    if(room.lastTickConfirmed["blue"] >= room.currentTick && room.lastTickConfirmed["green"] >= room.currentTick){
        // Commands should be executed after the tick lag
        sendRoomWebSocketMessage(room,{type:"game_tick", tick:room.currentTick+roomTickLag, commands:room.commands});
        room.currentTick++;
        room.commands = [];
    } else {
        // One of the players is causing the game to lag. Handle appropriately
        if(room.lastTickConfirmed["blue"] < room.currentTick){
            var logtext = "Room" + room.roomId +"Blue is lagging on Tick:" + room.currentTick+ "by" + room.currentTick-room.lastTickConfirmed["blue"];
            if(room.logtext &&  room.logtext != logtext)
            {
                console.log(logtext);
            }
            room.logtext = logtext;
        }
        if(room.lastTickConfirmed["green"] < room.currentTick){
            var logtext = "Room" + room.roomId +"Green is lagging on Tick:" + room.currentTick+ "by" + room.currentTick-room.lastTickConfirmed["green"];
            if(room.logtext &&  room.logtext != logtext)
                {
                    console.log(logtext);
                }
                room.logtext = logtext;
        }
    }
    },100);
}

function measureLatency(socket)
{
    var measurement = {start:Date.now()};
    socket.latencyTrips.push(measurement)
    var clientMessage = {type:"latency_ping"};
    socket.send(JSON.stringify(clientMessage));
}

function calculateAverageLatency(socket){
    var measurement = socket.latencyTrips[socket.latencyTrips.length-1];
    measurement.end = Date.now();
    measurement.roundTrip = measurement.end - measurement.start;
    socket.averageLatency = 0;

    for(var i=0;i < socket.latencyTrips.length-1;i++)
    {
        var measurement = socket.latencyTrips[i];
        console.log(i + " => start:" + measurement.start + ", end:" + measurement.end + ", current round trip:" + measurement.roundTrip)
        socket.averageLatency += socket.latencyTrips[i].roundTrip/2;
    }

    socket.averageLatency = socket.averageLatency /socket.latencyTrips.length;
    socket.tickLag = Math.round(socket.averageLatency * 0.02) + 1;
    console.log("Measuring Latency for player. Attempt", socket.latencyTrips.length, "- Average Latency:",socket.averageLatency, "Tick Lag:", socket.tickLag); 
}