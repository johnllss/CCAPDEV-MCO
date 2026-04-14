document.addEventListener('DOMContentLoaded', () => {
    const postId = window.location.pathname.split('/')[2];
    // const logged = JSON.parse(localStorage.getItem('loggedUser')) || null;
    let user = null;
    let currentUserId = null;

    function toggleCommentActions() {
        document.querySelectorAll('.comment').forEach(article => {
            const authorId = article.dataset.authorId;
            const ownerActions = article.querySelector('.owner-actions');
            const nonOwnerActions = article.querySelector('.nonowner-actions');

            if (currentUserId && authorId && currentUserId === authorId) {
                if (ownerActions) ownerActions.style.display = 'flex';
                if (nonOwnerActions) nonOwnerActions.style.display = 'none';
            } else {
                if (ownerActions) ownerActions.style.display = 'none';
                if (nonOwnerActions) nonOwnerActions.style.display = 'flex';
            }
        });
    }

    const postCommentBtn = document.querySelector('.add-comment-form .form-submit-btn');
    const newCommentText = document.getElementById('new-comment-text');

    if (postCommentBtn) {
        postCommentBtn.addEventListener('click', async () => {
            if (!currentUserId) {
                await showAppPopup('You must be logged in to comment. Redirecting to login...', { type: 'info', title: 'Login required', duration: 1800 });
                window.location.href = window.buildAuthRedirect(window.location.pathname + window.location.search, {
                    notice: 'Please log in to comment.'
                });
                return;
            }

            const content = newCommentText.value.trim();
            if (!content) {
                showAppPopup('Please write something first.', { type: 'info', title: 'Empty comment' });
                return;
            }

            try {
                const res = await fetch(`/api/comments/${postId}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ content })
                });

                if (res.ok) {
                    newCommentText.value = '';
                    location.reload();
                } else {
                    await showAppPopup('You must be logged in to comment. Redirecting to login...', { type: 'info', title: 'Login required', duration: 1800 });
                    window.location.href = window.buildAuthRedirect(window.location.pathname + window.location.search, {
                        notice: 'Please log in to comment.'
                    });
                    return;
                }
            } catch (err) {
                console.error(err);
                showAppPopup('Error posting comment.', { type: 'error' });
            }
        });
    }

    document.addEventListener('click', async (e) => {
        if (e.target.classList.contains('reply-btn')) {
            if (!currentUserId) {
                await showAppPopup('You must be logged in to reply. Redirecting to login...', { type: 'info', title: 'Login required', duration: 1800 });
                window.location.href = window.buildAuthRedirect(window.location.pathname + window.location.search, {
                    notice: 'Please log in to reply.'
                });
                return;
            }

            const commentId = e.target.dataset.commentId;
            const existing = document.getElementById(`reply-box-${commentId}`);
            if (existing) { existing.remove(); return; }

            const box = document.createElement('div');
            box.id = `reply-box-${commentId}`;
            box.className = 'add-comment-form reply-box';
            box.innerHTML = `
                <textarea id="reply-text-${commentId}" placeholder="Write a reply..." autofocus></textarea>
                <button class="btn-cancel cancel-edit-btn" data-comment-id="${commentId}" type="button">Cancel</button>
                <button class="form-submit-btn submit-reply-btn" data-comment-id="${commentId}" type="button">Reply</button>
            `;
            const actionsContainer = e.target.closest('.comment-actions') || e.target.parentElement;
            actionsContainer.style.display = 'none';
            actionsContainer.after(box);
        }

        if (e.target.classList.contains('cancel-reply-btn')) {
            const commentId = e.target.dataset.commentId;
            const replyBox = document.getElementById(`reply-box-${commentId}`);
            const commentActions = replyBox?.closest('.comment')?.querySelector('.comment-actions');
            if (commentActions) commentActions.style.display = 'flex';
            replyBox?.remove();
        }

        if (e.target.classList.contains('submit-reply-btn')) {
            if (!currentUserId) {
                await showAppPopup('Please log in first.', { type: 'info', title: 'Login required', duration: 1800 });
                window.location.href = window.buildAuthRedirect(window.location.pathname + window.location.search, {
                    notice: 'Please log in to reply.'
                });
                return;
            }

            const parentCommentId = e.target.dataset.commentId;
            const content = document.getElementById(`reply-text-${parentCommentId}`).value.trim();
            if (!content) {
                showAppPopup('Please write something.', { type: 'info', title: 'Empty reply' });
                return;
            }

            try {
                const res = await fetch(`/api/comments/${postId}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ content, parentCommentId })
                });

                if (res.ok) {
                    location.reload();
                } else {
                    showAppPopup('Failed to post reply.', { type: 'error' });
                }
            } catch (err) {
                console.error(err);
            }
        }

        if (e.target.classList.contains('edit-comment-btn')) {
            const commentId = e.target.dataset.commentId;
            const commentBody = document.querySelector(`[data-comment-body="${commentId}"]`);
            const commentActions = commentBody.closest('.comment')?.querySelector('.comment-actions');
            const currentText = commentBody.textContent.trim();

            if (commentActions) commentActions.style.display = 'none';

            // one-liner for now cos fsr it adds unnecessary spacing around the edit text area
            commentBody.innerHTML = `<div class="add-comment-form edit-form"><textarea id="edit-text-${commentId}" autofocus>${currentText}</textarea><div class="edit-form-actions"><button class="btn-cancel cancel-edit-btn" data-comment-id="${commentId}" type="button">Cancel</button><button class="btn-save save-edit-btn" data-comment-id="${commentId}" type="button">Save</button></div></div>`;
        }

        if (e.target.classList.contains('cancel-edit-btn')) {
            const commentId = e.target.dataset.commentId;
            const commentActions = e.target.closest('.comment')?.querySelector('.comment-actions');
            if (commentActions) commentActions.style.display = 'flex';
            location.reload();
        }

        if (e.target.classList.contains('save-edit-btn')) {
            const commentId = e.target.dataset.commentId;
            const content = document.getElementById(`edit-text-${commentId}`).value.trim();
            if (!content) return;

            try {
                const res = await fetch(`/api/comments/${postId}/${commentId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ content })
                });

                if (res.ok) {
                    location.reload();
                } else {
                    showAppPopup('Failed to update comment.', { type: 'error' });
                }
            } catch (err) {
                console.error(err);
            }
        }

        if (e.target.classList.contains('delete-comment-btn')) {
            const commentId = e.target.dataset.commentId;
            const shouldDelete = await showAppConfirm('Delete this comment?', {
                title: 'Delete comment?',
                confirmLabel: 'Delete',
                tone: 'danger'
            });
            if (!shouldDelete) return;

            try {
                const res = await fetch(`/api/comments/${postId}/${commentId}`, {
                    method: 'DELETE',
                    credentials: 'include'
                });

                if (res.ok) {
                    location.reload();
                } else {
                    showAppPopup('Failed to delete comment.', { type: 'error' });
                }
            } catch (err) {
                console.error(err);
            }
        }
    });

    loadUser().then(() => {
        toggleCommentActions();
    });
});
