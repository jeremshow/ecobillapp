document.getElementById('loginForm').addEventListener('submit', async (event) => {
    event.preventDefault(); // Empêche le rechargement de la page

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('http://localhost:5452/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        // Vérification de la réponse du serveur
        if (response.ok) {
            const data = await response.json();

            // Vérifier que les données contiennent le token et le type d'utilisateur
            if (data.token && data.userType) {
                localStorage.setItem('token', data.token); // Stocker le token dans le local storage

                // Rediriger en fonction du type d'utilisateur
                if (data.userType === 'admin') {
                    window.location.href = 'dashboard_admin.html'; // URL relative
                } else if (data.userType === 'merchant') {
                    window.location.href = 'dashboard_merchand.html'; // URL relative
                } else if (data.userType === 'client') {
                    window.location.href = 'dashboard_client.html'; // URL relative
                } else {
                    alert('Type d\'utilisateur non reconnu');
                }
            } else {
                alert('Données de connexion invalides');
            }
        } else {
            // Gérer les erreurs de réponse
            const errorData = await response.json();
            alert(errorData.error || 'Erreur de connexion'); // Afficher l'erreur
        }
    } catch (error) {
        console.error('Erreur lors de la connexion :', error);
        alert('Erreur de connexion. Veuillez réessayer plus tard.');
    }
});
