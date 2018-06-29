#!/usr/bin/env nodejs
// node package
const http = require('http');
const fs = require('fs');
const exec = require('child_process').exec;

const config = {
    port: '18001',
    log: './log.txt',
    repository: [
        {
            name: 'git-auto-deploy',
            path: '/home/nodeserver/public/18001',
            user: 'nodeserver'
        },
        {
            name: 'crm-jplsport-laravel',
            path: '/home/crm/public_html',
            user: 'crm'
        }
    ]
};

let getTargetRepo = function(body) {
    repoConfig = config.repository.find( repo => repo.name == body.repository.name );
    return repoConfig;
}

let gitPull = function(repo) {
    return new Promise((resolve, reject) => {
        const command = `su ${repo.user} -c 'cd ${repo.path} && git pull'`;
        console.log(command);
        exec( command, (err, stdout, stderr) => {
            if ( err ) {
                reject(err);
            } else {
                resolve({ stdout: stdout, stderr: stderr });
            }
        });
    })
}

let log = function() {
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
                gitPull(repo).then( data => { log(data); } );
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
console.log('Server running at port ' + config.port);