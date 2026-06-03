/* =========================
   BunkMate
   Safe static frontend attendance planner
   No API, no database, no file access
========================= */

const form = document.getElementById("attendanceForm");

const requiredInput = document.getElementById("requiredPercentage");
const totalHeldInput = document.getElementById("totalHeld");
const attendedInput = document.getElementById("attended");

const errorBox = document.getElementById("errorBox");
const resultCard = document.getElementById("resultCard");

const currentAttendanceText = document.getElementById("currentAttendance");
const statusLine = document.getElementById("statusLine");
const zoneBadge = document.getElementById("zoneBadge");

const progressLabel = document.getElementById("progressLabel");
const progressFill = document.getElementById("progressFill");

const missedClassesText = document.getElementById("missedClasses");
const safeMissesText = document.getElementById("safeMisses");
const neededClassesText = document.getElementById("neededClasses");
const adviceBox = document.getElementById("adviceBox");

const calculateBtn = document.getElementById("calculateBtn");
const resetBtn = document.getElementById("resetBtn");

const themeToggle = document.getElementById("themeToggle");
const themeIcon = document.getElementById("themeIcon");
const themeText = document.getElementById("themeText");

function getNumber(inputElement) {
  return Number(inputElement.value.trim());
}

function showError(message) {
  errorBox.textContent = message;
  errorBox.classList.add("show");

  resultCard.classList.remove("result-animate");
  adviceBox.textContent = "Fix the error and calculate again.";
}

function clearError() {
  errorBox.textContent = "";
  errorBox.classList.remove("show");
}

function validateInputs(requiredPercentage, totalHeld, attended) {
  if (
    Number.isNaN(requiredPercentage) ||
    Number.isNaN(totalHeld) ||
    Number.isNaN(attended)
  ) {
    return "Only numbers are allowed.";
  }

  if (requiredPercentage <= 0 || requiredPercentage > 100) {
    return "Required attendance percentage must be between 1 and 100.";
  }

  if (totalHeld <= 0) {
    return "Total classes held must be more than 0.";
  }

  if (attended < 0) {
    return "Attended classes cannot be negative.";
  }

  if (!Number.isInteger(totalHeld) || !Number.isInteger(attended)) {
    return "Total classes and attended classes should be whole numbers like 10, 20, or 40.";
  }

  if (attended > totalHeld) {
    return "Attended classes cannot be more than total classes held.";
  }

  return "";
}

function getZone(currentPercentage, requiredPercentage) {
  if (currentPercentage >= requiredPercentage) {
    return {
      name: "Safe Zone",
      className: "safe",
      status: "You are safe right now.",
      advice:
        "Great! Your current attendance is equal to or above the required target. Keep planning responsibly."
    };
  }

  if (currentPercentage >= requiredPercentage - 5) {
    return {
      name: "Warning Zone",
      className: "warning",
      status: "You are close, but not fully safe.",
      advice:
        "You are close to the required target, but you should attend upcoming classes to stay safe."
    };
  }

  return {
    name: "Danger Zone",
    className: "danger",
    status: "You need to recover your attendance.",
    advice:
      "Your attendance is below the safe range. Attend upcoming classes regularly to reduce shortage risk."
  };
}

function calculateClassesNeeded(requiredPercentage, totalHeld, attended) {
  const requiredDecimal = requiredPercentage / 100;
  const currentDecimal = attended / totalHeld;

  if (currentDecimal >= requiredDecimal) {
    return 0;
  }

  if (requiredPercentage === 100) {
    return "Not possible";
  }

  const needed = Math.ceil(
    ((requiredDecimal * totalHeld) - attended) / (1 - requiredDecimal)
  );

  return Math.max(0, needed);
}

function calculateSafeMissesFromNow(requiredPercentage, totalHeld, attended) {
  const requiredDecimal = requiredPercentage / 100;
  const currentDecimal = attended / totalHeld;

  if (currentDecimal < requiredDecimal) {
    return 0;
  }

  if (requiredPercentage === 100) {
    return 0;
  }

  const safeMisses = Math.floor((attended / requiredDecimal) - totalHeld);

  return Math.max(0, safeMisses);
}

