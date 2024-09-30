document.getElementById('signupForm').addEventListener('submit', async (e) => {
    e.preventDefault(); // Empêche le comportement par défaut du formulaire
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const usertype = document.getElementById('usertype').value; // Récupère le type d'utilisateur

    try {
        const response = await fetch('https://ecobillapp.onrender.com', { // Remplace par le bon port si nécessaire
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, email, password, usertype }) // Utilise le type d'utilisateur sélectionné
        });

        // Logging du statut de la réponse et son contenu pour le debug
        console.log('Statut de la réponse:', response.status);
        const responseData = await response.text(); // Lire la réponse comme texte
        console.log('Contenu de la réponse:', responseData);

        if (response.ok) {
            const data = JSON.parse(responseData); // Parse le JSON de la réponse
            // Connexion automatique après la création du compte
            localStorage.setItem('token', data.token); // Sauvegarder le token
            localStorage.setItem('usertype', usertype); // Sauvegarder le type d'utilisateur
            window.location.href = 'dashboard_client.html'; // Redirige vers le tableau de bord approprié
        } else {
            let errorMessage = 'Erreur lors de la création du compte';
            errorMessage += ': ' + (responseData || 'Erreur inconnue');
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
