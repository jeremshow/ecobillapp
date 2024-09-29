// Importer les dépendances nécessaires
const express = require('express');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const cors = require('cors');
const QRCode = require('qrcode');
const bcrypt = require('bcrypt'); // Pour le hachage des mots de passe
require('dotenv').config(); // Pour charger les variables d'environnement

// Initialiser l'application
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public')); // Pour servir les fichiers statiques

// Configurer la base de données (Render)
const pool = new Pool({
    user: process.env.DB_USER, // Utiliser une variable d'environnement
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

// Route pour la racine
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// Routes pour les pages
app.get('/login.html', (req, res) => {
    res.sendFile(__dirname + '/login.html');
});

app.get('/signup.html', (req, res) => {
    res.sendFile(__dirname + '/signup.html'); // Modifié pour rediriger vers signup.html
});

app.get('/dashboard_admin.html', authenticateToken, (req, res) => {
    if (req.user.usertype === 'admin') {
        res.sendFile(__dirname + '/dashboard_admin.html');
    } else {
        res.sendStatus(403);
    }
});

app.get('/dashboard_client.html', authenticateToken, (req, res) => {
    if (req.user.usertype === 'client') {
        res.sendFile(__dirname + '/dashboard_client.html');
    } else {
        res.sendStatus(403);
    }
});

app.get('/dashboard_merchant.html', authenticateToken, (req, res) => {
    if (req.user.usertype === 'merchant') {
        res.sendFile(__dirname + '/dashboard_merchant.html');
    } else {
        res.sendStatus(403);
    }
});

// Route pour se connecter et obtenir un token
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

// Route pour créer un nouvel utilisateur
app.post('/admin/create-user', async (req, res) => { // Modifié pour correspondre à l'URL de signup.html
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

// Route pour récupérer les utilisateurs (administrateur uniquement)
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

// Route pour créer un QR Code
app.get('/admin/generate-qr/:merchantId', authenticateToken, async (req, res) => {
    if (req.user.usertype !== 'admin') return res.sendStatus(403);

    const { merchantId } = req.params;
    const qrData = `https://ecobillapp.onrender.com/payment?merchantId=${merchantId}`;
    try {
        const qrCodeUrl = await QRCode.toDataURL(qrData);
        res.json({ qrCodeUrl });
    } catch (err) {
        console.error(err);
        res.status(500).send('Erreur lors de la génération du QR Code.');
    }
});

// Démarrer le serveur
const PORT = process.env.PORT || 5492;
app.listen(PORT, () => {
    console.log(`Serveur en écoute sur le port ${PORT}`);
});
