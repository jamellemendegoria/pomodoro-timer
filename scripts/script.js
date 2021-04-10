// Variables

// Global variables
const P_SECONDS = 1500; // Pomdoro - 25 min
const S_SECONDS = 300; // Short Break - 5 min
const L_SECONDS = 1200; // Long break - 20 min
let SECONDS_COUNT = P_SECONDS;

// Grab references to elements and put them in variables
const session = document.querySelector('.session');
const timer = document.querySelector('.timer');
const startStopBtn = document.querySelector('.startStopBtn');
const btnContainer = document.querySelector('.btnContainer');
const pomodoroCount = document.querySelector('.pomodoroCount');

// Set up variables
const alarm = new Audio('media/alarm.wav');
let numPomodoros = 0;
let isTimerActive = false;
let hasResetBtn = false;
let createTimer;
let resetBtn;
let elapsedTime;

// Variables representing current session
let pomodoroSession = true;
let shortSession = false;
let longSession = false;

// Function Declarations

function displayTimer(startTime, secondCount) {
  // Decrement second count by elapsed time since start
  elapsedTime = Math.floor((Date.now() - startTime) / 1000);
  secondCount -= elapsedTime;

  updateTimer(secondCount);

  if (secondCount <= 0) {
    playSound();

    clearInterval(createTimer);
    isTimerActive = false;
    toggleReset();
    let timeOut = setTimeout(() => {
      if (startStopBtn.textContent == 'Stop') {
        toggleStartStop();
      }
      switchSession();
      updateTimer(SECONDS_COUNT);
    }, 500);
  }
}

function updateTimer(secondCount) {
  // Calculate number of minutes and seconds
  let minutes = Math.floor((secondCount % 3600) / 60);
  let seconds = Math.floor(secondCount % 60);

  // Add leading zeroes if less than 10
  let displayMinutes = minutes < 10 ? `0${minutes}` : minutes;
  let displaySeconds = seconds < 10 ? `0${seconds}` : seconds;

  let time = `${displayMinutes}:${displaySeconds}`;
  timer.textContent = time;
  document.title = `${time} | Pomodoro Timer`;
}

function startTimer() {
  if (!isTimerActive) {
    isTimerActive = true;
    toggleReset();
  }
  let startTime = Date.now();
  createTimer = setInterval(displayTimer, 1000, startTime, SECONDS_COUNT);
  unlockAudio();
  toggleStartStop();
}

function stopTimer() {
  alarm.pause();
  clearInterval(createTimer);

  // Subtract elapsed time from secondCount and set it to remaining time
  SECONDS_COUNT -= elapsedTime;

  toggleStartStop();
}

function resetTimer() {
  clearInterval(createTimer);

  // Reset second count to current session's total seconds
  if (pomodoroSession) {
    SECONDS_COUNT = P_SECONDS;
  } else if (shortSession) {
    SECONDS_COUNT = S_SECONDS;
  } else {
    SECONDS_COUNT = L_SECONDS;
  }

  displayTimer(Date.now(), SECONDS_COUNT);

  if (startStopBtn.textContent == 'Stop') {
    toggleStartStop();
  }

  toggleReset();
  isTimerActive = false;
}

function toggleStartStop() {
  if (startStopBtn.textContent == 'Start') {
    startStopBtn.removeEventListener('click', startTimer);
    startStopBtn.addEventListener('click', stopTimer);
    startStopBtn.textContent = 'Stop';
  } else {
    startStopBtn.removeEventListener('click', stopTimer);
    startStopBtn.addEventListener('click', startTimer);
    startStopBtn.textContent = 'Start';
  }
}

function toggleReset() {
  if (hasResetBtn) {
    resetBtn.removeEventListener('click', resetTimer);
    btnContainer.removeChild(resetBtn);
    hasResetBtn = false;
  } else {
    resetBtn = document.createElement('button');
    resetBtn.textContent = 'Reset';
    btnContainer.appendChild(resetBtn);
    resetBtn.addEventListener('click', resetTimer);
    hasResetBtn = true;
  }
}

// Bypasses NotAllowedError by playing audio and pausing immediately.
// Allows audio played afterwards to run without any issues.
function unlockAudio() {
  const promise = alarm.play();

  if (promise !== undefined) {
    promise
      .then(() => {
        alarm.volume = 0;
        alarm.pause();
        alarm.currentTime = 0;
      })
      .catch((error) => console.error);
  }
}

function playSound() {
  const promise = alarm.play();

  if (promise !== undefined) {
    promise
      .then(() => {
        alarm.volume = 0.5;
      })
      .catch((error) => console.error);
  }
}

function switchSession() {
  if (pomodoroSession && numPomodoros < 3) {
    pomodoroSession = false;
    shortSession = true;
    SECONDS_COUNT = S_SECONDS;
    numPomodoros++;
    session.textContent = 'Short Break';
  } else if (pomodoroSession && numPomodoros === 3) {
    pomodoroSession = false;
    longSession = true;
    SECONDS_COUNT = L_SECONDS;
    numPomodoros++;
    session.textContent = 'Long Break';
  } else {
    pomodoroSession = true;
    shortSession = false;
    longSession = false;
    SECONDS_COUNT = P_SECONDS;

    if (numPomodoros === 4) {
      numPomodoros = 0;
    }
    session.textContent = 'Pomodoro';
  }
  pomodoroCount.textContent = numPomodoros;
}

// Event Listeners

startStopBtn.addEventListener('click', startTimer);

// Set up application

session.textContent = 'Pomodoro';
pomodoroCount.textContent = numPomodoros;

displayTimer(Date.now(), SECONDS_COUNT);