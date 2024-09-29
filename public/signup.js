document.getElementById('signupForm').addEventListener('submit', async (e) => {
    e.preventDefault(); // Empêche le comportement par défaut du formulaire
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const usertype = document.getElementById('usertype').value; // Récupère le type d'utilisateur

    try {
        const response = await fetch('/admin/create-user', { // URL de la route pour la création d'utilisateur
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('token') // Ajoute le token d'authentification
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
