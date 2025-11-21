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

// 1. Listen for timer triggers
chrome.runtime.onMessage.addListener((request) => {
  if (request.action === 'triggerPopup') {
    console.log("Trigger received! Waking up buddy...");
    showBubbleMessage();
  }
});

// 2. Check settings on page load
chrome.storage.local.get(['enableQuestions'], (res) => {
  if (res.enableQuestions) {
    buildHouseWidget();
    setTimeout(() => {
      showBubbleMessage();
    }, 1000);
  }
});

// --- CORE FUNCTIONS ---

function buildHouseWidget() {
  if (document.querySelector('.sanrio-house-container')) return;

  chrome.storage.local.get(['selectedChar'], (result) => {
    let charImage;
    const userChoice = result.selectedChar || 'random';

    if (userChoice === 'random') {
      charImage = CHARACTERS[Math.floor(Math.random() * CHARACTERS.length)];
    } else {
      charImage = userChoice;
    }

    // ✅ FIX: Get the correct URL for the text box image here
    const boxUrl = chrome.runtime.getURL('images/textbox.png');
    const charUrl = chrome.runtime.getURL(`images/${charImage}`);
    const houseUrl = chrome.runtime.getURL(`images/house.png`); 

    const container = document.createElement('div');
    container.className = 'sanrio-house-container';
    
    // ✅ FIX: Apply the background image directly in the HTML style
    container.innerHTML = `
      <div class="buddy-bubble" id="sanrio-bubble" style="background-image: url('${boxUrl}');">
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

    container.querySelector('#buddy-yes').addEventListener('click', hideBubble);
    container.querySelector('#buddy-later').addEventListener('click', hideBubble);
  });
}

function showBubbleMessage() {
  const bubble = document.getElementById('sanrio-bubble');
  const textEl = document.getElementById('sanrio-text');
  const charEl = document.getElementById('sanrio-char');
  
  if (!bubble || !textEl) return; 

  const randomMsg = MESSAGES[Math.floor(Math.random() * MESSAGES.length)];
  let displayText = randomMsg.text;

  chrome.storage.local.get(['tasks'], (result) => {
    let tasks = result.tasks || [];
    const activeTasks = tasks.filter(t => !t.completed);

    if (activeTasks.length > 0 && Math.random() < 0.3) {
      const task = activeTasks[Math.floor(Math.random() * activeTasks.length)];
      displayText = `Have you finished: "${task.text || task}" yet?`;
    }

    textEl.textContent = displayText;
    bubble.classList.add('visible'); 
    charEl.classList.add('peek-active'); 

    setTimeout(hideBubble, 15000);
  });
}

function hideBubble() {
  const bubble = document.getElementById('sanrio-bubble');
  const charEl = document.getElementById('sanrio-char');
  if (bubble) bubble.classList.remove('visible');
  if (charEl) charEl.classList.remove('peek-active');
}