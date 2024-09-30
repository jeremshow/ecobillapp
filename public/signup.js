document.getElementById('signupForm').addEventListener('submit', async (e) => {
    e.preventDefault(); // Empêche le comportement par défaut du formulaire
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const usertype = document.getElementById('usertype').value; // Récupère le type d'utilisateur

    // Vérifie si l'utilisateur est déjà connecté
    const token = localStorage.getItem('token');
    if (token) {
        alert('Vous êtes déjà connecté. Déconnectez-vous d\'abord pour créer un nouveau compte.');
        return;
    }

    try {
        const response = await fetch('/admin/create-user', { // URL de la route pour la création d'utilisateur
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, email, password, usertype }) // Utilise le type d'utilisateur sélectionné
        });

        if (response.ok) {
            window.location.href = 'login.html'; // Redirige vers la page de connexion
        } else {
            let errorMessage = 'Erreur lors de la création du compte';
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                const errorData = await response.json();
                errorMessage += ': ' + (errorData.message || 'Erreur inconnue');
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
        errorDisplay.textContent = 'Erreur lors de la création du compte: ' + error.message;
        errorDisplay.style.display = 'block'; // Affiche le message d'erreur
    }
});
