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

// Listen for background trigger
chrome.runtime.onMessage.addListener((request) => {
  if (request.action === 'triggerPopup') {
    createBuddyPopup();
  }
});

// Random check on page load (10% chance) to make it feel alive
if (Math.random() < 0.1) {
  chrome.storage.local.get(['enableQuestions'], (res) => {
    if (res.enableQuestions) createBuddyPopup();
  });
}

function createBuddyPopup() {
  // Prevent duplicates
  if (document.querySelector('.sanrio-buddy-container')) return;

  // 1. Select Random Content
  const randomChar = CHARACTERS[Math.floor(Math.random() * CHARACTERS.length)];
  const randomMsg = MESSAGES[Math.floor(Math.random() * MESSAGES.length)];
  const imgUrl = chrome.runtime.getURL(`images/${randomChar}`);

  // 2. Check for unfinished tasks to swap message
  chrome.storage.local.get(['tasks'], (result) => {
    let displayText = randomMsg.text;
    let tasks = result.tasks || [];
    
    // 30% chance to ask about a specific task if tasks exist
    if (tasks.length > 0 && Math.random() < 0.3) {
      const task = tasks[Math.floor(Math.random() * tasks.length)];
      displayText = `Have you finished: "${task}" yet?`;
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
      // If it was a task question, you could add logic here to delete the task!
    });
    
    container.querySelector('#buddy-later').addEventListener('click', () => {
      closePopup(container);
    });

    // Auto close after 15 seconds
    setTimeout(() => closePopup(container), 15000);
  });
}

function closePopup(element) {
  element.classList.remove('slide-in');
  element.classList.add('slide-out');
  setTimeout(() => element.remove(), 500);
}