const deleteBtn = document.getElementById("delete-button");
const editBtn = document.getElementById("edit-button");

// Prompts the user to confirm deleting a post
deleteBtn.addEventListener("click", () => {
    const delConfirmed = confirm("Are you sure you want to delete this post?\nThis action cannot be undone.");

    if (delConfirmed) {
        alert("[PLACEHOLDER] Post has been deleted successfully!");
        window.location.href = "index.html";
    }
});

// Saves post content and redirects to edit post page
editBtn.addEventListener("click", () => {
    const postTitle = document.querySelector(".post-header").innerText;
    const postBody = document.querySelector(".post-body p").innerText;

    localStorage.setItem("editPostTitle", postTitle);
    localStorage.setItem("editPostBody", postBody);

    window.location.href = "edit-post.html";
});
