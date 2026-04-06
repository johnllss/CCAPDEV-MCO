const titleField = document.getElementById("title-input");
const bodyField = document.getElementById("post-body");
const cancelBtn = document.getElementById("cancel-button");
const publishBtn = document.getElementById("save-button");
let user = null;

function setFieldValue(el, val) {
    if (!el)
        return;
    if ("value" in el)
        el.value = val;
    else
        el.textContent = val;
}

function getFieldValue(el) {
    if (!el)
        return '';
    return ("value" in el) ? el.value : el.textContent;
}

async function loadUser() {
    try {
        const res = await fetch('/auth/me', { credentials: 'include' });
        if (res.ok) {
            user = await res.json();
        }
    } catch { }
}

// Fill text fields with current post info
setFieldValue(titleField, titleField?.value || '');
setFieldValue(bodyField, bodyField?.value || '');

// Prompts the user to confirm cancelling an edit
cancelBtn.addEventListener("click", () => {
    const postCancel = confirm("Are you sure you want to go back?");

    if (postCancel) {
        const postId = new URLSearchParams(window.location.search).get('id');

        if (postId) {
            window.location.href = `/posts/${postId}/view`;
        } else {
            window.location.href = "/";
        }
    }
})

// Updates post in database and alerts when edited successfully
publishBtn.addEventListener("click", async () => {

    if (!user || !user.userId) {
        alert("Please login to edit a post.");
        window.location.href = "/login";
        return;
    }

    const editConfirmed = confirm("Are you sure you want to publish this edit?");

    const postId = new URLSearchParams(window.location.search).get('id');
    if (!postId) {
        alert('Post ID not found.');
        return;
    }

    if (editConfirmed) {
        try {
            const payload = {
                body: getFieldValue(bodyField).trim()
            };

            const response = await fetch(`/posts/${postId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: 'include',
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const result = await response.json().catch(() => ({}));
                alert(result.message || "Failed to edit post.");
                return;
            }

            alert("Post has been edited successfully!");
            window.location.href = `/posts/${postId}/view`;
        } catch (err) {
            console.error(err);
            alert("Could not connect to server.");
        }
    }
});

loadUser();