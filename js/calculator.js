/**
 * Engineering College - Interactive Tuition & Cost Estimator
 * Dynamically computes semester and annual costs based on residency, housing, credits, and scholarships.
 */

document.addEventListener('DOMContentLoaded', () => {
  initCostCalculator();
});

function initCostCalculator() {
  const calcForm = document.getElementById('tuitionCalculatorForm');
  if (!calcForm) return;

  const residencySelect = document.getElementById('calcResidency');
  const levelSelect = document.getElementById('calcLevel');
  const creditsSlider = document.getElementById('calcCredits');
  const creditsDisplay = document.getElementById('calcCreditsValue');
  const housingSelect = document.getElementById('calcHousing');
  const mealSelect = document.getElementById('calcMeal');
  const scholarshipSelect = document.getElementById('calcScholarship');

  // Result Elements
  const semesterTotalEl = document.getElementById('calcSemesterTotal');
  const annualTotalEl = document.getElementById('calcAnnualTotal');
  const breakdownTuitionEl = document.getElementById('calcBreakdownTuition');
  const breakdownFeesEl = document.getElementById('calcBreakdownFees');
  const breakdownHousingEl = document.getElementById('calcBreakdownHousing');
  const breakdownScholarshipEl = document.getElementById('calcBreakdownScholarship');

  // Rates definition
  const rates = {
    residencyPerCredit: {
      instate: 380,
      outstate: 640,
      international: 820
    },
    levelMultiplier: {
      undergrad: 1.0,
      grad: 1.25
    },
    mandatoryFeesPerSemester: 680,
    housingPerSemester: {
      none: 0,
      standard: 4200,
      suite: 5500
    },
    mealPerSemester: {
      none: 0,
      unlimited: 2600,
      weekly14: 1950,
      commuter: 750
    },
    scholarshipDiscount: {
      none: 0,
      deans: 2500,
      stem: 4000,
      presidential: 0.95 // 95% tuition discount
    }
  };

  const calculate = () => {
    const residency = residencySelect.value;
    const level = levelSelect.value;
    const credits = parseInt(creditsSlider.value, 10);
    const housing = housingSelect.value;
    const meal = mealSelect.value;
    const scholarship = scholarshipSelect.value;

    // Display slider value
    if (creditsDisplay) {
      creditsDisplay.textContent = `${credits} Credits`;
    }

    // 1. Base Tuition
    const perCreditRate = (rates.residencyPerCredit[residency] || 380) * (rates.levelMultiplier[level] || 1.0);
    let tuitionCost = perCreditRate * credits;

    // 2. Fees
    const feesCost = rates.mandatoryFeesPerSemester;

    // 3. Room & Board
    const housingCost = rates.housingPerSemester[housing] || 0;
    const mealCost = rates.mealPerSemester[meal] || 0;
    const roomAndBoard = housingCost + mealCost;

    // 4. Scholarship Deduction
    let discount = 0;
    if (scholarship === 'presidential') {
      discount = tuitionCost * rates.scholarshipDiscount.presidential;
    } else {
      discount = rates.scholarshipDiscount[scholarship] || 0;
    }
    // Cannot discount more than tuition
    discount = Math.min(discount, tuitionCost);

    // Totals
    const semesterTotal = Math.max(0, tuitionCost + feesCost + roomAndBoard - discount);
    const annualTotal = semesterTotal * 2;

    // Format currency
    const format = (num) => `$${Math.round(num).toLocaleString('en-US')}`;

    // Update DOM
    if (breakdownTuitionEl) breakdownTuitionEl.textContent = format(tuitionCost);
    if (breakdownFeesEl) breakdownFeesEl.textContent = format(feesCost);
    if (breakdownHousingEl) breakdownHousingEl.textContent = format(roomAndBoard);
    if (breakdownScholarshipEl) {
      breakdownScholarshipEl.textContent = discount > 0 ? `-${format(discount)}` : '$0';
      breakdownScholarshipEl.className = discount > 0 ? 'text-success fw-bold' : 'text-muted';
    }

    if (semesterTotalEl) semesterTotalEl.textContent = format(semesterTotal);
    if (annualTotalEl) annualTotalEl.textContent = format(annualTotal);
  };

  // Attach event listeners to all controls
  [residencySelect, levelSelect, housingSelect, mealSelect, scholarshipSelect].forEach((el) => {
    if (el) el.addEventListener('change', calculate);
  });

  if (creditsSlider) {
    creditsSlider.addEventListener('input', calculate);
  }

  // Initial Calculation
  calculate();
}
