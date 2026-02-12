const deleteBtn = document.getElementById("delete-button");

// Prompts the user to confirm deleting a post
deleteBtn.addEventListener("click", () => {
    const delConfirmed = confirm("Are you sure you want to delete this post?\nThis action cannot be undone.");

    if(delConfirmed) {
        alert("[PLACEHOLDER] Post has been deleted successfully!");
        window.location.href = "index.html";
    }
})
