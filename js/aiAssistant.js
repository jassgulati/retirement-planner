// AI Assistant for Retirement Planning
// Uses Claude API (Anthropic) for intelligent financial guidance

import { auth, database } from './config.js';
import { ref, get } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js';

const AI_ASSISTANT_CONTAINER = `
<div class="page-container" id="aiAssistantPage">
    <div class="page-header">
        <h1>💬 AI Financial Assistant</h1>
        <p>Get personalized advice based on your financial data</p>
    </div>

    <div class="ai-chat-container">
        <!-- Quick Actions -->
        <div class="quick-actions">
            <h3>Quick Questions</h3>
            <div class="quick-actions-grid">
                <button class="quick-action-btn" data-question="analyze">
                    📊 Analyze my finances
                </button>
                <button class="quick-action-btn" data-question="savings">
                    💰 How much should I save?
                </button>
                <button class="quick-action-btn" data-question="retirement">
                    🏖️ When can I retire?
                </button>
                <button class="quick-action-btn" data-question="optimize">
                    🎯 Optimize my strategy
                </button>
                <button class="quick-action-btn" data-question="taxes">
                    📝 Tax strategies
                </button>
                <button class="quick-action-btn" data-question="401k">
                    🏦 401(k) advice
                </button>
            </div>
        </div>

        <!-- Chat Messages -->
        <div class="chat-messages" id="chatMessages">
            <div class="ai-message welcome-message">
                <div class="message-avatar">🤖</div>
                <div class="message-content">
                    <p><strong>Hi! I'm your AI Financial Assistant.</strong></p>
                    <p>I can help you with:</p>
                    <ul>
                        <li>Analyzing your income and expenses</li>
                        <li>Creating retirement savings strategies</li>
                        <li>Tax optimization advice</li>
                        <li>Investment recommendations</li>
                        <li>Answering any financial questions</li>
                    </ul>
                    <p>Ask me anything or use the quick questions above!</p>
                </div>
            </div>
        </div>

        <!-- Chat Input -->
        <div class="chat-input-container">
            <textarea 
                id="chatInput" 
                placeholder="Ask me anything about your retirement planning..."
                rows="3"
            ></textarea>
            <button id="sendMessageBtn" class="primary-button">
                <span class="btn-text">Send</span>
                <span class="btn-icon">➤</span>
            </button>
        </div>

        <!-- Loading Indicator -->
        <div id="aiLoadingIndicator" class="ai-loading" style="display: none;">
            <div class="loading-spinner"></div>
            <p>Claude is thinking...</p>
        </div>
    </div>
</div>
`;

