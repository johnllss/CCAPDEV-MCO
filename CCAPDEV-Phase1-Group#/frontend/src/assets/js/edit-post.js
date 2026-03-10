const titleField = document.getElementById("title-input");
const bodyField = document.getElementById("body-input");
const currTitle = localStorage.getItem("editPostTitle");
const currBody = localStorage.getItem("editPostBody");
// const fileInput = document.getElementById("file-upload");
// const fileName = document.getElementById("file-upload-name");
const cancelBtn = document.getElementById("cancel-button");
const publishBtn = document.getElementById("publish-button");

// Fill text fields with current post info
titleField.value = currTitle;
bodyField.value = currBody;

// Prompts the user to confirm cancelling an edit
cancelBtn.addEventListener("click", () => {
    const postCancel = confirm("Are you sure you want to go back?");

    if(postCancel) {
        localStorage.removeItem("editPostTitle");
        localStorage.removeItem("editPostBody");
        window.location.href = "index.html"; // TODO: Link this to the post being edited
    }
})

// Prompts the user to confirm and alerts when edit successfully
publishBtn.addEventListener("click", () => {
    const postConfirmed = confirm("Are you sure you want to publish this edit?");

    if(postConfirmed) {
        // TODO: update post in database

        alert("[PLACEHOLDER] Post has been edited successfully!");
        localStorage.removeItem("editPostTitle");
        localStorage.removeItem("editPostBody");
        window.location.href = "post.html"; // TODO: link this to actual post page
    }
});

// // Replaces blank span with the filename of uploaded image
// fileInput.addEventListener("change", function() {
//     if(this.files && this.files.length > 0) {
//         const name = this.files[0].name;
//         fileName.textContent = name;
//     }
// });
