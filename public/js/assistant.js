// public/js/assistant.js
document.addEventListener('DOMContentLoaded', () => {
  // 1. Create the HTML for the Assistant Widget
  const widgetHTML = `
    <div id="ai-widget" style="position: fixed; bottom: 20px; right: 20px; z-index: 9999; font-family: 'Inter', sans-serif;">
      <!-- Chat Window -->
      <div id="ai-chat-window" style="display: none; width: 320px; height: 400px; background: var(--bg-card); border: 1px solid var(--border); border-radius: 15px; box-shadow: 0 10px 25px rgba(0,0,0,0.2); flex-direction: column; overflow: hidden; margin-bottom: 15px; transition: all 0.3s ease;">
        
        <!-- Header -->
        <div style="background: var(--gradient); color: white; padding: 15px; display: flex; justify-content: space-between; align-items: center;">
          <div style="font-weight: bold; display: flex; align-items: center; gap: 8px;">
            <span>🤖</span> Travel Assistant
          </div>
          <button id="ai-close" style="background: none; border: none; color: white; cursor: pointer; font-size: 1.2rem;">✕</button>
        </div>

        <!-- Messages Area -->
        <div id="ai-messages" style="flex: 1; padding: 15px; overflow-y: auto; display: flex; flex-direction: column; gap: 10px; background: var(--bg-main);">
          <div style="background: var(--bg-card); padding: 10px; border-radius: 10px 10px 10px 0; font-size: 0.9rem; border: 1px solid var(--border);">
            Hi! I'm your WanderWise Assistant. Ask me about beaches, mountains, history, or budget tips!
          </div>
        </div>

        <!-- Input Area -->
        <div style="padding: 10px; border-top: 1px solid var(--border); background: var(--bg-card); display: flex; gap: 10px;">
          <input type="text" id="ai-input" placeholder="Type a message..." style="flex: 1; padding: 10px; border: 1px solid var(--border); border-radius: 20px; outline: none; background: var(--bg-main); color: var(--text-main);">
          <button id="ai-send" class="btn btn-primary" style="padding: 10px 15px; border-radius: 50%;">➤</button>
        </div>
      </div>

      <!-- Floating Button -->
      <button id="ai-toggle" class="btn btn-primary" style="width: 60px; height: 60px; border-radius: 50%; font-size: 1.5rem; box-shadow: 0 4px 15px rgba(59, 130, 246, 0.5); display: flex; justify-content: center; align-items: center; float: right;">
        💬
      </button>
    </div>
  `;

  // Inject widget into the body
  document.body.insertAdjacentHTML('beforeend', widgetHTML);

  // 2. Logic
  const toggleBtn = document.getElementById('ai-toggle');
  const chatWindow = document.getElementById('ai-chat-window');
  const closeBtn = document.getElementById('ai-close');
  const sendBtn = document.getElementById('ai-send');
  const inputField = document.getElementById('ai-input');
  const messagesArea = document.getElementById('ai-messages');

  // Toggle Chat
  toggleBtn.addEventListener('click', () => {
    if (chatWindow.style.display === 'none') {
      chatWindow.style.display = 'flex';
      toggleBtn.innerHTML = '✕';
    } else {
      chatWindow.style.display = 'none';
      toggleBtn.innerHTML = '💬';
    }
  });

  closeBtn.addEventListener('click', () => {
    chatWindow.style.display = 'none';
    toggleBtn.innerHTML = '💬';
  });

  // Send Message
  async function sendMessage() {
    const text = inputField.value.trim();
    if (!text) return;

    // Add user message to UI
    addMessage(text, 'user');
    inputField.value = '';

    // Show typing indicator
    const typingId = 'typing-' + Date.now();
    messagesArea.insertAdjacentHTML('beforeend', `
      <div id="${typingId}" style="color: var(--text-muted); font-size: 0.8rem; margin-left: 5px;">Assistant is typing...</div>
    `);
    messagesArea.scrollTop = messagesArea.scrollHeight;

    try {
      // Fetch from our Node.js backend
      const res = await fetch(`/api/recommendations?query=${encodeURIComponent(text)}`);
      const json = await res.json();
      
      // Remove typing indicator
      document.getElementById(typingId).remove();
      
      // Add AI response to UI
      addMessage(json.reply, 'ai');
    } catch (err) {
      document.getElementById(typingId).remove();
      addMessage("Sorry, I am having trouble connecting right now.", 'ai');
    }
  }

  function addMessage(text, sender) {
    const isUser = sender === 'user';
    const msgDiv = document.createElement('div');
    msgDiv.style.cssText = `
      max-width: 80%; padding: 10px; font-size: 0.9rem; 
      border-radius: ${isUser ? '10px 10px 0 10px' : '10px 10px 10px 0'};
      align-self: ${isUser ? 'flex-end' : 'flex-start'};
      background: ${isUser ? 'var(--primary)' : 'var(--bg-card)'};
      color: ${isUser ? 'white' : 'var(--text-main)'};
      border: ${isUser ? 'none' : '1px solid var(--border)'};
    `;
    msgDiv.innerText = text;
    messagesArea.appendChild(msgDiv);
    messagesArea.scrollTop = messagesArea.scrollHeight;
  }

  sendBtn.addEventListener('click', sendMessage);
  inputField.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
  });
});