async function startGptChat(eventMessage) {
  try {
    // Get session token
    const sessionResponse = await fetch('https://chat.openai.com/api/auth/session', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!sessionResponse.ok) {
      console.error('Failed to get session:', sessionResponse.status, sessionResponse.statusText);
      throw new Error("Failed to get chatgpt session.");
    }

    const sessionData = await sessionResponse.json();

    const chatReq =  {
      "action": "next",
      "messages": [
          {
              "author":
              {
                "role": "user"
              },
              "content": {
                  "content_type": "text",
                  "parts": [
                    eventMessage.prompt
                  ]
              }
          }
      ],
      "model": "text-davinci-002-render",
      "parent_message_id": "393b0a0c-5f16-4d0d-887c-ae1ef3bc7c85"
    };

    if (!!eventMessage.conversationId) chatReq.conversation_id = eventMessage.conversationId;
    if (!!eventMessage.parentMessageId) chatReq.parent_message_id = eventMessage.parentMessageId;
      
    // Start a chat
    const newConversationResponse = await fetch('https://chat.openai.com/backend-api/conversation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + sessionData.accessToken
      },
      body: JSON.stringify(chatReq)
    });

    if (!newConversationResponse.ok) {
      console.error('Failed to start a new chat:', newConversationResponse.status, newConversationResponse.statusText);
      throw new Error("Failed to start a chat.");
    }

    const newConversationData = await newConversationResponse.text();
    const resMessage = parseGPTResponse(newConversationData);
    console.log(resMessage);
    return resMessage;
  }
  catch (error) {
    console.error(error.message);
  }
}

function parseGPTResponse(formattedString) {
  const dataChunks = formattedString.split("data:");
  const responseObjectText = dataChunks[dataChunks.length - 2].trim();
  const responseObject = JSON.parse(responseObjectText);

  return {...responseObject, action: "chat-response"};
}

const pluginDiv = document.createElement("div");
pluginDiv.style.backgroundColor = 'green';
pluginDiv.style.width = "100%";
pluginDiv.style.height= "10px"
document.body.insertBefore(pluginDiv, document.body.firstChild);

chrome.runtime.onMessage.addListener(async (eventMessage, sender, sendResponse) => {
  if (eventMessage.action === "chat") {
    const eventResponse = await startGptChat(eventMessage);
    chrome.runtime.sendMessage(eventResponse);
  }
});


