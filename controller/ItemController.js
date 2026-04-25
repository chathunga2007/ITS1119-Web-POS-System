import { items } from '../db/db.js';
import { Item } from '../model/ItemModel.js';
import { updateDashboardMetrics } from './DashboardController.js';

const generateItemCode = () => {
    if (items.length === 0) return 'I001';
    const lastCode = items[items.length - 1].code;
    const num = parseInt(lastCode.substring(1)) + 1;
    return 'I' + num.toString().padStart(3, '0');
}

//validation
const validateItemForm = () => {

    const fields = ['item-name', 'item-price', 'item-qty'];
    fields.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.remove('is-invalid');

        const err = document.getElementById(id + '-error');
        if (err) err.style.display = 'none';
    });

    let isValid = true;
    let errors = [];

    //name validation
    const nameInput = document.getElementById('item-name');
    const name = nameInput.value.trim();

    if (!name) {
        alert("Item name is required");
        errors.push("Item name is required");
        nameInput.classList.add('is-invalid');
        document.getElementById('item-name-error').style.display = 'block';
        isValid = false;
    } else if (name.length < 2) {
        alert("Item name must be at least 2 characters");
        errors.push("Item name must be at least 2 characters");
        nameInput.classList.add('is-invalid');
        document.getElementById('item-name-error').style.display = 'block';
        isValid = false;
    }

    //price validation
    const priceInput = document.getElementById('item-price');
    const priceStr = priceInput.value.trim();

    if (!priceStr) {
        alert("Price is required");
        errors.push("Price is required");
        priceInput.classList.add('is-invalid');
        document.getElementById('item-price-error').style.display = 'block';
        isValid = false;
    } else {
        const price = parseFloat(priceStr);
        if (isNaN(price) || price <= 0) {
            alert("Price must be a positive number");
            errors.push("Price must be a positive number");
            priceInput.classList.add('is-invalid');
            document.getElementById('item-price-error').style.display = 'block';
            isValid = false;
        }
    }

    //qty validation
    const qtyInput = document.getElementById('item-qty');
    const qtyStr = qtyInput.value.trim();

    if (!qtyStr) {
        alert("Quantity is required");
        errors.push("Quantity is required");
        qtyInput.classList.add('is-invalid');
        document.getElementById('item-qty-error').style.display = 'block';
        isValid = false;
    } else {
        const qty = parseInt(qtyStr);
        if (isNaN(qty) || qty < 0) {
            alert("Quantity must be 0 or more");
            errors.push("Quantity must be 0 or more");
            qtyInput.classList.add('is-invalid');
            document.getElementById('item-qty-error').style.display = 'block';
            isValid = false;
        }
    }

    const codeInput = document.getElementById('item-code');
    const code = codeInput.value.trim();

    if (!/^I\d{3}$/.test(code)) {
        alert("Invalid Item Code (must be like I001)");
        errors.push("Invalid Item Code (must be like I001)");
        codeInput.classList.add('is-invalid');
        document.getElementById('item-code-error').style.display = 'block';
        isValid = false;
    }

    if (!isValid && errors.length > 0) {
        alert("Please fix the following errors:\n\n" + errors.join("\n"));
    }

    return isValid;
};

const loadItems = (searchTerm = '') => {
    const tbody = document.getElementById('item-table-body');
    tbody.innerHTML = '';

    const selectItem = document.getElementById('select-item');
    if (selectItem) selectItem.innerHTML = '<option value="">-- Select --</option>';

    items.forEach(v => {
        if (v.name.toLowerCase().includes(searchTerm.toLowerCase()) || v.code.includes(searchTerm)) {
            let tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${v.code}</td>
                <td>${v.name}</td>
                <td>${Number(v.price).toFixed(2)}</td>
                <td>${v.qty}</td>
            `;

            tr.addEventListener('click', () => {
                document.getElementById('item-code').value = v.code;
                document.getElementById('item-name').value = v.name;
                document.getElementById('item-price').value = v.price;
                document.getElementById('item-qty').value = v.qty;

                document.querySelectorAll('#item-table-body tr').forEach(r => r.classList.remove('selected'));
                tr.classList.add('selected');
            });
            tbody.appendChild(tr);
        }

        if (selectItem) {
            let option = document.createElement('option');
            option.value = v.code;
            option.text = v.code;
            selectItem.appendChild(option);
        }
    });
}

const clearItemForm = () => {
    document.getElementById('item-code').value = generateItemCode();
    document.getElementById('item-name').value = '';
    document.getElementById('item-price').value = '';
    document.getElementById('item-qty').value = '';
    document.querySelectorAll('#item-table-body tr').forEach(r => r.classList.remove('selected'));
}

document.addEventListener("DOMContentLoaded", () => {
    clearItemForm();
    loadItems();
});

// Save
document.getElementById('btn-save-item').addEventListener('click', (e) => {
    e.preventDefault();

    if (!validateItemForm()) return;

    const code = document.getElementById('item-code').value;
    const name = document.getElementById('item-name').value;
    const price = document.getElementById('item-price').value;
    const qty = document.getElementById('item-qty').value;

    if (name && price && qty) {
        items.push(new Item(code, name, price, qty));
        clearItemForm();
        loadItems();
        updateDashboardMetrics(); // update counts
    }
});

// Update
document.getElementById('btn-update-item').addEventListener('click', () => {
    const code = document.getElementById('item-code').value;
    const index = items.findIndex(i => i.code === code);
    if (index > -1) {
        items[index].name = document.getElementById('item-name').value;
        items[index].price = document.getElementById('item-price').value;
        items[index].qty = document.getElementById('item-qty').value;
        clearItemForm();
        loadItems();
    }
});

// Delete
document.getElementById('btn-delete-item').addEventListener('click', () => {
    const code = document.getElementById('item-code').value;
    const index = items.findIndex(i => i.code === code);
    if (index > -1) {
        if (confirm('Are you sure you want to delete this item?')) {
            items.splice(index, 1);
            clearItemForm();
            loadItems();
            updateDashboardMetrics();
        }
    }
});

// Clear
document.getElementById('btn-clear-item').addEventListener('click', clearItemForm);

// Search
document.getElementById('search-item').addEventListener('input', (e) => {
    loadItems(e.target.value);
});
