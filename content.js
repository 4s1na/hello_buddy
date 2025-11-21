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

// 1. Listen for background trigger
chrome.runtime.onMessage.addListener((request) => {
  if (request.action === 'triggerPopup') {
    console.log("Trigger received from background timer!");
    createBuddyPopup();
  }
});

// 2. Check settings on page load
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

// 👇 THIS IS THE MISSING PART YOU NEED 👇
function createBuddyPopup() {
  // Prevent duplicates
  if (document.querySelector('.sanrio-buddy-container')) return;

  // Select Random Content
  const randomChar = CHARACTERS[Math.floor(Math.random() * CHARACTERS.length)];
  const randomMsg = MESSAGES[Math.floor(Math.random() * MESSAGES.length)];
  const imgUrl = chrome.runtime.getURL(`images/${randomChar}`);

  // Check for unfinished tasks
  chrome.storage.local.get(['tasks'], (result) => {
    let displayText = randomMsg.text;
    let tasks = result.tasks || [];
    const activeTasks = tasks.filter(t => !t.completed);

    // 30% chance to ask about a specific task
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

    // Event Listeners
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
  if (!element) return;
  element.classList.remove('slide-in');
  element.classList.add('slide-out');
  setTimeout(() => element.remove(), 500);
}