const form = document.getElementById('chat-form');
const input = document.getElementById('user-input');
const chatBox = document.getElementById('chat-box');
const sendButton = form.querySelector('button');

form.addEventListener('submit', async function (e) {
  e.preventDefault();

  const userMessage = input.value.trim();
  if (!userMessage) return;

  appendMessage('user', userMessage);
  input.value = '';
  input.disabled = true;
  sendButton.disabled = true;

  const thinkingMsgElement = appendMessage('bot', 'Gemini is thinking...');

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        conversation: [{ role: 'user', text: userMessage }],
      }),
    });

    if (thinkingMsgElement && thinkingMsgElement.parentNode === chatBox) {
      chatBox.removeChild(thinkingMsgElement);
    }

    if (!response.ok) {
      let errorDetails = `Failed to get response from server. Status: ${response.status}`;
      try {
        const errorData = await response.json();
        errorDetails = errorData.error || errorDetails;
      } catch (jsonError) {
        console.warn('Could not parse error response as JSON:', jsonError);
        errorDetails = response.statusText || errorDetails;
      }
      appendMessage('bot', `Error: ${errorDetails}`);
      return;
    }

    const data = await response.json();
    const aiReply = data.response;

    if (aiReply) {
      appendMessage('bot', aiReply);
    } else {
      appendMessage('bot', 'Sorry, no response received.');
    }
  } catch (networkError) {
    console.error('Fetch API call failed:', networkError);
    if (thinkingMsgElement && thinkingMsgElement.parentNode === chatBox) {
      chatBox.removeChild(thinkingMsgElement);
    }
    appendMessage('bot', 'Failed to get response from server. Please check your connection.');
  } finally {
    input.disabled = false;
    sendButton.disabled = false;
    input.focus();
  }
});

function appendMessage(sender, text) {
  const msg = document.createElement('div');
  msg.classList.add('message', sender);
  msg.textContent = text;
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
  return msg; // Return the element to be able to remove it later
}