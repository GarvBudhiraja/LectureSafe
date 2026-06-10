document.addEventListener('DOMContentLoaded', () => {

  // Get elements
  const form = document.getElementById('attendanceForm');
  const calculateBtn = document.getElementById('calculateBtn');
  const resetBtn = document.getElementById('resetBtn');
  const errorBox = document.getElementById('errorBox');
  
  const resultCard = document.getElementById('resultCard');
  const mobileBackdrop = document.getElementById('mobileBackdrop');
  const closeSheetBtn = document.getElementById('closeSheetBtn');

  // Math logic
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    errorBox.style.display = 'none';

    // Values
    const target = parseFloat(document.getElementById('requiredPercentage').value);
    const held = parseInt(document.getElementById('totalHeld').value, 10);
    const attended = parseInt(document.getElementById('attended').value, 10);

    // Checks
    if (isNaN(target) || isNaN(held) || isNaN(attended)) {
      errorBox.textContent = "Please enter valid numbers.";
      errorBox.style.display = 'block';
      return;
    }
    if (attended > held) {
      errorBox.textContent = "Attended classes cannot be more than total classes.";
      errorBox.style.display = 'block';
      return;
    }

    // Calculations
    const currentPercent = held === 0 ? 0 : (attended / held) * 100;
    const missed = held - attended;
    
    let safeMisses = 0;
    if (currentPercent >= target) {
       safeMisses = Math.floor((attended * 100 / target) - held);
    }

    let needed = 0;
    if (currentPercent < target) {
       needed = Math.ceil(((target * held) - (100 * attended)) / (100 - target));
    }

    // Update UI
    document.getElementById('currentAttendance').textContent = currentPercent.toFixed(1) + '%';
    document.getElementById('missedClasses').textContent = missed;
    document.getElementById('safeMisses').textContent = safeMisses < 0 ? 0 : safeMisses;
    document.getElementById('neededClasses').textContent = needed < 0 ? 0 : needed;

    // Trigger Mobile Slide-In
    if (window.innerWidth <= 768) {
      resultCard.classList.add('mobile-active');
      mobileBackdrop.classList.add('active');
    }
  });

  // Close Mobile Sheet Logic
  function closeMobileSheet() {
    resultCard.classList.remove('mobile-active');
    mobileBackdrop.classList.remove('active');
  }

  // Event Listeners for closing sheet
  closeSheetBtn.addEventListener('click', closeMobileSheet);
  mobileBackdrop.addEventListener('click', closeMobileSheet);

  // Reset button logic
  resetBtn.addEventListener('click', () => {
    form.reset();
    errorBox.style.display = 'none';
    
    document.getElementById('currentAttendance').textContent = '--%';
    document.getElementById('missedClasses').textContent = '--';
    document.getElementById('safeMisses').textContent = '--';
    document.getElementById('neededClasses').textContent = '--';
    
    closeMobileSheet();
  });

});
