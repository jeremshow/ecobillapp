// login.js
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('token', data.token);
            localStorage.setItem('usertype', data.usertype); // Stocke le type d'utilisateur dans le localStorage

            // Redirection en fonction du type d'utilisateur
            if (data.usertype === 'admin') {
                window.location.href = 'dashboard_admin.html';
            } else if (data.usertype === 'merchant') {
                window.location.href = 'dashboard_merchand.html';
            } else if (data.usertype === 'client') {
                window.location.href = 'dashboard_client.html';
            } else {
                alert('Type d’utilisateur inconnu');
            }
        } else {
            alert('Identifiants incorrects');
        }
    } catch (error) {
        console.error('Erreur lors de la connexion:', error);
        alert('Erreur lors de la connexion: ' + error.message);
    }
});
