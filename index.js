#!/usr/bin/env nodejs
// node package
const http = require('http');
const fs = require('fs');

const CircularJSON = require('circular-json'); //dev
const config = {
    port: '18001',
    log: './log.txt'
};

const server = http.createServer(function (req, res) {
    fs.appendFile(config.log, CircularJSON.stringify(req),(err) => { console.log(err) });
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end('OK');
});

server.listen(config.port);

console.log('Server running at port ' + config.port);
