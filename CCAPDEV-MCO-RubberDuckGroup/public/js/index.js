let user = null;
const logBtn = document.getElementById("log-btn");

document.addEventListener('DOMContentLoaded', async () => {
    await initAuthUI();

    const cards = document.querySelectorAll('.post-card');
    const currentUser = user?._id || user?.userId;

    cards.forEach(card => {
        const postHref = card.dataset.postHref;
        const postId = card.dataset.postid;

        if (postHref) {
            const shouldIgnoreClick = (event) => event.target.closest('a, button, input, textarea, select, label, form');

            card.addEventListener('click', (event) => {
                if (shouldIgnoreClick(event)) return;

                window.location.href = postHref;
            });
        }

        if (!postId) return;

        const upBtn = card.querySelector('.upvote-button');
        const downBtn = card.querySelector('.downvote-button');
        const vote = card.querySelector('.vote-count');

        if (upBtn) upBtn.addEventListener('click', () => voteOnPost(postId, 'up', vote, upBtn, downBtn));
        if (downBtn) downBtn.addEventListener('click', () => voteOnPost(postId, 'down', vote, upBtn, downBtn));

        const upIconInit = upBtn?.querySelector('.upvote-icon');
        const downIconInit = downBtn?.querySelector('.downvote-icon');

        const upList = (card.dataset.upvotes || '').split(',').map(s => s.trim()).filter(Boolean);
        const downList = (card.dataset.downvotes || '').split(',').map(s => s.trim()).filter(Boolean);

        if (currentUser) {
            if (upList.includes(currentUser)) {
                upBtn.classList.add('voted');
                setIconImg(upIconInit, '/images/upvote-fill.png');
                downBtn.classList.remove('voted');
                setIconImg(downIconInit, '/images/downvote-outline.png');
            } else if (downList.includes(currentUser)) {
                downBtn.classList.add('voted');
                setIconImg(downIconInit, '/images/downvote-fill.png');
                upBtn.classList.remove('voted');
                setIconImg(upIconInit, '/images/upvote-outline.png');
            } else {
                setIconImg(upIconInit, '/images/upvote-outline.png');
                setIconImg(downIconInit, '/images/downvote-outline.png');
            }
        } else {
            setIconImg(upIconInit, '/images/upvote-outline.png');
            setIconImg(downIconInit, '/images/downvote-outline.png');
        }
    });

    const addBtn = document.querySelector(".floating-add-btn");

    if (!user && addBtn) {
        addBtn.style.display = "none";
    }
});