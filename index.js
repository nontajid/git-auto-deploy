#!/usr/bin/env nodejs
// node package
const http = require('http');
const fs = require('fs');

const config = {
    port: '18001',
    log: './log.txt'
};

let handdlePostRequest = function() {
    return new Promise((resolve,reject) => {
        const data = {
            headers: this.headers,
            body: this.body
        };
        fs.appendFile(
            config.log, 
            JSON.stringify(data),
            (err) => { 
                if ( err ) {
                    reject(err)
                } else {
                    resolve({data: 'hey'}); 
                }
            } 
        );
    });
}

const server = http.createServer(function (req, res) {
    this.body = [];
    this.headers = req.headers;
    this.req = req;

    req.on('data', (chunk) => {
        this.body.push(chunk);
      }).on('end', () => {
        this.body = JSON.parse(Buffer.concat(this.body).toString());

        // Handle Post Request
        if ( this.req.method == 'POST' ) { 
            handdlePostRequest = handdlePostRequest.bind(this);

            handdlePostRequest()
            .then( (data) => {
                res.writeHead(200, {'Content-Type': 'application/json'});
                res.end(JSON.stringify(data));        
            });
        }
    });
});

server.listen(config.port);

console.log('Server running at port ' + config.port);
