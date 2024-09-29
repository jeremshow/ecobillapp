// Assure-toi d'avoir ces imports au début de ton fichier
const express = require('express');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const cors = require('cors');
const QRCode = require('qrcode');
const bcrypt = require('bcrypt'); // Ajout de bcrypt pour le hachage des mots de passe
require('dotenv').config(); // Assure-toi d'installer dotenv pour les variables d'environnement

// Initialise l'application
const app = express();
app.use(cors());
app.use(bodyParser.json());

// Configure ta base de données (Render)
const pool = new Pool({
    user: process.env.DB_USER, // Utilise une variable d'environnement
    host: process.env.DB_HOST, // Utilise une variable d'environnement
    database: process.env.DB_NAME, // Utilise une variable d'environnement
    password: process.env.DB_PASSWORD, // Utilise une variable d'environnement
    port: process.env.DB_PORT || 5432, // Utilise une variable d'environnement
});

// Middleware pour vérifier le token JWT
function authenticateToken(req, res, next) {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.sendStatus(401);
    
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => { // Utilise une variable d'environnement pour le secret
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

// Route de test de connexion à la base de données
app.get('/test-db', async (req, res) => {
    try {
        const result = await pool.query('SELECT NOW()');
        res.json({ message: "Connexion réussie à la base de données", time: result.rows[0].now });
    } catch (err) {
        console.error('Erreur de connexion à la base de données', err);
        res.status(500).send('Erreur de connexion à la base de données');
    }
});

// Route par défaut pour gérer la racine
app.get('/', (req, res) => {
    res.send('Bienvenue sur l\'API Ecobill Pay');
});

// Route pour se connecter et obtenir un token
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = result.rows[0];

        if (user && await bcrypt.compare(password, user.password)) { // Vérifie le mot de passe haché
            // Crée un token
            const token = jwt.sign({ id: user.id, email: user.email, usertype: user.usertype }, process.env.JWT_SECRET);
            res.json({ token });
        } else {
            res.status(401).send('Identifiants incorrects');
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Erreur serveur');
    }
});

// Route pour récupérer les utilisateurs
app.get('/admin/users', authenticateToken, async (req, res) => {
    // Vérifie que l'utilisateur est un administrateur
    if (req.user.usertype !== 'admin') return res.sendStatus(403);
    
    try {
        const result = await pool.query('SELECT id, name, email, usertype FROM users');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Erreur serveur');
    }
});

// Route pour créer un nouvel utilisateur
app.post('/admin/create-user', authenticateToken, async (req, res) => {
    // Vérifie que l'utilisateur est un administrateur
    if (req.user.usertype !== 'admin') return res.sendStatus(403);

    const { name, email, password, usertype } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10); // Hachage du mot de passe

    try {
        const result = await pool.query('INSERT INTO users (name, email, password, usertype) VALUES ($1, $2, $3, $4) RETURNING *', [name, email, hashedPassword, usertype]);
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send('Erreur serveur');
    }
});

// Route pour supprimer un utilisateur
app.delete('/admin/delete-user/:id', authenticateToken, async (req, res) => {
    // Vérifie que l'utilisateur est un administrateur
    if (req.user.usertype !== 'admin') return res.sendStatus(403);

    const userId = req.params.id;
    try {
        await pool.query('DELETE FROM users WHERE id = $1', [userId]);
        res.sendStatus(204);
    } catch (err) {
        console.error(err);
        res.status(500).send('Erreur serveur');
    }
});

// Route pour générer un QR Code
app.get('/admin/generate-qr/:merchantId', authenticateToken, async (req, res) => {
    // Vérifie que l'utilisateur est un administrateur
    if (req.user.usertype !== 'admin') return res.sendStatus(403);

    const { merchantId } = req.params;
    const qrData = `https://ecobillapp.onrender.com/payment?merchantId=${merchantId}`; // Mettez à jour avec votre URL de paiement
    try {
        const qrCodeUrl = await QRCode.toDataURL(qrData);
        res.json({ qrCodeUrl });
    } catch (err) {
        console.error(err);
        res.status(500).send('Erreur lors de la génération du QR Code.');
    }
});

// Route pour créer une transaction
app.post('/transaction', authenticateToken, async (req, res) => {
    const { amount, merchantId, clientId } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO transactions (amount, merchant_id, client_id) VALUES ($1, $2, $3) RETURNING *',
            [amount, merchantId, clientId]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send('Erreur lors de la création de la transaction.');
    }
});

// Route pour récupérer les transactions d'un commerçant
app.get('/merchant/transactions/:merchantId', authenticateToken, async (req, res) => {
    const { merchantId } = req.params;
    try {
        const result = await pool.query('SELECT transaction_id FROM transactions WHERE merchant_id = $1', [merchantId]);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Erreur lors de la récupération des transactions.');
    }
});

// Démarrer le serveur
app.listen(5490, () => {
    console.log('Serveur en écoute sur le port 5490');
});
