const express = require('express');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const cors = require('cors');
const bcrypt = require('bcrypt');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public')); // Servir les fichiers statiques à partir du dossier 'public'

// Configurer la base de données PostgreSQL avec les variables d'environnement
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT || 5432,
});

// Middleware pour vérifier le token JWT
function authenticateToken(req, res, next) {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

// Route principale (page d'accueil)
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

// Route pour la page de connexion
app.get('/login', (req, res) => {
    res.sendFile(__dirname + '/public/login.html');
});

// Route pour la page d'inscription
app.get('/signup', (req, res) => {
    res.sendFile(__dirname + '/public/signup.html');
});

// Route POST pour se connecter
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = result.rows[0];

        if (user && await bcrypt.compare(password, user.password)) {
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

// Route pour afficher les utilisateurs (admin)
app.get('/admin/users', authenticateToken, async (req, res) => {
    if (req.user.usertype !== 'admin') return res.sendStatus(403);
    try {
        const result = await pool.query('SELECT id, name, email, usertype FROM users');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Erreur serveur');
    }
});

// Route pour créer un utilisateur (admin)
app.post('/admin/create-user', authenticateToken, async (req, res) => {
    if (req.user.usertype !== 'admin') return res.sendStatus(403);
    const { name, email, password, usertype } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        const result = await pool.query('INSERT INTO users (name, email, password, usertype) VALUES ($1, $2, $3, $4) RETURNING *', [name, email, hashedPassword, usertype]);
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send('Erreur serveur');
    }
});

// Route pour supprimer un utilisateur (admin)
app.delete('/admin/delete-user/:id', authenticateToken, async (req, res) => {
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

// Route pour générer un QR Code (pour les commerçants)
app.get('/merchant/generate-qr', authenticateToken, async (req, res) => {
    if (req.user.usertype !== 'merchant') return res.sendStatus(403);
    const qrData = `merchant_id=${req.user.id}`;
    try {
        const qrCode = await QRCode.toDataURL(qrData);
        res.json({ qrCode });
    } catch (err) {
        console.error(err);
        res.status(500).send('Erreur serveur');
    }
});

// Démarrer le serveur
const PORT = process.env.PORT || 5492;
app.listen(PORT, () => {
    console.log(`Serveur en écoute sur le port ${PORT}`);
});
