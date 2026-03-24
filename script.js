// ====================== BimsaraPOS - Final Working JavaScript ======================

let customers = [];
let items = [];
let orders = [];
let currentOrderItems = [];

// ====================== LOCAL STORAGE ======================
function saveToLocalStorage() {
    localStorage.setItem("bimsara_customers", JSON.stringify(customers));
    localStorage.setItem("bimsara_items", JSON.stringify(items));
    localStorage.setItem("bimsara_orders", JSON.stringify(orders));
}

function loadFromLocalStorage() {
    const savedCustomers = localStorage.getItem("bimsara_customers");
    const savedItems = localStorage.getItem("bimsara_items");
    const savedOrders = localStorage.getItem("bimsara_orders");

    if (savedCustomers) customers = JSON.parse(savedCustomers);
    if (savedItems) items = JSON.parse(savedItems);
    if (savedOrders) orders = JSON.parse(savedOrders);
}

// ====================== ID GENERATORS ======================
function generateCustomerID() {
    if (customers.length === 0) return "C001";
    const lastID = customers[customers.length - 1].id;
    const num = parseInt(lastID.substring(1)) + 1;
    return "C" + num.toString().padStart(3, "0");
}

function generateItemID() {
    if (items.length === 0) return "I001";
    const lastID = items[items.length - 1].id;
    const num = parseInt(lastID.substring(1)) + 1;
    return "I" + num.toString().padStart(3, "0");
}

function generateOrderID() {
    if (orders.length === 0) return "ORD-001";
    const lastID = orders[orders.length - 1].id;
    const num = parseInt(lastID.substring(4)) + 1;
    return "ORD-" + num.toString().padStart(3, "0");
}

// ====================== VALIDATION HELPERS ======================
function showError(message) {
    alert("❌ " + message);
}

function showSuccess(message) {
    alert("✅ " + message);
}

// ====================== LOGIN PAGE (Works with your current HTML) ======================
function initLoginPage() {
    const form = document.querySelector("form");           // Your existing form
    const usernameInput = document.getElementById("username");
    const passwordInput = document.getElementById("password");

    // If already logged in, go to dashboard
    if (localStorage.getItem("isLoggedIn") === "true") {
        window.location.href = "dashboard.html";
        return;
    }

    form.addEventListener("submit", function(e) {
        e.preventDefault();

        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();

        if (!username) {
            showError("Username is required!");
            usernameInput.focus();
            return;
        }
        if (!password) {
            showError("Password is required!");
            passwordInput.focus();
            return;
        }

        // Demo credentials
        if (username === "admin" && password === "1234") {
            localStorage.setItem("isLoggedIn", "true");

            showSuccess("Login Successful! Redirecting to Dashboard...");

            setTimeout(() => {
                window.location.href = "dashboard.html";
            }, 800);
        } else {
            showError("Invalid username or password!\n\nTry:\nUsername: admin\nPassword: 1234");
        }
    });

    // Auto fill if remembered (optional)
    const savedUsername = localStorage.getItem("username");
    if (savedUsername) {
        usernameInput.value = savedUsername;
    }
}

// ====================== CUSTOMER PAGE ======================
function initCustomerPage() {
    const form = document.querySelector(".form-card form");
    const idInput = document.getElementById("customerId");
    const nameInput = document.getElementById("customerName");
    const addressInput = document.getElementById("customerAddress");
    const salaryInput = document.getElementById("customerSalary");

    if (idInput) idInput.value = generateCustomerID();

    form.addEventListener("submit", function(e) {
        e.preventDefault();

        const name = nameInput.value.trim();
        const address = addressInput.value.trim();
        const salary = parseFloat(salaryInput.value);

        if (!name) return showError("Full Name is required!");
        if (!address) return showError("Address is required!");
        if (isNaN(salary) || salary < 0) return showError("Salary must be 0 or higher!");

        const newCustomer = { id: idInput.value, name, address, salary };

        customers.push(newCustomer);
        saveToLocalStorage();
        showSuccess("Customer saved successfully!");

        form.reset();
        if (idInput) idInput.value = generateCustomerID();
        loadCustomerTable();
    });

    loadCustomerTable();
}

