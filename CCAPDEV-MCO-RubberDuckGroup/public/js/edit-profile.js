const form = document.getElementById("editProfileForm");
let user = null;
const logBtn = document.getElementById("log-btn");

// needs to load user from session instead now
async function loadUser() {
    try {
        const res = await fetch('/auth/me', { credentials: 'include' });
        if (res.ok) {
            user = await res.json();
        }
    } catch { }
}

// changed to a function since it no longer assumes that a user exists
async function initAuthUI() {
    await loadUser();

    if (!user) {
        logBtn.textContent = "Join Us";
        logBtn.href = "/register";
    } else {
        logBtn.textContent = "Logout";
        logBtn.href = "/logout";
        logBtn.addEventListener("click", async (e) => {
            e.preventDefault();
            await fetch('/auth/logout', { method: 'POST', credentials: 'include' });
            window.location.href = "/login";
        });
    }

    if (!user) {
        window.location.href = "/login";
    }
}

async function loadProfile() {

    try {
        const response = await fetch(`/auth/me`, { credentials: 'include' });
        const userData = await response.json();

        document.getElementById("username").value = userData.username;
        document.getElementById("fullname").value = userData.profile?.fullname || '';
        document.getElementById("aboutme").value = userData.profile?.about || '';
        document.getElementById("user-quote").value = userData.profile?.quote || '';
        document.getElementById("profilepreview").src = userData.profile?.photo || '/images/default-pfp.png';

    } catch (error) {
        console.error("Error loading profile:", error);
    }
}

form.addEventListener("submit", async function (e) {

    e.preventDefault();

    const username = document.getElementById("username").value;
    const fullname = document.getElementById("fullname").value;
    const about = document.getElementById("aboutme").value;
    const quote = document.getElementById("user-quote").value;
    const photo = document.getElementById("profilepreview").src;

    const data = {
        username: username,
        profile: {
            fullname: fullname,
            about: about,
            quote: quote,
            photo: photo
        }
    };

    // dev purposes
    console.log(data);
    console.log(user._id);
    const response = await fetch(`/users`, {

        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify(data),

    });

    const result = await response.json();

    if (response.ok) {
        console.log("Success:", result.message);
        alert("Successfully Saved Changes");
        window.location.href = "/profile";

    } else {
        console.log("Error:", result.message);
        alert("Erm Emoji!!! I think you messed up");
    }

});

//moved all function calls to end to preserve clarity
async function init() {
    await initAuthUI();
    await loadProfile();
}

init();