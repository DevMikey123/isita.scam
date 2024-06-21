document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('scamForm');
    const results = document.getElementById('results');
    const search = document.getElementById('search');
    const themeToggle = document.getElementById('theme-toggle');
    const loginToggle = document.getElementById('login-toggle');
    const notificationToggle = document.getElementById('notification-toggle');
    const loginForm = document.getElementById('login-form');
    const notificationCenter = document.getElementById('notification-center');
    const login = document.getElementById('login');
    const register = document.getElementById('register');
    const showRegister = document.getElementById('show-register');
    let token = '';

    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
    });

    loginToggle.addEventListener('click', () => {
        loginForm.style.display = loginForm.style.display === 'none' ? 'block' : 'none';
    });

    notificationToggle.addEventListener('click', () => {
        notificationCenter.style.display = notificationCenter.style.display === 'none' ? 'block' : 'none';
        fetchNotifications();
    });

    showRegister.addEventListener('click', () => {
        login.style.display = 'none';
        register.style.display = 'block';
    });

    login.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        try {
            const res = await fetch('https://isita-scam.vercel.app/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();
            if (data.token) {
                token = data.token;
                alert('Logged in successfully');
                loginForm.style.display = 'none';
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    });

    register.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('register-username').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        try {
            const res = await fetch('https://isita-scam.vercel.app/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password })
            });
            const data = await res.json();
            if (data.message) {
                alert(data.message);
                loginForm.style.display = 'none';
            } else {
                alert(data.error);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const type = document.getElementById('scam-type').value;
        const detail = document.getElementById('scam-detail').value;
        const description = document.getElementById('description').value;
        try {
            const res = await fetch('https://isita-scam.vercel.app/api/scams', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token
                },
                body: JSON.stringify({ username, type, detail, description })
            });
            const data = await res.json();
            if (data.message) {
                alert(data.message);
                fetchScams();
            } else {
                alert(data.error);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    });

    const fetchScams = async () => {
        try {
            const res = await fetch('https://isita-scam.vercel.app/api/scams');
            const scams = await res.json();
            results.innerHTML = '';
            scams.forEach(scam => {
                const listItem = document.createElement('li');
                listItem.innerHTML = `${scam.type}: ${scam.detail} - ${scam.description} (by ${scam.username}) <button data-id="${scam._id}" class="report">Report</button>`;
                results.appendChild(listItem);
            });
        } catch (error) {
            console.error('Error:', error);
        }
    };

    search.addEventListener('input', () => {
        const searchTerm = search.value.toLowerCase();
        const items = results.getElementsByTagName('li');
        Array.from(items).forEach(item => {
            const text = item.textContent.toLowerCase();
            item.style.display = text.includes(searchTerm) ? '' : 'none';
        });
    });

    results.addEventListener('click', async (e) => {
        if (e.target.classList.contains('report')) {
            const id = e.target.getAttribute('data-id');
            try {
                const res = await fetch('https://isita-scam.vercel.app/api/scams/report', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': token
                    },
                    body: JSON.stringify({ id })
                });
                const data = await res.json();
                alert(data.message);
            } catch (error) {
                console.error('Error:', error);
            }
        }
    });

    const fetchNotifications = async () => {
        try {
            const res = await fetch('https://isita-scam.vercel.app/api/notifications', {
                headers: {
                    'Authorization': token
                }
            });
            const notifications = await res.json();
            const notificationList = document.getElementById('notifications');
            notificationList.innerHTML = '';
            notifications.forEach(notification => {
                const listItem = document.createElement('li');
                listItem.textContent = notification.message;
                notificationList.appendChild(listItem);
            });
        } catch (error) {
            console.error('Error:', error);
        }
    };

    fetchScams();
});
