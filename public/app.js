const STORAGE_KEY = "stopwatch-state-v1";
const MAX_HOURS = 9999;

const dH3 = document.getElementById("d-h3");
const dH2 = document.getElementById("d-h2");
const dH1 = document.getElementById("d-h1");
const dH0 = document.getElementById("d-h0");
const dM1 = document.getElementById("d-m1");
const dM0 = document.getElementById("d-m0");
const dS1 = document.getElementById("d-s1");
const dS0 = document.getElementById("d-s0");
const toggleButton = document.getElementById("toggle-button");
const resetButton = document.getElementById("reset-button");
const settingsButton = document.getElementById("settings-button");
const resumeForm = document.getElementById("resume-form");
const timeInput = document.getElementById("time-input");
const errorMessage = document.getElementById("error-message");

let stopwatchState = loadState();
let intervalId = null;

function loadState() {
  try {
    const rawState = localStorage.getItem(STORAGE_KEY);
    if (!rawState) {
      return buildState();
    }

    const parsed = JSON.parse(rawState);
    const elapsedMs = Number.isFinite(parsed.elapsedMs) && parsed.elapsedMs >= 0 ? parsed.elapsedMs : 0;
    const isRunning = parsed.isRunning === true;
    const startedAt = Number.isFinite(parsed.startedAt) ? parsed.startedAt : null;

    return buildState(elapsedMs, isRunning, startedAt);
  } catch {
    return buildState();
  }
}

function buildState(elapsedMs = 0, isRunning = false, startedAt = null) {
  return { elapsedMs, isRunning, startedAt };
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stopwatchState));
  } catch {
    // storage unavailable; state kept in memory only
  }
}

function getElapsedMs() {
  if (!stopwatchState.isRunning || !stopwatchState.startedAt) {
    return stopwatchState.elapsedMs;
  }

  return stopwatchState.elapsedMs + (Date.now() - stopwatchState.startedAt);
}

function render() {
  const totalSeconds = Math.floor(getElapsedMs() / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;

  dH3.textContent = Math.floor(h / 1000);
  dH2.textContent = Math.floor(h / 100) % 10;
  dH1.textContent = Math.floor(h / 10) % 10;
  dH0.textContent = h % 10;
  dH3.style.visibility = h >= 1000 ? "visible" : "hidden";
  dH2.style.visibility = h >= 100  ? "visible" : "hidden";
  dH1.style.visibility = h >= 10   ? "visible" : "hidden";

  dM1.textContent = Math.floor(m / 10);
  dM0.textContent = m % 10;
  dS1.textContent = Math.floor(s / 10);
  dS0.textContent = s % 10;

  toggleButton.textContent = stopwatchState.isRunning ? "Pause" : "Start";
}

function startTicking() {
  if (intervalId) {
    return;
  }

  intervalId = window.setInterval(render, 250);
}

function stopTicking() {
  if (!intervalId) {
    return;
  }

  window.clearInterval(intervalId);
  intervalId = null;
}

function syncTicking() {
  if (stopwatchState.isRunning) {
    startTicking();
  } else {
    stopTicking();
  }
}

function startStopwatch() {
  stopwatchState.startedAt = Date.now();
  stopwatchState.isRunning = true;
  saveState();
  syncTicking();
  render();
}

function pauseStopwatch() {
  stopwatchState.elapsedMs = getElapsedMs();
  stopwatchState.startedAt = null;
  stopwatchState.isRunning = false;
  saveState();
  syncTicking();
  render();
}

function resetStopwatch() {
  stopwatchState = buildState();
  saveState();
  syncTicking();
  errorMessage.textContent = "";
  render();
}

function parseTimeInput(value) {
  const trimmed = value.trim();
  const match = /^(\d+):([0-5]\d):([0-5]\d)$/.exec(trimmed);

  if (!match) {
    return { error: "Use HH:MM:SS with valid minutes and seconds." };
  }

  const hours = Number.parseInt(match[1], 10);
  const minutes = Number.parseInt(match[2], 10);
  const seconds = Number.parseInt(match[3], 10);

  if (hours > MAX_HOURS) {
    return { error: `Maximum supported time is ${MAX_HOURS}:59:59.` };
  }

  return { elapsedMs: ((hours * 3600) + (minutes * 60) + seconds) * 1000 };
}

settingsButton.addEventListener("click", () => {
  resumeForm.hidden = !resumeForm.hidden;
  if (!resumeForm.hidden) timeInput.focus();
});

toggleButton.addEventListener("click", () => {
  if (stopwatchState.isRunning) {
    pauseStopwatch();
    return;
  }

  startStopwatch();
});

resetButton.addEventListener("click", resetStopwatch);

resumeForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const result = parseTimeInput(timeInput.value);
  if (result.error) {
    errorMessage.textContent = result.error;
    return;
  }

  stopwatchState.elapsedMs = result.elapsedMs;
  stopwatchState.startedAt = stopwatchState.isRunning ? Date.now() : null;
  saveState();
  errorMessage.textContent = "";
  render();
});

if (stopwatchState.isRunning && stopwatchState.startedAt === null) {
  stopwatchState.startedAt = Date.now();
  saveState();
}

render();
syncTicking();
