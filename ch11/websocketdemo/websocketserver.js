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
var wsServer = new WebSocketServer( {httpServer: server} );

function connectionIsAllowed(request) {
    return true;
}
var sockets = new Array();
var count = 0;

wsServer.on('request', function(request) {

    var websocket = request.accept();
    console.log('WebSocket Connectin from ' + request.remoteAddress + ' accepted.');
    websocket.send('you are now connected!!');
    websocket.id = ++count;

    websocket.on('message', function(message){
        if(message.type === 'utf8') {
            console.log("Received Message [" + websocket.id  + "]:" + message.utf8Data);
       //     websocket.send('Server said: received ' + message.utf8Data);

            for(var i=0;i<sockets.length;i++)
            {
                var s = sockets[i];
                if(s.id != websocket.id)
                    {
                        s.send("connection [" + websocket.id + "] said: "+ message.utf8Data);
                    }
            }
        }
    });

    websocket.on('close', function(reasonCode, description)
    {
        console.log("connection [" + websocket.id  + "] is closed.");
    });

    sockets.push(websocket);

});