function loadCustomerTable() {
    const tbody = document.querySelector(".table-card tbody");
    if (!tbody) return;
    tbody.innerHTML = customers.length === 0 ? 
        `<tr><td colspan="4" style="text-align:center;padding:50px;color:var(--text-light);">No customers found.</td></tr>` : 
        customers.map(c => `<tr><td>${c.id}</td><td>${c.name}</td><td>${c.address}</td><td>Rs. ${c.salary.toFixed(2)}</td></tr>`).join('');
}

// ====================== ITEM PAGE ======================
function initItemPage() {
    const form = document.querySelector(".form-card form");
    const idInput = document.getElementById("itemId");
    const nameInput = document.getElementById("itemName");
    const priceInput = document.getElementById("itemPrice");
    const qtyInput = document.getElementById("itemQty");

    if (idInput) idInput.value = generateItemID();

    form.addEventListener("submit", function(e) {
        e.preventDefault();

        const name = nameInput.value.trim();
        const price = parseFloat(priceInput.value);
        const qty = parseInt(qtyInput.value);

        if (!name) return showError("Item Name is required!");
        if (isNaN(price) || price <= 0) return showError("Price must be greater than 0!");
        if (isNaN(qty) || qty < 0) return showError("Quantity cannot be negative!");

        const newItem = { id: idInput.value, name, price, qty };

        items.push(newItem);
        saveToLocalStorage();
        showSuccess("Item saved successfully!");

        form.reset();
        if (idInput) idInput.value = generateItemID();
        loadItemTable();
    });

    loadItemTable();
}

function loadItemTable() {
    const tbody = document.querySelector(".table-card tbody");
    if (!tbody) return;
    tbody.innerHTML = items.length === 0 ? 
        `<tr><td colspan="4" style="text-align:center;padding:50px;color:var(--text-light);">No items found.</td></tr>` : 
        items.map(i => `<tr><td>${i.id}</td><td>${i.name}</td><td>Rs. ${i.price.toFixed(2)}</td><td>${i.qty}</td></tr>`).join('');
}

// ====================== DASHBOARD ======================
function initDashboard() {
    const counts = document.querySelectorAll(".card-info .count");
    if (counts[0]) counts[0].textContent = customers.length;
    if (counts[1]) counts[1].textContent = items.length;
    if (counts[2]) counts[2].textContent = orders.length;

    loadRecentOrders();
}

function loadRecentOrders() {
    const tbody = document.querySelector(".table-section tbody");
    if (!tbody) return;
    tbody.innerHTML = orders.length === 0 ? 
        `<tr><td colspan="5" style="text-align:center;padding:50px;color:var(--text-light);">No orders yet.</td></tr>` : 
        orders.slice(-5).reverse().map(o => `
            <tr>
                <td>${o.id}</td>
                <td>${o.customerName || 'Unknown'}</td>
                <td>${o.date}</td>
                <td>Rs. ${o.total.toFixed(2)}</td>
                <td><span class="status completed">Completed</span></td>
            </tr>`).join('');
}

// ====================== PLACE ORDER PAGE ======================
function initPlaceOrderPage() {
    const orderIdInput = document.getElementById("orderId");
    if (orderIdInput) orderIdInput.value = generateOrderID();

    const orderDateInput = document.getElementById("orderDate");
    if (orderDateInput) orderDateInput.value = new Date().toISOString().split('T')[0];

    // Populate Customer Select
    const customerSelect = document.getElementById("customerSelect");
    if (customerSelect) {
        customerSelect.innerHTML = `<option value="">Choose a customer</option>`;
        customers.forEach(c => {
            const opt = document.createElement("option");
            opt.value = c.id;
            opt.textContent = `${c.id} - ${c.name}`;
            customerSelect.appendChild(opt);
        });
    }

    // Populate Item Select
    const itemSelect = document.getElementById("itemSelect");
    if (itemSelect) {
        itemSelect.innerHTML = `<option value="">Choose an item</option>`;
        items.forEach(i => {
            const opt = document.createElement("option");
            opt.value = i.id;
            opt.textContent = `${i.id} - ${i.name}`;
            itemSelect.appendChild(opt);
        });
    }

    // Add Item Button
    const addBtn = document.querySelector(".order-items-header button");
    if (addBtn) addBtn.addEventListener("click", addItemToOrder);

    // Place Order Button
    const placeBtn = document.querySelector(".btn-success");
    if (placeBtn) placeBtn.addEventListener("click", placeOrder);
}

