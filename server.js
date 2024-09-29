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

// Middleware pour vérifier le token JWT et les droits d'accès
function authenticateToken(requiredGrade) {
    return (req, res, next) => {
        const token = req.headers['authorization']?.split(' ')[1];
        if (!token) return res.sendStatus(401);

        jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
            if (err) return res.sendStatus(403);
            req.user = user;

            // Vérification des droits d'accès si un grade est requis
            if (requiredGrade && req.user.grade > requiredGrade) {
                return res.sendStatus(403); // Accès interdit
            }
            next();
        });
    };
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

// Routes pour les tableaux de bord
app.get('/dashboard_admin.html', authenticateToken(1), (req, res) => {
    if (req.user.usertype === 'admin') {
        res.sendFile(__dirname + '/dashboard_admin.html');
    } else {
        res.sendStatus(403);
    }
});

app.get('/dashboard_client.html', authenticateToken(2), (req, res) => {
    if (req.user.usertype === 'client') {
        res.sendFile(__dirname + '/dashboard_client.html');
    } else {
        res.sendStatus(403);
    }
});

app.get('/dashboard_merchant.html', authenticateToken(3), (req, res) => {
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
            res.json({ token });
        } else {
            res.status(401).json({ error: 'Identifiants incorrects' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Route pour créer un nouvel utilisateur
app.post('/admin/create-user', authenticateToken(1), async (req, res) => {
    const { name, email, password, usertype } = req.body;

    if (!name || !email || !password || !usertype) {
        return res.status(400).json({ error: 'Tous les champs sont requis.' });
    }

    try {
        // Déterminer le grade
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

        // Hachage du mot de passe
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Insérer l'utilisateur dans la base de données
        const result = await pool.query(
            'INSERT INTO users (name, email, password, usertype, grade) VALUES ($1, $2, $3, $4, $5) RETURNING *', 
            [name, email, hashedPassword, usertype, grade]
        );
        
        const newUser = result.rows[0];
        res.status(201).json({ message: 'Utilisateur créé avec succès', user: newUser });
    } catch (err) {
        console.error(err);
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
