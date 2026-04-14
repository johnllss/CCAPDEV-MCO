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
        await showAppPopup("Please login to create a post.", { type: 'info', title: 'Login required', duration: 1800 });
        window.location.href = "/login";
        return;
    }

    if (titleInput.value.trim() === "") {
        showAppPopup("Please add a title.", { type: 'info', title: 'Missing title' });
        titleInput.focus();
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
