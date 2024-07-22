const config = {
    user: 'monkey',
    password: 'aaaaaaaa',
    server: 'PIXELPIRATE',
    database: 'computer_info',
    options: {
        trustServerCertificate: true,
        enableArithAbort: true,
        instanceName: 'MAPDETAILS24'
    },
    port: 1433,
    debug: {
        packet: true,
        data: true,
        payload: true,
        token: true,
        log: true
    }
};

module.exports = config;
