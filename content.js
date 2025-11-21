// Listen for background trigger
chrome.runtime.onMessage.addListener((request) => {
  if (request.action === 'triggerPopup') {
    console.log("Trigger received from background timer!");
    createBuddyPopup();
  }
});

// Check settings on page load
console.log("Sanrio Buddy: Checking settings..."); 
chrome.storage.local.get(['enableQuestions'], (res) => {
  console.log("Sanrio Buddy: Switch is currently set to ->", res.enableQuestions);
  
  if (res.enableQuestions) {
    console.log("Sanrio Buddy: Switch is ON! Spawning character...");
    createBuddyPopup();
  } else {
    console.log("Sanrio Buddy: Switch is OFF. Staying hidden.");
  }
});