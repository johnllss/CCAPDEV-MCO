const titleField = document.getElementById("title-input");
const bodyField = document.getElementById("post-body");
const bodyCharCtr = document.getElementById("body-char-ctr");
const cancelBtn = document.getElementById("cancel-button");
const publishBtn = document.getElementById("save-button");
let user = null;
const BODY_WARN_THRESHOLD = 0.9;

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

// Fill text fields with current post info
setFieldValue(titleField, titleField?.value || '');
setFieldValue(bodyField, bodyField?.value || '');

if (bodyField && bodyCharCtr) {
    const bodyMaxLength = Number(bodyField.getAttribute("maxlength")) || 0;
    bodyField.addEventListener("input", () => {
        updateCounterDisplay(bodyCharCtr, bodyField.value.length, bodyMaxLength);
    });
    updateCounterDisplay(bodyCharCtr, bodyField.value.length, bodyMaxLength);
}

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
        await window.redirectToLoginWithPopup(window.location.pathname + window.location.search, {
            notice: "Please log in to edit this post."
        });
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

    const bodyMaxLength = Number(bodyField?.getAttribute("maxlength")) || 0;
    if (bodyField && bodyMaxLength > 0 && getFieldValue(bodyField).trim().length > bodyMaxLength) {
        showAppPopup(`Post body must be ${bodyMaxLength} characters or fewer.`, { type: 'error', title: 'Body too long' });
        bodyField.focus();
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
