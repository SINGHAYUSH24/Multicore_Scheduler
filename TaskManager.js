let tasks = [];
let schedule = [];

function addTask() {
    let priority = parseInt(document.getElementById("priority").value);
    let executionTime = parseInt(document.getElementById("executionTime").value);
    let arrivalTime = parseInt(document.getElementById("arrivalTime").value);

    if (isNaN(priority) || isNaN(executionTime) || isNaN(arrivalTime) || executionTime <= 0) {
        alert("Please enter valid priority, execution time, and arrival time.");
        return;
    }

    let taskId = tasks.length + 1;
    let task = { id: taskId, priority, executionTime, arrivalTime, remainingTime: executionTime };
    let tsk = { id: taskId, priority, executionTime, arrivalTime, completionTime: 0, tt: 0, wt: 0 };
    
    schedule.push(tsk);
    tasks.push(task);
    tasks.sort((a, b) => a.arrivalTime - b.arrivalTime || a.priority - b.priority);
    displayTasks();
}

function displayTasks() {
    let taskListDiv = document.getElementById("taskList");
    taskListDiv.innerHTML = tasks.map(task =>
        `Task ${task.id}: Priority ${task.priority}, Execution: ${task.executionTime} sec, Arrival: ${task.arrivalTime} sec`
    ).join("<br>");
}

function clearTasks() {
    location.reload();
}