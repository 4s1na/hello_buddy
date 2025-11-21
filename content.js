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

// 1. Listen for timer triggers from background
chrome.runtime.onMessage.addListener((request) => {
  if (request.action === 'triggerPopup') {
    console.log("Trigger received! Waking up buddy...");
    showBubbleMessage();
  }
});

// 2. Check settings on page load -> Build the House immediately
chrome.storage.local.get(['enableQuestions'], (res) => {
  if (res.enableQuestions) {
    buildHouseWidget();
  }
});

// --- CORE FUNCTIONS ---

function buildHouseWidget() {
  // If house already exists, don't build another one
  if (document.querySelector('.sanrio-house-container')) return;

  // 1. Determine Character
  chrome.storage.local.get(['selectedChar'], (result) => {
    let charImage;
    const userChoice = result.selectedChar || 'random';

    if (userChoice === 'random') {
      charImage = CHARACTERS[Math.floor(Math.random() * CHARACTERS.length)];
    } else {
      charImage = userChoice;
    }

    const charUrl = chrome.runtime.getURL(`images/${charImage}`);
    const houseUrl = chrome.runtime.getURL(`images/house.png`); // MAKE SURE YOU HAVE THIS IMAGE!

    // 2. Build HTML Structure
    const container = document.createElement('div');
    container.className = 'sanrio-house-container';
    
    container.innerHTML = `
      <div class="buddy-bubble" id="sanrio-bubble">
        <p id="sanrio-text">Hello!</p>
        <div class="buddy-buttons">
          <button id="buddy-yes">Yes!</button>
          <button id="buddy-later">Later</button>
        </div>
      </div>

      <img src="${houseUrl}" class="house-img">
      <img src="${charUrl}" class="buddy-character" id="sanrio-char">
    `;

    document.body.appendChild(container);

    // 3. Add Button Listeners (To close bubble)
    container.querySelector('#buddy-yes').addEventListener('click', hideBubble);
    container.querySelector('#buddy-later').addEventListener('click', hideBubble);
  });
}

function showBubbleMessage() {
  const bubble = document.getElementById('sanrio-bubble');
  const textEl = document.getElementById('sanrio-text');
  const charEl = document.getElementById('sanrio-char');
  
  if (!bubble || !textEl) return; // If widget isn't built yet

  // 1. Pick a Message
  const randomMsg = MESSAGES[Math.floor(Math.random() * MESSAGES.length)];
  let displayText = randomMsg.text;

  // 2. Check Tasks (30% chance)
  chrome.storage.local.get(['tasks'], (result) => {
    let tasks = result.tasks || [];
    const activeTasks = tasks.filter(t => !t.completed);

    if (activeTasks.length > 0 && Math.random() < 0.3) {
      const task = activeTasks[Math.floor(Math.random() * activeTasks.length)];
      displayText = `Have you finished: "${task.text || task}" yet?`;
    }

    // 3. Update Text and Show
    textEl.textContent = displayText;
    bubble.classList.add('visible');
    
    // Force Buddy to Peek (Add CSS class)
    charEl.classList.add('peek-active');

    // Auto hide after 15 seconds
    setTimeout(hideBubble, 15000);
  });
}

function hideBubble() {
  const bubble = document.getElementById('sanrio-bubble');
  const charEl = document.getElementById('sanrio-char');
  if (bubble) bubble.classList.remove('visible');
  if (charEl) charEl.classList.remove('peek-active'); // Buddy goes back inside
}