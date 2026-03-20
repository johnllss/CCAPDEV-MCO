const titleField = document.getElementById("title-input");
const bodyField = document.getElementById("post-body");
const currTitle = localStorage.getItem("editPostTitle");
const currBody = localStorage.getItem("editPostBody");
// const fileInput = document.getElementById("file-upload");
// const fileName = document.getElementById("file-upload-name");
const cancelBtn = document.getElementById("cancel-button");
const publishBtn = document.getElementById("save-button");
const user = JSON.parse(localStorage.getItem("loggedUser"));

// Fill text fields with current post info
titleField.value = currTitle;
bodyField.value = currBody;

// Prompts the user to confirm cancelling an edit
cancelBtn.addEventListener("click", () => {
    const postCancel = confirm("Are you sure you want to go back?");

    if(postCancel) {
        localStorage.removeItem("editPostTitle");
        localStorage.removeItem("editPostBody");

        const postId = localStorage.getItem("editPostId");
        localStorage.removeItem("editPostId");
        
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

    const postId = localStorage.getItem('editPostId') || new URLSearchParams(window.location.search).get('id');
    if (!postId) {
        alert('Post ID not found.');
        return;
    }

    if(editConfirmed) {
        try {
            const payload = {
                body: bodyField.value.trim()
            };

            const response = await fetch(`/posts/${postId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const result = await response.json().catch(() => ({}));
                alert(result.message || "Failed to edit post.");
                return;
            }

            alert("Post has been edited successfully!");
            localStorage.removeItem("editPostTitle");
            localStorage.removeItem("editPostBody");
            localStorage.removeItem("editPostId");
            window.location.href = `/posts/${postId}/view`;
        } catch (err) {
            console.error(err);
            alert("Could not connect to server.");
        }
    }
});

// // Replaces blank span with the filename of uploaded image
// fileInput.addEventListener("change", function() {
//     if(this.files && this.files.length > 0) {
//         const name = this.files[0].name;
//         fileName.textContent = name;
//     }
// });
