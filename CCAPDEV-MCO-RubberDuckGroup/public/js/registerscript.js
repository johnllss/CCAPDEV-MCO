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
    if (!username || /[^a-zA-Z0-9]/.test(username)) {
        usernameInput.classList.add("input-error");
        isValid = false;
    }

    if (!email) {
        emailInput.classList.add("input-error");
        isValid = false;
    }

    if (!password || /\s/.test(password)) {
        passwordInput.classList.add("input-error");
        isValid = false;
    }

    if (!isValid) {
        showAppPopup("Check your details and remove invalid characters or spaces.", { type: 'info', title: 'Invalid input' });
        return;

    }

    const data = {
        username: username,
        email: email,
        password: password
    };

    const response = await fetch('/auth/register', {

        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify(data),

    })

    const result = await response.json();

    if (response.ok) {
        console.log("Success:", result.message);
        await showAppPopup(result.message, { type: 'success', title: 'Account created', duration: 1600 });
        window.location.href = "/login";

    } else {
        console.log("Error:", result.message);

        if (result.message.includes("Username")) {
            usernameInput.classList.add("input-error");
        }

        if (result.message.includes("email")) {
            emailInput.classList.add("input-error");
        }
        showAppPopup(result.message, { type: 'error', title: 'Registration failed' });
    }

});
