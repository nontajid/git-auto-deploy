#!/usr/bin/env nodejs
// node package

// TODO :: Pull on current branch only
// TODO :: Check for digital signature of request 

const http = require('http');
const exec = require('child_process').exec;
const config = require('./git-deploy.config');

let getTargetRepo = function(body) {
    repoConfig = config.repository.find( repo => repo.name == body.repository.name );
    return repoConfig;
}

let gitPull = function(repo) {
    return new Promise((resolve, reject) => {
        const command = `su ${repo.user} -c 'cd ${repo.path} && git pull'`;
        exec( command, (err, stdout, stderr) => {
            if ( err ) {
                reject(err);
            } else {
                resolve({ stdout: stdout, stderr: stderr });
            }
        });
    })
}

let log = function(data) {
    fs.appendFile(
        config.log,
        JSON.stringify(data),
        (err) => {
            if ( err ) {}
        } 
    );
}

let handdlePostRequest = function() {
    return new Promise((resolve,reject) => {
        const data = {
            headers: this.headers,
            body: this.body
        };
        
        if( data.headers['x-github-event'] == 'push' ) {
            const repo = getTargetRepo(data.body);
            if( repo ) {
                gitPull(repo)
                .then(shell => { log(shell); })
                .catch(err => { log(err); });
                resolve({data: repo});
            } else {
                reject({err: 'repo not found'});
            }
            
        }
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