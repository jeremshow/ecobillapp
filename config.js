require('dotenv').config(); // Charger les variables d'environnement à partir du fichier .env

const { Pool } = require('pg');

// Configurer la base de données avec les variables d'environnement
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT || 5432,
});

module.exports = pool; // Exporter le pool de connexion pour l'utiliser dans d'autres fichiers
