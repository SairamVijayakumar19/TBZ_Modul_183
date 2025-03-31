const mysql = require('mysql2/promise');
const dbConfig = require('../config');

async function connectDB() {
    try {
        const connection = await mysql.createConnection(dbConfig);
        console.log('Database connected');
        return connection;
    } catch (error) {
        console.error('Error connecting to database:', error);
    }
}

async function executeStatement(statement, params = []) {
    let conn = await connectDB();
    const [results] = await conn.execute(statement, params);
    return results;
}

module.exports = { connectDB: connectDB, executeStatement: executeStatement };