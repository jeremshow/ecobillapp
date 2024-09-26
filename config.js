const { Pool } = require('pg');

const pool = new Pool({
    host: process.env.DB_HOST || 'dpg-crqu765ds78s73cnuo9g-a',
    user: process.env.DB_USER || 'ecobillpay_user',
    password: process.env.DB_PASSWORD || 'Ak2mHkddTDZfGpdrXhGGzz5Z3ahrP2bI',
    database: process.env.DB_NAME || 'ecobillpay',
    port: process.env.DB_PORT || 5432, // généralement 5432 pour PostgreSQL
});

module.exports = pool;
