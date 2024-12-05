(function () {
  const participants = [
    "Carlos",
    "Marios",
    "Victor",
    "Ignacio",
    "Marek",
    "Pol",
    "Armin",
  ];

  let currentIndex = 0;
  let timer;

  // Check if the draggable div already exists
  if (document.getElementById("standup-timer-container")) {
    stopTimer();
    document.body.removeChild(
      document.getElementById("standup-timer-container")
    );
    return;
  }

  // Dynamically add TailwindCSS CDN to the document head
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href =
    "https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css";
  document.head.appendChild(link);

  // Create and style draggable container
  const container = document.createElement("div");
  container.id = "standup-timer-container";
  container.style.position = "absolute";
  container.style.zIndex = "999";
  container.style.width = "200px";
  container.style.top = "10px";
  container.style.right = "10px";
  container.style.background = "white";
  container.style.cursor = "move";
  document.body.appendChild(container);

  // Add inner content
  const content = `
  <div class="w-52 text-center font-sans p-4">
    <h3 class="mb-2 text-lg font-bold text-black">Stand-up Timer</h3>
    <div id="participantList" class="list-none p-0 m-0 text-black"></div>
    <p id="timer" class="mt-2 text-lg text-black"></p>
    <button id="nextButton" class="mt-2 mr-2 bg-blue-500 text-white py-1 px-4 rounded">Next</button>
    <button id="editButton" class="mt-2 bg-green-500 text-white py-1 px-4 rounded">Edit</button>
    <div id="editSection" class="hidden mt-2">
      <textarea id="participantTextArea" class="w-full h-32 p-2 border rounded bg-white text-black resize-y"></textarea>
      <button id="saveButton" class="mt-2 bg-green-500 text-white py-1 px-4 rounded">Save</button>
    </div>
  </div>
`;
  container.innerHTML = content;

  const participantTextArea = document.getElementById("participantTextArea");

  // Prevent dragging the container when interacting with the text area
  participantTextArea.addEventListener("mousedown", (e) => {
    e.stopPropagation();
  });

  // Variables to track dragging state
  let offsetX = 0,
    offsetY = 0,
    isDragging = false;

  // Mouse down event to start dragging
  container.addEventListener("mousedown", (e) => {
    offsetX = e.clientX - container.offsetLeft;
    offsetY = e.clientY - container.offsetTop;
    isDragging = true;
  });

  // Mouse move event to drag the div
  document.addEventListener("mousemove", (e) => {
    if (isDragging) {
      container.style.left = e.clientX - offsetX + "px";
      container.style.top = e.clientY - offsetY + "px";
    }
  });

  // Mouse up event to stop dragging
  document.addEventListener("mouseup", () => {
    isDragging = false;
  });

  // Function to shuffle an array using Fisher-Yates algorithm
  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  // Shuffle the participants array
  shuffleArray(participants);

  function updateList() {
    const participantList = document.getElementById("participantList");

    if (participantList) {
      participantList.innerHTML = participants
        .map((participant, index) => {
          return `<li 
              style="
              font-weight: ${
                index === currentIndex ? "bold" : "normal"
              }">${participant}</li>`;
        })
        .join("");
    }
  }

  function updateTimer(seconds) {
    if (!timer) {
      return;
    }
    const timerElement = document.getElementById("timer");
    if (!timerElement) {
      // If the timer element doesn't exist, stop the timer
      stopTimer();
      return;
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    document.getElementById("timer").innerText = `${minutes}'${remainingSeconds
      .toString()
      .padStart(2, "0")}"`;
  }

  function startTimer() {
    const totalTime = 15 * 60;
    let seconds = (totalTime / participants.length).toFixed(0);
    timer = setInterval(() => {
      updateTimer(seconds);
      if (seconds === 0) {
        clearInterval(timer);
        currentIndex = (currentIndex + 1) % participants.length;
        updateList();
        startTimer();
      }
      seconds--;
    }, 1000);
  }

  function stopTimer() {
    if (timer) {
      clearInterval(timer);
      timer = undefined; // Set timer to undefined to indicate it's stopped
      console.log("Timer stopped.");
    }
  }

  function nextParticipant() {
    stopTimer();
    currentIndex = (currentIndex + 1) % participants.length;
    updateList();
    startTimer();
  }

  function toggleEditSection() {
    const editSection = document.getElementById("editSection");
    const participantTextArea = document.getElementById("participantTextArea");

    if (editSection.classList.contains("hidden")) {
      participantTextArea.value = participants.join("\n");
      editSection.classList.remove("hidden");
    } else {
      editSection.classList.add("hidden");
    }
  }

  function saveParticipants() {
    const participantTextArea = document.getElementById("participantTextArea");
    const newParticipants = participantTextArea.value
      .split("\n")
      .map((p) => p.trim())
      .filter((p) => p);

    if (newParticipants.length > 0) {
      participants.length = 0;
      participants.push(...newParticipants);
      currentIndex = 0;
      updateList();
      toggleEditSection();

      // Save the updated participants array to chrome.storage
      chrome.storage.local.set({ participants }, () => {
        console.log("Participants saved:", participants);
      });
    }
  }

  document
    .getElementById("nextButton")
    .addEventListener("click", nextParticipant);

  document
    .getElementById("editButton")
    .addEventListener("click", toggleEditSection);

  document
    .getElementById("saveButton")
    .addEventListener("click", saveParticipants);

  // Initialize
  // Load participants from chrome.storage
  chrome.storage.local.get("participants", (result) => {
    if (result.participants) {
      participants.length = 0;
      participants.push(...result.participants);
    }
    updateList();
    startTimer();
  });
})();
