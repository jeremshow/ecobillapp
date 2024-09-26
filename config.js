const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgres://ecobillpay_user:Ak2mHkddTDZfGpdrXhGGzz5Z3ahrP2bI@dpg-crqu765ds78s73cnuo9g-a:5432/ecobillpay', // Remplacez par les informations de votre base de données
  ssl: {
    rejectUnauthorized: false
  }
});

module.exports = pool;
