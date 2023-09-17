let score = 0;
let videoMuted = true;

function addTask() {
    const taskInput = document.getElementById("task");
    const taskText = taskInput.value.trim();

    if (taskText !== "") {
        const tasksList = document.getElementById("tasks");
        const li = document.createElement("li");
        const taskSpan = document.createElement("span");
        const deleteButton = document.createElement("button");
        const completeButton = document.createElement("button");

        taskSpan.textContent = taskText;
        taskSpan.className = "task";
        deleteButton.textContent = "Delete";
        deleteButton.className = "delete-button";
        completeButton.textContent = "Complete";
        completeButton.className = "complete-button";

        deleteButton.onclick = function () {
            tasksList.removeChild(li);
        };

        completeButton.onclick = function () {
            tasksList.removeChild(li);
            incrementScore();
        };

        li.appendChild(taskSpan);
        li.appendChild(deleteButton);
        li.appendChild(completeButton);
        tasksList.appendChild(li);

        taskInput.value = "";
    }
}

function incrementScore() {
    score++;
    document.getElementById("score").textContent = `Completed: ${score}`;
}

function toggleMute() {
    const video = document.getElementById("video-background");

    if (videoMuted) {
        video.muted = false;
        videoMuted = false;
        document.getElementById("unmute-button").textContent = "Mute Video";
    } else {
        video.muted = true;
        videoMuted = true;
        document.getElementById("unmute-button").textContent = "Unmute Video";
    }
}
