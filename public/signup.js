document.getElementById('signupForm').addEventListener('submit', async (e) => {
    e.preventDefault(); // Empêche le comportement par défaut du formulaire
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const usertype = document.getElementById('usertype').value; // Récupère le type d'utilisateur

    try {
        const response = await fetch('/signup', { // Utilisez la route d'inscription
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, email, password, usertype }) // Utilise le type d'utilisateur sélectionné
        });

        if (response.ok) {
            const data = await response.json();
            // Connexion automatique après la création du compte
            localStorage.setItem('token', data.token); // Sauvegarder le token
            localStorage.setItem('usertype', usertype); // Sauvegarder le type d'utilisateur
            window.location.href = 'dashboard_client.html'; // Redirige vers le tableau de bord approprié
        } else {
            let errorMessage = 'Erreur lors de la création du compte';
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                const errorData = await response.json();
                errorMessage += ': ' + (errorData.error || 'Erreur inconnue'); // Corriger ici pour accéder au message d'erreur
            } else {
                errorMessage += ': ' + await response.text(); // Gérer les réponses texte
            }
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
