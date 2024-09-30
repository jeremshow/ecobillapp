module.exports = {
    db: {
      host: 'dpg-crqu765ds78s73cnuo9g-a.oregon-postgres.render.com', // Remplacer par l'host de ta base Render
      port: 5432,  // Le port par défaut de PostgreSQL
      database: 'ecobillpay',  // Nom de ta base de données
      user: 'ecobillpay_user',  // Ton utilisateur PostgreSQL
      password: 'Ak2mHkddTDZfGpdrXhGGzz5Z3ahrP2bI',  // Ton mot de passe PostgreSQL
      ssl: { rejectUnauthorized: false } // Assure une connexion sécurisée avec Render
    }
  };
  