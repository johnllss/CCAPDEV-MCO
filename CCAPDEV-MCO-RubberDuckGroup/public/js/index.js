let user = null;
const logBtn = document.getElementById("log-btn");

/* LOGIN BUTTON LOGIC */
async function loadUser() {
    try {
        const res = await fetch('/auth/me', { credentials: 'include' });
        if (res.ok) {
            const data = await res.json();
            user = data.user || data;
        }
    } catch { }
}

//turned into a function to get the user, as user is no longer an assumption
async function initAuthUI() {
    await loadUser();

    if (!user) {
        logBtn.textContent = "Join Us";
        logBtn.href = "/register";
    } else {
        logBtn.textContent = "Logout";
        logBtn.href = "/logout";
        logBtn.addEventListener("click", async (e) => {
            e.preventDefault();
            await fetch('/auth/logout', { method: 'POST', credentials: 'include' });
            window.location.href = "/logout";
        });
    }
}

function setIconImg(img, src) {
    if (!img)
        return null;

    try {
        const clone = img.cloneNode(true);

        clone.src = src;
        img.replaceWith(clone);

        return clone;
    } catch (err) {
        img.src = src;

        return img;
    }
}

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

        const doVote = async (type, btn, oppBtn) => {
            if (!currentUser) { alert('Please login to vote.'); window.location.href = '/login'; return; }
            btn.disabled = true;
            try {
                const res = await fetch(`/posts/${postId}/vote`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ type })
                });
                const result = await res.json().catch(() => ({}));
                if (!res.ok) {
                    if (res.status === 401) { alert('Please login to vote.'); window.location.href = '/login'; return; }
                    alert(result.message || 'Failed to vote.');
                    return;
                }

                if (vote) vote.textContent = result.score ?? (result.up - result.down);

                const was = btn.classList.contains('voted');

                const upIcon = upBtn.querySelector('.upvote-icon');
                const downIcon = downBtn.querySelector('.downvote-icon');

                if (was) {
                    btn.classList.remove('voted');
                    if (btn === upBtn) setIconImg(upIcon, '/images/upvote-outline.png');
                    else setIconImg(downIcon, '/images/downvote-outline.png');
                } else {
                    btn.classList.add('voted');
                    if (btn === upBtn) {
                        setIconImg(upIcon, '/images/upvote-fill.png');
                        setIconImg(downIcon, '/images/downvote-outline.png');
                        downBtn.classList.remove('voted');
                    } else {
                        setIconImg(downIcon, '/images/downvote-fill.png');
                        setIconImg(upIcon, '/images/upvote-outline.png');
                        upBtn.classList.remove('voted');
                    }
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

    const urlParams = new URLSearchParams(window.location.search);
    const sortType = urlParams.get('sort') || 'newest';
    document.getElementById('sort-dropdown').value = sortType;

    document.getElementById('sort-dropdown')?.addEventListener('change', (e) => {
        window.location.href = `/?sort=${e.target.value}`;
    });
});