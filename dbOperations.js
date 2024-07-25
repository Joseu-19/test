// dbOperations.js
const config = require('./dbConfig');
const sql = require('mssql');

async function getComputer() {
    try {
        let pool = await sql.connect(config);
        let computerNode = await pool.request().query("SELECT * FROM nodes");
        console.log("Fetch success");
        return computerNode.recordsets[0]; // Return the first recordset
    } catch (error) {
        console.log("Error fetching data:", error);
        throw error; // Re-throw error to be handled by the caller
    }
}

async function addOrUpdateComputer(name, xcord, ycord) {
    try {
        let pool = await sql.connect(config);
        // Check if the node exists
        let result = await pool.request()
            .input('name', sql.VarChar, name)
            .query("SELECT COUNT(*) AS count FROM nodes WHERE name = @name");

        const count = result.recordset[0].count;

        if (count > 0) {
            // Update existing node
            await pool.request()
                .input('name', sql.VarChar, name)
                .input('xcord', sql.Float, xcord)
                .input('ycord', sql.Float, ycord)
                .query("UPDATE nodes SET xcord = @xcord, ycord = @ycord WHERE name = @name");
            console.log("Update success");
        } else {
            // Insert new node
            await pool.request()
                .input('name', sql.VarChar, name)
                .input('xcord', sql.Float, xcord)
                .input('ycord', sql.Float, ycord)
                .query("INSERT INTO nodes (name, xcord, ycord) VALUES (@name, @xcord, @ycord)");
            console.log("Insert success");
        }
    } catch (error) {
        console.log("Error adding or updating computer:", error);
        throw error; // Re-throw error to be handled by the caller
    }
}

async function removeComputer(name) {
    try {
        let pool = await sql.connect(config);
        await pool.request()
            .input('name', sql.VarChar, name)
            .query("DELETE FROM nodes WHERE name = @name");
        console.log("Delete success");
    } catch (error) {
        console.log("Error deleting computer:", error);
        throw error; // Re-throw error to be handled by the caller
    }
}

module.exports = {
    getComputer: getComputer,
    addOrUpdateComputer: addOrUpdateComputer,
    removeComputer: removeComputer
};
