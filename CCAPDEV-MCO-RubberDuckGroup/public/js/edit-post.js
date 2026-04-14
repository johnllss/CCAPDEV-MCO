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

// Fill text fields with current post info
setFieldValue(titleField, titleField?.value || '');
setFieldValue(bodyField, bodyField?.value || '');

// Prompts the user to confirm cancelling an edit
cancelBtn.addEventListener("click", () => {
    showAppConfirm("Are you sure you want to go back?", {
        title: "Discard this edit?",
        confirmLabel: "Go back"
    }).then(postCancel => {
        if (postCancel) {
            const postId = new URLSearchParams(window.location.search).get('id');

            if (postId) {
                window.location.href = `/posts/${postId}/view`;
            } else {
                window.location.href = "/";
            }
        }
    });
})

// Updates post in database and alerts when edited successfully
publishBtn.addEventListener("click", async () => {

    if (!user || !user.userId) {
        await showAppPopup("Please login to edit a post.", { type: 'info', title: 'Login required', duration: 1800 });
        window.location.href = "/login";
        return;
    }

    const editConfirmed = await showAppConfirm("Are you sure you want to publish this edit?", {
        title: "Save post changes?",
        confirmLabel: "Save changes"
    });

    const postId = new URLSearchParams(window.location.search).get('id');
    if (!postId) {
        showAppPopup('Post ID not found.', { type: 'error' });
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
                showAppPopup(result.message || "Failed to edit post.", { type: 'error', title: 'Edit failed' });
                return;
            }

            await showAppPopup("Post has been edited successfully!", { type: 'success', title: 'Post updated', duration: 1600 });
            window.location.href = `/posts/${postId}/view`;
        } catch (err) {
            console.error(err);
            showAppPopup("Could not connect to server.", { type: 'error', title: 'Connection issue' });
        }
    }
});

loadUser();