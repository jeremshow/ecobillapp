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

    document.getElementById('createUserBtn').addEventListener('click', () => {
        document.getElementById('createUserModal').style.display = 'block';
    });

    document.getElementById('createUserForm').addEventListener('submit', async (event) => {
        event.preventDefault();
        const name = document.getElementById('newUserName').value;
        const email = document.getElementById('newUserEmail').value;
        const grade = document.getElementById('newUserGrade').value;

        await createUser(name, email, grade);
        document.getElementById('createUserModal').style.display = 'none';
    });
});

function displayUsers(users) {
    const userList = document.getElementById('userList');
    userList.innerHTML = '';
    users.forEach(user => {
        const userItem = document.createElement('div');
        userItem.textContent = `${user.id} - ${user.name} - ${user.email} - Grade ${user.grade}`;
        
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

async function createUser(name, email, grade) {
    const token = localStorage.getItem('token');
    const response = await fetch('/admin/create-user', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, grade })
    });

    if (!response.ok) {
        alert('Erreur lors de la création de l\'utilisateur.');
    } else {
        const newUser = await response.json();
        displayUsers([...document.getElementById('userList').children, newUser]);
    }
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
