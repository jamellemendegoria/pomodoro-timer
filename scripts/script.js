// Variables

// Constant global variables defining session duration
const P_SECONDS = 1500; // Pomdoro - 25 min
const S_SECONDS = 300; // Short Break - 5 min
const L_SECONDS = 1200; // Long break - 20 min

// Grab references to elements and put them in variables
const session = document.querySelector('.session');
const timer = document.querySelector('.timer');
const startStopBtn = document.querySelector('.startStopBtn');
const btnContainer = document.querySelector('.btnContainer');
const pomodoroCount = document.querySelector('.pomodoroCount');

// Set up variables
const alarm = new Audio('media/alarm.wav');
let secondCount = P_SECONDS;
let numPomodoros = 0;
let isTimerActive = false;
let hasResetBtn = false;
let createTimer;
let resetBtn;

// Variables representing current session
let pomodoroSession = true;
let shortSession = false;
let longSession = false;

// Function Declarations

function displayTimer() {
  updateTimer();
  secondCount--;

  if (secondCount < 0) {
    playSound();

    clearInterval(createTimer);
    isTimerActive = false;
    toggleReset();
    let timeOut = setTimeout(() => {
      if (startStopBtn.textContent == 'Stop') {
        toggleStartStop();
      }
      switchSession();
      updateTimer();
    }, 500);
  }
}

function updateTimer() {
  let minutes = Math.floor((secondCount % 3600) / 60);
  let seconds = Math.floor(secondCount % 60);

  // Add leading zeroes if less than 10 to match an actual timer
  let displayMinutes = minutes < 10 ? '0' + minutes : minutes;
  let displaySeconds = seconds < 10 ? '0' + seconds : seconds;

  let time = `${displayMinutes}:${displaySeconds}`;
  timer.textContent = time;
  document.title = `${time} | Pomodoro Timer`;
}

function startTimer() {
  if (!isTimerActive) {
    isTimerActive = true;
    toggleReset();
  }
  createTimer = setInterval(displayTimer, 1000);
  unlockAudio();
  toggleStartStop();
}

function stopTimer() {
  alarm.pause();
  clearInterval(createTimer);
  toggleStartStop();
}

function resetTimer() {
  clearInterval(createTimer);

  // Rest secondCount to current session's total seconds
  if (pomodoroSession) {
    secondCount = P_SECONDS;
  } else if (shortSession) {
    secondCount = S_SECONDS;
  } else {
    secondCount = L_SECONDS;
  }

  displayTimer();

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
    secondCount = S_SECONDS;
    numPomodoros++;
    session.textContent = 'Short Break';
  } else if (pomodoroSession && numPomodoros == 3) {
    pomodoroSession = false;
    longSession = true;
    secondCount = L_SECONDS;
    numPomodoros++;
    session.textContent = 'Long Break';
  } else {
    pomodoroSession = true;
    shortSession = false;
    longSession = false;
    secondCount = P_SECONDS;

    if (numPomodoros == 4) {
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

displayTimer();