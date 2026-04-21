const titleInput = document.getElementById("title-input");
const bodyInput = document.querySelector(".create-post-body");
const charCtr = document.getElementById("char-ctr");
const bodyCharCtr = document.getElementById("body-char-ctr");
const fileInput = document.getElementById("file-upload");
const fileName = document.getElementById("file-upload-name");
const cancelBtn = document.getElementById("cancel-button");
const publishBtn = document.getElementById("publish-button");
//const user = JSON.parse(localStorage.getItem("loggedUser")); remove this and replace with
let user = null;

const MAX_UPLOAD_SIZE = 10 * 1024 * 1024; // 10MB
const BODY_WARN_THRESHOLD = 0.9;

function updateCounterDisplay(counter, currentLength, maxLength) {
    if (!counter || !Number.isFinite(maxLength) || maxLength <= 0)
        return;

    counter.textContent = `${currentLength}/${maxLength}`;

    if (currentLength >= maxLength) {
        counter.style.color = "#fc6e6e";
    } else if (currentLength >= Math.floor(maxLength * BODY_WARN_THRESHOLD)) {
        counter.style.color = "#d28a1d";
    } else {
        counter.style.color = "lightgray";
    }
}

// Post title character counter
titleInput.addEventListener("input", () => {
    const currentLength = titleInput.value.length;
    updateCounterDisplay(charCtr, currentLength, 150);
});

if (bodyInput && bodyCharCtr) {
    const bodyMaxLength = Number(bodyInput.getAttribute("maxlength")) || 0;
    bodyInput.addEventListener("input", () => {
        updateCounterDisplay(bodyCharCtr, bodyInput.value.length, bodyMaxLength);
    });
    updateCounterDisplay(bodyCharCtr, bodyInput.value.length, bodyMaxLength);
}

// Prompts the user to confirm cancelling a post
cancelBtn.addEventListener("click", () => {
    showAppConfirm("Are you sure you want to go back?", {
        title: "Leave this draft?",
        confirmLabel: "Go back"
    }).then(postCancel => {
        if (postCancel) {
            window.location.href = "/";
        }
    });
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
        await window.redirectToLoginWithPopup("/create-post", {
            notice: "Please log in to create a post."
        });
        return;
    }

    if (titleInput.value.trim() === "") {
        showAppPopup("Please add a title.", { type: 'info', title: 'Missing title' });
        titleInput.focus();
        return;
    }

    const bodyMaxLength = Number(bodyInput?.getAttribute("maxlength")) || 0;
    if (bodyInput && bodyMaxLength > 0 && bodyInput.value.trim().length > bodyMaxLength) {
        showAppPopup(`Post body must be ${bodyMaxLength} characters or fewer.`, { type: 'error', title: 'Body too long' });
        bodyInput.focus();
        return;
    }

    let imagePath = "";
    const file = fileInput.files?.[0];

    if (file) {
        try {
            imagePath = await uploadImageFile(file);
        } catch (err) {
            showAppPopup(err.message || 'Image upload failed.', { type: 'error', title: 'Upload failed' });
            return;
        }
    }

    const postConfirmed = await showAppConfirm("Are you sure you want to publish this post?", {
        title: "Publish post?",
        confirmLabel: "Publish"
    });

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
                showAppPopup(result.message || "Failed to publish post.", { type: 'error', title: 'Publish failed' });
                return;
            }

            await showAppPopup("Post has been published successfully!", { type: 'success', title: 'Post published', duration: 1600 });
            window.location.href = `/posts/${result._id}/view`;
        } catch (err) {
            showAppPopup("Could not connect to server.", { type: 'error', title: 'Connection issue' });
        }
    }
});

// Adds filename of uploaded image if successful and alerts if size limit exceeded
fileInput.addEventListener("change", function () {
    if (this.files && this.files.length > 0) {
        const file = this.files[0];
        if (file.size > MAX_UPLOAD_SIZE) {
            showAppPopup('File too large. Max is 10MB.', { type: 'error', title: 'Upload failed' });
            this.value = '';
            fileName.textContent = '';
            return;
        }

        fileName.textContent = file.name;
    }
});


// Login / Logout button detector

const logBtn = document.getElementById("log-btn");

// Initialize user interface
initAuthUI("/login");
