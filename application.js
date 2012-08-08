// Require dependencies
var app = require('http').createServer(handler);
var fs = require('fs');
var ecstatic = require('ecstatic')(__dirname);
var io = require('socket.io').listen(app, {
    log: false
});
var url = require('url');
var request = require('request');
//var cheerio = require('cheerio');
var mainTemplate = "";

var staticLetter = "";


io.configure(function() {
    io.set("transports", ["xhr-polling"]);
    io.set("polling duration", 10);
});


fs.readFile('./i-wrote-it2.html', function(error, content) {
    staticLetter = content;

});


fs.readFile('./typewriter.html', function(error, content) {
    mainTemplate = content;
});


var port = process.env.PORT || 9000;
app.listen(port);


function handler(req, res) {
    var url_parts = url.parse(req.url, true);
    var query = url_parts.query;
    var writerUrl = query.writerURL;
    var requestUrl = req.url;
    //See if file needs to be proxied or not to original site
 /*
    if (requestUrl.indexOf(".js") != -1 || requestUrl.indexOf(".css") != -1 && (
        requestUrl.indexOf("typewriter") == -1 && requestUrl.indexOf("type-writer-styles.css") == -1 && requestUrl.indexOf("socket.io.js") == -1) ) {
        console.log("need to proxy: " + requestUrl);
        //Compose origin url : 
        var param = extractRequestUrl(req.headers.referer)
        var fileAt = (param + requestUrl);
        request(fileAt).pipe(res);

    } else */if (req.url.indexOf("singit")!= -1){
        pipeArrayFromStaticLetter(req, res);
    }

    else if (typeof(writerUrl) != "undefined") {
        console.log("writerify:" + writerUrl);
        pipeOtherSite(res, writerUrl);
    } else {
        ecstatic(req, res);
    }
}

function pipeArrayFromStaticLetter(req, res){
    res.end(staticLetter.toString());
}

function extractRequestUrl(referer) {
    var returnString = "";
    returnString = unescape(referer.substr(referer.lastIndexOf("=")+1, referer.length));

    returnString = trimLastSlash(returnString);
    return returnString;
}

function trimLastSlash(baseUrl) {
    var url = baseUrl;
    if (baseUrl.indexOf("/") != baseUrl.length) {
        url = baseUrl.substring(0, baseUrl.lastIndexOf("/"));
    }

    return url;

}

function pipeOtherSite(res, url) {
    //   request.get(url).pipe(res);
    request(url, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            res.writeHead(200, {
                "Content-Type": "text/html"
            });
            var randClient = randomString(64);
            //Store temporary
            var alteredBody = rewriteOriginHostToTags(body, url);
            alteredBody = alteredBody.replace(/(  )*/, " ");

            sourceSites[randClient] = parseHtmlToArray(alteredBody);

            //var $ = cheerio.load(alteredBody);
            //sourceSites[randClient] = htmlToObjectGraph($);

            // The old WAY
            //console.log(sourceSites[randClient].length);
            //sourceSites[randClient] = sourceSites[randClient].replace(/( )*/, " ");
            //console.log(sourceSites[randClient].length);
            //sourceSites[randClient] = parseHtmlToArray(sourceSites[randClient]);
            //console.log(sourceSites[randClient].length);
            


            res.end(mainTemplate.toString().replace("${RAND_CLIENT}", randClient));
        }
    })
}

function htmlToObjectGraph($){
var arr = [];
$("head").each(function(){
    arr.push(getOuter($, this));
});

}

function getOuter($, $el){
       
       return $('<div>').append($el.clone()).html();
}



function rewriteOriginHostToTags(html, baseUrl) {

    var url = trimLastSlash(baseUrl);

    return html;
}


//##### Type-Writerify Specific Stuff stuff



var clients = {};
var tickCollection = {};
var basicSpeed = 15;
var sourceSites = {};


var rawHtml = fs.readFileSync(__dirname + '/letter.html', 'ascii');

function parseHtmlToArray(htmlRaw) {
    var curPos = 0;
    console.time("Array generation")
    var arr = [];
    var htmlContent = "";
    //Start by Crearting a big Blob for content up to "</head>"
    if (htmlRaw.indexOf("</head>") > -1) {
        var tempArray = htmlRaw.split("</head>");
        arr.push(tempArray[0] + "</head>");
        htmlContent = tempArray[1]
    } else if (htmlRaw.indexOf("</HEAD>") > -1) {
        var tempArray = htmlRaw.split("</HEAD>");
        arr.push(tempArray[0] + "</HEAD>");
        htmlContent = tempArray[1]
    } else {
        htmlContent = htmlRaw;
    }

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
    console.timeEnd("Array generation");
    return arr;
}

var htmlArray = parseHtmlToArray(rawHtml);


// creating a new websocket to keep the content updated without any AJAX request
io.sockets.on('connection', function(socket) {
    console.log("New guy joined: " + socket.id);
    clients[socket.id] = new TypeWriterClient(socket);



    socket.on("kickstart", function(data) {

        clients[socket.id].siteData = sourceSites[data.clientId];
        delete sourceSites[data.clientId];

        tickCollection[socket.id] = setTimeout(function() {
            broadCast(socket.id)
        }, 200);

    })


    socket.on("change-speed", function(data) {
        clients[this.id].speed = basicSpeed / data.speed;
    })
    socket.on("change-direction", function(data) {
        clients[this.id].direction = data.direction;
    })
});

function broadCast(socketId) {

    var client = clients[socketId];
    var html = client.siteData;

    if (client.speed > 0) {
        var nextChunk = ""
        if (client.direction === "F") {
            if (html.length > client.location) {
                nextChunk = html[client.location++];
            }
        } else {
            if (client.location > 0) {
                nextChunk = html[client.location--];

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
    this.siteData = "";
}




function randomString(bits) {
    var chars, rand, i, ret;
    chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    ret = '';
    // in v8, Math.random() yields 32 pseudo-random bits (in spidermonkey it gives 53)
    while (bits > 0) {
        rand = Math.floor(Math.random() * 0x100000000) // 32-bit integer
        // base 64 means 6 bits per character, so we use the top 30 bits from rand to give 30/6=5 characters.
        for (i = 26; i > 0 && bits > 0; i -= 6, bits -= 6) ret += chars[0x3F & rand >>> i]
    }
    return ret;
}
