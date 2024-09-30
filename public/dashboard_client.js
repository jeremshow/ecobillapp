document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Vous devez vous connecter pour accéder au tableau de bord.');
        window.location.href = 'login.html';
        return;
    }

    try {
        const response = await fetch('/client/info', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Erreur lors de la récupération des informations du client.');
        }

        const clientInfo = await response.json();
        document.getElementById('clientId').textContent = `ID Client : ${clientInfo.id}`;
    } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur lors de la récupération des informations du client.');
    }

    document.getElementById('bankAccountForm').addEventListener('submit', async (event) => {
        event.preventDefault();
        const bankAccountNumber = document.getElementById('bankAccountNumber').value;

        // Logique pour affilier le compte bancaire
        const token = localStorage.getItem('token');
        const response = await fetch('/client/affiliate-bank-account', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ bankAccountNumber })
        });

        if (response.ok) {
            alert('Compte bancaire affilié avec succès.');
        } else {
            alert('Erreur lors de l\'affiliation du compte bancaire.');
        }
    });
});
