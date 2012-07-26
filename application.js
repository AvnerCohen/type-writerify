// Require dependencies
var app = require('http').createServer(handler)
    ,fs = require('fs')
    ,ecstatic = require('ecstatic')(__dirname)
    ,io = require('socket.io').listen(app, {
        log: false
    });

var port = process.env.PORT || 9000;
app.listen(port);

// on server started we can load our client.html page
var fileContent = "";
var clients = {};

var fileContent = fs.readFileSync(__dirname + '/letter.html', 'ascii');


function handler(req, res) {

   ecstatic(req, res);
}


// creating a new websocket to keep the content updated without any AJAX request
io.sockets.on('connection', function(socket) {
    console.log("New guy joined: " + socket.id);
    clients[socket.id] = [socket, 0];
});

var broadCastToClients = function() {
        for (var c in clients) {
            var client = clients[c];
            if (fileContent.length > client[1]) {
                  var nextChunk = fileContent.substr(++client[1], 1);
                  if (nextChunk === "<"){
                    var nextPlusOne= "";

                    while(nextPlusOne != ">"){
                      nextPlusOne = fileContent.substr(++client[1], 1)
                      nextChunk += nextPlusOne;
                    }
                  }
                client[0].emit("broadcast_msg", nextChunk);
            }
        }
      var wait = Math.abs(Math.random()*150)        
      clearTimeout(tick);
      tick = setTimeout(broadCastToClients, wait);

    }

var tick = setTimeout(broadCastToClients, 200);
