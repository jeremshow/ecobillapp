// databasepg.js
const { Client } = require('pg');

const client = new Client({
    host: "localhost", 
    user: "postgres", 
    port: 5432, 
    password: "250104Jl", 
    database: "ecobillpay"
});

client.connect();

module.exports = { client }; // Exporter le client pour l'utiliser dans d'autres fichiers
