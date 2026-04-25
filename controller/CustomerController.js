import { customers } from '../db/db.js';
import { Customer } from '../model/CustomerModel.js';
import { updateDashboardMetrics } from './DashboardController.js';

const generateCustomerId = () => {
    if (customers.length === 0) return 'C001';
    const lastId = customers[customers.length - 1].id;
    const num = parseInt(lastId.substring(1)) + 1;
    return 'C' + num.toString().padStart(3, '0');
};

// validation
const validateCustomerForm = () => {
    const fields = ['cust-name', 'cust-address', 'cust-salary'];
    fields.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.remove('is-invalid');
        const errSpan = document.getElementById(id + '-error');
        if (errSpan) errSpan.style.display = 'none';
    });

    let isValid = true;
    let errors = [];

    //Name Validation
    const nameInput = document.getElementById('cust-name');
    const name = nameInput.value.trim();
    if (!name) {
        alert("Customer Name is required");
        errors.push("Customer Name is required");
        nameInput.classList.add('is-invalid');
        document.getElementById('cust-name-error').style.display = 'block';
        isValid = false;
    } else if (name.length < 3) {
        alert("Customer Name must be at least 3 characters");
        errors.push("Customer Name must be at least 3 characters");
        nameInput.classList.add('is-invalid');
        document.getElementById('cust-name-error').style.display = 'block';
        isValid = false;
    } else if (!/^[a-zA-Z\s]+$/.test(name)) {
        alert("Customer Name can only contain letters and spaces");
        errors.push("Customer Name can only contain letters and spaces");
        nameInput.classList.add('is-invalid');
        document.getElementById('cust-name-error').style.display = 'block';
        isValid = false;
    }

    //Address Validation
    const addressInput = document.getElementById('cust-address');
    const address = addressInput.value.trim();
    if (!address) {
        alert("Address is required");
        errors.push("Address is required");
        addressInput.classList.add('is-invalid');
        document.getElementById('cust-address-error').style.display = 'block';
        isValid = false;
    } else if (address.length < 5) {
        alert("Address must be at least 5 characters");
        errors.push("Address must be at least 5 characters");
        addressInput.classList.add('is-invalid');
        document.getElementById('cust-address-error').style.display = 'block';
        isValid = false;
    }

    //Salary Validation
    const salaryInput = document.getElementById('cust-salary');
    const salaryStr = salaryInput.value.trim();
    if (!salaryStr) {
        alert("Salary is required");
        errors.push("Salary is required");
        salaryInput.classList.add('is-invalid');
        document.getElementById('cust-salary-error').style.display = 'block';
        isValid = false;
    } else {
        const salary = parseFloat(salaryStr);
        if (isNaN(salary) || salary <= 0) {
            alert("Salary must be a positive number");
            errors.push("Salary must be a positive number");
            salaryInput.classList.add('is-invalid');
            document.getElementById('cust-salary-error').style.display = 'block';
            isValid = false;
        }
    }

    const idInput = document.getElementById('cust-id');
    const id = idInput.value.trim();
    if (!/^C\d{3}$/.test(id)) {
        alert("Invalid Customer ID format (must be like C001)");
        errors.push("Invalid Customer ID format (must be like C001)");
        idInput.classList.add('is-invalid');
        document.getElementById('cust-id-error').style.display = 'block';
        isValid = false;
    }

    if (!isValid && errors.length > 0) {
        alert("Please fix the following errors:\n\n" + errors.join("\n"));
    }

    return isValid;
};

//load customers
const loadCustomers = (searchTerm = '') => {
    const tbody = document.getElementById('customer-table-body');
    tbody.innerHTML = '';

    const selectCustomer = document.getElementById('select-customer');
    if (selectCustomer) selectCustomer.innerHTML = '<option value="">-- Select --</option>';

    customers.forEach(v => {
        if (v.name.toLowerCase().includes(searchTerm.toLowerCase()) || v.id.includes(searchTerm)) {
            let tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${v.id}</td>
                <td>${v.name}</td>
                <td>${v.address}</td>
                <td>${Number(v.salary).toFixed(2)}</td>
            `;

            tr.addEventListener('click', () => {
                document.getElementById('cust-id').value = v.id;
                document.getElementById('cust-name').value = v.name;
                document.getElementById('cust-address').value = v.address;
                document.getElementById('cust-salary').value = v.salary;

                document.querySelectorAll('#customer-table-body tr').forEach(r => r.classList.remove('selected'));
                tr.classList.add('selected');
            });
            tbody.appendChild(tr);
        }

        if (selectCustomer) {
            let option = document.createElement('option');
            option.value = v.id;
            option.text = v.id;
            selectCustomer.appendChild(option);
        }
    });
};

//clear form
const clearCustomerForm = () => {
    document.getElementById('cust-id').value = generateCustomerId();
    document.getElementById('cust-name').value = '';
    document.getElementById('cust-address').value = '';
    document.getElementById('cust-salary').value = '';
    document.querySelectorAll('#customer-table-body tr').forEach(r => r.classList.remove('selected'));

    // Clear error styles
    ['cust-id', 'cust-name', 'cust-address', 'cust-salary'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.remove('is-invalid');
        const err = document.getElementById(id + '-error');
        if (err) err.style.display = 'none';
    });
};

//save customer
document.getElementById('btn-save-customer').addEventListener('click', (e) => {
    e.preventDefault();

    if (!validateCustomerForm()) return;

    const id = document.getElementById('cust-id').value.trim();
    const name = document.getElementById('cust-name').value.trim();
    const address = document.getElementById('cust-address').value.trim();
    const salary = document.getElementById('cust-salary').value.trim();

    if (customers.some(c => c.id === id)) {
        alert('Customer ID already exists!');
        return;
    }

    customers.push(new Customer(id, name, address, salary));
    clearCustomerForm();
    loadCustomers();
    updateDashboardMetrics();
});

//update customer
document.getElementById('btn-update-customer').addEventListener('click', () => {
    if (!validateCustomerForm()) return;

    const id = document.getElementById('cust-id').value.trim();
    const index = customers.findIndex(c => c.id === id);

    if (index > -1) {
        customers[index].name = document.getElementById('cust-name').value.trim();
        customers[index].address = document.getElementById('cust-address').value.trim();
        customers[index].salary = document.getElementById('cust-salary').value.trim();

        clearCustomerForm();
        loadCustomers();
    } else {
        alert("Customer not found! Please select a customer from the table.");
    }
});

// delete customer
document.getElementById('btn-delete-customer').addEventListener('click', () => {
    const id = document.getElementById('cust-id').value;
    const index = customers.findIndex(c => c.id === id);
    if (index > -1) {
        if (confirm('Are you sure you want to delete this customer?')) {
            customers.splice(index, 1);
            clearCustomerForm();
            loadCustomers();
            updateDashboardMetrics();
        }
    }
});

document.getElementById('btn-clear-customer').addEventListener('click', clearCustomerForm);

document.getElementById('search-customer').addEventListener('input', (e) => {
    loadCustomers(e.target.value);
});

document.addEventListener("DOMContentLoaded", () => {
    const idField = document.getElementById('cust-id');
    if (idField) idField.readOnly = true;

    clearCustomerForm();
    loadCustomers();
});