class PriorityQueue {
    constructor(compare) {
        this.heap = [];
        this.compare = compare;
    }

    push(item) {
        this.heap.push(item);
        this._heapifyUp(this.heap.length - 1);
    }

    pop() {
        if (this.heap.length === 0) return null;
        if (this.heap.length === 1) return this.heap.pop();

        const top = this.heap[0];
        this.heap[0] = this.heap.pop();
        this._heapifyDown(0);
        return top;
    }

    peek() {
        return this.heap[0];
    }

    isEmpty() {
        return this.heap.length === 0;
    }

    _heapifyUp(index) {
        while (index > 0) {
            let parent = Math.floor((index - 1) / 2);
            if (this.compare(this.heap[index], this.heap[parent]) >= 0) break;
            [this.heap[index], this.heap[parent]] = [this.heap[parent], this.heap[index]];
            index = parent;
        }
    }

    _heapifyDown(index) {
        const n = this.heap.length;
        while (true) {
            let smallest = index;
            let left = 2 * index + 1;
            let right = 2 * index + 2;

            if (left < n && this.compare(this.heap[left], this.heap[smallest]) < 0)
                smallest = left;
            if (right < n && this.compare(this.heap[right], this.heap[smallest]) < 0)
                smallest = right;

            if (smallest === index) break;
            [this.heap[index], this.heap[smallest]] = [this.heap[smallest], this.heap[index]];
            index = smallest;
        }
    }
}
let cores = Array(4).fill(null);
let executionLog = [];
let preemptionLog = [];
let ganttData = [];

let readyQueue = new PriorityQueue((a, b) => {
    if (a.priority !== b.priority) return a.priority - b.priority;
    return a.arrivalTime - b.arrivalTime;
});

let taskIndex = 0;

function startExecution() {
    let time = 0;
    tasks.sort((a, b) => a.arrivalTime - b.arrivalTime);

    let interval = setInterval(() => {
        while (taskIndex < tasks.length && tasks[taskIndex].arrivalTime <= time) {
            if (tasks[taskIndex].remainingTime > 0) {
                readyQueue.push(tasks[taskIndex]);
            }
            taskIndex++;
        }
        let tempQueue = [];
        while (!readyQueue.isEmpty()) {
            let task = readyQueue.pop();

            let alreadyAssigned = cores.some(c => c && c.id === task.id);
            if (alreadyAssigned) {
                tempQueue.push(task);
                continue;
            }

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

                    executionLog.push(
                        `Task ${task.id} preempted Task ${preemptedTask.id} on Core ${lowestPriorityIndex + 1} at ${time} sec`
                    );
                    preemptionLog.push(
                        `Task ${preemptedTask.id} preempted by Task ${task.id} at ${time} sec`
                    );

                    tempQueue.push(preemptedTask);
                } else {
                    tempQueue.push(task);
                }
            }
        }
        tempQueue.forEach(t => readyQueue.push(t));

        let activeCores = 0;
        for (let i = 0; i < cores.length; i++) {
            if (cores[i]) {
                cores[i].remainingTime--;

                if (cores[i].remainingTime === 0) {
                    ganttData.push({ core: i + 1, task: cores[i].id, time: time + 1 });
                } else {
                    ganttData.push({ core: i + 1, task: cores[i].id, time: time });
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
            drawLineChart();
        }
    }, 1000);
}

function updateLogs() {
    document.getElementById("log").innerText = executionLog.join("\n");
    document.getElementById("preemptionLog").innerText = preemptionLog.join("\n");
    document.getElementById("scheduleLog").innerText =
        schedule.map(t =>
            `Task ${t.id}: Priority ${t.priority}, Execution: ${t.executionTime}, Arrival: ${t.arrivalTime}, Completion: ${t.completionTime}, TurnAround Time: ${t.tt}, Waiting Time: ${t.wt}`
        ).join("\n");
}
