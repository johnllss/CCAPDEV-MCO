document.addEventListener('DOMContentLoaded', function() {
    renderCommentsSection();
});

function renderCommentsSection() {
    const commentsContainer = document.getElementById('comments-section');
    
    const html = `
        <div class="comments-header">Comments (${sampleComments.length})</div>
        
        <div class="add-comment-form">
            <textarea 
                id="new-comment-text" 
                placeholder="Write a comment..."
            ></textarea>
            <button class="form-submit-btn" onclick="postComment()">Post Comment</button>
        </div>
        
        <div class="comments-list" id="comments-list"></div>
    `;
    
    commentsContainer.innerHTML = html;
    renderComments();
}

function renderComments() {
    const commentsList = document.getElementById('comments-list');
    const topLevelComments = sampleComments.filter(c => c.parentCommentId === null);
    
    let html = '';
    topLevelComments.forEach(comment => {
        html += renderCommentThread(comment, 0);
    });
    
    commentsList.innerHTML = html;
}

function renderCommentThread(comment, level) {
    const user = sampleUsers.find(u => u.id === comment.userId);
    const isOwner = currentUser.id === comment.userId;
    const timeAgo = getTimeAgo(comment.timestamp);
    const replies = sampleComments.filter(c => c.parentCommentId === comment.id);
    
    let html = `
        <div class="comment level-${level}" id="comment-${comment.id}">
            <div class="comment-header">
                <img src="${user.avatar}" alt="${user.username}" class="comment-avatar">
                <span class="comment-author">${user.username}</span>
                <span class="comment-time">· ${timeAgo}</span>
                ${comment.isEdited ? '<span class="comment-edited">(edited)</span>' : ''}
                <button class="comment-menu" onclick="toggleCommentMenu(${comment.id})">⋯</button>
            </div>
            
            <div class="comment-body" id="comment-body-${comment.id}">
                ${comment.text}
            </div>
            
            <div class="edit-form hidden" id="edit-form-${comment.id}">
                <textarea id="edit-text-${comment.id}">${comment.text}</textarea>
                <div class="edit-form-actions">
                    <button class="btn-cancel" onclick="cancelEdit(${comment.id})">Cancel</button>
                    <button class="btn-save" onclick="saveEdit(${comment.id})">Save</button>
                </div>
            </div>
            
            <div class="comment-actions">
                <button class="action-btn" onclick="showReplyForm(${comment.id})">Reply</button>
                ${isOwner ? `
                    <span class="action-separator">·</span>
                    <button class="action-btn" onclick="showEditForm(${comment.id})">Edit</button>
                    <span class="action-separator">·</span>
                    <button class="action-btn delete" onclick="deleteComment(${comment.id})">Delete</button>
                ` : ''}
            </div>
            
            <div class="reply-form hidden" id="reply-form-${comment.id}">
                <textarea 
                    id="reply-text-${comment.id}" 
                    placeholder="Write a reply..."
                ></textarea>
                <div class="reply-form-actions">
                    <button class="btn-cancel" onclick="cancelReply(${comment.id})">Cancel</button>
                    <button class="btn-reply" onclick="submitReply(${comment.id})">Reply</button>
                </div>
            </div>
        </div>
    `;
    
    if (replies.length > 0 && level < 2) {
        replies.forEach(reply => {
            html += renderCommentThread(reply, level + 1);
        });
    }
    
    return html;
}

function getTimeAgo(timestamp) {
    const now = new Date();
    const commentTime = new Date(timestamp);
    const diffMs = now - commentTime;
    
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffSeconds < 60) return `${diffSeconds} seconds ago`;
    if (diffMinutes < 60) return `${diffMinutes} ${diffMinutes === 1 ? 'minute' : 'minutes'} ago`;
    if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 30) return `${diffDays} days ago`;
    
    return commentTime.toLocaleDateString();
}

