document.addEventListener("DOMContentLoaded", async () => {
    const profileLink = document.getElementById("nav-profile-link");
    const profileImage = document.getElementById("nav-profile-image");
    const logBtn = document.getElementById("log-btn");

    if (!profileLink || !profileImage) {
        return;
    }

    let loggedUser = null;

    try {
        const res = await fetch('/auth/me', { credentials: 'include' });
        if (res.ok) {
            loggedUser = await res.json();
        }
    } catch (error) {
        loggedUser = null;
    }

    const userId = loggedUser?.userId;
    const photo = loggedUser?.profile?.photo || "/images/unknownperson.jpg";

    profileLink.href = userId ? `/profile?id=${userId}` : "/profile";
    profileImage.src = photo;

    //added toggle for hbs
    if (userId) {
        logBtn.textContent = "Logout";
        logBtn.href = "/logout";
    } else {
        logBtn.textContent = "Join us";
        logBtn.href = "/login";
    }
});