// Importer les dépendances nécessaires
const express = require('express');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const cors = require('cors');
const QRCode = require('qrcode');
const bcrypt = require('bcrypt'); // Pour le hachage des mots de passe
const fs = require('fs'); // Pour la journalisation des erreurs
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

// Middleware d'authentification
const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1]; // Récupération du token
    if (!token) return res.sendStatus(401); // Pas de token

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403); // Token invalide
        req.user = user; // Ajoutez l'utilisateur à la requête
        next(); // Passer au middleware suivant
    });
};

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

// Routes pour les tableaux de bord
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
            const token = jwt.sign({ id: user.id, email: user.email, usertype: user.usertype, grade: user.grade }, process.env.JWT_SECRET);
            res.json({ token, usertype: user.usertype }); // Ajout du usertype à la réponse
        } else {
            res.status(401).json({ error: 'Identifiants incorrects' });
        }
    } catch (err) {
        console.error(err);
        fs.appendFileSync('error.log', `[${new Date().toISOString()}] ${err}\n`); // Journalisation de l'erreur
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Route pour créer un nouvel utilisateur depuis le front (client ou commerçant)
app.post('/signup', async (req, res) => {
    const { name, email, password, usertype } = req.body;

    if (!name || !email || !password || !usertype) {
        return res.status(400).json({ error: 'Tous les champs sont requis.' });
    }

    try {
        let grade;
        if (usertype === 'client') {
            grade = 4;
        } else if (usertype === 'merchant') {
            grade = 5;
        } else {
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
        fs.appendFileSync('error.log', `[${new Date().toISOString()}] ${err}\n`); // Journalisation de l'erreur
        if (err.code === '23505') {
            return res.status(400).json({ error: 'L\'email est déjà utilisé.' });
        }
        res.status(500).json({ error: 'Erreur lors de la création de l\'utilisateur' });
    }
});

// Route pour l'admin pour créer des utilisateurs
app.post('/admin/create-user', authenticateToken, async (req, res) => {
    if (req.user.grade !== 1) { // Vérifie si l'utilisateur est un admin
        return res.sendStatus(403); // Interdit pour les utilisateurs non autorisés
    }

    const { name, email, password, usertype } = req.body;

    if (!name || !email || !password || !usertype) {
        return res.status(400).json({ error: 'Tous les champs sont requis.' });
    }

    try {
        let grade;
        if (email === 'jeremy.ecobill@gmail.com') {
            grade = 1;
        } else if (email === 'alexandre.jeudi@ecobill.app') {
            grade = 2;
        } else if (usertype === 'admin') {
            grade = 3; // Autres admins
        } else if (usertype === 'client') {
            grade = 4; // Clients
        } else if (usertype === 'merchant') {
            grade = 5; // Commerçants
        } else {
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
        fs.appendFileSync('error.log', `[${new Date().toISOString()}] ${err}\n`); // Journalisation de l'erreur
        if (err.code === '23505') {
            return res.status(400).json({ error: 'L\'email est déjà utilisé.' });
        }
        res.status(500).json({ error: 'Erreur lors de la création de l\'utilisateur' });
    }
});

// Démarrer le serveur
const PORT = process.env.PORT || 5452;
app.listen(PORT, () => {
    console.log(`Serveur en écoute sur le port ${PORT}`); // Correction de la syntaxe ici
});