const AI_ASSISTANT_STYLES = `
<style>
.ai-chat-container {
    max-width: 900px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    height: calc(100vh - 200px);
    min-height: 600px;
    background: var(--surface-secondary);
    border-radius: 20px;
    overflow: hidden;
    box-shadow: var(--shadow-large);
}

.quick-actions {
    padding: 20px;
    background: var(--surface-primary);
    border-bottom: 1px solid var(--border-color);
}

.quick-actions h3 {
    margin: 0 0 12px 0;
    font-size: 14px;
    font-weight: 600;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.quick-actions-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 8px;
}

.quick-action-btn {
    padding: 12px 16px;
    background: var(--surface-secondary);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    font-size: 13px;
    font-weight: 500;
    color: var(--text-primary);
    cursor: pointer;
    transition: all 0.2s;
    text-align: left;
}

.quick-action-btn:hover {
    background: var(--accent-blue);
    color: white;
    border-color: var(--accent-blue);
    transform: translateY(-2px);
}

.chat-messages {
    flex: 1;
    overflow-y: auto;
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.ai-message, .user-message {
    display: flex;
    gap: 12px;
    animation: messageSlide 0.3s ease-out;
}

@keyframes messageSlide {
    from {
        opacity: 0;
        transform: translateY(10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.user-message {
    flex-direction: row-reverse;
}

.message-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: var(--accent-blue);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    flex-shrink: 0;
}

.user-message .message-avatar {
    background: var(--accent-green);
}

.message-content {
    flex: 1;
    background: var(--surface-primary);
    padding: 16px;
    border-radius: 16px;
    max-width: 80%;
}

.user-message .message-content {
    background: var(--accent-blue);
    color: white;
}

.message-content p {
    margin: 0 0 12px 0;
    line-height: 1.6;
}

.message-content p:last-child {
    margin-bottom: 0;
}

.message-content ul, .message-content ol {
    margin: 8px 0;
    padding-left: 24px;
}

.message-content li {
    margin: 4px 0;
    line-height: 1.6;
}

.message-content strong {
    font-weight: 600;
    color: var(--accent-blue);
}

.user-message .message-content strong {
    color: white;
}

.welcome-message {
    background: linear-gradient(135deg, var(--accent-blue) 0%, var(--accent-purple) 100%);
    border-radius: 20px;
    padding: 20px;
}

.welcome-message .message-content {
    background: transparent;
    color: white;
    max-width: 100%;
}

.welcome-message strong {
    color: white !important;
}

.chat-input-container {
    padding: 20px;
    background: var(--surface-primary);
    border-top: 1px solid var(--border-color);
    display: flex;
    gap: 12px;
    align-items: flex-end;
}

#chatInput {
    flex: 1;
    padding: 12px 16px;
    border: 2px solid var(--border-color);
    border-radius: 12px;
    background: var(--surface-secondary);
    color: var(--text-primary);
    font-size: 15px;
    font-family: inherit;
    resize: none;
    transition: border-color 0.2s;
}

#chatInput:focus {
    outline: none;
    border-color: var(--accent-blue);
}

#sendMessageBtn {
    padding: 12px 24px;
    min-width: 100px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
}

.ai-loading {
    position: absolute;
    bottom: 100px;
    left: 50%;
    transform: translateX(-50%);
    background: var(--surface-primary);
    padding: 16px 24px;
    border-radius: 12px;
    box-shadow: var(--shadow-large);
    display: flex;
    align-items: center;
    gap: 12px;
}

.loading-spinner {
    width: 20px;
    height: 20px;
    border: 3px solid var(--border-color);
    border-top-color: var(--accent-blue);
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    to { transform: rotate(360deg); }
}

/* Mobile Responsive */
@media (max-width: 768px) {
    .ai-chat-container {
        height: calc(100vh - 180px);
        border-radius: 0;
    }
    
    .quick-actions-grid {
        grid-template-columns: repeat(2, 1fr);
    }
    
    .message-content {
        max-width: 85%;
    }
    
    .chat-input-container {
        padding: 16px;
    }
}
</style>
`;

class AIAssistant {
    constructor() {
        this.currentUser = null;
        this.userData = null;
        this.conversationHistory = [];
    }

    async init() {
        const container = document.getElementById('content');
        if (!container) return;

        // Add styles
        if (!document.getElementById('aiAssistantStyles')) {
            const styleTag = document.createElement('div');
            styleTag.id = 'aiAssistantStyles';
            styleTag.innerHTML = AI_ASSISTANT_STYLES;
            document.head.appendChild(styleTag);
        }

        // Add HTML
        container.innerHTML = AI_ASSISTANT_CONTAINER;

        // Get current user
        this.currentUser = auth.currentUser;
        if (!this.currentUser) {
            this.showError('Please log in to use the AI assistant.');
            return;
        }

        // Load user data
        await this.loadUserData();

        // Setup event listeners
        this.setupEventListeners();
    }

    async loadUserData() {
        try {
            const userId = this.currentUser.uid;
            
            // Load all user data
            const [profile, familyMembers, incomes, expenses, investments, retirement] = await Promise.all([
                get(ref(database, `users/${userId}/profile`)),
                get(ref(database, `users/${userId}/familyMembers`)),
                get(ref(database, `users/${userId}/incomes`)),
                get(ref(database, `users/${userId}/expenses`)),
                get(ref(database, `users/${userId}/investments`)),
                get(ref(database, `users/${userId}/retirement`))
            ]);

            this.userData = {
                profile: profile.val() || {},
                familyMembers: familyMembers.val() || {},
                incomes: incomes.val() || {},
                expenses: expenses.val() || {},
                investments: investments.val() || {},
                retirement: retirement.val() || {}
            };

            console.log('User data loaded for AI:', this.userData);
        } catch (error) {
            console.error('Error loading user data:', error);
            this.userData = null;
        }
    }

