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
        window.location.href = 'http://localhost:5452/dashboard'; // Rediriger vers le tableau de bord
    } else {
        const errorData = await response.json();
        alert(errorData.error); // Afficher l'erreur
    }
});
