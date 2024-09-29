document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Vous devez vous connecter pour accéder au tableau de bord.');
        window.location.href = 'login.html';
        return;
    }

    try {
        const response = await fetch('/merchant/info', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Erreur lors de la récupération des informations du commerçant.');
        }

        const merchantInfo = await response.json();
        document.getElementById('merchantId').textContent = `ID Commerçant : ${merchantInfo.id}`;
    } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur lors de la récupération des informations du commerçant.');
    }

    document.getElementById('bankAccountForm').addEventListener('submit', async (event) => {
        event.preventDefault();
        const bankAccountNumber = document.getElementById('bankAccountNumber').value;

        // Ajouter logique pour affilier le compte bancaire ici
    });
});
