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


// manages the login logic. 


const form = document.getElementById("login-form");

form.addEventListener("submit", function (e) {
    e.preventDefault();

    const identifier = document.getElementById("loginIdentifier").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!identifier || !password) {
        alert("Fill all fields.");
        return;
    }

    // Temporary frontend login
    if (identifier === "donald" && password === "1234") {

        const user = {
            username: "donaldduck67",
            fullname: "Donald Duck",
            quote: "Wishing i was like Scrooge McDuck",
            about: "Full Quack developer for Mickey Studios",
            posts: 999,
            replies: 67,
            dday: "1-1-1000",
            photo: "/assets/images/donald_profilepic.jpg",
            activity: []
        };

        localStorage.setItem("loggedUser", JSON.stringify(user));

        window.location.href = "/pages/static-html/index.html";

    } else {
        alert("Invalid credentials");
    }
});
