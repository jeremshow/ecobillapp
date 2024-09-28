const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const QRCode = require('qrcode');
const cors = require('cors');
const path = require('path');
const { client } = require('./databasepg.js'); // Importer le client PostgreSQL

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Servir les fichiers statiques (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

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
        jwt.verify(token, 'votre_secret_jwt', (err, user) => {
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
app.post('/register', async (req, res) => {
    const { name, email, password, user_type } = req.body;
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

        const token = jwt.sign({ userId: user.id, userType: user.user_type, email: user.email }, 'votre_secret_jwt', { expiresIn: '1h' });
        res.json({ token });
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

// Route pour envoyer de l'argent (pour les clients)
app.post('/send-money', authenticate, async (req, res) => {
    if (req.user.userType !== 'client') {
        return res.status(403).json({ error: 'Accès réservé aux clients' });
    }

    const { amount, recipientEmail } = req.body;

    if (!amount || !recipientEmail) {
        return res.status(400).json({ error: 'Montant et email du destinataire sont requis' });
    }

    try {
        const transactionQuery = `
            INSERT INTO transactions (sender_id, recipient_email, amount, date)
            VALUES ($1, $2, $3, NOW()) RETURNING *;
        `;
        await client.query(transactionQuery, [req.user.userId, recipientEmail, amount]);

        res.status(201).json({ message: 'Transfert d\'argent effectué avec succès' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur lors de l\'envoi d\'argent' });
    }
});

// Démarrer le serveur
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});
