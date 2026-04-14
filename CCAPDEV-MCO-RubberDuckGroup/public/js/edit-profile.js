const form = document.getElementById("editProfileForm");
const logBtn = document.getElementById("log-btn");
const profileImageInput = document.getElementById("profile-img");
const profilePreview = document.getElementById("profilepreview");
const MAX_UPLOAD_SIZE = 10 * 1024 * 1024; // 10MB
let uploadedPhotoPath = '';

async function loadProfile() {

    try {
        const response = await fetch(`/auth/me`, { credentials: 'include' });

        if (!response.ok)
            throw new Error('Failed to load profile');

        const userData = await response.json();

        document.getElementById("username").value = userData.username;
        document.getElementById("fullname").value = userData.profile?.fullname || '';
        document.getElementById("aboutme").value = userData.profile?.about || '';
        document.getElementById("user-quote").value = userData.profile?.quote || '';

        uploadedPhotoPath = userData.profile?.photo || '/images/default-pfp.png';
        profilePreview.src = uploadedPhotoPath;

    } catch (error) {
        console.error("Error loading profile:", error);
    }
}

async function uploadProfilePhoto(file) {
    if (!file)
        throw new Error('No file found');

    if (file.size > MAX_UPLOAD_SIZE)
        throw new Error('File too large. Max is 10MB.');

    const fd = new FormData();
    fd.append('photo', file);

    const response = await fetch('/users/upload-profile', {
        method: 'POST',
        body: fd,
        credentials: 'include'
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok)
        throw new Error(result.message || 'Upload failed');

    return result.photo;
}

profileImageInput.addEventListener('change', async function () {
    const file = this.files?.[0];
    if (!file)
        return;

    const previousPhotoPath = uploadedPhotoPath;
    const previewUrl = URL.createObjectURL(file);
    profilePreview.src = previewUrl;

    try {
        uploadedPhotoPath = await uploadProfilePhoto(file);
        profilePreview.src = uploadedPhotoPath;
    } catch (error) {
        uploadedPhotoPath = previousPhotoPath;
        profilePreview.src = previousPhotoPath || '/images/default-pfp.png';
        showAppPopup(error.message || 'Profile photo upload failed.', { type: 'error', title: 'Upload failed' });
        this.value = '';
    } finally {
        URL.revokeObjectURL(previewUrl);
    }
});

form.addEventListener("submit", async function (e) {

    e.preventDefault();

    const username = document.getElementById("username").value;
    const fullname = document.getElementById("fullname").value;
    const about = document.getElementById("aboutme").value;
    const quote = document.getElementById("user-quote").value;

    const data = {
        username: username,
        profile: {
            fullname: fullname,
            about: about,
            quote: quote,
            photo: uploadedPhotoPath || '/images/default-pfp.png'
        }
    };

    const response = await fetch(`/users`, {

        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify(data),

    });

    const result = await response.json();

    if (response.ok) {
        await showAppPopup("Successfully saved changes.", { type: 'success', title: 'Profile updated', duration: 1600 });
        window.location.href = "/profile";

    } else {
        showAppPopup(result.message || "Failed to save profile changes.", { type: 'error', title: 'Save failed' });
    }

});

//moved all function calls to end to preserve clarity
async function init() {
    await initAuthUI("/login");
    await loadProfile();
}

init();
