const titleInput = document.getElementById("title-input");
const bodyInput = document.querySelector(".create-post-body");
const charCtr = document.getElementById("char-ctr");
const fileInput = document.getElementById("file-upload");
const fileName = document.getElementById("file-upload-name");
const cancelBtn = document.getElementById("cancel-button");
const publishBtn = document.getElementById("publish-button");
//const user = JSON.parse(localStorage.getItem("loggedUser")); remove this and replace with
let user = null;

const MAX_UPLOAD_SIZE = 10 * 1024 * 1024; // 10MB

// removed localStorage users
async function loadUser() {
    try {
        const res = await fetch('/auth/me', { credentials: 'include' });
        if (res.ok) {
            user = await res.json();
        }
    } catch { }
}

// Post title character counter
titleInput.addEventListener("input", () => {
    const currentLength = titleInput.value.length;
    charCtr.textContent = `${currentLength}/150`;

    if(currentLength >= 150) {
        charCtr.style.color = "#fc6e6e";
    } else {
        charCtr.style.color = "lightgray";
    }
});

// Prompts the user to confirm cancelling a post
cancelBtn.addEventListener("click", () => {
    const postCancel = confirm("Are you sure you want to go back?");

    if (postCancel) {
        window.location.href = "/";
    }
})

async function uploadImageFile(file) {
    if (!file) 
        throw new Error('No file found');

    if (file.size > MAX_UPLOAD_SIZE)
        throw new Error('File too large. Max is 10MB.');

    const fd = new FormData();
    fd.append('image', file);

    const res = await fetch('/posts/upload-image', { method: 'POST', body: fd, credentials: 'include' });

    if (!res.ok) 
        throw new Error('Upload failed');

    return (await res.json()).filename;
}

// Adds post to database and alerts when posted successfully
publishBtn.addEventListener("click", async () => {

    if (!user || !user.userId) {
        alert("Please login to create a post.");
        window.location.href = "/login";
        return;
    }

    if (titleInput.value.trim() === "") {
        alert("Please add a title.");
        titleInput.focus();
        return;
    }

    let imagePath = "";
    const file = fileInput.files?.[0];

    if (file) {
        try {
            imagePath = await uploadImageFile(file);
        } catch (err) {
            alert('Image upload failed');
            return;
        }
    }

    const postConfirmed = confirm("Are you sure you want to publish this post?");

    if (postConfirmed) {
        try {
            const payload = {
                title: titleInput.value.trim(),
                body: bodyInput.value.trim(),
                image: imagePath
            };

            const response = await fetch("/posts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: 'include',
                body: JSON.stringify(payload)
            });

            const result = await response.json().catch(() => ({}));

            if (!response.ok) {
                alert(result.message || "Failed to publish post.");
                return;
            }

            alert("Post has been published successfully!");
            window.location.href = `/posts/${result._id}/view`;
        } catch (err) {
            alert("Could not connect to server.");
        }
    }
});

// Adds filename of uploaded image if successful and alerts if size limit exceeded
fileInput.addEventListener("change", function () {
    if (this.files && this.files.length > 0) {
        const file = this.files[0];
        if (file.size > MAX_UPLOAD_SIZE) {
            alert('File too large. Max is 10MB.');
            this.value = '';
            fileName.textContent = '';
            return;
        }

        fileName.textContent = file.name;
    }
});


// Login / Logout button detector

const logBtn = document.getElementById("log-btn");

// changed to a function since it no longer assumes that a user exists
async function initializeUserUi() {
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
}

initializeUserUi();