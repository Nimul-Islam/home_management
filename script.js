import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import { getFirestore, doc, setDoc, collection, getDocs, onSnapshot, deleteDoc } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyDUD8jsgH3sIMrKuI9A___DlYkMwdwy4Rs",
  authDomain: "home-management-system-6045b.firebaseapp.com",
  projectId: "home-management-system-6045b",
  storageBucket: "home-management-system-6045b.firebasestorage.app",
  messagingSenderId: "802600653999",
  appId: "1:802600653999:web:86bd29b9943f5be925b05a",
  measurementId: "G-K24V5BR2H1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Global variables for user and app
let currentUser = null;
let unsubscribeDevices = null;
let unsubscribeNotes = null;

const contentContainer = document.getElementById('content-container');
const navMenu = document.getElementById('nav-menu');

const pages = {
    'login': `
        <div class="flex justify-center items-center min-h-screen">
            <div class="card p-8 w-full max-w-md text-center">
                <h2 class="text-accent text-2xl font-semibold mb-6">Login</h2>
                <form id="login-form" class="space-y-6">
                    <input type="email" id="login-email" placeholder="Email" class="w-full px-4 py-2 rounded-lg bg-[#2b2f3a] border border-[#4a5568] focus:outline-none focus:ring-2 focus:ring-accent">
                    <input type="password" id="login-password" placeholder="Password" class="w-full px-4 py-2 rounded-lg bg-[#2b2f3a] border border-[#4a5568] focus:outline-none focus:ring-2 focus:ring-accent">
                    <button type="submit" class="w-full bg-accent text-[#1f3041] font-bold py-2 rounded-lg hover:bg-accent-dark">Login</button>
                    <p class="text-sm text-center">Don't have an account? <a href="#" id="show-register" class="text-accent hover:underline">Register here</a></p>
                </form>
                <p id="auth-error-message" class="text-red-500 mt-4 text-sm"></p>
            </div>
        </div>
    `,
    'register': `
        <div class="flex justify-center items-center min-h-screen">
            <div class="card p-8 w-full max-w-md text-center">
                <h2 class="text-accent text-2xl font-semibold mb-6">Register</h2>
                <form id="register-form" class="space-y-6">
                    <input type="email" id="reg-email" placeholder="Email" class="w-full px-4 py-2 rounded-lg bg-[#2b2f3a] border border-[#4a5568] focus:outline-none focus:ring-2 focus:ring-accent">
                    <input type="password" id="reg-password" placeholder="Password" class="w-full px-4 py-2 rounded-lg bg-[#2b2f3a] border border-[#4a5568] focus:outline-none focus:ring-2 focus:ring-accent">
                    <button type="submit" class="w-full bg-accent text-[#1f3041] font-bold py-2 rounded-lg hover:bg-accent-dark">Register</button>
                    <p class="text-sm text-center">Already have an account? <a href="#" id="show-login" class="text-accent hover:underline">Login here</a></p>
                </form>
                <p id="auth-error-message" class="text-red-500 mt-4 text-sm"></p>
            </div>
        </div>
    `,
    'dashboard': `
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div class="card col-span-1 lg:col-span-2">
                <h2 class="text-xl font-semibold border-b border-gray-700 pb-2 mb-4 text-accent">Temperature Trends</h2>
                <canvas id="tempChart" class="w-full h-72"></canvas>
                <div class="mt-4">
                    <h3 class="text-lg font-semibold mb-2 text-accent">Temperature Analysis ✨</h3>
                    <button id="analyze-temp-btn" class="bg-accent text-[#1f3041] font-bold py-2 px-4 rounded-lg hover:bg-accent-dark">Analyze Trends</button>
                    <p id="temp-analysis-output" class="mt-2 text-sm"></p>
                </div>
            </div>
        </div>
    `,
    'devices': `
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div class="card">
                <h2 class="text-xl font-semibold border-b border-gray-700 pb-2 mb-4 text-accent">Devices Control</h2>
                <ul id="device-list" class="space-y-4"></ul>
                <div class="mt-4">
                    <h3 class="text-lg font-semibold mb-2 text-accent">Connected Devices</h3>
                    <p id="suggestion-output" class="mt-2 text-sm">Real-time status of your connected devices will be shown here.</p>
                </div>
            </div>
        </div>
    `,
    'schedule': `
        <div class="flex justify-center items-center">
            <div class="card w-full max-w-lg">
                <h2 class="text-xl font-semibold border-b border-gray-700 pb-2 mb-4 text-accent">Device Scheduler</h2>
                <form id="schedule-form" class="space-y-4">
                    <div>
                        <label for="device-select" class="block text-sm font-medium mb-1">Select Device</label>
                        <select id="device-select" class="w-full px-3 py-2 rounded-lg bg-[#2b2f3a] border border-[#4a5568] focus:outline-none focus:ring-2 focus:ring-accent">
                            <option value="light">Living Room Light</option>
                            <option value="fan">Bedroom Fan</option>
                            <option value="plug">Smart Plug</option>
                        </select>
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label for="time-on" class="block text-sm font-medium mb-1">Turn On at</label>
                            <input type="time" id="time-on" class="w-full px-3 py-2 rounded-lg bg-[#2b2f3a] border border-[#4a5568] focus:outline-none focus:ring-2 focus:ring-accent">
                        </div>
                        <div>
                            <label for="time-off" class="block text-sm font-medium mb-1">Turn Off at</label>
                            <input type="time" id="time-off" class="w-full px-3 py-2 rounded-lg bg-[#2b2f3a] border border-[#4a5568] focus:outline-none focus:ring-2 focus:ring-accent">
                        </div>
                    </div>
                    <button type="submit" class="w-full bg-accent text-[#1f3041] font-bold py-2 rounded-lg hover:bg-accent-dark">Set Schedule</button>
                </form>
                <h3 class="text-lg font-medium mt-6 mb-2">Scheduled Items</h3>
                <ul id="schedule-list" class="space-y-2"></ul>
            </div>
        </div>
    `,
    'notes': `
        <div class="flex justify-center items-center">
            <div class="card w-full max-w-lg">
                <h2 class="text-xl font-semibold border-b border-gray-700 pb-2 mb-4 text-accent">My Notes</h2>
                <form id="note-form" class="flex space-x-2 mb-4">
                    <input type="text" id="note-input" placeholder="Add a new note..." class="flex-grow px-3 py-2 rounded-lg bg-[#2b2f3a] border border-[#4a5568] focus:outline-none focus:ring-2 focus:ring-accent">
                    <button type="submit" class="bg-accent text-[#1f3041] font-bold py-2 px-4 rounded-lg hover:bg-accent-dark">Add</button>
                </form>
                <ul id="notes-list" class="space-y-2"></ul>
            </div>
        </div>
    `
};

