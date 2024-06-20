document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('scamForm');
    const searchInput = document.getElementById('searchInput');
    const scamEntries = document.getElementById('scamEntries');
    const darkModeToggle = document.getElementById('darkModeToggle');

    let isDarkMode = false;

    // Toggle dark mode
    darkModeToggle.addEventListener('click', () => {
        isDarkMode = !isDarkMode;
        document.body.classList.toggle('dark-mode', isDarkMode);
    });

    // Handle form submission
    form.addEventListener('submit', (event) => {
        event.preventDefault();
        const scamType = document.getElementById('scamType').value;
        const scamDetail = document.getElementById('scamDetail').value;
        const username = document.getElementById('username').value || 'Anonymous';

        const entry = document.createElement('li');
        entry.textContent = `${scamType.toUpperCase()}: ${scamDetail} (Submitted by ${username})`;
        scamEntries.appendChild(entry);

        form.reset();
    });

    // Handle search functionality
    searchInput.addEventListener('input', () => {
        const query = searchInput.value.toLowerCase();
        const entries = scamEntries.getElementsByTagName('li');

        Array.from(entries).forEach((entry) => {
            const text = entry.textContent.toLowerCase();
            entry.style.display = text.includes(query) ? '' : 'none';
        });
    });
});
