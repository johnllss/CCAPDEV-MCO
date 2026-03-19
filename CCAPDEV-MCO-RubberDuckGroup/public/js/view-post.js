document.addEventListener('DOMContentLoaded', () => {
    const postId = window.location.pathname.split('/')[2];
    const currentUserId = '6650a1b2c3d4e5f6a7b8c9d0';

    const postCommentBtn = document.querySelector('.add-comment-form .form-submit-btn');
    const newCommentText = document.getElementById('new-comment-text');

    if (postCommentBtn) {
        postCommentBtn.addEventListener('click', async () => {
            const content = newCommentText.value.trim();
            if (!content) return alert('Please write something first.');

            try {
                const res = await fetch(`/api/comments/${postId}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ content, authorId: currentUserId })
                });

                if (res.ok) {
                    newCommentText.value = '';
                    location.reload();
                } else {
                    alert('Failed to post comment.');
                }
            } catch (err) {
                console.error(err);
                alert('Error posting comment.');
            }
        });
    }

    document.addEventListener('click', async (e) => {
        if (e.target.classList.contains('reply-btn')) {
            const commentId = e.target.dataset.commentId;
            const existing = document.getElementById(`reply-box-${commentId}`);
            if (existing) { existing.remove(); return; }

            const box = document.createElement('div');
            box.id = `reply-box-${commentId}`;
            box.innerHTML = `
                <textarea id="reply-text-${commentId}" placeholder="Write a reply..."></textarea>
                <button class="cancel-reply-btn" data-comment-id="${commentId}">Cancel</button>
                <button class="submit-reply-btn" data-comment-id="${commentId}">Reply</button>
            `;
            e.target.parentElement.after(box);
        }

        if (e.target.classList.contains('cancel-reply-btn')) {
            const commentId = e.target.dataset.commentId;
            document.getElementById(`reply-box-${commentId}`)?.remove();
        }

        if (e.target.classList.contains('submit-reply-btn')) {
            const parentCommentId = e.target.dataset.commentId;
            const content = document.getElementById(`reply-text-${parentCommentId}`).value.trim();
            if (!content) return alert('Please write something.');

            try {
                const res = await fetch(`/api/comments/${postId}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ content, authorId: currentUserId, parentCommentId })
                });

                if (res.ok) {
                    location.reload();
                } else {
                    alert('Failed to post reply.');
                }
            } catch (err) {
                console.error(err);
            }
        }

        if (e.target.classList.contains('edit-comment-btn')) {
            const commentId = e.target.dataset.commentId;
            const commentBody = document.querySelector(`[data-comment-body="${commentId}"]`);
            const currentText = commentBody.textContent;

            commentBody.innerHTML = `
                <textarea id="edit-text-${commentId}">${currentText}</textarea>
                <button class="cancel-edit-btn" data-comment-id="${commentId}">Cancel</button>
                <button class="save-edit-btn" data-comment-id="${commentId}">Save</button>
            `;
        }

        if (e.target.classList.contains('cancel-edit-btn')) {
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
                    body: JSON.stringify({ content })
                });

                if (res.ok) {
                    location.reload();
                } else {
                    alert('Failed to update comment.');
                }
            } catch (err) {
                console.error(err);
            }
        }

        if (e.target.classList.contains('delete-comment-btn')) {
            const commentId = e.target.dataset.commentId;
            if (!confirm('Delete this comment?')) return;

            try {
                const res = await fetch(`/api/comments/${postId}/${commentId}`, {
                    method: 'DELETE'
                });

                if (res.ok) {
                    location.reload();
                } else {
                    alert('Failed to delete comment.');
                }
            } catch (err) {
                console.error(err);
            }
        }
    });
});