// Create an alarm that fires every 20 minutes
chrome.alarms.create('buddyCheck', { periodInMinutes: 20 });

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'buddyCheck') {
    chrome.storage.local.get(['enableQuestions'], (result) => {
      if (result.enableQuestions) {
        // Send message to the active tab to show the character
        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
          if (tabs[0]) {
            chrome.tabs.sendMessage(tabs[0].id, {action: "triggerPopup"});
          }
        });
      }
    });
  }
});