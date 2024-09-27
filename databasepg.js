const { Client } = require('pg');
const config = require('./config.js');  // Assure-toi d'inclure la bonne configuration

const client = new Client({
  host: config.db.host,
  port: config.db.port,
  database: config.db.database,
  user: config.db.user,
  password: config.db.password,
  ssl: config.db.ssl, // SSL est nécessaire pour la connexion sécurisée sur Render
});

client.connect()
  .then(() => console.log('Connecté à PostgreSQL avec succès !'))
  .catch(err => console.error('Erreur de connexion à PostgreSQL', err));

module.exports = { client };
