const deleteBtn = document.getElementById("delete-button");
const editBtn = document.getElementById("edit-button");
const upvoteBtn = document.querySelector(".upvote-button");
const downvoteBtn = document.querySelector(".downvote-button");
let upIcon = upvoteBtn?.querySelector('.upvote-icon');
let downIcon = downvoteBtn?.querySelector('.downvote-icon');
// const user = JSON.parse(localStorage.getItem("loggedUser"));
let user = null;

const path = window.location.pathname.match(/\/posts\/([^\/]+)(?:\/view)?/);
const postId = path ? path[1] : new URLSearchParams(window.location.search).get('id');

// get session user (cookie-based)
(async () => {
    await loadUser();
})();

try {
    const cards = document.querySelectorAll('.post-card');
    const currentUserId = user?.userId;

    cards.forEach(card => {
        try {
            const dataUp = card.dataset?.upvotes ?? '';
            const dataDown = card.dataset?.downvotes ?? '';
            const upvotes = dataUp ? dataUp.split(',').filter(Boolean) : [];
            const downvotes = dataDown ? dataDown.split(',').filter(Boolean) : [];

            const upBtn = card.querySelector('.upvote-button');
            const downBtn = card.querySelector('.downvote-button');
            let up = upBtn?.querySelector('.upvote-icon');
            let down = downBtn?.querySelector('.downvote-icon');

            if (currentUserId && upvotes.includes(currentUserId)) {
                upBtn?.classList.add('voted');
                if (up)
                    up = setIconImg(up, '/images/upvote-fill.png');
            }

            if (currentUserId && downvotes.includes(currentUserId)) {
                downBtn?.classList.add('voted');
                if (down)
                    down = setIconImg(down, '/images/downvote-fill.png');
            }
        } catch (err) { }
    });
} catch (err) { }

try {
    const cards = document.querySelectorAll('.post-card');
    const currentUser = user?.userId;

    cards.forEach(card => {
        const cardPostId = card.dataset.postid;
        if (!cardPostId) return;

        const upBtn = card.querySelector('.upvote-button');
        const downBtn = card.querySelector('.downvote-button');
        let upI = upBtn?.querySelector('.upvote-icon');
        let downI = downBtn?.querySelector('.downvote-icon');
        const vote = card.querySelector('.vote-count');

        if (upBtn) upBtn.addEventListener('click', () => voteOnPost(cardPostId, 'up', vote, upBtn, downBtn));
        if (downBtn) downBtn.addEventListener('click', () => voteOnPost(cardPostId, 'down', vote, upBtn, downBtn));
    });
} catch (e) { }

// Prompts the user to confirm deleting a post
if (deleteBtn) {
    deleteBtn.addEventListener("click", async () => {

        if (!user || !user.userId) {
            await showAppPopup("Please login to delete a post.", { type: 'info', title: 'Login required', duration: 1800 });
            window.location.href = "/login";
            return;
        }

        const delConfirmed = confirm("Are you sure you want to delete this post?\nThis action cannot be undone.");

        if (!postId) {
            showAppPopup('Post ID not found.', { type: 'error' });
            return;
        }

        if (delConfirmed) {
            try {
                const response = await fetch(`/posts/${postId}`, {
                    method: "DELETE",
                    credentials: 'include'
                });

                if (!response.ok) {
                    const err = await response.json().catch(() => ({}));
                    showAppPopup(err.message || 'Failed to delete post.', { type: 'error', title: 'Delete failed' });
                    return;
                }

                await showAppPopup("Post has been deleted successfully!", { type: 'success', title: 'Post deleted', duration: 1600 });
                localStorage.removeItem("editPostTitle");
                localStorage.removeItem("editPostBody");
                localStorage.removeItem("editPostId");
                window.location.href = `/`;
            } catch (err) {
                console.error(err);
                showAppPopup("Could not connect to server.", { type: 'error', title: 'Connection issue' });
            }
        }
    });
}

// Saves post content and redirects to edit post page
if (editBtn) {
    editBtn.addEventListener("click", () => {
        window.location.href = `/edit-post?id=${postId}`;
    });
};
