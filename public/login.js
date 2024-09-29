document.getElementById('loginForm').addEventListener('submit', async (event) => {
    event.preventDefault(); // Empêche le rechargement de la page

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const response = await fetch('http://localhost:5452/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
    });

    if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token); // Stocker le token dans le local storage

        // Rediriger en fonction du type d'utilisateur
        if (data.userType === 'admin') {
            window.location.href = 'http://localhost:5452/dashboard_admin.html';
        } else if (data.userType === 'merchant') {
            window.location.href = 'http://localhost:5452/dashboard_merchand.html';
        } else if (data.userType === 'client') {
            window.location.href = 'http://localhost:5452/dashboard_client.html';
        } else {
            alert('Type d\'utilisateur non reconnu');
        }
    } else {
        const errorData = await response.json();
        alert(errorData.error); // Afficher l'erreur
    }
});
