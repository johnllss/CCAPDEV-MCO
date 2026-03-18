console.log("testing");

// manages the password viewer

let eyeicon = document.getElementById("eyeicon");
let password = document.getElementById("password");

eyeicon.onclick = function () {
    if (password.type == "password") {
        password.type = "text";
        eyeicon.src = "../../assets/images/eye-open.png";
    } else {
        password.type = "password";
        eyeicon.src = "../../assets/images/eye-close.png";
    }
}

const form = document.getElementById("login-form");

form.addEventListener("submit", async function (e) {

    e.preventDefault();


    const login = document.getElementById("loginName").value;
    const password = document.getElementById("password").value;

    const data = {
        login: login,
        password: password
    };


    if (!login || !password) {
        alert("Please fill empty fields");
        return;
    }
    const response = await fetch('http://localhost:3000/auth/login', {

        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),

    })

    const result = await response.json();

    if (response.ok) {
        console.log("Success:", result.message);
        alert(result.message);
        localStorage.setItem("loggedUser", JSON.stringify(result)); // Where user is saved for other pages
        window.location.href = "/index.html";

    } else {
        console.log("Error:", result.message);
        alert(result.message);
    }
});