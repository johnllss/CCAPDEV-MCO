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
async function initAuthUI(logoutRedirect = "/logout") {
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
            window.location.href = logoutRedirect;
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

// Common voting function for posts
async function voteOnPost(postId, type, voteElement, upBtn, downBtn) {
    if (!user || !user.userId) { 
        await showAppPopup('Please login to vote.', { type: 'info', title: 'Login required', duration: 1800 }); 
        window.location.href = window.buildAuthRedirect(window.location.pathname + window.location.search, {
            notice: 'Please log in to vote.'
        }); 
        return; 
    }

    // Disable buttons during vote
    if (upBtn) upBtn.disabled = true;
    if (downBtn) downBtn.disabled = true;

    try {
        const res = await fetch(`/posts/${postId}/vote`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ type })
        });

        const result = await res.json().catch(() => ({}));
        if (!res.ok) {
            if (res.status === 401) { 
                await showAppPopup('Please login to vote.', { type: 'info', title: 'Login required', duration: 1800 }); 
                window.location.href = window.buildAuthRedirect(window.location.pathname + window.location.search, {
                    notice: 'Please log in to vote.'
                }); 
                return; 
            }
            showAppPopup(result.message || 'Failed to vote.', { type: 'error' });
            return;
        }

        // Update vote count
        if (voteElement) {
            voteElement.textContent = result.score ?? (result.up - result.down);
        }

        // Update button states and icons
        const targetBtn = type === 'up' ? upBtn : downBtn;
        const oppositeBtn = type === 'up' ? downBtn : upBtn;

        const wasVoted = targetBtn?.classList.contains('voted');

        if (wasVoted) {
            // Remove vote
            targetBtn.classList.remove('voted');
            const icon = targetBtn?.querySelector('.upvote-icon') || targetBtn?.querySelector('.downvote-icon');
            if (icon) setIconImg(icon, type === 'up' ? '/images/upvote-outline.png' : '/images/downvote-outline.png');
        } else {
            // Add vote
            targetBtn?.classList.add('voted');
            const icon = targetBtn?.querySelector('.upvote-icon') || targetBtn?.querySelector('.downvote-icon');
            if (icon) setIconImg(icon, type === 'up' ? '/images/upvote-fill.png' : '/images/downvote-fill.png');
            
            // Remove opposite vote
            oppositeBtn?.classList.remove('voted');
            const oppositeIcon = oppositeBtn?.querySelector('.downvote-icon') || oppositeBtn?.querySelector('.upvote-icon');
            if (oppositeIcon) setIconImg(oppositeIcon, type === 'up' ? '/images/downvote-outline.png' : '/images/upvote-outline.png');
        }

    } catch (err) {
        console.error(err);
        showAppPopup('Could not connect to server.', { type: 'error', title: 'Connection issue' });
    } finally {
        // Re-enable buttons
        if (upBtn) upBtn.disabled = false;
        if (downBtn) downBtn.disabled = false;
    }
}