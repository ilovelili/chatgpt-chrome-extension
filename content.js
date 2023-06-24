async function startNewChatAndSendMessage(message) {
    try {

      const sessionResponse = await fetch('https://chat.openai.com/api/auth/session', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!sessionResponse.ok) {
        console.error('Failed to get session:', sessionResponse.status, sessionResponse.statusText);
        return;
      }
      const sessionData = await sessionResponse.json();
      console.log(sessionData);
      
      // Start a new chat
      const newConversationResponse = await fetch('https://chat.openai.com/backend-api/conversation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + sessionData.accessToken
        },
        body: JSON.stringify({
          "action": "next",
          "messages": [
              {
                  "id": "3624a3e0-c0ce-40a5-a8c2-fa8617fc54b0",
                  "role": "user",
                  "content": {
                      "content_type": "text",
                      "parts": [
                          "tell me a joke"
                      ]
                  }
              }
          ],
          "model": "text-davinci-002-render",
          "parent_message_id": "393b0a0c-5f16-4d0d-887c-ae1ef3bc7c85"
      })
      });

      if (!newConversationResponse.ok) {
        console.error('Failed to start a new chat:', newConversationResponse.status, newConversationResponse.statusText);
        return;
      }

      //const reader = newConversationResponse.body.pipeThrough(new TextDecoderStream()).getReader();
      const newConversationData = await newConversationResponse.text();
      //let res = "";
      const resMessage = parseGPTResponse(newConversationData);
      console.log(resMessage);
      return resMessage;
      //const conversationId = newConversationData.conversationId;
/*
      // Send a message in the new chat
      const sendMessageResponse = await fetch(`https://chat.openai.com/api/conversations/${conversationId}/messages.create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: message }]
        })
      });

      if (!sendMessageResponse.ok) {
        console.error('Failed to send a message:', sendMessageResponse.status, sendMessageResponse.statusText);
        return;
      }

      const sendMessageData = await sendMessageResponse.json();
      const reply = sendMessageData.messages[1].content;
      console.log('Response:', reply);
      // Process the response as needed
      */
    } catch (error) {
      console.error('Error:', error);
    }
  }

function parseGPTResponse(formattedString) {
  const dataChunks = formattedString.split("data:");
  const responseObjectText = dataChunks[dataChunks.length - 2].trim();
  const responseObject = JSON.parse(responseObjectText);
  return responseObject.message.content.parts[0];
}

const menu = document.createElement("div");
menu.style.backgroundColor='black';
const runBtn = document.createElement("button");
runBtn.id = 'runbtn';
runBtn.innerText = 'Refresh Video';
runBtn.style.backgroundColor = 'white';
runBtn.onclick = async function() {
  console.log('safa');
  await startNewChatAndSendMessage('hi there');
}
menu.appendChild(runBtn);
document.body.insertBefore(menu, document.body.firstChild);

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (message.action === "chat") {
    const res = await startNewChatAndSendMessage();
    chrome.runtime.sendMessage({
      data: res
    });
    
  }
});


