const CHARACTERS = [
  'hellokitty.png', 
  'kuromi.png', 
  'cinnamoroll.png', 
  'mymelody.png'
];

const MESSAGES = [
  { text: "Have you drunk water lately?", type: "health" },
  { text: "Shoulders down, jaw unclenched!", type: "health" },
  { text: "You're doing amazing! Keep going!", type: "affirmation" },
  { text: "Time for a quick stretch?", type: "health" },
  { text: "Don't forget to blink!", type: "health" }
];

// Listen for background trigger (from the timer)
chrome.runtime.onMessage.addListener((request) => {
  if (request.action === 'triggerPopup') {
    createBuddyPopup();
  }
});

// ✅ CHANGED: No more random check. This runs on every page load!
chrome.storage.local.get(['enableQuestions'], (res) => {
  if (res.enableQuestions) {
    createBuddyPopup();
  }
});

function createBuddyPopup() {
  // Prevent duplicates (don't show two characters if one is already there)
  if (document.querySelector('.sanrio-buddy-container')) return;

  // 1. Select Random Content
  const randomChar = CHARACTERS[Math.floor(Math.random() * CHARACTERS.length)];
  const randomMsg = MESSAGES[Math.floor(Math.random() * MESSAGES.length)];
  const imgUrl = chrome.runtime.getURL(`images/${randomChar}`);

  // 2. Check for unfinished tasks to swap message
  chrome.storage.local.get(['tasks'], (result) => {
    let displayText = randomMsg.text;
    
    // Ensure tasks is an array (handling your new object structure)
    let tasks = result.tasks || [];
    
    // Filter to only find tasks that are NOT completed yet
    const activeTasks = tasks.filter(t => !t.completed);

    // 30% chance to ask about a specific task if active tasks exist
    if (activeTasks.length > 0 && Math.random() < 0.3) {
      const task = activeTasks[Math.floor(Math.random() * activeTasks.length)];
      // Handle both old string tasks and new object tasks
      const taskName = task.text || task; 
      displayText = `Have you finished: "${taskName}" yet?`;
    }

    // 3. Build HTML
    const container = document.createElement('div');
    container.className = 'sanrio-buddy-container slide-in';
    
    container.innerHTML = `
      <div class="buddy-bubble">
        <p>${displayText}</p>
        <div class="buddy-buttons">
          <button id="buddy-yes">Yes!</button>
          <button id="buddy-later">Later</button>
        </div>
      </div>
      <img src="${imgUrl}" class="buddy-character">
    `;

    document.body.appendChild(container);

    // 4. Event Listeners
    container.querySelector('#buddy-yes').addEventListener('click', () => {
      closePopup(container);
    });
    
    container.querySelector('#buddy-later').addEventListener('click', () => {
      closePopup(container);
    });

    // Auto close after 15 seconds
    setTimeout(() => closePopup(container), 15000);
  });
}

function closePopup(element) {
  if (!element) return; // Safety check
  element.classList.remove('slide-in');
  element.classList.add('slide-out');
  setTimeout(() => element.remove(), 500);
}