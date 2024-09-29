document.getElementById('signupForm').addEventListener('submit', async (e) => {
    e.preventDefault(); // Empêche le comportement par défaut du formulaire
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const usertype = document.getElementById('usertype').value; // Récupère le type d'utilisateur

    // Ajout de la gestion du token
    const token = localStorage.getItem('token');
    if (token) {
        const payload = JSON.parse(atob(token.split('.')[1])); // Décodage du payload
        const currentTime = Math.floor(Date.now() / 1000); // Temps actuel en secondes

        if (payload.exp < currentTime) {
            console.log('Le token a expiré.');
            // Gestion de l'expiration (par exemple, redirection vers la page de connexion)
            window.location.href = 'login.html'; // Redirige vers la page de connexion
        } else {
            console.log('Token valide, grade:', payload.grade);
        }
    }

    try {
        const response = await fetch('/admin/create-user', { // URL de la route pour la création d'utilisateur
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token // Ajoute le token d'authentification
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
            alert(errorMessage);
        }
    } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur lors de la création du compte: ' + error.message);
    }
});
