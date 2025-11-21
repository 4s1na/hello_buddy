console.log("hello buddy script has loaded 🎀");

const CHARACTERS = [
  'hellokitty.png', 
  'kuromi.png',
  'cinnamoroll.png', 
  'pompompurin.png'
];

const MESSAGES = [
  { text: "Have you drunk water lately?", type: "health" },
  { text: "Shoulders down, jaw unclenched!", type: "health" },
  { text: "You're doing amazing! Keep going!", type: "affirmation" },
  { text: "Time for a quick stretch?", type: "health" },
  { text: "Don't forget to blink!", type: "health" }
];

chrome.runtime.onMessage.addListener((request) => {
  if (request.action === 'triggerPopup') {
    createBuddyPopup();
  }
});

// Check settings on page load
chrome.storage.local.get(['enableQuestions'], (res) => {
  if (res.enableQuestions) {
    createBuddyPopup();
  }
});

function createBuddyPopup() {
  if (document.querySelector('.sanrio-buddy-container')) return;

  // 1. GET SAVED CHARACTER AND TASKS
  chrome.storage.local.get(['selectedChar', 'tasks'], (result) => {
    
    // Determine Image
    let charImage;
    const userChoice = result.selectedChar || 'random';

    if (userChoice === 'random') {
      // Pick random from array
      charImage = CHARACTERS[Math.floor(Math.random() * CHARACTERS.length)];
    } else {
      // Use the specific choice
      charImage = userChoice;
    }

    const imgUrl = chrome.runtime.getURL(`images/${charImage}`);
    
    // Determine Message (Task logic)
    const randomMsg = MESSAGES[Math.floor(Math.random() * MESSAGES.length)];
    let displayText = randomMsg.text;
    let tasks = result.tasks || [];
    const activeTasks = tasks.filter(t => !t.completed);

    if (activeTasks.length > 0 && Math.random() < 0.3) {
      const task = activeTasks[Math.floor(Math.random() * activeTasks.length)];
      const taskName = task.text || task; 
      displayText = `Have you finished: "${taskName}" yet?`;
    }

    // Build HTML
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

    container.querySelector('#buddy-yes').addEventListener('click', () => {
      closePopup(container);
    });
    
    container.querySelector('#buddy-later').addEventListener('click', () => {
      closePopup(container);
    });

    setTimeout(() => closePopup(container), 15000);
  });
}

function closePopup(element) {
  if (!element) return;
  element.classList.remove('slide-in');
  element.classList.add('slide-out');
  setTimeout(() => element.remove(), 500);
}