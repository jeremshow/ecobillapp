const { Pool } = require('pg'); // Utiliser Pool pour gérer les connexions multiples
const pool = require('./config.js'); // Utiliser le fichier config.js pour la configuration

// Connecter à la base de données avec Pool
pool.connect()
  .then(() => {
    console.log('Connecté à PostgreSQL avec succès !');
  })
  .catch(err => {
    console.error('Erreur de connexion à PostgreSQL:', err);
  });

module.exports = { pool };
