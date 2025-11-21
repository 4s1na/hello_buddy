document.addEventListener('DOMContentLoaded', function() {
  const taskInput = document.getElementById('task-input');
  const addTaskBtn = document.getElementById('add-task-btn');
  const taskList = document.getElementById('task-list');
  const doneList = document.getElementById('done-list');
  const doneSection = document.getElementById('done-section');
  const emptyMsg = document.getElementById('empty-msg');
  const enableQuestions = document.getElementById('enable-questions');
  const charButtons = document.querySelectorAll('.char-btn'); // Select all character buttons

  // Load saved data
  chrome.storage.local.get(['tasks', 'enableQuestions', 'selectedChar'], function(result) {
    let tasks = result.tasks || [];
    if (tasks.length > 0 && typeof tasks[0] === 'string') {
      tasks = tasks.map(t => ({ text: t, completed: false }));
    }
    renderTasks(tasks);
    
    enableQuestions.checked = result.enableQuestions || false;

    // Highlight the saved character (or Random if none saved)
    const savedChar = result.selectedChar || 'random';
    updateCharSelection(savedChar);
  });

  // --- CHARACTER SELECTION LOGIC ---
  charButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const charName = btn.getAttribute('data-char');
      
      // 1. Save to storage
      chrome.storage.local.set({ selectedChar: charName });
      
      // 2. Update UI (highlight the button)
      updateCharSelection(charName);
    });
  });

  function updateCharSelection(selectedName) {
    charButtons.forEach(btn => {
      if (btn.getAttribute('data-char') === selectedName) {
        btn.classList.add('selected');
      } else {
        btn.classList.remove('selected');
      }
    });
  }
  // --------------------------------

  // Add Task Event
  addTaskBtn.addEventListener('click', addTask);
  taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addTask();
  });

  enableQuestions.addEventListener('change', function() {
    chrome.storage.local.set({ enableQuestions: enableQuestions.checked });
  });

  function addTask() {
    const taskText = taskInput.value.trim();
    if (taskText) {
      chrome.storage.local.get(['tasks'], function(result) {
        let tasks = result.tasks || [];
        tasks.push({ text: taskText, completed: false });
        saveAndRender(tasks);
        taskInput.value = '';
      });
    }
  }

  function toggleTask(index) {
    chrome.storage.local.get(['tasks'], function(result) {
      const tasks = result.tasks || [];
      tasks[index].completed = !tasks[index].completed;
      saveAndRender(tasks);
    });
  }

  function deleteTask(index) {
    chrome.storage.local.get(['tasks'], function(result) {
      const tasks = result.tasks || [];
      tasks.splice(index, 1);
      saveAndRender(tasks);
    });
  }

  function saveAndRender(tasks) {
    chrome.storage.local.set({ tasks: tasks });
    renderTasks(tasks);
  }

  function renderTasks(tasks) {
    taskList.innerHTML = '';
    doneList.innerHTML = '';
    let activeCount = 0;
    let doneCount = 0;

    tasks.forEach((task, index) => {
      const li = document.createElement('li');
      li.textContent = task.text || task;

      const controls = document.createElement('div');
      controls.className = 'task-controls';

      const checkBtn = document.createElement('button');
      checkBtn.innerHTML = '✓';
      checkBtn.className = 'check-btn';
      checkBtn.onclick = () => toggleTask(index);

      const delBtn = document.createElement('button');
      delBtn.textContent = 'X';
      delBtn.className = 'delete-btn';
      delBtn.onclick = () => deleteTask(index);

      controls.appendChild(checkBtn);
      controls.appendChild(delBtn);
      li.appendChild(controls);

      if (task.completed) {
        li.classList.add('done-task');
        checkBtn.style.background = '#ccc'; 
        doneList.appendChild(li);
        doneCount++;
      } else {
        taskList.appendChild(li);
        activeCount++;
      }
    });

    if (activeCount === 0) {
      emptyMsg.style.display = 'block';
      if(doneCount > 0) emptyMsg.textContent = "All done! Great job! 💖";
      else emptyMsg.textContent = "No tasks yet! 💖";
    } else {
      emptyMsg.style.display = 'none';
    }

    if (doneCount > 0) {
      doneSection.style.display = 'block';
    } else {
      doneSection.style.display = 'none';
    }
  }
});