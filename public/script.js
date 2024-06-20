document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('scamForm');
    const results = document.getElementById('results');
    const search = document.getElementById('search');
    const themeToggle = document.getElementById('theme-toggle');
    const loginToggle = document.getElementById('login-toggle');
    const notificationToggle = document.getElementById('notification-toggle');
    const loginForm = document.getElementById('login');
    const registerForm = document.getElementById('register');
    const showRegister = document.getElementById('show-register');
    const notificationCenter = document.getElementById('notification-center');
    const notificationsList = document.getElementById('notifications');
    let darkMode = false;
    let token = null;

    // Toggle dark mode
    themeToggle.addEventListener('click', () => {
        darkMode = !darkMode;
        document.body.classList.toggle('dark-mode', darkMode);
    });

    // Toggle login form
    loginToggle.addEventListener('click', () => {
        const loginSection = document.getElementById('login-form');
        loginSection.style.display = loginSection.style.display === 'none' ? 'block' : 'none';
    });

    // Toggle notification center
    notificationToggle.addEventListener('click', () => {
        notificationCenter.style.display = notificationCenter.style.display === 'none' ? 'block' : 'none';
    });

    // Show register form
    showRegister.addEventListener('click', () => {
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
    });

    // Login form submission
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = loginForm['login-email'].value;
        const password = loginForm['login-password'].value;

        const response = await fetch('/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        if (response.ok) {
            const data = await response.json();
            token = data.token;
            alert('Login successful');
            loginForm.reset();
            document.getElementById('login-form').style.display = 'none';
        } else {
            alert('Login failed');
        }
    });

    // Register form submission
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = registerForm['register-username'].value;
        const email = registerForm['register-email'].value;
        const password = registerForm['register-password'].value;

        const response = await fetch('/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });

        if (response.ok) {
            alert('Registration successful');
            registerForm.reset();
            registerForm.style.display = 'none';
            loginForm.style.display = 'block';
        } else {
            alert('Registration failed');
        }
    });

    // Submit scam form
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const type = form['scam-type'].value;
        const detail = form['scam-detail'].value.trim();
        const description = form.description.value.trim();

        const response = await fetch('/submit-scam', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token
            },
            body: JSON.stringify({ type, detail, description })
        });

        if (response.ok) {
            alert('Scam submitted');
            form.reset();
            fetchScams();
        } else {
            alert('Submission failed');
        }
    });

    // Fetch scams
    async function fetchScams() {
        const response = await fetch('/scams');
        const scams = await response.json();
        results.innerHTML = '';
        scams.forEach(scam => {
            const listItem = document.createElement('li');
            listItem.innerHTML = `
                ${scam.type}: ${scam.detail} - ${scam.description} (by ${scam.username})
                <button class="report-btn" data-id="${scam._id}">Report</button>
                ${token && scam.username === 'mikeykooijman@outlook.com' ? `<button class="delete-btn" data-id="${scam._id}">Delete</button>` : ''}
            `;
            results.appendChild(listItem);
        });

        // Add report button event listeners
        document.querySelectorAll('.report-btn').forEach(button => {
            button.addEventListener('click', async (e) => {
                const id = e.target.dataset.id;
                await fetch('/report-scam', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': token
                    },
                    body: JSON.stringify({ id })
                });
                alert('Scam reported');
                fetchScams();
            });
        });

        // Add delete button event listeners
        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', async (e) => {
                const id = e.target.dataset.id;
                await fetch(`/delete-scam/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': token
                    }
                });
                alert('Scam deleted');
                fetchScams();
            });
        });
    }

    // Fetch notifications
    async function fetchNotifications() {
        const response = await fetch('/notifications', {
            headers: {
                'Authorization': token
            }
        });
        const notifications = await response.json();
        notificationsList.innerHTML = '';
        notifications.forEach(notification => {
            const listItem = document.createElement('li');
            listItem.textContent = notification;
            notificationsList.appendChild(listItem);
        });
    }

    // Search functionality
    search.addEventListener('input', () => {
        const searchTerm = search.value.toLowerCase();
        const items = results.getElementsByTagName('li');
        Array.from(items).forEach(item => {
            const text = item.textContent.toLowerCase();
            item.style.display = text.includes(searchTerm) ? '' : 'none';
        });
    });

    // Initial fetches
    fetchScams();
    if (token) fetchNotifications();
});
