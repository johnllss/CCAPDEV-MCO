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

        const doVote = async (type, btn, oppositeBtn) => {
            if (!user || !user.userId) { alert('Please login to vote.'); window.location.href = '/login'; return; }
            btn.disabled = true;
            try {
                const res = await fetch(`/posts/${cardPostId}/vote`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ type }) // removed userId
                });

                const result = await res.json().catch(() => ({}));
                if (!res.ok) {
                    if (res.status === 401) { alert('Please login to vote.'); window.location.href = '/login'; return; }
                    alert(result.message || 'Failed to vote.');
                    return;
                }

                if (vote) vote.textContent = result.score ?? (result.up - result.down);

                const icon = btn.querySelector('.upvote-icon') || btn.querySelector('.downvote-icon');
                const oppositeIcon = oppositeBtn?.querySelector('.downvote-icon') || oppositeBtn?.querySelector('.upvote-icon');

                const was = btn.classList.contains('voted');
                if (was) {
                    btn.classList.remove('voted');
                    if (icon) setIconImg(icon, type === 'up' ? '/images/upvote-outline.png' : '/images/downvote-outline.png');
                } else {
                    btn.classList.add('voted');
                    if (icon) setIconImg(icon, type === 'up' ? '/images/upvote-fill.png' : '/images/downvote-fill.png');
                    if (oppositeBtn) oppositeBtn.classList.remove('voted');
                    if (oppositeIcon) setIconImg(oppositeIcon, type === 'up' ? '/images/downvote-outline.png' : '/images/upvote-outline.png');
                }
            } catch (err) {
                console.error(err);
                alert('Could not connect to server.');
            } finally {
                btn.disabled = false;
            }
        };

        if (upBtn) upBtn.addEventListener('click', () => doVote('up', upBtn, downBtn));
        if (downBtn) downBtn.addEventListener('click', () => doVote('down', downBtn, upBtn));
    });
} catch (e) { }

// Prompts the user to confirm deleting a post
if (deleteBtn) {
    deleteBtn.addEventListener("click", async () => {

        if (!user || !user.userId) {
            alert("Please login to delete a post.");
            window.location.href = "/login";
            return;
        }

        const delConfirmed = confirm("Are you sure you want to delete this post?\nThis action cannot be undone.");

        if (!postId) {
            alert('Post ID not found.');
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
                    alert(err.message || 'Failed to delete post.');
                    return;
                }

                alert("Post has been deleted successfully!");
                localStorage.removeItem("editPostTitle");
                localStorage.removeItem("editPostBody");
                localStorage.removeItem("editPostId");
                window.location.href = `/`;
            } catch (err) {
                console.error(err);
                alert("Could not connect to server.");
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