const config = {
    user: 'monkey',
    password: 'aaaaaaaa',
    server: 'PIXELPIRATE',
    database: 'computer_info',
    options: {
        trustServerCertificate: true,
        enableArithAbort: true,
        instanceName: 'MAPDETAILS24',
    //     requestTimeout: 30000, // 30 seconds
    // connectionTimeout: 30000 // 30 seconds
    },
    port: 1433
};

module.exports = config;
