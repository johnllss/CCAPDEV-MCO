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
    window.location.href = "/login.html";
}


async function loadProfile() {

    // load the information
    try {
        const userId = user.userId;
        const response = await fetch(`http://localhost:3000/users/${userId}`);
        const userData = await response.json();

        console.log(userData);

        document.getElementById("username").value = userData.username;
        document.getElementById("fullname").value = userData.profile.fullname;
        document.getElementById("aboutme").value = userData.profile.about;
        document.getElementById("user-quote").value = userData.profile.quote;
        document.getElementById("profilepreview").src = userData.profile.photo; // this was an epic revalation

    } catch (error) {
        console.error("Error loading profile:", error);
    }
}

// call the function to load it
loadProfile();


form.addEventListener("submit", async function (e) {

    e.preventDefault();

    const userId = user.userId;
    const username = document.getElementById("username").value;
    const fullname = document.getElementById("fullname").value;
    const about = document.getElementById("aboutme").value;
    const quote = document.getElementById("user-quote").value;
    const photo = document.getElementById("profilepreview").src;


    //create the data object to send to the database
    const data = {
        username: username,
        profile: {
            fullname: fullname,
            about: about,
            quote: quote,
            photo: photo
        }
    };

    console.log(data);
    console.log(userId);

    const response = await fetch(`http://localhost:3000/users/${userId}`, {

        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),

    });

    const result = await response.json();

    if (response.ok) {
        console.log("Success:", result.message);
        alert("Successfully Saved Changes");
        window.location.href = "/profile.html";

    } else {
        console.log("Error:", result.message);
        alert("Erm Emoji!!! I think you messed up");
    }

});

// TODO implement photo saving 
