// Require dependencies
var app = require('http').createServer(handler),
    fs = require('fs'),
    io = require('socket.io').listen(app, {
        log: false
    });

var port = process.env.PORT || 9000;
app.listen(port);

// on server started we can load our client.html page
var fileContent = "";
var clients = {};

var fileContent = fs.readFileSync(__dirname + '/sometext.txt', 'ascii');


function handler(req, res) {
    fs.readFile(__dirname + '/type-writer.html', function(err, data) {
        if (err) {
            console.log(err);
            res.writeHead(500);
            return res.end('Error loading client.html');
        }
        res.writeHead(200);
        res.end(data);
    });
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
                client[0].emit("broadcast_msg", fileContent.substr(client[1]++, 1));
            }
        }
      var wait = Math.abs(Math.random()*300)        
      clearTimeout(tick);
      tick = setTimeout(broadCastToClients, wait);

    }

var tick = setTimeout(broadCastToClients, 200);
