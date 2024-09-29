document.getElementById('signupForm').addEventListener('submit', async (e) => {
    e.preventDefault(); // Empêche le comportement par défaut du formulaire
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('/admin/create-user', { // URL de la route pour la création d'utilisateur
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, password, usertype: 'client' }) // Ajouter usertype si nécessaire
        });

        if (response.ok) {
            window.location.href = 'login.html'; // Redirige vers la page de connexion
        } else {
            const errorData = await response.json(); // Récupère les données d'erreur
            alert('Erreur lors de la création du compte: ' + (errorData.message || 'Erreur inconnue'));
        }
    } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur lors de la création du compte: ' + error.message);
    }
});
