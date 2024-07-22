const config = require('./dbConfig');
const sql = require('mssql');

const getusers = async () => {
    try {
        let pool = await sql.connect(config);
        let result = await pool.request().query("SELECT * FROM nodes");
        console.log(result.recordset); // Use recordset to get rows
        return result.recordset;
    } catch (error) {
        console.log(error);
    }
}

module.exports = {
    getusers
}
