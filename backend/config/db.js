const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PASSWORD,
    port: process.env.PG_PORT,
});

// test the database connection

const connectDB = async () => {
    try {
        await pool.query('SELECT NOW()'); 
        console.log('PostgreSQL connected successfully.');
    } catch (err) {
        console.error('PostgreSQL connection error:', err.message);
        process.exit(1);
    }
};

module.exports = {
    pool,
    connectDB,
};