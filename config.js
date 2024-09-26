const { Pool } = require('pg');

// Remplacez ceci par l'URL de connexion fournie par Render
const pool = new Pool({
  connectionString: 'postgresql://ecobillpay_user:Ak2mHkddTDZfGpdrXhGGzz5Z3ahrP2bI@dpg-crqu765ds78s73cnuo9g-a.oregon-postgres.render.com/ecobillpay',
  ssl: {
    rejectUnauthorized: false,
  },
});

module.exports = pool;
