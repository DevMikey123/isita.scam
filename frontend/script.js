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
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        try {
            const res = await fetch('https://your-backend-url/api/auth/login', {
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

    // Register form submission
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('register-username').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        try {
            const res = await fetch('https://your-backend-url/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password })
            });
            const data = await res.json();
            if (data.message) {
                alert(data.message);
                registerForm.style.display = 'none';
            } else {
                alert(data.error);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    });

    // Submit scam form
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const type = document.getElementById('scam-type').value;
        const detail = document.getElementById('scam-detail').value;
        const description = document.getElementById('description').value;
        try {
            const res = await fetch('https://your-backend-url/api/scams', {
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

    // Fetch scams
    const fetchScams = async () => {
        try {
            const res = await fetch('https://your-backend-url/api/scams');
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

    // Search scams
    search.addEventListener('input', () => {
        const searchTerm = search.value.toLowerCase();
        const items = results.getElementsByTagName('li');
        Array.from(items).forEach(item => {
            const text = item.textContent.toLowerCase();
            item.style.display = text.includes(searchTerm) ? '' : 'none';
        });
    });

    // Report scam
    results.addEventListener('click', async (e) => {
        if (e.target.classList.contains('report')) {
            const id = e.target.getAttribute('data-id');
            try {
                const res = await fetch('https://your-backend-url/api/scams/report', {
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

    // Fetch initial scams
    fetchScams();
});
