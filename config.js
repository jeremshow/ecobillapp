module.exports = {
  db: {
    host: process.env.DB_HOST || 'dpg-crqu765ds78s73cnuo9g-a.oregon-postgres.render.com',  // Adresse de la base de données (Render)
    port: process.env.DB_PORT || 5432,         // Port de PostgreSQL
    database: process.env.DB_NAME || 'ecobillpay',  // Nom de la base de données
    user: process.env.DB_USER || 'ecobillpay_user',      // Utilisateur de la base de données
    password: process.env.DB_PASSWORD || 'Ak2mHkddTDZfGpdrXhGGzz5Z3ahrP2bI',  // Mot de passe de la base de données
    ssl: { rejectUnauthorized: false } // Ajoute cette ligne pour éviter des erreurs SSL sur Render
  }
};
