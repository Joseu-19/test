const config = {
    user: 'testdb',
    password: 'monkey',
    server: 'PIXELPIRATE',
    database: 'scsmapsdata',
    options: {
        trustServerCertificate: true,
        trustConnection: false,
        enableArithAbort: true,
        instanceName: 'SQLEXPRESS24'
    },
    port: 1433
}

module.exports = config;