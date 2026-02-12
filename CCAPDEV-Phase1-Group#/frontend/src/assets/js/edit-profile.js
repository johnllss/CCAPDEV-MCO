const form = document.getElementById("editProfileForm");
const user = JSON.parse(localStorage.getItem("loggedUser"));

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


