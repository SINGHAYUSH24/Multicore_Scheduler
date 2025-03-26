
function drawGanttChart() {
    let ctx = document.getElementById("ganttChart").getContext("2d");
    let labels = [...new Set(ganttData.map(d => d.time))];
    let datasets = [];

    for (let i = 1; i <= 4; i++) {
        datasets.push({
            label: `Core ${i}`,
            data: ganttData.filter(d => d.core === i).map(d => ({ x: d.time, y: d.task })),
            borderColor: `hsl(${i * 90}, 70%, 50%)`,
            borderWidth: 2,
            fill: false
        });
    }

    new Chart(ctx, { type: "line", data: { labels, datasets }, options: { scales: { x: { beginAtZero: true } } } });
}
