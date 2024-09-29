document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');

    if (!token) {
        alert('Vous devez vous connecter pour accéder au tableau de bord.');
        window.location.href = 'login.html';
        return;
    }

    try {
        const response = await fetch('https://ecobillapp.onrender.com/dashboard', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Erreur lors de l\'accès au tableau de bord, statut: ' + response.status);
        }

        const data = await response.json();
        console.log('Données du tableau de bord reçues:', data);
        // Logique pour afficher les données ici

    } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur lors de l\'accès au tableau de bord : ' + error.message);
        window.location.href = 'login.html';
    }
});
