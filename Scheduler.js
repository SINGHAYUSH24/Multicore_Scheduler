let cores = Array(4).fill(null);
let executionLog = [];
let preemptionLog = [];
let ganttData = [];

function startExecution() {
    let time = 0;
    let interval = setInterval(() => {
        tasks.sort((a, b) => a.arrivalTime - b.arrivalTime || a.priority - b.priority);
        let arrivedTasks = tasks.filter(t => t.arrivalTime <= time && t.remainingTime > 0);
        arrivedTasks.sort((a, b) => a.priority - b.priority);

        arrivedTasks.forEach(task => {
            let alreadyAssigned = cores.some(coreTask => coreTask && coreTask.id === task.id);
            if (alreadyAssigned) return;

            let freeCoreIndex = cores.findIndex(core => core === null);
            if (freeCoreIndex !== -1) {
                cores[freeCoreIndex] = task;
                executionLog.push(`Task ${task.id} assigned to Core ${freeCoreIndex + 1} at ${time} sec`);
            } else {
                let lowestPriorityIndex = -1;
                let lowestPriority = -1;

                for (let i = 0; i < cores.length; i++) {
                    if (cores[i] && (lowestPriorityIndex === -1 || cores[i].priority > lowestPriority)) {
                        lowestPriority = cores[i].priority;
                        lowestPriorityIndex = i;
                    }
                }

                if (lowestPriorityIndex !== -1 && cores[lowestPriorityIndex].priority > task.priority) {
                    let preemptedTask = cores[lowestPriorityIndex];
                    cores[lowestPriorityIndex] = task;
                    executionLog.push(`Task ${task.id} preempted Task ${preemptedTask.id} on Core ${lowestPriorityIndex + 1} at ${time} sec`);
                    preemptionLog.push(`Task ${preemptedTask.id} preempted by Task ${task.id} at ${time} sec`);
                }
            }
        });

        let activeCores = 0;
        for (let i = 0; i < cores.length; i++) {
            if (cores[i]) {
                cores[i].remainingTime--;
                if(cores[i].remainingTime==0){
                    ganttData.push({ core: i + 1, task: cores[i].id, time: time+1});
                }else{
                    ganttData.push({ core: i + 1, task: cores[i].id, time: time});
                }
                activeCores++;
                if (cores[i].remainingTime === 0) {
                    executionLog.push(`Task ${cores[i].id} completed on Core ${i + 1} at ${time + 1} sec`);
                    let scheduledTask = schedule.find(t => t.id === cores[i].id);
                    if (scheduledTask) {
                        scheduledTask.completionTime = time + 1;
                        scheduledTask.tt = scheduledTask.completionTime - scheduledTask.arrivalTime;
                        scheduledTask.wt = scheduledTask.tt - scheduledTask.executionTime;
                    }
                    cores[i] = null;
                }
            }
        }

        time++;
        updateLogs();

        if (tasks.every(t => t.remainingTime <= 0) && activeCores === 0) {
            clearInterval(interval);
            drawGanttChart();
        }
    }, 1000);
}

function updateLogs() {
    document.getElementById("log").innerText = executionLog.join("\n");
    document.getElementById("preemptionLog").innerText = preemptionLog.join("\n");
    document.getElementById("scheduleLog").innerText = schedule.map(t => `Task ${t.id}: Priority ${t.priority}, Execution: ${t.executionTime}, Arrival: ${t.arrivalTime}, Completion: ${t.completionTime}, TurnAround Time: ${t.tt}, Waiting Time: ${t.wt}`).join("\n");
}