    setupEventListeners() {
        // Send message button
        const sendBtn = document.getElementById('sendMessageBtn');
        const chatInput = document.getElementById('chatInput');

        if (sendBtn) {
            sendBtn.addEventListener('click', () => this.sendMessage());
        }

        if (chatInput) {
            chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });
        }

        // Quick action buttons
        const quickActionBtns = document.querySelectorAll('.quick-action-btn');
        quickActionBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const question = btn.dataset.question;
                this.handleQuickAction(question);
            });
        });
    }

    handleQuickAction(action) {
        const questions = {
            analyze: "Can you analyze my current financial situation and give me insights?",
            savings: "Based on my income and expenses, how much should I be saving each month for retirement?",
            retirement: "When can I realistically retire based on my current savings and income?",
            optimize: "What strategies can I use to optimize my retirement savings?",
            taxes: "What tax strategies should I consider to reduce my tax burden?",
            "401k": "Should I max out my 401(k) contributions? What's the best strategy?"
        };

        const question = questions[action];
        if (question) {
            document.getElementById('chatInput').value = question;
            this.sendMessage();
        }
    }

    async sendMessage() {
        const input = document.getElementById('chatInput');
        const message = input.value.trim();

        if (!message) return;

        // Clear input
        input.value = '';

        // Add user message to chat
        this.addMessage(message, 'user');

        // Show loading
        this.showLoading(true);

        // Get AI response
        try {
            const response = await this.getAIResponse(message);
            this.addMessage(response, 'ai');
        } catch (error) {
            console.error('Error getting AI response:', error);
            this.addMessage('Sorry, I encountered an error. Please try again.', 'ai');
        } finally {
            this.showLoading(false);
        }
    }

    addMessage(content, type) {
        const messagesContainer = document.getElementById('chatMessages');
        if (!messagesContainer) return;

        const messageDiv = document.createElement('div');
        messageDiv.className = type === 'user' ? 'user-message' : 'ai-message';

        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.textContent = type === 'user' ? '👤' : '🤖';

        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        
        // Convert markdown-style formatting to HTML
        const formattedContent = this.formatMessage(content);
        messageContent.innerHTML = formattedContent;

        messageDiv.appendChild(avatar);
        messageDiv.appendChild(messageContent);
        messagesContainer.appendChild(messageDiv);

        // Scroll to bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        // Add to conversation history
        this.conversationHistory.push({
            role: type === 'user' ? 'user' : 'assistant',
            content: content
        });
    }

    formatMessage(text) {
        // Convert markdown-style formatting
        let formatted = text;
        
        // Bold
        formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
        // Lists
        formatted = formatted.replace(/^\- (.+)$/gm, '<li>$1</li>');
        formatted = formatted.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
        
        // Numbered lists
        formatted = formatted.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');
        
        // Paragraphs
        formatted = formatted.split('\n\n').map(para => {
            if (!para.startsWith('<ul>') && !para.startsWith('<ol>') && para.trim()) {
                return `<p>${para}</p>`;
            }
            return para;
        }).join('');

        return formatted;
    }

    showLoading(show) {
        const loadingIndicator = document.getElementById('aiLoadingIndicator');
        if (loadingIndicator) {
            loadingIndicator.style.display = show ? 'flex' : 'none';
        }
    }

    async getAIResponse(userMessage) {
        // Build context from user data
        const context = this.buildUserContext();

        // Create prompt for Claude
        const systemPrompt = `You are a helpful, knowledgeable financial advisor assistant for a retirement planning app. 

${context}

Provide clear, actionable advice. Use bullet points and formatting where helpful. Be encouraging but realistic. Always consider the user's specific situation when giving advice.

Keep responses concise but thorough (2-4 paragraphs max). Use specific numbers from their data when relevant.`;

        try {
            // Call Claude API
            const response = await fetch("https://api.anthropic.com/v1/messages", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "anthropic-version": "2023-06-01"
                },
                body: JSON.stringify({
                    model: "claude-sonnet-4-20250514",
                    max_tokens: 1024,
                    messages: [
                        {
                            role: "user",
                            content: systemPrompt + "\n\nUser question: " + userMessage
                        }
                    ]
                })
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }

            const data = await response.json();
            return data.content[0].text;

        } catch (error) {
            console.error('AI API Error:', error);
            
            // Fallback to rule-based responses
            return this.getFallbackResponse(userMessage);
        }
    }

    buildUserContext() {
        if (!this.userData) {
            return "The user hasn't entered their financial data yet. Encourage them to fill out their profile, income, and expenses first.";
        }

        const { profile, incomes, expenses, investments, retirement } = this.userData;
        
        let context = "USER FINANCIAL DATA:\n\n";

        // Profile info
        if (profile && Object.keys(profile).length > 0) {
            context += `Profile:\n`;
            if (profile.currentAge) context += `- Age: ${profile.currentAge}\n`;
            if (profile.retirementAge) context += `- Target retirement age: ${profile.retirementAge}\n`;
            if (profile.state) context += `- State: ${profile.state}\n`;
            if (profile.taxFilingStatus) context += `- Tax status: ${profile.taxFilingStatus}\n`;
            if (profile.projectionMode) context += `- Investment approach: ${profile.projectionMode}\n`;
            context += '\n';
        }

        // Income
        const incomesList = Object.values(incomes || {});
        if (incomesList.length > 0) {
            const totalIncome = incomesList.reduce((sum, inc) => sum + (inc.annualAmount || 0), 0);
            context += `Income:\n`;
            context += `- Total annual income: $${totalIncome.toLocaleString()}\n`;
            incomesList.forEach(inc => {
                context += `  • ${inc.source}: $${(inc.annualAmount || 0).toLocaleString()}/year\n`;
            });
            context += '\n';
        }

        // Expenses
        const expensesList = Object.values(expenses || {});
        if (expensesList.length > 0) {
            const totalExpenses = expensesList.reduce((sum, exp) => sum + (exp.monthlyAmount || 0) * 12, 0);
            context += `Expenses:\n`;
            context += `- Total annual expenses: $${totalExpenses.toLocaleString()}\n`;
            context += '\n';
        }

        // Investments
        const investmentsList = Object.values(investments || {});
        if (investmentsList.length > 0) {
            const totalInvested = investmentsList.reduce((sum, inv) => sum + (inv.currentValue || 0), 0);
            context += `Investments:\n`;
            context += `- Total portfolio value: $${totalInvested.toLocaleString()}\n`;
            context += '\n';
        }

        // Retirement accounts
        const retirementList = Object.values(retirement || {});
        if (retirementList.length > 0) {
            const totalRetirement = retirementList.reduce((sum, ret) => sum + (ret.currentBalance || 0), 0);
            context += `Retirement Accounts:\n`;
            context += `- Total retirement savings: $${totalRetirement.toLocaleString()}\n`;
            retirementList.forEach(ret => {
                context += `  • ${ret.accountType}: $${(ret.currentBalance || 0).toLocaleString()}\n`;
            });
        }

        return context;
    }

    getFallbackResponse(message) {
        const msg = message.toLowerCase();

        // Simple keyword matching for fallback
        if (msg.includes('save') || msg.includes('saving')) {
            return "A good rule of thumb is to save 15-20% of your gross income for retirement. Start with getting any employer 401(k) match (free money!), then max out a Roth IRA ($7,000/year for 2025), then go back to maxing your 401(k) ($23,500/year). The earlier you start, the better!";
        }

        if (msg.includes('retire') || msg.includes('retirement age')) {
            return "Most people plan to retire between 65-67, which is when you can claim full Social Security benefits. However, with proper planning and saving, early retirement at 55-60 is possible for some. The key is having 25-30x your annual expenses saved. Review your current savings rate and expenses to see if you're on track!";
        }

        if (msg.includes('tax') || msg.includes('taxes')) {
            return "Key tax strategies: 1) Contribute to tax-advantaged accounts (401k, IRA, HSA), 2) Consider Roth conversions in low-income years, 3) Harvest tax losses in taxable accounts, 4) Be strategic about which accounts to withdraw from in retirement. Your state taxes also matter - some states have no income tax!";
        }

        if (msg.includes('401') || msg.includes('401k')) {
            return "401(k) priority: 1) Contribute enough to get full employer match, 2) Max out Roth IRA if eligible, 3) Come back and max out 401(k) ($23,500 for 2025, plus $7,500 catch-up if 50+). Traditional 401(k) gives you a tax deduction now; Roth 401(k) gives tax-free withdrawals in retirement. Consider your current vs. future tax bracket.";
        }

        return "That's a great question! For the most accurate advice, I recommend filling out your complete financial profile (income, expenses, investments). This helps me give you personalized recommendations. You can also try asking about specific topics like '401(k) strategies', 'when can I retire', or 'tax optimization'.";
    }

    showError(message) {
        const container = document.getElementById('content');
        if (container) {
            container.innerHTML = `
                <div class="error-container">
                    <p>${message}</p>
                </div>
            `;
        }
    }
}

// Export
export function initAIAssistant() {
    const assistant = new AIAssistant();
    assistant.init();
}
