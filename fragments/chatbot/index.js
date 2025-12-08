// A function to inject a new message into the chat history (Unchanged)
function appendMessage(sender, text) {
  const messagesDiv = document.querySelector('.chat-messages');
  if (messagesDiv) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', `${sender}-message`);
    messageElement.textContent = text;
    messagesDiv.appendChild(messageElement);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  }
}

// Shows the "bot is typing" animation (Unchanged)
function showBotTyping() {
  const messagesDiv = document.querySelector('.chat-messages');
  if (messagesDiv) {
    const typingElement = document.createElement('div');
    typingElement.classList.add('message', 'bot-message', 'typing-indicator');
    typingElement.innerHTML = '<span></span><span></span><span></span>';
    messagesDiv.appendChild(typingElement);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  }
}

// Removes the "bot is typing" animation (Unchanged)
function hideBotTyping() {
  const typingIndicator = document.querySelector('.typing-indicator');
  if (typingIndicator) {
    typingIndicator.remove();
  }
}

// A simple helper function to create a delay. (Unchanged)
function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/* --- Main Setup Logic --- */

// We'll use a simple "marker" to make sure this code only runs ONCE.
if (!window.chatbotListenersAttached) {



  // --- Liferay Object Configuration ---
  const initialId = parseInt(configuration.initialCorrelationId) || 1;
  const increment = parseInt(configuration.correlationIdIncrement) || 1;
  
  let currentMessageIndex = initialId;


  /**
   * Fetches the next message from your Liferay Object. (Unchanged)
   */
  async function getLiferayObjectMessage() {
    // --- Use configured values with fallbacks ---
    const correlationField = configuration.correlationIdField || 'messageID';
    const objectPluralName = configuration.objectPluralName || 'chatmessages';
    const objectScope = configuration.objectScope || 'site';
    const messageField = configuration.objectMessageField || 'messageText';
    const fetchOptions = {
      headers: { 
        'Accept-Language': themeDisplay.getLanguageId().replace('_', '-') 
      }
    };

    let baseUrl = `/o/c/${objectPluralName}`;
    if (objectScope === 'site') {
      const scopeKey = themeDisplay.getScopeGroupId();
      baseUrl += `/scopes/${scopeKey}`;
    }

    const apiUrl = `${baseUrl}?filter=${correlationField} eq ${currentMessageIndex}`;

    try {
      const response = await Liferay.Util.fetch(apiUrl, fetchOptions);
      if (!response.ok) {
        console.error(`Error fetching message ${currentMessageIndex}. Status: ${response.status}`);
        return "I'm sorry, I encountered an error. Please try again.";
      }
      const data = await response.json();

      if (data.items && data.items.length > 0) {
        const messageItem = data.items[0];
        currentMessageIndex += increment;
        return messageItem[messageField];
      } else {
        // Reset Logic
        currentMessageIndex = initialId;
        
        const resetApiUrl = `${baseUrl}?filter=${correlationField} eq ${initialId}`;
        const resetResponse = await Liferay.Util.fetch(resetApiUrl, fetchOptions);

        if (!resetResponse.ok) {
          return "I'm sorry, I couldn't restart the message sequence.";
        }
        const resetData = await resetResponse.json();
        
        if (resetData.items && resetData.items.length > 0) {
          currentMessageIndex = initialId + increment; // Set index for the *next* call
          return resetData.items[0][messageField];
        } else {
          return "Error: Could not find message #1.";
        }
      }
    } catch (error) {
      console.error('Failed to fetch chatbot message:', error);
      return "I'm sorry, I'm having trouble connecting right now.";
    }
  }

  // --- 1. Handle all CLICKS on the body (Unchanged) ---
  document.body.addEventListener('click', function(event) {
    if (event.target.closest('.chat-launcher')) {
      document.body.classList.add('chat-is-open');
    }
    if (event.target.closest('.chat-close-button')) {
      document.body.classList.remove('chat-is-open');
    }
  });

  // --- 2. Handle all FORM SUBMISSIONS on the body (MODIFIED) ---
  document.body.addEventListener('submit', async function(event) {
    if (event.target.classList.contains('chat-input-form')) {
      event.preventDefault();
      
      const form = event.target;
      const input = form.querySelector('.chat-input');
      if (!input) return;
      
      const userMessage = input.value.trim();
      if (userMessage === '') return;

      // 1. Display user message
      appendMessage('user', userMessage);
      
      // 2. Clear input and disable
      input.value = '';
      input.disabled = true;

      // 3. Show typing indicator
      showBotTyping();
      
      // 4. Get the response
      const botResponse = await getLiferayObjectMessage();
      
      // 5. Wait for the configured delay
      // --- FIX: Access the JS object 'configuration' directly ---
      const delay = parseInt(configuration.botThinkingDelay) || 500;
      await wait(delay);

      // 6. Hide typing and show response
      hideBotTyping();
      appendMessage('bot', botResponse);
      
      // 7. Re-enable input
      input.disabled = false;
      input.focus();
    }
  });

  // --- 3. Add Initial Welcome Message (MODIFIED) ---
  (async function() {
    const messagesDiv = document.querySelector('.chat-messages');
    if (messagesDiv && messagesDiv.childElementCount === 0) {
      
      // 1. Show typing indicator
      showBotTyping();

      // 2. Fetch the first message
      const firstMessage = await getLiferayObjectMessage();
      
      // 3. Wait for the configured delay
      // --- FIX: Access the JS object 'configuration' directly ---
      const delay = parseInt(configuration.botThinkingDelay) || 500;
      await wait(delay);

      // 4. Hide typing and show response
      hideBotTyping();
      appendMessage('bot', firstMessage);
    }
  })();

  // Set the marker so this code doesn't run again
  window.chatbotListenersAttached = true;
}