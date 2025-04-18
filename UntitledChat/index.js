class ChatRoom {
    constructor() {
        this.socket = null;
        this.username = null;
        this.isTyping = false;
        this.typingTimeout = null;
        
        this.initializeElements();
        this.initializeEventListeners();
    }
    
    initializeElements() {
        this.messagesContainer = document.querySelector('.messages');
        this.messageInput = document.querySelector('.message-input');
        this.usernameInput = document.querySelector('.username-input');
        this.sendButton = document.querySelector('.send-button');
        this.joinButton = document.querySelector('.join-button');
        this.userCount = document.querySelector('.user-count');
    }
    
    initializeEventListeners() {
        this.joinButton.addEventListener('click', () => this.joinChat());
        this.sendButton.addEventListener('click', () => this.sendMessage());
        this.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        
        this.messageInput.addEventListener('input', () => this.handleTyping());
    }
    
    joinChat() {
        const username = this.usernameInput.value.trim();
        if (!username) {
            this.showError('Please enter a username');
            return;
        }
        
        this.username = username;
        this.connectToServer();
        
        // Hide join form and show chat interface
        document.querySelector('.join-form').style.display = 'none';
        document.querySelector('.chat-interface').style.display = 'flex';
    }
    
    connectToServer() {
        // In a real implementation, this would connect to a WebSocket server
        // For now, we'll simulate the connection
        this.socket = {
            send: (data) => {
                // Simulate message being sent to server
                setTimeout(() => {
                    this.handleMessage({
                        type: 'message',
                        username: this.username,
                        content: data.content,
                        timestamp: new Date().toISOString()
                    });
                }, 100);
            }
        };
        
        this.addSystemMessage(`${this.username} has joined the chat`);
        this.updateUserCount(1);
    }
    
    sendMessage() {
        if (!this.socket) return;
        
        const content = this.messageInput.value.trim();
        if (!content) return;
        
        this.socket.send({ content });
        this.messageInput.value = '';
        this.isTyping = false;
    }
    
    handleMessage(message) {
        const messageElement = this.createMessageElement(message);
        this.messagesContainer.appendChild(messageElement);
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }
    
    createMessageElement(message) {
        const div = document.createElement('div');
        div.className = `message ${message.username === this.username ? 'own' : ''} ${message.type === 'system' ? 'system' : ''}`;
        
        if (message.type === 'system') {
            div.textContent = message.content;
        } else {
            div.innerHTML = `
                <div class="message-header">
                    <span class="username">${message.username}</span>
                    <span class="timestamp">${new Date(message.timestamp).toLocaleTimeString()}</span>
                </div>
                <div class="message-content">${message.content}</div>
            `;
        }
        
        return div;
    }
    
    handleTyping() {
        if (!this.isTyping) {
            this.isTyping = true;
            // In a real implementation, this would send a typing indicator to the server
        }
        
        clearTimeout(this.typingTimeout);
        this.typingTimeout = setTimeout(() => {
            this.isTyping = false;
            // In a real implementation, this would send a stop typing indicator to the server
        }, 1000);
    }
    
    addSystemMessage(content) {
        this.handleMessage({
            type: 'system',
            content,
            timestamp: new Date().toISOString()
        });
    }
    
    updateUserCount(count) {
        this.userCount.textContent = count;
    }
    
    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        
        document.querySelector('.chat-container').insertBefore(
            errorDiv,
            document.querySelector('.messages')
        );
        
        setTimeout(() => errorDiv.remove(), 3000);
    }
}

// Initialize chat room when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.chatRoom = new ChatRoom();
}); 