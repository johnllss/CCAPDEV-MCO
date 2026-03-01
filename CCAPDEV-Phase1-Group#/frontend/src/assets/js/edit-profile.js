const form = document.getElementById("editProfileForm");
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

if (!user) {
    window.location.href = "../../pages/static-html/login.html";
}

//fills the empty fields
document.getElementById("username").value = user.username;
document.getElementById("fullname").value = user.fullname;
document.getElementById("user-quote").value = user.quote;
document.getElementById("aboutme").value = user.about;
document.getElementById("profilepreview").src = user.photo;

// temp listener, will add saving later
form.addEventListener("submit", function (e) {

    alert("Changes saved (temporary  will be included in MCO2)");
});


