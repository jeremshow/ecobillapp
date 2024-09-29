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
        document.getElementById('dashboardContent').innerHTML = `
            <h2>Bienvenue, ${data.username} !</h2>
            <p>Informations sur votre compte :</p>
            <ul>
                <li>Nom : ${data.name}</li>
                <li>Email : ${data.email}</li>
                <li>Statut : ${data.status}</li>
            </ul>
        `;

    } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur lors de l\'accès au tableau de bord : ' + error.message);
        window.location.href = 'login.html'; // Rediriger vers la page de connexion
    }
});

// Fonction pour générer le QR code
const generateQRCode = async () => {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch('https://ecobillapp.onrender.com/generate-qr', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Erreur lors de la génération du QR Code');
        }

        const data = await response.json();
        alert(`QR Code généré: ${data.qrData}`);
    } catch (error) {
        console.error('Erreur lors de la génération du QR Code:', error);
    }
};

// Fonction pour lier un compte bancaire
const linkBankAccount = async () => {
    const token = localStorage.getItem('token');
    const bankAccountNumber = prompt("Entrez votre numéro de compte bancaire:");
    
    if (!bankAccountNumber) {
        alert("Numéro de compte bancaire requis !");
        return;
    }

    try {
        const response = await fetch('https://ecobillapp.onrender.com/link-bank-account', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ bankAccountNumber })
        });
        
        if (!response.ok) {
            throw new Error('Erreur lors de la liaison du compte bancaire');
        }

        const data = await response.json();
        alert(data.message);
    } catch (error) {
        console.error('Erreur lors de la liaison du compte bancaire:', error);
    }
};
