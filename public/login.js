// login.js
const loginForm = document.getElementById('loginForm');

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    console.log('Tentative de connexion avec l\'email:', email); // Log de l'email
    console.log('Mot de passe fourni:', password); // Log du mot de passe

    try {
        const response = await fetch('https://ecobillapp.onrender.com/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        console.log('Réponse du serveur:', response); // Log de la réponse brute

        const data = await response.json();
        console.log('Données reçues du serveur:', data); // Log des données JSON

        if (!response.ok) {
            throw new Error(data.error || 'Erreur de connexion');
        }

        localStorage.setItem('token', data.token);
        console.log('Token enregistré dans le stockage local:', data.token); // Log du token

        // Redirection en fonction du type d'utilisateur
        switch (data.userType) {
            case 'admin':
                window.location.href = 'dashboard_admin.html';
                break;
            case 'client':
                window.location.href = 'dashboard_client.html';
                break;
            case 'merchant':
                window.location.href = 'dashboard_merchand.html'; // Changement ici
                break;
            default:
                throw new Error('Type d\'utilisateur inconnu');
        }
    } catch (error) {
        console.error('Erreur lors de la connexion:', error); // Log de l'erreur
        alert(error.message);
    }
});
