/**
 * Vesna — Chat Module
 * AI-powered product assistant
 */

const Chat = {
    isOpen: false,
    messages: [],

    init() {
        this.chatBtn = document.getElementById('chat-toggle');
        this.chatWidget = document.getElementById('chat-widget');
        this.chatClose = document.getElementById('chat-close');
        this.chatMessages = document.getElementById('chat-messages');
        this.chatInput = document.getElementById('chat-input');
        this.chatSend = document.getElementById('chat-send');

        if (!this.chatBtn || !this.chatWidget) {
            console.warn('Chat elements not found, skipping chat initialization');
            return;
        }

        this.setupEventListeners();
        this.loadMessages();
        this.addWelcomeMessage();
    },

    setupEventListeners() {
        // Chat button
        this.chatBtn.addEventListener('click', () => this.toggleChat());

        // Close button
        this.chatClose.addEventListener('click', () => this.closeChat());

        // Send message
        const sendMessage = () => {
            const message = this.chatInput.value.trim();
            if (message) {
                this.sendMessage(message);
                this.chatInput.value = '';
            }
        };

        this.chatSend.addEventListener('click', sendMessage);
        this.chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendMessage();
        });

        // Click outside to close
        document.addEventListener('click', (e) => {
            if (!this.chatWidget.contains(e.target) && !this.chatBtn.contains(e.target) && this.isOpen) {
                this.closeChat();
            }
        });

        // Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.closeChat();
            }
        });
    },

    toggleChat() {
        if (this.isOpen) {
            this.closeChat();
        } else {
            this.openChat();
        }
    },

    openChat() {
        this.isOpen = true;
        this.chatWidget.setAttribute('aria-hidden', 'false');
        this.chatInput.focus();
    },

    closeChat() {
        this.isOpen = false;
        this.chatWidget.setAttribute('aria-hidden', 'true');
    },

    async sendMessage(text) {
        // Add user message
        this.addMessage('user', text);

        // Show typing indicator
        this.showTyping();

        try {
            // Get AI response
            const response = await this.getAIResponse(text);

            // Hide typing, add response
            this.hideTyping();
            this.addMessage('ai', response);

            // Save messages
            this.saveMessages();
        } catch (error) {
            this.hideTyping();
            this.addMessage('ai', 'Sorry, I\'m having trouble connecting right now. Please try again later.');
            console.error('Chat error:', error);
        }
    },

    async getAIResponse(message) {
        // For now, return mock responses based on keywords
        // In production, this would call your Netlify function
        const lowerMessage = message.toLowerCase();

        if (lowerMessage.includes('marketing') || lowerMessage.includes('course')) {
            return "Great choice! For marketing courses, I recommend our 'Digital Marketing Masterclass' - it's comprehensive and covers everything from social media to SEO. You can find it in the Courses category. Would you like me to show you similar options?";
        }

        if (lowerMessage.includes('design') || lowerMessage.includes('tool')) {
            return "Design tools are essential! Check out our 'Notion Business OS Template' - it's perfect for organizing your creative workflow. We also have specialized design courses if you're looking to learn new skills.";
        }

        if (lowerMessage.includes('productivity')) {
            return "Productivity is key! Our 'Social Media Scheduling Tool' can save you hours each week. It's great for content creators and businesses. Would you like recommendations for time management or workflow tools?";
        }

        if (lowerMessage.includes('ebook') || lowerMessage.includes('book')) {
            return "Ebooks are perfect for deep dives! The 'Content Creator's Playbook' is our most popular - it covers audience building, monetization, and viral content strategies. All our ebooks come with lifetime access.";
        }

        return "I'd love to help you find the perfect digital product! Could you tell me more about what you're looking for? Are you interested in courses, tools, ebooks, or templates? Or maybe you have a specific skill you want to learn?";
    },

    addMessage(type, text) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message chat-message--${type}`;
        messageDiv.innerHTML = `
      <div class="chat-message__content">${this.formatMessage(text)}</div>
    `;

        this.chatMessages.appendChild(messageDiv);
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;

        this.messages.push({ type, text, timestamp: Date.now() });
    },

    formatMessage(text) {
        // Simple formatting for links and emphasis
        return text
            .replace(/'(.*?)'/g, '<em>$1</em>')
            .replace(/"(.*?)"/g, '<strong>$1</strong>');
    },

    showTyping() {
        const typingEl = document.getElementById('chat-typing');
        if (typingEl) typingEl.style.display = 'flex';
    },

    hideTyping() {
        const typingEl = document.getElementById('chat-typing');
        if (typingEl) typingEl.style.display = 'none';
    },

    showBadge() {
        // Badge not implemented in current design
    },

    hideBadge() {
        // Badge not implemented in current design
    },

    getTimeString() {
        return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    },

    saveMessages() {
        localStorage.setItem('vesna_chat_messages', JSON.stringify(this.messages.slice(-50))); // Keep last 50
    },

    loadMessages() {
        const saved = localStorage.getItem('vesna_chat_messages');
        if (saved) {
            this.messages = JSON.parse(saved);
            // Rebuild chat history (optional - for now we start fresh)
        }
    }
};

// Export for use
window.Chat = Chat;