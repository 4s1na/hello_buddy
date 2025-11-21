document.addEventListener('DOMContentLoaded', function() {
  const taskInput = document.getElementById('task-input');
  const addTaskBtn = document.getElementById('add-task-btn');
  const taskList = document.getElementById('task-list');
  const doneList = document.getElementById('done-list');
  const doneSection = document.getElementById('done-section');
  const emptyMsg = document.getElementById('empty-msg');
  const enableQuestions = document.getElementById('enable-questions');

  // Load saved data
  chrome.storage.local.get(['tasks', 'enableQuestions'], function(result) {
    // Ensure tasks is an array of objects, even if it was old string data
    let tasks = result.tasks || [];
    
    // Migration fix: If user had old tasks (just strings), convert them to objects
    if (tasks.length > 0 && typeof tasks[0] === 'string') {
      tasks = tasks.map(t => ({ text: t, completed: false }));
    }

    renderTasks(tasks);
    enableQuestions.checked = result.enableQuestions || false;
  });

  // Add Task Event
  addTaskBtn.addEventListener('click', addTask);
  taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addTask();
  });

  // Toggle Settings
  enableQuestions.addEventListener('change', function() {
    chrome.storage.local.set({ enableQuestions: enableQuestions.checked });
  });

  function addTask() {
    const taskText = taskInput.value.trim();
    if (taskText) {
      chrome.storage.local.get(['tasks'], function(result) {
        let tasks = result.tasks || [];
        // Add new task object
        tasks.push({ text: taskText, completed: false });
        saveAndRender(tasks);
        taskInput.value = '';
      });
    }
  }

  function toggleTask(index) {
    chrome.storage.local.get(['tasks'], function(result) {
      const tasks = result.tasks || [];
      // Flip the completed status
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
      li.textContent = task.text || task; // Handle legacy data

      // Create Controls Div
      const controls = document.createElement('div');
      controls.className = 'task-controls';

      // Check Button
      const checkBtn = document.createElement('button');
      checkBtn.innerHTML = '✓';
      checkBtn.className = 'check-btn';
      checkBtn.onclick = () => toggleTask(index);

      // Delete Button
      const delBtn = document.createElement('button');
      delBtn.textContent = 'X';
      delBtn.className = 'delete-btn';
      delBtn.onclick = () => deleteTask(index);

      controls.appendChild(checkBtn);
      controls.appendChild(delBtn);
      li.appendChild(controls);

      if (task.completed) {
        li.classList.add('done-task');
        // For done tasks, the check button can act as an "Undo"
        checkBtn.style.background = '#ccc'; 
        doneList.appendChild(li);
        doneCount++;
      } else {
        taskList.appendChild(li);
        activeCount++;
      }
    });

    // Show/Hide Empty Message
    if (activeCount === 0) {
      emptyMsg.style.display = 'block';
      if(doneCount > 0) emptyMsg.textContent = "All done! Great job! 💖";
      else emptyMsg.textContent = "No tasks yet! 💖";
    } else {
      emptyMsg.style.display = 'none';
    }

    // Show/Hide Done Section
    if (doneCount > 0) {
      doneSection.style.display = 'block';
    } else {
      doneSection.style.display = 'none';
    }
  }
});