const navigateTo = (pageName) => {
    window.location.hash = pageName;
};

const renderPage = async (pageName) => {
    contentContainer.innerHTML = pages[pageName];
    navMenu.innerHTML = '';
    
    if (currentUser) {
        // Logged in user navigation
        navMenu.innerHTML = `
            <li><a href="#" class="text-gray-300 hover:text-accent" data-nav="dashboard">Dashboard</a></li>
            <li><a href="#" class="text-gray-300 hover:text-accent" data-nav="devices">Devices</a></li>
            <li><a href="#" class="text-gray-300 hover:text-accent" data-nav="schedule">Schedule</a></li>
            <li><a href="#" class="text-gray-300 hover:text-accent" data-nav="notes">Notes</a></li>
            <li><button id="logout-btn" class="bg-[#ff6347] text-white font-semibold py-1 px-3 rounded-lg hover:bg-[#e65239]">Logout</button></li>
        `;
        document.getElementById('logout-btn').addEventListener('click', async () => {
            await signOut(auth);
        });
        
        // Attach event listeners for logged-in pages
        if (pageName === 'dashboard') {
            renderDashboardContent();
        } else if (pageName === 'devices') {
            renderDevicesContent();
        } else if (pageName === 'schedule') {
            renderScheduleContent();
        } else if (pageName === 'notes') {
            renderNotesContent();
        }
    } else {
        // Not logged in user navigation
        navMenu.innerHTML = `
            <li><a href="#" class="text-gray-300 hover:text-accent" data-nav="login">Login</a></li>
            <li><a href="#" class="text-gray-300 hover:text-accent" data-nav="register">Register</a></li>
        `;
        if (pageName === 'login' || pageName === 'register') {
            setupAuthForm(pageName);
        }
    }
    // Add click handlers for nav links
    navMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            navigateTo(e.target.dataset.nav);
        });
    });
};

const setupAuthForm = (pageName) => {
    const form = document.getElementById(`${pageName}-form`);
    const errorMessage = document.getElementById('auth-error-message');
    const showLoginLink = document.getElementById('show-login');
    const showRegisterLink = document.getElementById('show-register');

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById(`${pageName === 'login' ? 'login' : 'reg'}-email`).value;
            const password = document.getElementById(`${pageName === 'login' ? 'login' : 'reg'}-password`).value;

            try {
                if (pageName === 'login') {
                    await signInWithEmailAndPassword(auth, email, password);
                } else {
                    await createUserWithEmailAndPassword(auth, email, password);
                }
                // Auth state listener handles redirection
            } catch (error) {
                errorMessage.textContent = error.message;
            }
        });
    }

    if (showLoginLink) {
        showLoginLink.addEventListener('click', (e) => {
            e.preventDefault();
            navigateTo('login');
        });
    }

    if (showRegisterLink) {
        showRegisterLink.addEventListener('click', (e) => {
            e.preventDefault();
            navigateTo('register');
        });
    }
};

