const express = require('express');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const pool = require('./config');
const cors = require('cors');
const bcrypt = require('bcrypt');
const fs = require('fs');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// Routes pour les pages
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.get('/login.html', (req, res) => {
    res.sendFile(__dirname + '/login.html');
});

app.get('/signup.html', (req, res) => {
    res.sendFile(__dirname + '/signup.html');
});

// Routes pour le tableau de bord
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

app.get('/dashboard_merchant.html', authenticateToken, (req, res) => { // Correction de l'orthographe
    if (req.user.usertype === 'merchant') {
        res.sendFile(__dirname + '/dashboard_merchant.html');
    } else {
        res.sendStatus(403);
    }
});

// Route pour se connecter
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = result.rows[0];

        if (user && await bcrypt.compare(password, user.password)) {
            const token = jwt.sign({ id: user.id, email: user.email, usertype: user.usertype, grade: user.grade }, process.env.JWT_SECRET);
            res.json({ token, usertype: user.usertype });
        } else {
            res.status(401).json({ error: 'Identifiants incorrects' });
        }
    } catch (err) {
        console.error(err);
        fs.appendFileSync('error.log', `[${new Date().toISOString()}] ${err}\n`);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Route pour créer un utilisateur
app.post('/signup', async (req, res) => {
    const { name, email, password, usertype } = req.body;

    if (!name || !email || !password || !usertype) {
        return res.status(400).json({ error: 'Tous les champs sont requis.' });
    }

    try {
        let grade = usertype === 'client' ? 4 : usertype === 'merchant' ? 5 : null;

        if (grade === null) {
            return res.status(400).json({ error: 'Type d\'utilisateur non valide.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        
        const result = await pool.query(
            'INSERT INTO users (name, email, password, usertype, grade) VALUES ($1, $2, $3, $4, $5) RETURNING *', 
            [name, email, hashedPassword, usertype, grade]
        );

        const newUser = result.rows[0];
        res.status(201).json({ message: 'Utilisateur créé avec succès', user: newUser });
    } catch (err) {
        console.error(err);
        fs.appendFileSync('error.log', `[${new Date().toISOString()}] ${err}\n`);
        if (err.code === '23505') {
            return res.status(400).json({ error: 'L\'email est déjà utilisé.' });
        }
        res.status(500).json({ error: 'Erreur lors de la création de l\'utilisateur' });
    }
});

// Démarrer le serveur
const PORT = process.env.PORT || 5452;
app.listen(PORT, () => {
    console.log(`Serveur en écoute sur le port ${PORT}`);
});
