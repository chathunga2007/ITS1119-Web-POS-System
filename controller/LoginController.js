import { users } from '../db/db.js';
import { updateDashboardMetrics } from './DashboardController.js';

const loginForm = document.getElementById('login-form');
const loginSection = document.getElementById('login-section');
const appWrapper = document.getElementById('app-wrapper');
const logoutBtn = document.getElementById('btn-logout');

loginForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const uname = document.getElementById('login-username').value;
    const pass = document.getElementById('login-password').value;

    const user = users.find(u => u.username === uname && u.password === pass);

    if (user) {
        loginSection.classList.remove('active');
        setTimeout(() => {
            loginSection.style.display = 'none';
        }, 10);

        appWrapper.classList.remove('hidden');

        updateDashboardMetrics();

        // Clear form
        loginForm.reset();
    } else {
        alert("Invalid Username or Password!");
    }
});

logoutBtn.addEventListener('click', () => {
    appWrapper.classList.add('hidden');

    // Show Login
    loginSection.style.display = 'flex';
    setTimeout(() => {
        loginSection.classList.add('active');
    }, 10);
});
