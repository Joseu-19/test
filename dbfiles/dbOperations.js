const config =require('./dbConfig'),
sql = require('mssql');

const getusers = async() =>{
    try{
        let pool = await sql.connect(config);
        let users = pool.request().query("SELECT * FROM computer_objects");
        console.log(users);
        return users
    }

    catch(error){
        console.log(error)
    }
}

module.exports = {
    getusers
}