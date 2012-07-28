// Require dependencies
var app = require('http').createServer(handler);
var fs = require('fs');
var ecstatic = require('ecstatic')(__dirname);
var io = require('socket.io').listen(app, {
    log: false
});
var url = require('url');
var request = require('request');

var staticSocketHTML = "";

io.configure(function() {
    io.set("transports", ["xhr-polling"]);
    io.set("polling duration", 10);
});


  fs.readFile('./staticSocketCreator.html', function(error, content) {
            staticSocketHTML = content;
    });


var port = process.env.PORT || 9000;
app.listen(port);


function handler(req, res) {
    var url_parts = url.parse(req.url, true);
    var query = url_parts.query;
    var writerUrl = query.writerURL;
    if (typeof(writerUrl) != "undefined") {
        console.log("writerify:" + writerUrl);
        pipeOtherSite(res, writerUrl);
    } else {
        ecstatic(req, res);
    }
}



function pipeOtherSite(res, url) {
 //   request.get(url).pipe(res);
    request(url, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            res.writeHead(200, { "Content-Type": "text/html" });
            res.end(rewriteOriginHostToTags(body, url));
        }
    })
}


function rewriteOriginHostToTags(html, baseUrl){

 html = html.replace(/<head>|<HEAD>/, "<head>"+ "\n<base href=\""+baseUrl+"\"/>"+"\n" + staticSocketHTML);

 return html;
}


//##### Type-Writerify Specific Stuff stuff



var clients = {};
var tickCollection = {};
var basicSpeed = 15;

var rawHtml = fs.readFileSync(__dirname + '/letter.html', 'ascii');

function parseHtmlToArray(htmlContent) {
    var curPos = 0;
    console.time("Array generation")
    var arr = [];
    while (curPos <= htmlContent.length) {
        var nextChunk = htmlContent.substr(curPos++, 1);
        if (nextChunk === "<") {
            var nextPlusOne = "";

            while (nextPlusOne != ">") {
                nextPlusOne = htmlContent.substr(curPos++, 1)
                nextChunk += nextPlusOne;
            }

        }
        arr.push(nextChunk);
    }
    console.log("Pre created array.length = " + arr.length);
    console.timeEnd("Array generation");
    return arr;
}

var htmlArray = parseHtmlToArray(rawHtml);



// creating a new websocket to keep the content updated without any AJAX request
io.sockets.on('connection', function(socket) {
    console.log("New guy joined: " + socket.id);
    clients[socket.id] = new TypeWriterClient(socket);
    tickCollection[socket.id] = setTimeout(function() {
        broadCast(socket.id)
    }, 200);

    socket.on("change-speed", function(data) {
        clients[this.id].speed = basicSpeed / data.speed;
    })
    socket.on("change-direction", function(data) {
        clients[this.id].direction = data.direction;
    })
});

function broadCast(socketId) {

    var client = clients[socketId];
    if (client.speed > 0) {
        var nextChunk = ""
        if (client.direction === "F") {
            if (htmlArray.length > client.location) {
                nextChunk = htmlArray[client.location++];
            }
        } else {
            if (client.location > 0) {
                nextChunk = htmlArray[client.location--];

            }
        }
        client.socket.emit("broadcast_msg", nextChunk);
    }
    var wait = Math.abs(Math.random() * (client.speed * 10))
    clearTimeout(tickCollection[socketId]);
    tickCollection[socketId] = setTimeout(function() {
        broadCast(socketId)
    }, wait);

}



function TypeWriterClient(socket) {
    this.socket = socket;
    this.location = 0;
    this.speed = basicSpeed;
    this.direction = "F";
}
