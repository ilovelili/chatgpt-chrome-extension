document.getElementById("processVideo").onclick = function() {
  chrome.tabs.query({}, function(tabs) {
    var eventMessage = {
      action: "chat",
      prompt: "Please provide 10 famous quotes, do not provide any greetings"
    };

    chrome.storage.sync.get(['chatgptConversationId', 'chatgptParentMessageId'], function(items) {
      if (!!items.chatgptConversationId)
      {
        eventMessage.conversationId = items.chatgptConversationId;
      }
      if (!!items.chatgptParentMessageId)
      {
        eventMessage.parentMessageId = items.chatgptParentMessageId;
        eventMessage.prompt = 'Please provide another 10 different famous quotes never used in the previous answers, use the same output format as before.';
      }
      document.getElementById("log").value += '\n----- Waiting response for prompt: '+ eventMessage.prompt +' -----\n';
      console.log(eventMessage);
      for (var i=0; i<tabs.length; ++i) {
        chrome.tabs.sendMessage(tabs[i].id, eventMessage);
      }
    });
  });
}

document.getElementById("clearConversation").onclick = function() {
    chrome.storage.sync.set({
        'chatgptConversationId': null,
        'chatgptParentMessageId': null
    }, function() {
        document.getElementById("log").value += '\n----- Conversation cleared. -----\n';
    });
}

document.getElementById("clearHistory").onclick = function() {
    document.getElementById("log").value = '';
}

chrome.runtime.onMessage.addListener(function (eventResponse, sender, sendResponse) {
  if (eventResponse.action === 'chat-response'){
    document.getElementById("log").value += eventResponse.message.content.parts[0];
    chrome.storage.sync.set({
        'chatgptConversationId': eventResponse.conversation_id,
        'chatgptParentMessageId': eventResponse.message.id
    }, function() {
        document.getElementById("log").value += '\n----- Conversation saved. -----\n';
        chrome.storage.sync.get(['chatgptConversationId', 'chatgptParentMessageId'], function(items) {
            document.getElementById("log").value += '----- Existing Conversation -----\nConversation id: '
        + items.chatgptConversationId + '\nParent message id: ' + items.chatgptParentMessageId + '\n'
        });
    });
  }
});

chrome.storage.sync.get(['chatgptConversationId', 'chatgptParentMessageId'], function(items) {
    document.getElementById("log").value += '----- Existing Conversation -----\nConversation id: '
        + items.chatgptConversationId + '\nParent message id: ' + items.chatgptParentMessageId + '\n';
});