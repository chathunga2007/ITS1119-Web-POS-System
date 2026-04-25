import { customers, items, orders } from '../db/db.js';

const navBtns = document.querySelectorAll('.nav-btn');
const iconBtns = document.querySelectorAll('.icon-btn');
const appViews = document.querySelectorAll('.app-view');

function navigateTo(targetId) {
    appViews.forEach(view => {
        view.classList.remove('active');
        view.classList.add('hidden');
    });

    navBtns.forEach(btn => btn.classList.remove('active'));

    const targetView = document.getElementById(targetId);
    if (targetView) {
        targetView.classList.remove('hidden');
        targetView.classList.add('active');
    }

    const targetNav = Array.from(navBtns).find(btn => btn.dataset.target === targetId);
    if (targetNav) {
        targetNav.classList.add('active');
    }

    if (targetId === 'dashboard-section') {
        updateDashboardMetrics();
    }
}

navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        navigateTo(btn.dataset.target);
    });
});

iconBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        if (btn.dataset.target) {
            navigateTo(btn.dataset.target);
        }
    });
});

export function updateDashboardMetrics() {
    document.getElementById('dash-total-customers').innerText = customers.length;
    document.getElementById('dash-total-items').innerText = items.length;
    document.getElementById('dash-total-orders').innerText = orders.length;

    loadRecentOrders();
}

function loadRecentOrders() {
    const tbody = document.getElementById('dash-orders-table-body');
    tbody.innerHTML = '';

    const recentOrders = [...orders].slice(-5).reverse();

    recentOrders.forEach(order => {
        let tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${order.orderId}</td>
            <td>${order.customerId}</td>
            <td>${order.date}</td>
            <td>Rs ${parseFloat(order.total).toFixed(2)}</td>
        `;
        tbody.appendChild(tr);
    });
}