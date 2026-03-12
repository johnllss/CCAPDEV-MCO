const titleInput = document.getElementById("title-input");
const charCtr = document.getElementById("char-ctr");
const fileInput = document.getElementById("file-upload");
const fileName = document.getElementById("file-upload-name");
const cancelBtn = document.getElementById("cancel-button");
const publishBtn = document.getElementById("publish-button");


// Post title character counter
titleInput.addEventListener("input", () => {
    const currentLength = titleInput.value.length;
    charCtr.textContent = `${currentLength}/150`;

    if (currentLength >= 150) {
        charCtr.style.color = "#fc6e6e";
    } else {
        charCtr.style.color = "lightgray";
    }
});

// Prompts the user to confirm cancelling a post
cancelBtn.addEventListener("click", () => {
    const postCancel = confirm("Are you sure you want to go back?");

    if (postCancel) {
        window.location.href = "javascript:history.back()";
    }
})

// Prompts the user to confirm and alerts when posted successfully
publishBtn.addEventListener("click", () => {
    if (titleInput.value.trim() === "") {
        alert("Please add a title.");
        titleInput.focus();
        return;
    }

    const postConfirmed = confirm("Are you sure you want to publish this post?");

    if (postConfirmed) {
        alert("Post has been published successfully!");
        window.location.href = "index.html"; // TODO: link this to actual post page
    }
});

// Replaces blank span with the filename of uploaded image
fileInput.addEventListener("change", function () {
    if (this.files && this.files.length > 0) {
        const name = this.files[0].name;
        fileName.textContent = name;
    }
});

// Login / Logout Button

const user = JSON.parse(localStorage.getItem("loggedUser"));
const logBtn = document.getElementById("log-btn");


if (!user) {
    logBtn.textContent = "Join Us";
    logBtn.href = "register.html";
} else {
    logBtn.textContent = "Logout";
    logBtn.href = "logout.html";
    logBtn.addEventListener("click", (e) => {
        e.preventDefault();
        localStorage.removeItem("loggedUser");
        window.location.href = "logout.html";
    });
}
