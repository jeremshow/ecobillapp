const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const QRCode = require('qrcode');
const cors = require('cors');
const path = require('path');
const { Client } = require('pg'); // Assurez-vous d'avoir 'pg' installé
const config = require('./config.js'); // Importer le fichier de configuration

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Servir les fichiers statiques (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

// Créer une instance du client PostgreSQL
const client = new Client(config.db);

// Connexion à la base de données
client.connect()
    .then(() => console.log('Connecté à la base de données PostgreSQL'))
    .catch(err => console.error('Erreur de connexion à la base de données', err));

// Fonction pour créer les tables nécessaires
const createTables = async () => {
    const createUsersTableQuery = `
    CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100),
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        user_type VARCHAR(50) NOT NULL
    );
    `;

    const createQRCodesTableQuery = `
    CREATE TABLE IF NOT EXISTS qrcodes (
        id SERIAL PRIMARY KEY,
        qr_code_data TEXT NOT NULL,
        merchant_id INTEGER REFERENCES users(id) ON DELETE CASCADE
    );
    `;

    const createBankAccountsTableQuery = `
    CREATE TABLE IF NOT EXISTS bank_accounts (
        id SERIAL PRIMARY KEY,
        merchant_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        bank_account_number VARCHAR(100) NOT NULL
    );
    `;

    const createTransactionsTableQuery = `
    CREATE TABLE IF NOT EXISTS transactions (
        id SERIAL PRIMARY KEY,
        sender_id INTEGER REFERENCES users(id),
        recipient_email VARCHAR(100) NOT NULL,
        amount DECIMAL NOT NULL,
        date TIMESTAMP DEFAULT NOW()
    );
    `;

    try {
        await client.query(createUsersTableQuery);
        await client.query(createQRCodesTableQuery);
        await client.query(createBankAccountsTableQuery);
        await client.query(createTransactionsTableQuery);
        console.log('Tables créées ou vérifiées avec succès');
    } catch (error) {
        console.error('Erreur lors de la création des tables:', error);
    }
};

// Appeler la fonction pour créer les tables avant le démarrage du serveur
createTables();

// Middleware d'authentification
const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
        const token = authHeader.split(' ')[1];
        jwt.verify(token, '250104@Jl', (err, user) => {
            if (err) {
                return res.sendStatus(403); // Interdit
            }
            req.user = user;
            next();
        });
    } else {
        res.sendStatus(401); // Non autorisé
    }
};