// Render functions for logged-in pages
const renderDashboardContent = () => {
    // Temperature Chart
    const ctx = document.getElementById('tempChart').getContext('2d');
    const tempChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['12 AM', '3 AM', '6 AM', '9 AM', '12 PM', '3 PM', '6 PM', '9 PM'],
            datasets: [{
                label: 'Temperature (°C)',
                data: [23, 22, 21, 24, 26, 28, 25, 24],
                borderColor: '#00bcd4',
                tension: 0.4,
                fill: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: { grid: { color: '#4a5568' }, ticks: { color: '#E0E2E7' } },
                y: { grid: { color: '#4a5568' }, ticks: { color: '#E0E2E7' } }
            },
            plugins: {
                legend: { labels: { color: '#E0E2E7' } }
            }
        }
    });

    // Temperature Analysis
    const analyzeTempBtn = document.getElementById('analyze-temp-btn');
    const tempAnalysisOutput = document.getElementById('temp-analysis-output');
    
    analyzeTempBtn.addEventListener('click', async () => {
        const tempLabels = tempChart.data.labels.join(', ');
        const tempData = tempChart.data.datasets[0].data.join(', ');
        const prompt = `Analyze the following temperature data and provide a concise summary of the trends and a simple prediction. Data points: ${tempLabels}. Temperature values: ${tempData}.`;

        tempAnalysisOutput.textContent = 'Analyzing...';
        try {
            const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], tools: [{ "google_search": {} }],
                systemInstruction: { parts: [{ text: "Act as a smart home AI assistant. Provide a simple, single-paragraph analysis." }]}
                })
            });
            const result = await response.json();
            const text = result?.candidates?.[0]?.content?.parts?.[0]?.text;
            tempAnalysisOutput.textContent = text || 'Analysis failed.';
        } catch (error) {
            tempAnalysisOutput.textContent = 'Error during analysis. Please try again.';
        }
    });

};

const renderDevicesContent = async () => {
    const deviceList = document.getElementById('device-list');
    const suggestControlBtn = document.getElementById('suggest-control-btn');
    const suggestionOutput = document.getElementById('suggestion-output');

    // Example virtual devices
    const devices = [
        { id: 'light', name: 'Living Room Light', icon: 'fas fa-lightbulb', status: true },
        { id: 'fan', name: 'Bedroom Fan', icon: 'fas fa-fan', status: false },
        { id: 'plug', name: 'Smart Plug', icon: 'fas fa-plug', status: true },
    ];

    if (unsubscribeDevices) unsubscribeDevices();

    unsubscribeDevices = onSnapshot(collection(db, "users", currentUser.uid, "devices"), (querySnapshot) => {
        const currentDeviceStates = querySnapshot.docs.reduce((acc, doc) => {
            acc[doc.id] = doc.data().status;
            return acc;
        }, {});

        deviceList.innerHTML = '';
        devices.forEach(device => {
            const status = currentDeviceStates[device.id] !== undefined ? currentDeviceStates[device.id] : device.status;
            const li = document.createElement('li');
            li.classList.add('flex', 'justify-between', 'items-center', 'bg-[#2b2f3a]', 'p-4', 'rounded-lg', 'shadow');
            li.innerHTML = `
                <div class="flex items-center space-x-4">
                    <i class="${device.icon} text-2xl text-accent"></i>
                    <span class="text-lg font-medium">${device.name}</span>
                </div>
                <label class="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" data-device-id="${device.id}" class="sr-only peer" ${status ? 'checked' : ''}>
                    <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
                </label>
            `;
            deviceList.appendChild(li);
        });

        // Attach event listeners for switches
        document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', async (e) => {
                const deviceId = e.target.dataset.deviceId;
                const newStatus = e.target.checked;
                const docRef = doc(db, "users", currentUser.uid, "devices", deviceId);
                await setDoc(docRef, { status: newStatus }, { merge: true });
            });
        });
    });

    // Seed initial data if not exists
    const devicesColRef = collection(db, "users", currentUser.uid, "devices");
    const devicesSnapshot = await getDocs(devicesColRef);
    if (devicesSnapshot.empty) {
        await setDoc(doc(devicesColRef, 'light'), { status: true });
        await setDoc(doc(devicesColRef, 'fan'), { status: false });
        await setDoc(doc(devicesColRef, 'plug'), { status: true });
    }

    // Gemini API for suggestions
    suggestControlBtn.addEventListener('click', async () => {
        suggestionOutput.textContent = 'Getting smart suggestions...';
        try {
            const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: "Given a home with a living room light, bedroom fan, and a smart plug, suggest some efficient ways to control these devices based on typical daily routines and energy saving goals." }] }], tools: [{ "google_search": {} }],
                systemInstruction: { parts: [{ text: "Act as a smart home AI assistant. Provide clear, bulleted suggestions for controlling the devices." }]}
                })
            });
            const result = await response.json();
            const text = result?.candidates?.[0]?.content?.parts?.[0]?.text;
            suggestionOutput.textContent = text || 'Suggestions failed.';
        } catch (error) {
            suggestionOutput.textContent = 'Error getting suggestions. Please try again.';
        }
    });
};

