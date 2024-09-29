// login.js
const loginForm = document.getElementById('loginForm');

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('http://localhost:5452/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Erreur de connexion');
        }

        localStorage.setItem('token', data.token);

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
        alert(error.message);
    }
});
