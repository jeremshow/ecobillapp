const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const pool = require('./config'); // Importer la configuration de la base de données
const app = express();

app.use(express.json());

// Route pour la création de compte
app.post('/signup', async (req, res) => {
    const { name, email, password, usertype } = req.body;

    // Vérifier si l'email existe déjà
    const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
        return res.status(400).json({ error: 'Cet email est déjà utilisé.' });
    }

    // Hacher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        await pool.query('INSERT INTO users (name, email, password, usertype) VALUES ($1, $2, $3, $4)', 
        [name, email, hashedPassword, usertype]);
        res.status(201).json({ message: 'Utilisateur créé avec succès' });
    } catch (error) {
        console.error('Erreur lors de la création de l\'utilisateur:', error);
        res.status(500).json({ error: 'Erreur lors de la création de l\'utilisateur.' });
    }
});

// Autres routes (login, users) à ajouter ici...

app.listen(3000, () => {
    console.log('Serveur en écoute sur le port 3000');
});
