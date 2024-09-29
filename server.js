// Assure-toi d'avoir ces imports au début de ton fichier
const express = require('express');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const cors = require('cors');
const QRCode = require('qrcode');

// Initialise l'application
const app = express();
app.use(cors());
app.use(bodyParser.json());

// Configure ta base de données
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'ecobillpay',
    password: '250104Jl',
    port: 5432,
});

// Middleware pour vérifier le token JWT
function authenticateToken(req, res, next) {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.sendStatus(401);
    
    jwt.verify(token, '250104@Jl', (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

// Route pour récupérer les utilisateurs
app.get('/admin/users', authenticateToken, async (req, res) => {
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
    const { name, email, usertype } = req.body;
    try {
        const result = await pool.query('INSERT INTO users (name, email, usertype) VALUES ($1, $2, $3) RETURNING *', [name, email, usertype]);
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send('Erreur serveur');
    }
});

// Route pour supprimer un utilisateur
app.delete('/admin/delete-user/:id', authenticateToken, async (req, res) => {
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
app.listen(5452, () => {
    console.log('Serveur en écoute sur le port 5452');
});
