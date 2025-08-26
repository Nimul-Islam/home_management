document.addEventListener('DOMContentLoaded', () => {

    const loggedInUser = sessionStorage.getItem('loggedInUser');
    const navbarNav = document.querySelector('.navbar nav ul');
    
    // Function to get users from local storage
    function getUsers() {
        const users = localStorage.getItem('users');
        return users ? JSON.parse(users) : [];
    }

    // Function to update navbar based on login status
    function updateNavbar() {
        if (navbarNav) { // Check if navbarNav exists before proceeding
            navbarNav.innerHTML = ''; // Clear existing nav items
            if (loggedInUser) {
                navbarNav.innerHTML = `
                    <li><a href="index.html">Dashboard</a></li>
                    <li><a href="devices.html">Devices</a></li>
                    <li><a href="schedule.html">Schedule</a></li>
                    <li><a href="notes.html">Notes</a></li>
                    <li><button id="logout-btn" class="logout-btn">Logout</button></li>
                `;
                const welcomeText = document.createElement('li');
                welcomeText.textContent = `Welcome, ${loggedInUser}!`;
                welcomeText.style.color = '#fff';
                welcomeText.style.fontWeight = 'bold';
                welcomeText.style.marginRight = '20px';
                navbarNav.insertBefore(welcomeText, navbarNav.firstChild);
                
                // Add event listener for logout button
                const logoutBtn = document.getElementById('logout-btn');
                if (logoutBtn) {
                    logoutBtn.addEventListener('click', () => {
                        sessionStorage.removeItem('loggedInUser');
                        window.location.href = 'login.html';
                    });
                }
            } else {
                navbarNav.innerHTML = `
                    <li><a href="login.html">Login</a></li>
                    <li><a href="register.html">Register</a></li>
                `;
            }
        }
    }
    
    updateNavbar();

    // Login logic on login.html
    const loginBtn = document.getElementById('login-btn');
    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            const usernameInput = document.getElementById('username').value.trim();
            const passwordInput = document.getElementById('password').value.trim();
            const errorMessage = document.getElementById('login-error');
            const users = getUsers();
            
            const user = users.find(u => u.username === usernameInput && u.password === passwordInput);

            if (user) {
                sessionStorage.setItem('loggedInUser', user.username);
                window.location.href = 'index.html';
            } else {
                errorMessage.textContent = 'Invalid username or password.';
            }
        });
    }

    // Registration logic on register.html
    const registerBtn = document.getElementById('register-btn');
    if (registerBtn) {
        registerBtn.addEventListener('click', () => {
            const usernameInput = document.getElementById('reg-username').value.trim();
            const passwordInput = document.getElementById('reg-password').value.trim();
            const errorMessage = document.getElementById('reg-error');
            let users = getUsers();

            if (!usernameInput || !passwordInput) {
                errorMessage.textContent = 'Username and password cannot be empty.';
                return;
            }

            const userExists = users.some(u => u.username === usernameInput);
            if (userExists) {
                errorMessage.textContent = 'Username already exists. Please choose a different one.';
            } else {
                users.push({ username: usernameInput, password: passwordInput });
                localStorage.setItem('users', JSON.stringify(users));
                window.location.href = 'login.html';
            }
        });
    }

    // Redirect to login page if not logged in
    const path = window.location.pathname;
    if (path.includes('index.html') || path.includes('devices.html') || path.includes('schedule.html') || path.includes('notes.html')) {
        if (!loggedInUser) {
            window.location.href = 'login.html';
        }
    }

    // --- All other feature-specific logic below ---

    // Device Controls (on devices.html)
    if (document.getElementById('devices')) {
        const deviceSwitches = document.querySelectorAll('.switch input');
        deviceSwitches.forEach(sw => {
            sw.addEventListener('change', (e) => {
                const deviceName = e.target.dataset.device;
                console.log(`${deviceName} is turned ${e.target.checked ? 'ON' : 'OFF'}.`);
            });
        });
    }

    // Device Scheduling (on schedule.html)
    if (document.getElementById('schedule')) {
        const setScheduleBtn = document.getElementById('set-schedule-btn');
        const scheduleList = document.getElementById('schedule-list');

        setScheduleBtn.addEventListener('click', () => {
            const deviceSelect = document.getElementById('device-select').value;
            const timeOn = document.getElementById('time-on').value;
            const timeOff = document.getElementById('time-off').value;
            if (timeOn && timeOff) {
                const listItem = document.createElement('li');
                listItem.innerHTML = `<strong>${deviceSelect.charAt(0).toUpperCase() + deviceSelect.slice(1)}:</strong> ON at ${timeOn}, OFF at ${timeOff}`;
                scheduleList.appendChild(listItem);
                alert(`Schedule set for ${deviceSelect}: ON at ${timeOn}, OFF at ${timeOff}`);
            } else {
                alert('Please select both ON and OFF times.');
            }
        });
    }

    // Notes System (on notes.html)
    if (document.getElementById('notes')) {
        const addNoteBtn = document.getElementById('add-note-btn');
        const noteInput = document.getElementById('note-input');
        const noteList = document.getElementById('note-list');

        addNoteBtn.addEventListener('click', () => {
            const noteText = noteInput.value.trim();
            if (noteText) {
                const listItem = document.createElement('li');
                listItem.textContent = noteText;
                const deleteBtn = document.createElement('button');
                deleteBtn.innerHTML = `<i class="fas fa-trash-alt"></i>`;
                deleteBtn.addEventListener('click', () => listItem.remove());
                listItem.appendChild(deleteBtn);
                noteList.appendChild(listItem);
                noteInput.value = '';
            }
        });
    }

    // Temperature Chart (on index.html)
    const tempChartElement = document.getElementById('tempChart');
    if (tempChartElement) {
        const ctx = tempChartElement.getContext('2d');
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['12 AM', '3 AM', '6 AM', '9 AM', '12 PM', '3 PM', '6 PM', '9 PM'],
                datasets: [{
                    label: 'Temperature (°C)',
                    data: [23, 22, 21, 24, 26, 28, 25, 24],
                    borderColor: '#ffd700',
                    tension: 0.4,
                    fill: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: { grid: { color: '#445c73' }, ticks: { color: '#e6e6e6' } }
                },
                plugins: {
                    legend: { labels: { color: '#e6e6e6' } }
                }
            }
        });
    }
});
