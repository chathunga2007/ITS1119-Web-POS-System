const settingForm = document.getElementById('settings-form');

settingForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const username = document.getElementById('setting-username').value;
    const currPass = document.getElementById('setting-current-pwd').value;
    const newPass = document.getElementById('setting-new-pwd').value;
    const confPass = document.getElementById('setting-confirm-pwd').value;

    const userIndex = users.findIndex(u => u.username === username);

    if (userIndex === -1) {
        alert("User not found!");
        return;
    }

    if (users[userIndex].password !== currPass) {
        alert("Current password is incorrect!");
        return;
    }

    if (newPass !== confPass) {
        alert("New passwords do not match!");
        return;
    }

    if (newPass.length < 3) {
        alert("Password too short!");
        return;
    }

    // Success
    users[userIndex].password = newPass;

    alert("Password changed successfully! You will be logged out.");

    // Reset Form
    settingForm.reset();

    // Logout
    document.getElementById('btn-logout').click();
});