function postComment() {
    const textarea = document.getElementById('new-comment-text');
    const text = textarea.value.trim();
    
    if (!text) {
        alert('Please write a comment before posting.');
        return;
    }
    
    console.log('New comment:', text);
    alert('✅ Comment posted successfully!\n\n(In Phase 2, this will save to the database)');
    
    textarea.value = '';
}

function showReplyForm(commentId) {
    document.querySelectorAll('.reply-form').forEach(form => {
        form.classList.add('hidden');
    });
    
    const replyForm = document.getElementById(`reply-form-${commentId}`);
    replyForm.classList.remove('hidden');
    
    const textarea = document.getElementById(`reply-text-${commentId}`);
    textarea.focus();
}

function cancelReply(commentId) {
    const replyForm = document.getElementById(`reply-form-${commentId}`);
    const textarea = document.getElementById(`reply-text-${commentId}`);
    
    replyForm.classList.add('hidden');
    textarea.value = '';
}

function submitReply(commentId) {
    const textarea = document.getElementById(`reply-text-${commentId}`);
    const text = textarea.value.trim();
    
    if (!text) {
        alert('Please write a reply before submitting.');
        return;
    }
    
    console.log(`Reply to comment ${commentId}:`, text);
    alert(`✅ Reply posted successfully!\n\n(In Phase 2, this will save as a reply to comment ${commentId})`);
    
    cancelReply(commentId);
}

function showEditForm(commentId) {
    const commentBody = document.getElementById(`comment-body-${commentId}`);
    const editForm = document.getElementById(`edit-form-${commentId}`);
    
    commentBody.classList.add('hidden');
    editForm.classList.remove('hidden');
    
    const textarea = document.getElementById(`edit-text-${commentId}`);
    textarea.focus();
    textarea.selectionStart = textarea.selectionEnd = textarea.value.length;
}

function cancelEdit(commentId) {
    const commentBody = document.getElementById(`comment-body-${commentId}`);
    const editForm = document.getElementById(`edit-form-${commentId}`);
    const textarea = document.getElementById(`edit-text-${commentId}`);
    
    const comment = sampleComments.find(c => c.id === commentId);
    textarea.value = comment.text;
    
    commentBody.classList.remove('hidden');
    editForm.classList.add('hidden');
}

function saveEdit(commentId) {
    const textarea = document.getElementById(`edit-text-${commentId}`);
    const newText = textarea.value.trim();
    
    if (!newText) {
        alert('Comment cannot be empty.');
        return;
    }
    
    const comment = sampleComments.find(c => c.id === commentId);
    const oldText = comment.text;
    comment.text = newText;
    comment.isEdited = true;
    
    const commentBody = document.getElementById(`comment-body-${commentId}`);
    commentBody.textContent = newText;
    
    const editForm = document.getElementById(`edit-form-${commentId}`);
    commentBody.classList.remove('hidden');
    editForm.classList.add('hidden');
    
    console.log(`Comment ${commentId} edited from "${oldText}" to "${newText}"`);
    alert('✅ Comment updated successfully!\n\n(In Phase 2, this will update the database)');
    
    renderComments();
}

function deleteComment(commentId) {
    const comment = sampleComments.find(c => c.id === commentId);
    
    if (!confirm(`Are you sure you want to delete this comment?\n\n"${comment.text}"`)) {
        return;
    }
    
    const index = sampleComments.findIndex(c => c.id === commentId);
    sampleComments.splice(index, 1);
    
    const repliesToRemove = sampleComments.filter(c => c.parentCommentId === commentId);
    repliesToRemove.forEach(reply => {
        const replyIndex = sampleComments.findIndex(c => c.id === reply.id);
        sampleComments.splice(replyIndex, 1);
    });
    
    console.log(`Comment ${commentId} deleted`);
    alert('✅ Comment deleted successfully!\n\n(In Phase 2, this will delete from the database)');
    
    renderCommentsSection();
}

function toggleCommentMenu(commentId) {
    console.log(`Menu clicked for comment ${commentId}`);
}

function getUserById(userId) {
    return sampleUsers.find(u => u.id === userId);
}

function getCommentById(commentId) {
    return sampleComments.find(c => c.id === commentId);
}
