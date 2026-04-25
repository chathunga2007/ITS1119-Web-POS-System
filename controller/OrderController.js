import { orders, customers, items, orderDetails } from '../db/db.js';
import { Order } from '../model/OrderModel.js';
import { OrderDetail } from '../model/OrderDetailModel.js';
import { updateDashboardMetrics } from './DashboardController.js';

let cart = [];

const generateOrderId = () => {
    if (orders.length === 0) return 'OD001';
    const lastId = orders[orders.length - 1].orderId;
    const num = parseInt(lastId.substring(2)) + 1;
    return 'OD' + num.toString().padStart(3, '0');
}

const clearOrderForm = () => {
    document.getElementById('order-id').value = generateOrderId();

    const now = new Date();
    const day = ("0" + now.getDate()).slice(-2);
    const month = ("0" + (now.getMonth() + 1)).slice(-2);
    document.getElementById('order-date').value = now.getFullYear() + "-" + month + "-" + day;

    document.getElementById('select-customer').value = '';
    document.getElementById('order-cust-name').value = '';
    document.getElementById('order-cust-salary').value = '';

    document.getElementById('select-item').value = '';
    document.getElementById('order-item-name').value = '';
    document.getElementById('order-item-price').value = '';
    document.getElementById('order-item-qtyonhand').value = '';
    document.getElementById('order-item-qtyneed').value = '';

    document.getElementById('txt-discount').value = '';
    document.getElementById('txt-cash').value = '';
    document.getElementById('txt-balance').value = '';

    cart = [];
    renderCart();
}

document.addEventListener("DOMContentLoaded", () => {
    clearOrderForm();
});

// Customer select change
document.getElementById('select-customer').addEventListener('change', (e) => {
    const custId = e.target.value;
    const customer = customers.find(c => c.id === custId);
    if (customer) {
        document.getElementById('order-cust-name').value = customer.name;
        document.getElementById('order-cust-address').value = customer.address;
        document.getElementById('order-cust-salary').value = customer.salary;
    } else {
        document.getElementById('order-cust-name').value = '';
        document.getElementById('order-cust-address').value = '';
        document.getElementById('order-cust-salary').value = '';
    }
});

// Item select change
document.getElementById('select-item').addEventListener('change', (e) => {
    const itemCode = e.target.value;
    const item = items.find(i => i.code === itemCode);
    if (item) {
        document.getElementById('order-item-name').value = item.name;
        document.getElementById('order-item-price').value = item.price;
        document.getElementById('order-item-qtyonhand').value = item.qty;
    } else {
        document.getElementById('order-item-name').value = '';
        document.getElementById('order-item-price').value = '';
        document.getElementById('order-item-qtyonhand').value = '';
    }
});

// Add to Cart
document.getElementById('btn-add-to-cart').addEventListener('click', () => {
    const itemCode = document.getElementById('select-item').value;
    const itemName = document.getElementById('order-item-name').value;
    const price = parseFloat(document.getElementById('order-item-price').value);
    const qtyOnHand = parseInt(document.getElementById('order-item-qtyonhand').value);
    const orderQty = parseInt(document.getElementById('order-item-qtyneed').value);

    if (!itemCode || isNaN(orderQty) || orderQty <= 0) {
        alert("Please select an item and enter a valid quantity.");
        return;
    }

    if (orderQty > qtyOnHand) {
        alert("Not enough quantity on hand.");
        return;
    }

    const existingItemIndex = cart.findIndex(c => c.code === itemCode);
    if (existingItemIndex > -1) {
        const newQty = cart[existingItemIndex].qty + orderQty;
        if (newQty > qtyOnHand) {
            alert("Total quantity exceeds available stock.");
            return;
        }
        cart[existingItemIndex].qty = newQty;
        cart[existingItemIndex].total = newQty * price;
    } else {
        cart.push({
            code: itemCode,
            name: itemName,
            price: price,
            qty: orderQty,
            total: orderQty * price
        });
    }

    renderCart();

    document.getElementById('order-item-qtyneed').value = '';
});

// Render Cart Table
const renderCart = () => {
    const tbody = document.getElementById('cart-table-body');
    tbody.innerHTML = '';

    let subtotal = 0;

    cart.forEach((c, index) => {
        subtotal += c.total;

        let tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${c.code}</td>
            <td>${c.name}</td>
            <td>${c.price.toFixed(2)}</td>
            <td>${c.qty}</td>
            <td>${c.total.toFixed(2)}</td>
            <td><button class="btn-danger-outline btn-sm" onclick="removeFromCart(${index})"><i class="fa-solid fa-trash"></i></button></td>
        `;
        tbody.appendChild(tr);
    });

    document.getElementById('lbl-subtotal').innerText = 'Rs ' + subtotal.toFixed(2);
    calculateTotal(subtotal);
}

window.removeFromCart = (index) => {
    cart.splice(index, 1);
    renderCart();
}

const calculateTotal = (subtotal) => {
    const discountStr = document.getElementById('txt-discount').value;
    const discount = discountStr === '' ? 0 : parseFloat(discountStr);

    const discountAmt = subtotal * (discount / 100);
    const netTotal = subtotal - discountAmt;

    document.getElementById('lbl-total').innerText = 'Rs ' + netTotal.toFixed(2);

    calculateBalance(netTotal);
}

document.getElementById('txt-discount').addEventListener('input', () => {
    const subtotalStr = document.getElementById('lbl-subtotal').innerText.replace('Rs ', '');
    calculateTotal(parseFloat(subtotalStr));
});

document.getElementById('txt-cash').addEventListener('input', () => {
    const totalStr = document.getElementById('lbl-total').innerText.replace('Rs ', '');
    calculateBalance(parseFloat(totalStr));
});

const calculateBalance = (netTotal) => {
    const cashStr = document.getElementById('txt-cash').value;
    if (cashStr === '') {
        document.getElementById('txt-balance').value = '';
        return;
    }
    const cash = parseFloat(cashStr);
    const balance = cash - netTotal;
    document.getElementById('txt-balance').value = balance.toFixed(2);
}

// Place Order
document.getElementById('btn-place-order').addEventListener('click', () => {
    if (cart.length === 0) {
        alert('Cart is empty!');
        return;
    }

    const orderId = document.getElementById('order-id').value;
    const customerId = document.getElementById('select-customer').value;
    const date = document.getElementById('order-date').value;

    if (!customerId) {
        alert('Please select a customer.');
        return;
    }

    const total = parseFloat(document.getElementById('lbl-total').innerText.replace('Rs ', ''));
    const discount = document.getElementById('txt-discount').value || 0;
    const cash = parseFloat(document.getElementById('txt-cash').value);
    const balance = parseFloat(document.getElementById('txt-balance').value);

    if (isNaN(cash) || cash < total) {
        alert('Insufficient cash provided.');
        return;
    }

    // Save Order
    orders.push(new Order(orderId, customerId, date, total, discount, cash, balance));

    cart.forEach(c => {
        orderDetails.push(new OrderDetail(orderId, c.code, c.price, c.qty, c.total));

        // Update item qty
        const itemIndex = items.findIndex(i => i.code === c.code);
        if (itemIndex > -1) {
            items[itemIndex].qty = items[itemIndex].qty - c.qty;
        }
    });

    alert('Order placed successfully!');

    clearOrderForm();
    loadItems();
    updateDashboardMetrics(); // update counts
});
