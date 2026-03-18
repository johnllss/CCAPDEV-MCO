const deleteBtn = document.getElementById("delete-button");

// Prompts the user to confirm deleting a post
deleteBtn.addEventListener("click", () => {
    const delConfirmed = confirm("Are you sure you want to delete this post?\nThis action cannot be undone.");

    if (delConfirmed) {
        alert("[PLACEHOLDER] Post has been deleted successfully!");
        window.location.href = "index.html";
    }
})

// Login / Logout Button

const user = JSON.parse(localStorage.getItem("loggedUser"));
const logBtn = document.getElementById("log-btn");


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
