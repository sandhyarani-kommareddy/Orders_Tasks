var http = require('http');
var app =  require('./config/express');
var server;
server = http.createServer(app)
server.listen(8000, function () {
 console.log("Express app started on port 8000");
})