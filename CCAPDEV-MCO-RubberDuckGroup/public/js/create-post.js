const titleInput = document.getElementById("title-input");
const bodyInput = document.querySelector(".create-post-body");
const charCtr = document.getElementById("char-ctr");
const fileInput = document.getElementById("file-upload");
const fileName = document.getElementById("file-upload-name");
const cancelBtn = document.getElementById("cancel-button");
const publishBtn = document.getElementById("publish-button");
const user = JSON.parse(localStorage.getItem("loggedUser"));

let uploadedImageData = "";

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

// Adds post to database and alerts when posted successfully
publishBtn.addEventListener("click", async () => {

    if (!user || !user.userId) {
        alert("Please login to create a post.");
        window.location.href = "/login";
        return;
    }

    if (titleInput.value.trim() === "") {
        alert("Please add a title.");
        titleInput.focus();
        return;
    }

    const postConfirmed = confirm("Are you sure you want to publish this post?");

    if (postConfirmed) {
        try {
            const payload = {
                user: user.userId,
                title: titleInput.value.trim(),
                body: bodyInput.value.trim(),
                image: uploadedImageData
            };

            const response = await fetch("http://localhost:3000/posts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            const result = await response.json().catch(() => ({}));

            if (!response.ok) {
                alert(result.message || "Failed to publish post.");
                return;
            }

            alert("Post has been published successfully!");
            window.location.href = `/posts/${result._id}/view`;
        } catch (err) {
            alert("Could not connect to server.");
        }
    }
});

// Replaces blank span with the filename of uploaded image
fileInput.addEventListener("change", function () {
    if (this.files && this.files.length > 0) {
        const name = this.files[0].name;
        fileName.textContent = name;
    }
});


// Login / Logout button detector

const logBtn = document.getElementById("log-btn");

if (!user) {
    logBtn.textContent = "Join Us";
    logBtn.href = "/register";
} else {
    logBtn.textContent = "Logout";
    logBtn.href = "/logout";
    logBtn.addEventListener("click", (e) => {
        e.preventDefault();
        localStorage.removeItem("loggedUser");
        window.location.href = "/logout";
    });
}

