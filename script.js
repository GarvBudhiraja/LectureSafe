/* =========================
   LectureSafe
   Private static attendance planner
   No API, no database, no cookies, no localStorage, no file access
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

const startPlanningBtn = document.getElementById("startPlanningBtn");

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
    return "Minimum attendance criteria must be between 1 and 100.";
  }

  if (totalHeld <= 0) {
    return "Total lectures/classes held must be more than 0.";
  }

  if (attended < 0) {
    return "Attended lectures/classes cannot be negative.";
  }

  if (!Number.isInteger(totalHeld) || !Number.isInteger(attended)) {
    return "Total and attended lecture counts should be whole numbers like 10, 20, or 40.";
  }

  if (attended > totalHeld) {
    return "Attended lectures/classes cannot be more than total lectures/classes held.";
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
        "Your attendance is equal to or above the minimum attendance criteria. Keep planning responsibly."
    };
  }

  if (currentPercentage >= requiredPercentage - 5) {
    return {
      name: "Warning Zone",
      className: "warning",
      status: "You are close, but not fully safe.",
      advice:
        "Your attendance is close to the minimum criteria. Try to attend upcoming classes to stay on the safe side."
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

  /*
    Formula:
    (attended + x) / (held + x) >= requiredDecimal

    x = number of future classes needed
  */
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

  /*
    Formula:
    attended / (held + misses) >= requiredDecimal
  */
  const safeMisses = Math.floor((attended / requiredDecimal) - totalHeld);

  return Math.max(0, safeMisses);
}

function getMotivationMessage(zoneName, safeMisses, classesNeeded) {
  if (zoneName === "Safe Zone") {
    if (safeMisses === 0) {
      return "You are safe, but very close to the boundary. Missing one more class may put you below your target.";
    }

    return `You can still miss about ${safeMisses} upcoming class(es), but always confirm with official records.`;
  }

  if (zoneName === "Warning Zone") {
    return `Attend at least ${classesNeeded} upcoming class(es) to reach your target.`;
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
      "Your target is 100%, but you have already missed one or more classes. Reaching 100% is not possible with the current record.";
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
  }, 350);
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
    "Tip: Use your official attendance portal numbers for the most accurate result.";

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

if (startPlanningBtn) {
  startPlanningBtn.addEventListener("click", function () {
    document.getElementById("calculator").scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  });
}

updateThemeButton();
/* Mobile users should directly see the calculator first */
function openCalculatorFirstOnMobile() {
  const isMobile = window.innerWidth <= 700;
  const calculatorSection = document.getElementById("calculator");

  if (isMobile && calculatorSection) {
    setTimeout(function () {
      calculatorSection.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }, 500);
  }
}

openCalculatorFirstOnMobile();
