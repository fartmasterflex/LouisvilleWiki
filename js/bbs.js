// --- js/bbs.js ---
import { openModal } from './utils.js';

const BBS_API = 'https://jsonbin-zeta.vercel.app/api/bins';
const BBS_ID = 'x0APxChizs';

let replyingTo = null;

function getMessages() {
    return fetch(`${BBS_API}/${BBS_ID}`)
        .then(res => res.json())
        .then(data => data.messages || [])
        .catch(err => {
            console.error('Get messages error:', err);
            return [];
        });
}

async function saveMessages(messages) {
    try {
        const res = await fetch(`${BBS_API}/${BBS_ID}`, {
            method: 'PUT',
            mode: 'cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messages })
        });
        if (!res.ok) {
            const text = await res.text();
            console.error('Save failed:', res.status, text);
        }
        return res.ok;
    } catch (err) {
        console.error('Save error:', err);
        return false;
    }
}

export function openBBS() {
    replyingTo = null;
    openModal('bbsModal');
}

export async function loadBBS() {
    const container = document.getElementById('bbsContent');
    if (!container) return;
    
    container.innerHTML = '<div style="text-align:center; padding:20px;">Loading messages...</div>';
    
    const messages = await getMessages();
    renderMessages(messages);
}

function renderMessages(messages) {
    const container = document.getElementById('bbsContent');
    const form = document.getElementById('bbsForm');
    const count = document.getElementById('bbsCount');
    
    const topLevel = messages.filter(m => !m.parentId);
    const total = messages.length;
    
    if (count) count.textContent = `${total} message${total !== 1 ? 's' : ''}`;
    
    if (total === 0) {
        container.innerHTML = '<div style="text-align:center; padding:30px; color:#666;">No messages yet. Be the first to post!</div>';
    } else {
        const sorted = [...topLevel].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        container.innerHTML = sorted.map(msg => renderMessageHTML(msg, messages)).join('');
    }
    
    if (form) {
        if (replyingTo) {
            form.innerHTML = `
                <div style="margin-bottom:10px; font-size:0.8rem;">
                    Replying to ${escapeHtml(replyingTo.name)} 
                    <a href="#" onclick="cancelReply(); return false;" style="color:red;">(cancel)</a>
                </div>
                <input type="text" id="bbsName" class="bbs-input" placeholder="Your name" maxlength="30">
                <textarea id="bbsMessage" class="bbs-input" placeholder="Your reply" maxlength="280" rows="2"></textarea>
                <button class="btn-tool bbs-submit" onclick="postReply()">Post Reply</button>
            `;
        } else {
            form.innerHTML = `
                <input type="text" id="bbsName" class="bbs-input" placeholder="Your name" maxlength="30">
                <textarea id="bbsMessage" class="bbs-input" placeholder="Your message" maxlength="280" rows="3"></textarea>
                <button class="btn-tool bbs-submit" onclick="postMessage()">Post Message</button>
            `;
        }
        form.style.display = 'flex';
    }
}

function renderMessageHTML(msg, allMessages) {
    const replies = allMessages.filter(m => m.parentId === msg.id);
    const replyCount = replies.length;
    
    let html = `
        <div class="bbs-message" id="msg-${msg.id}">
            <div class="bbs-header">
                <span class="bbs-name">${escapeHtml(msg.name)}</span>
                <span class="bbs-date">${formatDate(msg.timestamp)}</span>
            </div>
            <div class="bbs-text">${escapeHtml(msg.message)}</div>
            <button class="bbs-reply-btn" onclick="showReply('${msg.id}', '${escapeHtml(msg.name).replace(/'/g, "\\'")}')">Reply${replyCount > 0 ? ` (${replyCount})` : ''}</button>
        </div>
    `;
    
    if (replies.length > 0) {
        const sortedReplies = [...replies].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        html += '<div class="bbs-replies">';
        html += sortedReplies.map(reply => `
            <div class="bbs-message bbs-reply">
                <div class="bbs-header">
                    <span class="bbs-name">${escapeHtml(reply.name)}</span>
                    <span class="bbs-date">${formatDate(reply.timestamp)}</span>
                </div>
                <div class="bbs-text">${escapeHtml(reply.message)}</div>
            </div>
        `).join('');
        html += '</div>';
    }
    
    return html;
}

export async function showReply(parentId, parentName) {
    const messages = await getMessages();
    replyingTo = { id: parentId, name: parentName };
    renderMessages(messages);
}

window.cancelReply = function() {
    replyingTo = null;
    loadBBS();
};

export async function postReply() {
    const nameInput = document.getElementById('bbsName');
    const msgInput = document.getElementById('bbsMessage');
    const name = nameInput.value.trim();
    const message = msgInput.value.trim();
    
    if (!name || !message) {
        alert('Please enter both a name and message');
        return;
    }
    
    if (!replyingTo) return;
    
    const btn = document.querySelector('.bbs-submit');
    btn.disabled = true;
    btn.textContent = 'Posting...';
    
    try {
        const messages = await getMessages();
        messages.push({
            id: Date.now().toString(),
            name,
            message,
            timestamp: new Date().toISOString(),
            parentId: replyingTo.id
        });
        
        const saved = await saveMessages(messages);
        
        if (saved) {
            replyingTo = null;
            renderMessages(messages);
        } else {
            alert('Failed to save. Try again.');
        }
    } catch (e) {
        console.error('Reply error:', e);
        alert('Error posting reply');
    }
    
    btn.disabled = false;
    btn.textContent = 'Post Reply';
}

export async function postMessage() {
    const nameInput = document.getElementById('bbsName');
    const msgInput = document.getElementById('bbsMessage');
    const name = nameInput.value.trim();
    const message = msgInput.value.trim();
    
    if (!name || !message) {
        alert('Please enter both a name and message');
        return;
    }
    
    const btn = document.querySelector('.bbs-submit');
    btn.disabled = true;
    btn.textContent = 'Posting...';
    
    try {
        const messages = await getMessages();
        messages.push({
            id: Date.now().toString(),
            name,
            message,
            timestamp: new Date().toISOString()
        });
        
        const saved = await saveMessages(messages);
        
        if (saved) {
            nameInput.value = '';
            msgInput.value = '';
            renderMessages(messages);
        } else {
            alert('Failed to save. Try again.');
        }
    } catch (e) {
        console.error('Post error:', e);
        alert('Error posting message');
    }
    
    btn.disabled = false;
    btn.textContent = 'Post Message';
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(iso) {
    const d = new Date(iso);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
