const config = {
    port: '18001',
    log: './log.txt',
    repository: [
        {
            name: 'repo-name',
            path: '/path/to/target/folder',
            user: 'serveruser'
        },
        {
            name: 'repo-name',
            path: '/path/to/target/folder',
            user: 'serveruser'
        },
    ]
};

module.exports = config;
