chrome.action.onClicked.addListener(function(tab) {
    chrome.tabs.create({'url': chrome.extension.getURL('popup.html'), 'selected': true});
});