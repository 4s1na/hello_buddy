document.addEventListener('DOMContentLoaded', function() {
  const taskInput = document.getElementById('task-input');
  const addTaskBtn = document.getElementById('add-task-btn');
  const taskList = document.getElementById('task-list');
  const emptyMsg = document.getElementById('empty-msg');
  const enableQuestions = document.getElementById('enable-questions');

  // Load saved data
  chrome.storage.local.get(['tasks', 'enableQuestions'], function(result) {
    const tasks = result.tasks || [];
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
    const task = taskInput.value.trim();
    if (task) {
      chrome.storage.local.get(['tasks'], function(result) {
        const tasks = result.tasks || [];
        tasks.push(task);
        saveAndRender(tasks);
        taskInput.value = '';
      });
    }
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
    if (tasks.length === 0) {
      emptyMsg.style.display = 'block';
    } else {
      emptyMsg.style.display = 'none';
      tasks.forEach((task, index) => {
        const li = document.createElement('li');
        li.textContent = task;
        
        const delBtn = document.createElement('button');
        delBtn.textContent = 'X';
        delBtn.className = 'delete-btn';
        delBtn.onclick = () => deleteTask(index);

        li.appendChild(delBtn);
        taskList.appendChild(li);
      });
    }
  }
});