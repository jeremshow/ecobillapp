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

        // Logique pour affilier le compte bancaire
        const response = await fetch('/merchant/affiliate-bank-account', {
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

    document.getElementById('generateQRCodeBtn').addEventListener('click', async () => {
        // Logique pour générer le QR-Code
        const response = await fetch('/merchant/generate-qrcode', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const { qrCodeUrl } = await response.json();
            document.getElementById('qrCodeImage').src = qrCodeUrl;
            document.getElementById('qrCodeDisplay').style.display = 'block';
        } else {
            alert('Erreur lors de la génération du QR-Code.');
        }
    });
});
