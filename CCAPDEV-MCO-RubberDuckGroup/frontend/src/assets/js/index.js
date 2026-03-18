const user = JSON.parse(localStorage.getItem("loggedUser"));
const logBtn = document.getElementById("log-btn");

/* LOGIN BUTTON LOGIC */
if (!user) {
    logBtn.textContent = "Join Us";
    logBtn.href = "register.html";
} else {
    logBtn.textContent = "Logout";
    logBtn.href = "logout.html";
    logBtn.addEventListener("click", (e) => {
        e.preventDefault();
        localStorage.removeItem("loggedUser");
        window.location.href = "logout.html";
    });
}

document.addEventListener("DOMContentLoaded", () => {
    const user = JSON.parse(localStorage.getItem("loggedUser"));
    const addBtn = document.querySelector(".floating-add-btn");

    if (!user && addBtn) {
        addBtn.style.display = "none";
    }
});