function addItemToOrder() {
    const itemSelect = document.getElementById("itemSelect");
    const qtyInput = document.getElementById("itemQty");

    if (!itemSelect || !itemSelect.value) return showError("Please select an item!");
    if (!qtyInput || parseInt(qtyInput.value) < 1) return showError("Quantity must be at least 1!");

    const itemId = itemSelect.value;
    const qty = parseInt(qtyInput.value);

    const selectedItem = items.find(i => i.id === itemId);
    if (!selectedItem) return;
    if (selectedItem.qty < qty) return showError(`Only ${selectedItem.qty} available in stock!`);

    const existing = currentOrderItems.find(it => it.id === itemId);
    if (existing) {
        existing.qty += qty;
    } else {
        currentOrderItems.push({ id: selectedItem.id, name: selectedItem.name, price: selectedItem.price, qty });
    }

    loadOrderItemsTable();
    calculateOrderTotal();
}

function loadOrderItemsTable() {
    const tbody = document.querySelector(".order-items-header + .table-container tbody");
    if (!tbody) return;
    tbody.innerHTML = currentOrderItems.length === 0 ? 
        `<tr><td colspan="4" style="text-align:center;padding:40px;color:var(--text-light);">No items added yet.</td></tr>` : 
        currentOrderItems.map(item => `
            <tr>
                <td>${item.name}</td>
                <td>Rs. ${item.price.toFixed(2)}</td>
                <td>${item.qty}</td>
                <td>Rs. ${(item.price * item.qty).toFixed(2)}</td>
            </tr>`).join('');
}

function calculateOrderTotal() {
    let subtotal = currentOrderItems.reduce((sum, item) => sum + item.price * item.qty, 0);
    const discount = parseFloat(document.getElementById("discount")?.value) || 0;
    const total = subtotal - (subtotal * discount / 100);

    const summarySpans = document.querySelectorAll(".summary-row span:last-child");
    if (summarySpans[0]) summarySpans[0].textContent = `Rs. ${subtotal.toFixed(2)}`;
    if (summarySpans[1]) summarySpans[1].textContent = `Rs. ${(subtotal * discount / 100).toFixed(2)}`;
    if (summarySpans[2]) summarySpans[2].textContent = `Rs. ${total.toFixed(2)}`;
}

function placeOrder() {
    const customerSelect = document.getElementById("customerSelect");
    if (!customerSelect || !customerSelect.value) return showError("Please select a customer!");
    if (currentOrderItems.length === 0) return showError("Please add at least one item!");

    const customer = customers.find(c => c.id === customerSelect.value);
    const subtotal = currentOrderItems.reduce((sum, item) => sum + item.price * item.qty, 0);
    const discount = parseFloat(document.getElementById("discount")?.value) || 0;
    const total = subtotal * (1 - discount / 100);

    const newOrder = {
        id: document.getElementById("orderId").value,
        customerId: customerSelect.value,
        customerName: customer.name,
        date: document.getElementById("orderDate").value,
        items: [...currentOrderItems],
        subtotal, discount: subtotal * discount / 100, total, status: "Completed"
    };

    orders.push(newOrder);

    // Reduce stock
    currentOrderItems.forEach(oItem => {
        const item = items.find(i => i.id === oItem.id);
        if (item) item.qty -= oItem.qty;
    });

    saveToLocalStorage();
    showSuccess(`Order ${newOrder.id} placed successfully! Total: Rs. ${total.toFixed(2)}`);

    currentOrderItems = [];
    document.getElementById("orderId").value = generateOrderID();
    if (document.getElementById("discount")) document.getElementById("discount").value = "";
    loadOrderItemsTable();
    calculateOrderTotal();
}

// ====================== LOGOUT ======================
function logout() {
    if (confirm("Are you sure you want to logout?")) {
        localStorage.removeItem("isLoggedIn");
        window.location.href = "login.html";
    }
}

// ====================== MAIN INITIALIZER ======================
function initializeApp() {
    loadFromLocalStorage();

    const page = window.location.href;

    if (page.includes("login.html")) {
        initLoginPage();
    } 
    else if (localStorage.getItem("isLoggedIn") !== "true") {
        window.location.href = "login.html";
    } 
    else if (page.includes("customer.html")) {
        initCustomerPage();
    } 
    else if (page.includes("item.html")) {
        initItemPage();
    } 
    else if (page.includes("dashboard.html")) {
        initDashboard();
    } 
    else if (page.includes("place-order.html")) {
        initPlaceOrderPage();
    }
}

window.onload = initializeApp;