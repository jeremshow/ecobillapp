document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault(); // Empêche le comportement par défaut du formulaire
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('token', data.token); // Stocke le token dans le localStorage
            window.location.href = `dashboard_${data.usertype}.html`; // Redirige vers le tableau de bord en fonction du type d'utilisateur
        } else {
            const errorMessage = await response.text(); // Gérer les réponses texte
            const errorDisplay = document.getElementById('error-message');
            errorDisplay.textContent = errorMessage;
            errorDisplay.style.display = 'block'; // Affiche le message d'erreur
        }
    } catch (error) {
        console.error('Erreur:', error);
        const errorDisplay = document.getElementById('error-message');
        errorDisplay.textContent = 'Erreur lors de la connexion au serveur';
        errorDisplay.style.display = 'block'; // Affiche le message d'erreur
    }
});
