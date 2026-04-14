/* LOGIN BUTTON LOGIC */
async function loadUser() {
    try {
        const res = await fetch('/auth/me', { credentials: 'include' });
        if (res.ok) {
            const data = await res.json();
            user = data.user || data;
        }
    } catch { }
}

//turned into a function to get the user, as user is no longer an assumption
async function initAuthUI(logoutRedirect = "/logout") {
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
            window.location.href = logoutRedirect;
        });
    }
}

function setIconImg(img, src) {
    if (!img)
        return null;

    try {
        const clone = img.cloneNode(true);

        clone.src = src;
        img.replaceWith(clone);

        return clone;
    } catch (err) {
        img.src = src;

        return img;
    }
}