function getMotivationMessage(zoneName, safeMisses, classesNeeded) {
  if (zoneName === "Safe Zone") {
    if (safeMisses === 0) {
      return "You are safe, but you are very close to the boundary. Missing one class may put you below the target.";
    }

    return `You are currently safe. You can miss about ${safeMisses} upcoming class(es), but official records should always be checked.`;
  }

  if (zoneName === "Warning Zone") {
    return `Stay alert. Attend at least ${classesNeeded} upcoming class(es) to reach your target.`;
  }

  return `Recovery is needed. You may need to attend ${classesNeeded} upcoming class(es) to reach the target.`;
}

function liftResultCard() {
  resultCard.classList.remove("result-animate");

  void resultCard.offsetWidth;

  resultCard.classList.add("result-animate");

  resultCard.scrollIntoView({
    behavior: "smooth",
    block: "center"
  });
}

function calculateAttendance() {
  const requiredPercentage = getNumber(requiredInput);
  const totalHeld = getNumber(totalHeldInput);
  const attended = getNumber(attendedInput);

  if (
    requiredInput.value.trim() === "" ||
    totalHeldInput.value.trim() === "" ||
    attendedInput.value.trim() === ""
  ) {
    showError("Please fill all fields.");
    liftResultCard();
    return;
  }

  const validationMessage = validateInputs(
    requiredPercentage,
    totalHeld,
    attended
  );

  if (validationMessage) {
    showError(validationMessage);
    liftResultCard();
    return;
  }

  clearError();

  const currentPercentage = (attended / totalHeld) * 100;
  const alreadyMissed = totalHeld - attended;

  const safeMisses = calculateSafeMissesFromNow(
    requiredPercentage,
    totalHeld,
    attended
  );

  const classesNeeded = calculateClassesNeeded(
    requiredPercentage,
    totalHeld,
    attended
  );

  const zone = getZone(currentPercentage, requiredPercentage);

  currentAttendanceText.textContent = `${currentPercentage.toFixed(2)}%`;
  statusLine.textContent = zone.status;

  progressLabel.textContent = `${currentPercentage.toFixed(2)}%`;
  progressFill.style.width = `${Math.min(currentPercentage, 100)}%`;

  zoneBadge.textContent = zone.name;
  zoneBadge.className = `zone-badge ${zone.className}`;

  missedClassesText.textContent = alreadyMissed;
  safeMissesText.textContent = safeMisses;
  neededClassesText.textContent = classesNeeded;

  if (classesNeeded === "Not possible") {
    adviceBox.textContent =
      "Your target is 100%, and you have already missed one or more classes. Reaching 100% is not possible with the current record.";
  } else {
    const motivation = getMotivationMessage(
      zone.name,
      safeMisses,
      classesNeeded
    );

    adviceBox.textContent = `${zone.advice} ${motivation}`;
  }

  resultCard.classList.remove("waiting");
  liftResultCard();
}

function handleFormSubmit(event) {
  event.preventDefault();

  calculateBtn.classList.add("is-loading");
  calculateBtn.disabled = true;

  setTimeout(function () {
    calculateAttendance();

    calculateBtn.classList.remove("is-loading");
    calculateBtn.disabled = false;
  }, 450);
}

function resetCalculator() {
  form.reset();
  clearError();

  currentAttendanceText.textContent = "--%";
  statusLine.textContent = "Fill the form and press calculate.";

  progressLabel.textContent = "0%";
  progressFill.style.width = "0%";

  zoneBadge.textContent = "Ready";
  zoneBadge.className = "zone-badge neutral";

  missedClassesText.textContent = "--";
  safeMissesText.textContent = "--";
  neededClassesText.textContent = "--";

  adviceBox.textContent =
    "Tip: Check your official attendance portal before entering values here.";

  resultCard.classList.add("waiting");
  resultCard.classList.remove("result-animate");
}

function updateThemeButton() {
  const isDark = document.body.classList.contains("dark-mode");

  themeIcon.textContent = isDark ? "☀️" : "🌙";
  themeText.textContent = isDark ? "Light" : "Dark";
}

function toggleTheme() {
  document.body.classList.toggle("dark-mode");
  updateThemeButton();
}

form.addEventListener("submit", handleFormSubmit);
resetBtn.addEventListener("click", resetCalculator);
themeToggle.addEventListener("click", toggleTheme);

updateThemeButton();