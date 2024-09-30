document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    console.log('Token récupéré:', token); // Ligne ajoutée pour le débogage

    if (!token) {
        alert('Vous devez vous connecter pour accéder au tableau de bord.');
        window.location.href = 'login.html'; // Rediriger vers la page de connexion
        return;
    }

    try {
        const response = await fetch('https://ecobillapp.onrender.com/dashboard', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}` // Envoie le token dans l'en-tête
            }
        });

        if (!response.ok) {
            throw new Error('Erreur lors de l\'accès au tableau de bord, statut: ' + response.status);
        }

        const data = await response.json(); // Récupérer les données JSON
        console.log('Données du tableau de bord reçues:', data); // Vérification des données reçues

        // Ici, vous pouvez traiter et afficher les données du tableau de bord
        // Par exemple : 
        // document.getElementById('someElement').innerText = data.someValue;

    } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur lors de l\'accès au tableau de bord : ' + error.message);
        window.location.href = 'login.html'; // Rediriger vers la page de connexion
    }
});
