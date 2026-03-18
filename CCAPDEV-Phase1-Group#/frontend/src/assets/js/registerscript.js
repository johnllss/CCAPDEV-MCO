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

const form = document.getElementById("register-form");

form.addEventListener("submit", async function (e) {

    e.preventDefault();


    // for dom
    const usernameInput = document.getElementById("username");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");

    // raw values
    const username = usernameInput.value;
    const email = emailInput.value;
    const password = passwordInput.value;

    let isValid = true;

    // frontend validation
    if (!username) {
        usernameInput.classList.add("input-error");
        isValid = false;
    }

    if (!email) {
        emailInput.classList.add("input-error");
        isValid = false;
    }

    if (!password) {
        passwordInput.classList.add("input-error");
        isValid = false;
    }

    if (!isValid) {
        return;
    }

    const data = {
        username: username,
        email: email,
        password: password
    };

    const response = await fetch('http://localhost:3000/auth/register', {

        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),

    })

    const result = await response.json();

    if (response.ok) {
        console.log("Success:", result.message);
        alert(result.message);
        window.location.href = "/login.html";

    } else {
        console.log("Error:", result.message);

        if (result.message.includes("Username")) {
            usernameInput.classList.add("input-error");
        }

        if (result.message.includes("email")) {
            emailInput.classList.add("input-error");
        }
        alert(result.message);
    }

});
