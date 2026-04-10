document.addEventListener('DOMContentLoaded', () => {
    const chatForm = document.getElementById('chat-form');
    const userInput = document.getElementById('user-input');
    const chatBox = document.getElementById('chat-box');
    const submitButton = chatForm.querySelector('button[type="submit"]');

    // Maintain conversation history to send back to the server for context
    let conversation = [];

    /**
     * Adds a message to the chat UI.
     * @param {string} role - 'user' or 'model'
     * @param {string} text - The message content
     * @returns {HTMLElement} The created message element
     */
    function appendMessage(role, text) {
        const messageElement = document.createElement('div');
        // Using 'bot' class for model messages to match typical chat CSS naming
        const displayRole = role === 'model' ? 'bot' : role;
        messageElement.className = `message ${displayRole}-message`;
        messageElement.textContent = text;
        chatBox.appendChild(messageElement);
        
        // Auto-scroll to the latest message
        chatBox.scrollTop = chatBox.scrollHeight;
        return messageElement;
    }

    chatForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const text = userInput.value.trim();
        if (!text) return;

        // 1. Prepare UI and history
        appendMessage('user', text);
        conversation.push({ role: 'user', text });
        userInput.value = '';
        
        // Disable input during request to prevent overlapping messages
        userInput.disabled = true;
        submitButton.disabled = true;

        // 2. Show temporary "Thinking..." bot message
        const botMessageElement = appendMessage('model', 'Thinking...');

        try {
            // 3. Send request to the backend
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ conversation })
            });

            const data = await response.json();

            if (response.ok && data.result) {
                // 4. Replace "Thinking..." with the AI reply
                botMessageElement.textContent = data.result;
                conversation.push({ role: 'model', text: data.result });
            } else {
                botMessageElement.textContent = data.error || "Sorry, no response received.";
            }
        } catch (error) {
            console.error('Error fetching chat response:', error);
            botMessageElement.textContent = "Failed to get response from server.";
        } finally {
            // Re-enable input
            userInput.disabled = false;
            submitButton.disabled = false;
            userInput.focus();
        }
    });
});