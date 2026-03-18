const deleteBtn = document.getElementById("delete-button");
const editBtn = document.getElementById("edit-button");
const user = JSON.parse(localStorage.getItem("loggedUser"));
const path = window.location.pathname.match(/\/posts\/([^\/]+)(?:\/view)?/);
const postId = path ? path[1] : new URLSearchParams(window.location.search).get('id');

// Prompts the user to confirm deleting a post
deleteBtn.addEventListener("click", async () => {

    if (!user || !user.userId) {
        alert("Please login to delete a post.");
        window.location.href = "/login.html";
        return;
    }

    const delConfirmed = confirm("Are you sure you want to delete this post?\nThis action cannot be undone.");

    const postId = localStorage.getItem('editPostId') || new URLSearchParams(window.location.search).get('id');
    if (!postId) {
        alert('Post ID not found.');
        return;
    }

    if (delConfirmed) {
        try {
            const response = await fetch(`/posts/${postId}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                const err = await resp.json().catch(()=>({}));
                alert(err.message || 'Failed to delete post.');
                return;
            }

            alert("Post has been deleted successfully!");
            localStorage.removeItem("editPostTitle");
            localStorage.removeItem("editPostBody");
            localStorage.removeItem("editPostId");
            window.location.href = `/index.html`;
        } catch (err) {
            console.error(err);
            alert("Could not connect to server.");
        }

        alert("Post has been deleted successfully!");
        window.location.href = "/index.html";
    }
});

// Saves post content and redirects to edit post page
editBtn.addEventListener("click", () => {
    const postTitle = document.querySelector(".post-header").innerText;
    const postBody = document.querySelector(".post-body p").innerText;

    localStorage.setItem("editPostId", postId);
    localStorage.setItem("editPostTitle", postTitle);
    localStorage.setItem("editPostBody", postBody);

    window.location.href = "/edit-post.html";
});
