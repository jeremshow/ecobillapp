document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Vous devez vous connecter pour accéder au tableau de bord.');
        window.location.href = 'login.html';
        return;
    }

    try {
        const response = await fetch('/admin/users', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Erreur lors de l\'accès aux utilisateurs.');
        }

        const users = await response.json();
        displayUsers(users);
    } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur lors de la récupération des utilisateurs.');
    }
});

function displayUsers(users) {
    const userList = document.getElementById('userList');
    userList.innerHTML = '';
    users.forEach(user => {
        const userItem = document.createElement('div');
        userItem.textContent = `${user.id} - ${user.name} - ${user.email} - ${user.usertype}`;
        
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Supprimer';
        deleteButton.addEventListener('click', async () => {
            await deleteUser(user.id);
            userItem.remove();
        });

        userItem.appendChild(deleteButton);
        userList.appendChild(userItem);
    });
}

async function deleteUser(userId) {
    const token = localStorage.getItem('token');
    await fetch(`/admin/delete-user/${userId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
}
