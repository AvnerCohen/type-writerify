// Require dependencies
var app = require('http').createServer(handler);
var fs = require('fs');
var ecstatic = require('ecstatic')(__dirname);
var io = require('socket.io').listen(app, {
    log: false
});

var port = process.env.PORT || 9000;
app.listen(port);

// on server started we can load our client.html page
var fileContent = "";
var clients = {};
var tickCollection = {};

var fileContent = fs.readFileSync(__dirname + '/letter.html', 'ascii');


function handler(req, res) {
    ecstatic(req, res);
}


// creating a new websocket to keep the content updated without any AJAX request
io.sockets.on('connection', function(socket) {
    console.log("New guy joined: " + socket.id);
    clients[socket.id] = new TypeWriterClient(socket);
    tickCollection[socket.id] = setTimeout(function() {
        broadCast(socket.id)
    }, 200);
});

var broadCast = function(socketId) {

        var client = clients[socketId];

        if (fileContent.length > client.location) {
            var nextChunk = fileContent.substr(++client.location, 1);
            if (nextChunk === "<") {
                var nextPlusOne = "";

                while (nextPlusOne != ">") {
                    nextPlusOne = fileContent.substr(++client.location, 1)
                    nextChunk += nextPlusOne;
                }
            }
            client.socket.emit("broadcast_msg", nextChunk);
        }
        var wait = Math.abs(Math.random() * (client.speed * 100))
        clearTimeout(tickCollection[socketId]);
        tickCollection[socketId] = setTimeout(function() {
            broadCast(socketId)
        }, wait);

    }



function TypeWriterClient(socket) {

    this.socket = socket;
    this.location = -1;
    this.speed = 1.5;
}