const renderScheduleContent = async () => {
    const scheduleForm = document.getElementById('schedule-form');
    const scheduleList = document.getElementById('schedule-list');

    scheduleForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const deviceSelect = document.getElementById('device-select').value;
        const timeOn = document.getElementById('time-on').value;
        const timeOff = document.getElementById('time-off').value;

        if (timeOn && timeOff) {
            await setDoc(doc(collection(db, "users", currentUser.uid, "schedules")), {
                device: deviceSelect,
                timeOn,
                timeOff,
                timestamp: Date.now()
            });
        }
    });

    onSnapshot(collection(db, "users", currentUser.uid, "schedules"), (querySnapshot) => {
        scheduleList.innerHTML = '';
        querySnapshot.forEach(doc => {
            const schedule = doc.data();
            const li = document.createElement('li');
            li.classList.add('flex', 'justify-between', 'items-center', 'bg-[#2b2f3a]', 'p-3', 'rounded-lg', 'shadow');
            li.innerHTML = `
                <span><strong>${schedule.device.charAt(0).toUpperCase() + schedule.device.slice(1)}</strong>: ON at ${schedule.timeOn}, OFF at ${schedule.timeOff}</span>
                <button class="text-red-500 hover:text-red-700 delete-schedule" data-id="${doc.id}">
                    <i class="fas fa-trash-alt"></i>
                </button>
            `;
            scheduleList.appendChild(li);
        });
    });

    scheduleList.addEventListener('click', async (e) => {
        if (e.target.closest('.delete-schedule')) {
            const scheduleId = e.target.closest('.delete-schedule').dataset.id;
            await deleteDoc(doc(db, "users", currentUser.uid, "schedules", scheduleId));
        }
    });
};

const renderNotesContent = () => {
     const notesList = document.getElementById('notes-list');
     const noteForm = document.getElementById('note-form');
     if (unsubscribeNotes) unsubscribeNotes();

     unsubscribeNotes = onSnapshot(collection(db, "users", currentUser.uid, "notes"), (querySnapshot) => {
         notesList.innerHTML = '';
         querySnapshot.forEach((doc) => {
             const note = doc.data();
             const li = document.createElement('li');
             li.classList.add('flex', 'justify-between', 'items-center', 'bg-[#2b2f3a]', 'p-3', 'rounded-lg', 'shadow');
             li.innerHTML = `
                 <span>${note.content}</span>
                 <button class="text-red-500 hover:text-red-700 delete-note" data-id="${doc.id}">
                     <i class="fas fa-trash-alt"></i>
                 </button>
             `;
             notesList.appendChild(li);
         });
     });

     noteForm.addEventListener('submit', async (e) => {
         e.preventDefault();
         const noteInput = document.getElementById('note-input');
         const content = noteInput.value.trim();
         if (content) {
             await setDoc(doc(collection(db, "users", currentUser.uid, "notes")), { content, timestamp: Date.now() });
             noteInput.value = '';
         }
     });

     notesList.addEventListener('click', async (e) => {
         if (e.target.closest('.delete-note')) {
             const noteId = e.target.closest('.delete-note').dataset.id;
             await deleteDoc(doc(db, "users", currentUser.uid, "notes", noteId));
         }
     });
};

// Auth State Listener
onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = user;
        const currentHash = window.location.hash.substring(1);
        if (currentHash && pages[currentHash]) {
            renderPage(currentHash);
        } else {
            navigateTo('dashboard');
        }
    } else {
        currentUser = null;
        navigateTo('login');
    }
});

// Initial page render
const initialHash = window.location.hash.substring(1);
if (initialHash && pages[initialHash]) {
    renderPage(initialHash);
} else {
    navigateTo('login');
}

window.addEventListener('hashchange', () => {
    const pageName = window.location.hash.substring(1);
    if (pages[pageName]) {
        renderPage(pageName);
    }
});
