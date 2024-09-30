document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('token', data.token);
            window.location.href = `dashboard_${data.usertype}.html`; 
        } else {
            const errorMessage = await response.text();
            const errorDisplay = document.getElementById('error-message');
            errorDisplay.textContent = errorMessage;
            errorDisplay.style.display = 'block';
        }
    } catch (error) {
        console.error('Erreur:', error);
        const errorDisplay = document.getElementById('error-message');
        errorDisplay.textContent = 'Erreur lors de la connexion au serveur';
        errorDisplay.style.display = 'block';
    }
});
