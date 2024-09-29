document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Vous devez vous connecter pour accéder au tableau de bord.');
        window.location.href = 'login.html';
        return;
    }

    const merchantId = 'ExempleId'; // À remplacer par l'ID du commerçant récupéré
    document.getElementById('merchantId').textContent = `ID Commerçant : ${merchantId}`;

    document.getElementById('bankAccountForm').addEventListener('submit', async (event) => {
        event.preventDefault();
        const bankAccountNumber = document.getElementById('bankAccountNumber').value;

        // Ajouter logique pour affilier le compte bancaire
    });

    document.getElementById('generateQRCodeBtn').addEventListener('click', () => {
        // Ajouter logique pour générer le QR-Code
    });
});
