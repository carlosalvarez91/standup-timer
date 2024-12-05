chrome.action.onClicked.addListener((tab) => {
  console.log("action clicked");
  // Manually inject the content script into the active tab
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ["contentScript.js"],
  });
});
