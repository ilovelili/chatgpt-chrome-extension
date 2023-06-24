document.getElementById("processVideo").onclick = function()
{
    chrome.tabs.query({}, function(tabs) {
        var message = {action: "chat"};
        for (var i=0; i<tabs.length; ++i) {
            chrome.tabs.sendMessage(tabs[i].id, message);
        }
    });
}

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    document.getElementById("log").value += message.data;
});