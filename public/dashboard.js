document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    console.log('Token récupéré:', token); // Ligne ajoutée pour le débogage

    if (!token) {
        alert('Vous devez vous connecter pour accéder au tableau de bord.');
        window.location.href = 'login.html'; // Rediriger vers la page de connexion
        return;
    }

    try {
        const response = await fetch('/dashboard.html', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}` // Envoie le token dans l'en-tête
            }
        });

        if (!response.ok) {
            throw new Error('Erreur lors de l\'accès au tableau de bord');
        }

        // Si la requête réussit, tu peux afficher le contenu du tableau de bord ici
    } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur lors de l\'accès au tableau de bord : ' + error.message);
        window.location.href = 'login.html'; // Rediriger vers la page de connexion
    }
});
