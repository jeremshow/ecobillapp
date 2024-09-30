const bcrypt = require('bcrypt');
const readline = require('readline');

// Créer une interface pour lire l'entrée de l'utilisateur
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Fonction pour hacher le mot de passe
const hashPassword = async (password) => {
    const saltRounds = 10; // Nombre de tours de salage
    try {
        const hash = await bcrypt.hash(password, saltRounds);
        console.log(`Votre mot de passe haché est : ${hash}`);
    } catch (err) {
        console.error('Erreur lors du hachage du mot de passe :', err);
    } finally {
        rl.close(); // Fermer l'interface de lecture
    }
};

// Demander le mot de passe à l'utilisateur
rl.question('Entrez le mot de passe que vous souhaitez hacher : ', (password) => {
    hashPassword(password); // Appeler la fonction avec le mot de passe de l'utilisateur
});
