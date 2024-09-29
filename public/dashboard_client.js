document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Vous devez vous connecter pour accéder au tableau de bord.');
        window.location.href = 'login.html';
        return;
    }

    const clientId = 'ExempleId'; // À remplacer par l'ID du client récupéré
    document.getElementById('clientId').textContent = `ID Client : ${clientId}`;

    document.getElementById('bankAccountForm').addEventListener('submit', async (event) => {
        event.preventDefault();
        const bankAccountNumber = document.getElementById('bankAccountNumber').value;

        // Ajouter logique pour affilier le compte bancaire
    });

    document.getElementById('scanQRCodeBtn').addEventListener('click', () => {
        // Ajouter logique pour scanner le QR-Code
    });
});
