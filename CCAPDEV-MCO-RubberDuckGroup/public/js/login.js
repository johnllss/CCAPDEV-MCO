console.log("testing");

// manages the password viewer

let eyeicon = document.getElementById("eyeicon");
let password = document.getElementById("password");

eyeicon.onclick = function () {
    if (password.type == "password") {
        password.type = "text";
        eyeicon.src = "/images/eye-open.png";
    } else {
        password.type = "password";
        eyeicon.src = "/images/eye-close.png";
    }
}

const form = document.getElementById("login-form");

form.addEventListener("submit", async function (e) {

    e.preventDefault();

    const login = document.getElementById("loginName").value;
    const password = document.getElementById("password").value;
    const remember = document.getElementById("rememberCheck").checked;

    const data = {
        login: login,
        password: password,
        remember: remember
    };

    if (!login || !password) {
        alert("Please fill empty fields");
        return;
    }

    const response = await fetch('/auth/login', {

        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify(data),

    })

    const result = await response.json();

    if (response.ok) {
        console.log("Success:", result.message);
        alert(result.message);
        window.location.href = "/";
    } else {
        console.log("Error:", result.message);
        alert(result.message);
    }
});