// Route d'inscription
app.post('/register', authenticate, async (req, res) => {
    const { name, email, password, user_type } = req.body;

    // Vérifie si l'utilisateur est administrateur avant de créer un compte
    if (req.user.userType !== 'admin') {
        return res.status(403).json({ error: 'Accès réservé aux administrateurs' });
    }

    if (!name || !email || !password || !user_type) {
        return res.status(400).json({ error: 'Tous les champs sont requis' });
    }

    try {
        const checkUserQuery = 'SELECT * FROM users WHERE email = $1';
        const existingUser = await client.query(checkUserQuery, [email]);

        if (existingUser.rows.length > 0) {
            return res.status(400).json({ error: 'Email déjà utilisé' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const insertUserQuery = `
            INSERT INTO users (name, email, password_hash, user_type)
            VALUES ($1, $2, $3, $4) RETURNING *;
        `;
        const newUser = await client.query(insertUserQuery, [name, email, hashedPassword, user_type]);

        res.status(201).json({ message: 'Utilisateur créé avec succès', user: newUser.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Route de connexion
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: 'Tous les champs sont requis' });
    }
    try {
        const findUserQuery = 'SELECT * FROM users WHERE email = $1';
        const result = await client.query(findUserQuery, [email]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Utilisateur non trouvé' });
        }

        const user = result.rows[0];
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);

        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Mot de passe invalide' });
        }

        const token = jwt.sign({ userId: user.id, userType: user.user_type, email: user.email }, '250104@Jl', { expiresIn: '1h' });
        
        // Renvoie le token et le type d'utilisateur
        res.json({ token, userType: user.user_type });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Route pour récupérer les utilisateurs (pour les administrateurs)
app.get('/users', authenticate, async (req, res) => {
    if (req.user.userType !== 'admin' && req.user.email !== 'jeremy.ecobill@gmail.com') {
        return res.status(403).json({ error: 'Accès interdit' });
    }
    try {
        const usersQuery = 'SELECT * FROM users';
        const result = await client.query(usersQuery);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Route pour générer un QR Code (pour les commerçants)
app.post('/generate-qr', authenticate, async (req, res) => {
    if (req.user.userType !== 'merchant') {
        return res.status(403).json({ error: 'Accès réservé aux commerçants' });
    }
    const userId = req.user.userId;
    const uniqueKey = `merchant_${userId}_${Date.now()}`;
    const qrData = `ecobillpay://pay?merchant=${userId}&key=${uniqueKey}`;

    try {
        const insertQRQuery = `
            INSERT INTO qrcodes (qr_code_data, merchant_id) VALUES ($1, $2) RETURNING *;
        `;
        await client.query(insertQRQuery, [qrData, userId]);

        res.json({ qrData });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur lors de la génération du QR Code' });
    }
});

// Route pour lier un compte bancaire (pour les commerçants)
app.post('/link-bank-account', authenticate, async (req, res) => {
    if (req.user.userType !== 'merchant') {
        return res.status(403).json({ error: 'Accès réservé aux commerçants' });
    }

    const { bankAccountNumber } = req.body;

    if (!bankAccountNumber) {
        return res.status(400).json({ error: 'Le numéro de compte bancaire est requis' });
    }

    try {
        const insertBankAccountQuery = `
            INSERT INTO bank_accounts (merchant_id, bank_account_number)
            VALUES ($1, $2) RETURNING *;
        `;
        await client.query(insertBankAccountQuery, [req.user.userId, bankAccountNumber]);
        
        res.status(201).json({ message: 'Compte bancaire lié avec succès' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur lors de la liaison du compte bancaire' });
    }
});

// Route pour envoyer de l'argent
app.post('/send-money', authenticate, async (req, res) => {
    if (req.user.userType !== 'client') {
        return res.status(403).json({ error: 'Accès réservé aux clients' });
    }

    const { recipientEmail, amount } = req.body;

    if (!recipientEmail || !amount) {
        return res.status(400).json({ error: 'Email du destinataire et montant sont requis' });
    }

    try {
        const insertTransactionQuery = `
            INSERT INTO transactions (sender_id, recipient_email, amount)
            VALUES ($1, $2, $3) RETURNING *;
        `;
        await client.query(insertTransactionQuery, [req.user.userId, recipientEmail, amount]);
        
        res.status(201).json({ message: 'Transaction effectuée avec succès' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur lors de l\'envoi d\'argent' });
    }
});

// Route pour récupérer les données du tableau de bord
app.get('/dashboard', authenticate, async (req, res) => {
    try {
        const userType = req.user.userType;

        // Logique pour récupérer les données en fonction du type d'utilisateur
        let dashboardData = {};
        if (userType === 'admin') {
            // Récupérer les données spécifiques aux administrateurs
            dashboardData.message = 'Bienvenue, Admin ! Voici vos données.';
        } else if (userType === 'merchant') {
            // Récupérer les données spécifiques aux commerçants
            dashboardData.message = 'Bienvenue, Commerçant ! Voici vos données.';
        } else if (userType === 'client') {
            // Récupérer les données spécifiques aux clients
            dashboardData.message = 'Bienvenue, Client ! Voici vos données.';
        } else {
            return res.sendStatus(403); // Accès interdit pour les types d'utilisateur non reconnus
        }

        res.json(dashboardData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur lors de la récupération des données du tableau de bord.' });
    }
});

// Démarrer le serveur
const PORT = 5452;
app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});
