document.addEventListener("DOMContentLoaded", () => {
    const profileLink = document.getElementById("nav-profile-link");
    const profileImage = document.getElementById("nav-profile-image");

    if (!profileLink || !profileImage) {
        return;
    }

    let loggedUser = null;

    try {
        loggedUser = JSON.parse(localStorage.getItem("loggedUser"));
    } catch (error) {
        loggedUser = null;
    }

    const userId = loggedUser?.userId;
    const photo = loggedUser?.profile?.photo || "/images/unknownperson.jpg";

    profileLink.href = userId ? `/profile?id=${userId}` : "/profile";
    profileImage.src = photo;
});