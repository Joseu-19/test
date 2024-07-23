const config = require('./dbConfig');
const sql = require('mssql');

async function getComputer() {
    try {
        let pool = await sql.connect(config);
        let computerNode = await pool.request().query("SELECT * FROM nodes");
        console.log("success");
        return computerNode.recordsets;
    } catch (error) {
        console.log(error);
    }
}

async function addComputer(name, xcord, ycord) {
    try {
        let pool = await sql.connect(config);
        let result = await pool.request()
            .input('name', sql.VarChar, name)
            .input('xcord', sql.Float, xcord)
            .input('ycord', sql.Float, ycord)
            .query("INSERT INTO nodes (name, xcord, ycord) VALUES (@name, @xcord, @ycord)");
        console.log("Insert success");
        return result;
    } catch (error) {
        console.log(error);
    }
}

// Insert the specific record for "Steve"
addComputer("Steve", 121.232, 312.23);
addComputer("Speed", 341.232, 534.23);
addComputer("Morgan", 451.232, 242.23);

module.exports = {
    getComputer: getComputer,
    addComputer: addComputer
};
