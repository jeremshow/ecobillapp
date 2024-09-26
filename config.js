require('dotenv').config();

module.exports = {
    development: {
        username: 'postgres',        // Remplacez par votre nom d'utilisateur
        password: '250104Jl',        // Remplacez par votre mot de passe
        database: 'ecobillpay',      // Nom de votre base de données
        host: 'localhost',           // Ou l'adresse IP de votre serveur PostgreSQL
        dialect: 'postgres',         // Dialecte de la base de données
        port: 5451                    // Remplacez par le port si nécessaire (5432 est le port par défaut)
    },
    test: {
        username: 'postgres',
        password: '250104Jl',
        database: 'ecobillpay_test',
        host: 'localhost',
        dialect: 'postgres',
        port: 5451
    },
    production: {
        username: 'postgres',
        password: '250104Jl',
        database: 'ecobillpay_production',
        host: 'localhost',
        dialect: 'postgres',
        port: 5451
    }
};
