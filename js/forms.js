/**
 * Engineering College - Form Validation & UX Handler
 * Covers:
 * 1. Advanced Registration Form with real-time feedback, password strength, and confirmation state.
 * 2. Basic Contact Form with dynamic anti-spam captcha and feedback banners.
 */

document.addEventListener('DOMContentLoaded', () => {
  initRegistrationForm();
  initContactForm();
});

/* ==========================================================================
   1. Advanced Registration Form Handler
   ========================================================================== */
function initRegistrationForm() {
  const form = document.getElementById('registrationForm');
  if (!form) return;

  const fullNameInput = document.getElementById('regFullName');
  const emailInput = document.getElementById('regEmail');
  const phoneInput = document.getElementById('regPhone');
  const programSelect = document.getElementById('regProgram');
  const intakeDateInput = document.getElementById('regIntakeDate');
  const passwordInput = document.getElementById('regPassword');
  const confirmPasswordInput = document.getElementById('regConfirmPassword');
  const termsCheckbox = document.getElementById('regTerms');
  const studyModeRadios = document.querySelectorAll('input[name="studyMode"]');

  // Minimum intake date: set to today's date formatted as YYYY-MM-DD
  if (intakeDateInput) {
    const today = new Date().toISOString().split('T')[0];
    intakeDateInput.setAttribute('min', today);
  }

  // Password Visibility Toggles
  setupPasswordToggle('togglePasswordBtn', 'regPassword');
  setupPasswordToggle('toggleConfirmPasswordBtn', 'regConfirmPassword');

  // Real-time Password Strength Meter
  if (passwordInput) {
    passwordInput.addEventListener('input', () => {
      evaluatePasswordStrength(passwordInput.value);
      if (confirmPasswordInput.value.length > 0) {
        validateConfirmPassword();
      }
    });
  }

  // Real-time Confirm Password Matching
  if (confirmPasswordInput) {
    confirmPasswordInput.addEventListener('input', validateConfirmPassword);
  }

  // Real-time Inline Validation for text inputs on blur
  [fullNameInput, emailInput, phoneInput, programSelect, intakeDateInput].forEach((input) => {
    if (!input) return;
    input.addEventListener('blur', () => validateField(input));
    input.addEventListener('input', () => {
      if (input.classList.contains('is-invalid')) {
        validateField(input);
      }
    });
  });

  // Terms checkbox change
  if (termsCheckbox) {
    termsCheckbox.addEventListener('change', () => validateTerms());
  }

  // Study mode radios change
  studyModeRadios.forEach((radio) => {
    radio.addEventListener('change', () => validateStudyMode());
  });

  // Form Submit Handler
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const isNameValid = validateField(fullNameInput);
    const isEmailValid = validateField(emailInput);
    const isPhoneValid = validateField(phoneInput);
    const isProgramValid = validateField(programSelect);
    const isStudyModeValid = validateStudyMode();
    const isIntakeValid = validateField(intakeDateInput);
    const isPasswordValid = validatePassword();
    const isConfirmValid = validateConfirmPassword();
    const isTermsValid = validateTerms();

    const isFormValid = isNameValid && isEmailValid && isPhoneValid && 
                        isProgramValid && isStudyModeValid && isIntakeValid && 
                        isPasswordValid && isConfirmValid && isTermsValid;

    if (!isFormValid) {
      // Focus on first invalid element
      const firstInvalid = form.querySelector('.is-invalid, input[name="studyMode"]:invalid');
      if (firstInvalid) {
        firstInvalid.focus();
        firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    // Submit Simulation
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnHtml = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
      <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
      Processing Application...
    `;

    setTimeout(() => {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnHtml;

      // Extract values for confirmation view
      const selectedStudyMode = document.querySelector('input[name="studyMode"]:checked')?.value || 'Full-Time';
      const selectedProgramName = programSelect.options[programSelect.selectedIndex]?.text || programSelect.value;
      const referralSource = document.getElementById('regReferral')?.value || 'Not specified';
      const scholarship = document.getElementById('regScholarship')?.checked ? 'Yes (Requested Consideration)' : 'No';

      const applicantData = {
        appId: `EC-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`,
        name: fullNameInput.value.trim(),
        email: emailInput.value.trim(),
        phone: phoneInput.value.trim(),
        program: selectedProgramName,
        studyMode: selectedStudyMode,
        intakeDate: intakeDateInput.value,
        scholarship: scholarship,
        referral: referralSource,
        timestamp: new Date().toLocaleString()
      };

      displayRegistrationConfirmation(applicantData);
    }, 1200);
  });
}

/**
 * Validates individual input fields
 */
function validateField(input) {
  if (!input) return false;
  const value = input.value.trim();
  let isValid = true;
  let errorMsg = '';

  const id = input.id;
  const errorContainer = document.getElementById(`${id}Error`);

  if (id === 'regFullName') {
    if (!value) {
      isValid = false;
      errorMsg = 'Please enter your full legal name.';
    } else if (value.length < 3) {
      isValid = false;
      errorMsg = 'Full name must be at least 3 characters long.';
    } else if (!/^[a-zA-Z\s\.\-']+$/.test(value)) {
      isValid = false;
      errorMsg = 'Name should only contain letters and standard characters.';
    }
  } else if (id === 'regEmail') {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!value) {
      isValid = false;
      errorMsg = 'Email address is required.';
    } else if (!emailRegex.test(value)) {
      isValid = false;
      errorMsg = 'Please enter a valid email address (e.g. student@example.edu).';
    }
  } else if (id === 'regPhone') {
    // Allows digits, spaces, parentheses, dashes, +, minimum 7 digits
    const digitsOnly = value.replace(/\D/g, '');
    if (!value) {
      isValid = false;
      errorMsg = 'Phone number is required for admissions contact.';
    } else if (digitsOnly.length < 7 || digitsOnly.length > 15) {
      isValid = false;
      errorMsg = 'Please enter a valid phone number (7 to 15 digits).';
    }
  } else if (id === 'regProgram') {
    if (!value) {
      isValid = false;
      errorMsg = 'Please select your intended engineering program.';
    }
  } else if (id === 'regIntakeDate') {
    if (!value) {
      isValid = false;
      errorMsg = 'Please select your intended intake starting date.';
    }
  }

  // Update UI classes and feedback text
  if (isValid) {
    input.classList.remove('is-invalid');
    input.classList.add('is-valid');
    input.setAttribute('aria-invalid', 'false');
    if (errorContainer) {
      errorContainer.textContent = '';
      errorContainer.style.display = 'none';
    }
  } else {
    input.classList.remove('is-valid');
    input.classList.add('is-invalid');
    input.setAttribute('aria-invalid', 'true');
    if (errorContainer) {
      errorContainer.textContent = errorMsg;
      errorContainer.style.display = 'block';
    }
  }

  return isValid;
}

/**
 * Validates Study Mode Radio Group
 */
function validateStudyMode() {
  const checked = document.querySelector('input[name="studyMode"]:checked');
  const errorContainer = document.getElementById('studyModeError');
  const radioCards = document.querySelectorAll('.radio-card-label');

  if (!checked) {
    if (errorContainer) {
      errorContainer.textContent = 'Please choose a study mode.';
      errorContainer.style.display = 'block';
    }
    radioCards.forEach(c => c.classList.add('border-danger'));
    return false;
  } else {
    if (errorContainer) {
      errorContainer.textContent = '';
      errorContainer.style.display = 'none';
    }
    radioCards.forEach(c => c.classList.remove('border-danger'));
    return true;
  }
}

/**
 * Validates Terms Checkbox
 */
function validateTerms() {
  const termsCheckbox = document.getElementById('regTerms');
  const errorContainer = document.getElementById('regTermsError');
  if (!termsCheckbox) return false;

  if (!termsCheckbox.checked) {
    termsCheckbox.classList.add('is-invalid');
    termsCheckbox.classList.remove('is-valid');
    if (errorContainer) {
      errorContainer.textContent = 'You must agree to the institutional terms & privacy policy to register.';
      errorContainer.style.display = 'block';
    }
    return false;
  } else {
    termsCheckbox.classList.remove('is-invalid');
    termsCheckbox.classList.add('is-valid');
    if (errorContainer) {
      errorContainer.textContent = '';
      errorContainer.style.display = 'none';
    }
    return true;
  }
}

/**
 * Validates Master Password
 */
function validatePassword() {
  const passwordInput = document.getElementById('regPassword');
  const errorContainer = document.getElementById('regPasswordError');
  if (!passwordInput) return false;

  const value = passwordInput.value;
  let isValid = true;
  let msg = '';

  if (!value) {
    isValid = false;
    msg = 'Password is required.';
  } else if (value.length < 8) {
    isValid = false;
    msg = 'Password must be at least 8 characters.';
  } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
    isValid = false;
    msg = 'Password must contain uppercase, lowercase, and at least one number.';
  }

  if (isValid) {
    passwordInput.classList.remove('is-invalid');
    passwordInput.classList.add('is-valid');
    if (errorContainer) {
      errorContainer.textContent = '';
      errorContainer.style.display = 'none';
    }
  } else {
    passwordInput.classList.remove('is-valid');
    passwordInput.classList.add('is-invalid');
    if (errorContainer) {
      errorContainer.textContent = msg;
      errorContainer.style.display = 'block';
    }
  }
  return isValid;
}

/**
 * Validates Password Confirmation
 */
function validateConfirmPassword() {
  const passwordInput = document.getElementById('regPassword');
  const confirmPasswordInput = document.getElementById('regConfirmPassword');
  const errorContainer = document.getElementById('regConfirmPasswordError');
  if (!confirmPasswordInput || !passwordInput) return false;

  const pVal = passwordInput.value;
  const cVal = confirmPasswordInput.value;
  let isValid = true;
  let msg = '';

  if (!cVal) {
    isValid = false;
    msg = 'Please confirm your chosen password.';
  } else if (cVal !== pVal) {
    isValid = false;
    msg = 'Passwords do not match.';
  }

  if (isValid) {
    confirmPasswordInput.classList.remove('is-invalid');
    confirmPasswordInput.classList.add('is-valid');
    if (errorContainer) {
      errorContainer.textContent = '';
      errorContainer.style.display = 'none';
    }
  } else {
    confirmPasswordInput.classList.remove('is-valid');
    confirmPasswordInput.classList.add('is-invalid');
    if (errorContainer) {
      errorContainer.textContent = msg;
      errorContainer.style.display = 'block';
    }
  }
  return isValid;
}

/**
 * Live Password Strength Evaluation
 */
function evaluatePasswordStrength(password) {
  const fill = document.getElementById('passwordStrengthFill');
  const text = document.getElementById('passwordStrengthText');
  if (!fill || !text) return;

  if (!password) {
    fill.style.width = '0%';
    fill.style.backgroundColor = 'transparent';
    text.textContent = 'Password strength: None';
    text.className = 'password-strength-text text-muted';
    return;
  }

  let score = 0;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  if (score <= 2) {
    fill.style.width = '25%';
    fill.style.backgroundColor = '#ef4444';
    text.textContent = 'Password strength: Weak';
    text.className = 'password-strength-text text-danger';
  } else if (score <= 4) {
    fill.style.width = '60%';
    fill.style.backgroundColor = '#f59e0b';
    text.textContent = 'Password strength: Moderate';
    text.className = 'password-strength-text text-warning';
  } else if (score === 5) {
    fill.style.width = '85%';
    fill.style.backgroundColor = '#3b82f6';
    text.textContent = 'Password strength: Strong';
    text.className = 'password-strength-text text-primary';
  } else {
    fill.style.width = '100%';
    fill.style.backgroundColor = '#10b981';
    text.textContent = 'Password strength: Excellent';
    text.className = 'password-strength-text text-success';
  }
}

/**
 * Helper to toggle password visibility
 */
function setupPasswordToggle(btnId, inputId) {
  const btn = document.getElementById(btnId);
  const input = document.getElementById(inputId);
  if (!btn || !input) return;

  btn.addEventListener('click', () => {
    const isPassword = input.type === 'password';
    input.type = isPassword ? 'text' : 'password';
    btn.innerHTML = isPassword 
      ? '<i class="bi bi-eye-slash-fill"></i>' 
      : '<i class="bi bi-eye-fill"></i>';
    btn.setAttribute('aria-label', isPassword ? 'Hide password' : 'Show password');
  });
}

/**
 * Displays rich confirmation receipt after successful registration
 */
function displayRegistrationConfirmation(data) {
  const formCard = document.getElementById('registrationCard');
  const confirmationContainer = document.getElementById('registrationConfirmation');
  if (!confirmationContainer) return;

  if (formCard) formCard.style.display = 'none';
  confirmationContainer.style.display = 'block';

  confirmationContainer.innerHTML = `
    <div class="confirmation-card animate__animated animate__fadeIn">
      <div class="confirmation-icon">
        <i class="bi bi-check-circle-fill"></i>
      </div>
      <h2 class="h3 fw-bold mb-2">Registration Submitted Successfully!</h2>
      <p class="text-muted mb-4">
        Thank you, <strong>${escapeHtml(data.name)}</strong>. Your application dossier has been received by the Engineering College Admissions Directorate.
      </p>

      <div class="card bg-light border-0 text-start p-4 mb-4 rounded-3">
        <div class="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
          <span class="text-muted small">Application Reference:</span>
          <span class="badge bg-primary fs-6 font-monospace">${data.appId}</span>
        </div>
        <div class="row g-3">
          <div class="col-sm-6">
            <span class="text-muted small d-block">Prospective Student:</span>
            <strong>${escapeHtml(data.name)}</strong>
          </div>
          <div class="col-sm-6">
            <span class="text-muted small d-block">Contact Email:</span>
            <strong>${escapeHtml(data.email)}</strong>
          </div>
          <div class="col-sm-6">
            <span class="text-muted small d-block">Telephone:</span>
            <strong>${escapeHtml(data.phone)}</strong>
          </div>
          <div class="col-sm-6">
            <span class="text-muted small d-block">Intended Intake:</span>
            <strong>${escapeHtml(data.intakeDate)}</strong>
          </div>
          <div class="col-sm-6">
            <span class="text-muted small d-block">Chosen Program:</span>
            <strong class="text-primary">${escapeHtml(data.program)}</strong>
          </div>
          <div class="col-sm-6">
            <span class="text-muted small d-block">Study Mode:</span>
            <strong>${escapeHtml(data.studyMode)}</strong>
          </div>
          <div class="col-sm-6">
            <span class="text-muted small d-block">Scholarship Consideration:</span>
            <span>${escapeHtml(data.scholarship)}</span>
          </div>
          <div class="col-sm-6">
            <span class="text-muted small d-block">Referral Channel:</span>
            <span>${escapeHtml(data.referral)}</span>
          </div>
          <div class="col-12 pt-2 border-top">
            <span class="text-muted small d-block">Submission Timestamp:</span>
            <span class="small font-monospace">${data.timestamp}</span>
          </div>
        </div>
      </div>

      <div class="alert alert-info d-flex align-items-center text-start gap-3 mb-4" role="alert">
        <i class="bi bi-info-circle-fill fs-4 flex-shrink-0 text-primary"></i>
        <div class="small">
          An admissions verification email has been dispatched to <strong>${escapeHtml(data.email)}</strong> with your student portal credentials and next document submission steps.
        </div>
      </div>

      <div class="d-flex flex-wrap gap-2 justify-content-center">
        <button type="button" class="btn btn-outline-secondary" onclick="window.print()">
          <i class="bi bi-printer me-1"></i> Print Application Receipt
        </button>
        <button type="button" class="btn btn-primary" id="btnRegisterAnother">
          <i class="bi bi-person-plus me-1"></i> Register Another Student
        </button>
        <a href="index.html" class="btn btn-outline-primary">
          <i class="bi bi-house me-1"></i> Return to Homepage
        </a>
      </div>
    </div>
  `;

  // Attach restart listener
  const resetBtn = document.getElementById('btnRegisterAnother');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      confirmationContainer.style.display = 'none';
      if (formCard) {
        formCard.style.display = 'block';
        document.getElementById('registrationForm').reset();
        document.querySelectorAll('.is-valid, .is-invalid').forEach(el => el.classList.remove('is-valid', 'is-invalid'));
        evaluatePasswordStrength('');
      }
    });
  }

  confirmationContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
}


/* ==========================================================================
   2. Basic Contact Form Handler with Dynamic Anti-Spam
   ========================================================================== */
function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  const nameInput = document.getElementById('contactName');
  const emailInput = document.getElementById('contactEmail');
  const subjectInput = document.getElementById('contactSubject');
  const messageInput = document.getElementById('contactMessage');
  const captchaInput = document.getElementById('contactCaptcha');
  const captchaBadge = document.getElementById('captchaQuestion');
  const refreshCaptchaBtn = document.getElementById('refreshCaptchaBtn');
  const alertContainer = document.getElementById('contactAlertContainer');

  let captchaResult = 0;

  // Generates simple arithmetic question: e.g. "7 + 4 = ?"
  const generateCaptcha = () => {
    const a = Math.floor(Math.random() * 9) + 2;
    const b = Math.floor(Math.random() * 8) + 1;
    captchaResult = a + b;
    if (captchaBadge) {
      captchaBadge.textContent = `${a} + ${b} = ?`;
    }
    if (captchaInput) {
      captchaInput.value = '';
      captchaInput.classList.remove('is-valid', 'is-invalid');
    }
  };

  generateCaptcha();

  if (refreshCaptchaBtn) {
    refreshCaptchaBtn.addEventListener('click', (e) => {
      e.preventDefault();
      generateCaptcha();
    });
  }

  // Real-time blur validation
  [nameInput, emailInput, subjectInput, messageInput, captchaInput].forEach((input) => {
    if (!input) return;
    input.addEventListener('blur', () => validateContactInput(input));
    input.addEventListener('input', () => {
      if (input.classList.contains('is-invalid')) {
        validateContactInput(input);
      }
    });
  });

  const validateContactInput = (input) => {
    if (!input) return false;
    const val = input.value.trim();
    let valid = true;
    let msg = '';
    const errEl = document.getElementById(`${input.id}Error`);

    if (input.id === 'contactName') {
      if (!val) { valid = false; msg = 'Name is required.'; }
      else if (val.length < 2) { valid = false; msg = 'Name must be at least 2 characters.'; }
    } else if (input.id === 'contactEmail') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
      if (!val) { valid = false; msg = 'Email address is required.'; }
      else if (!emailRegex.test(val)) { valid = false; msg = 'Please enter a valid email address.'; }
    } else if (input.id === 'contactSubject') {
      if (!val) { valid = false; msg = 'Subject is required.'; }
    } else if (input.id === 'contactMessage') {
      if (!val) { valid = false; msg = 'Message cannot be empty.'; }
      else if (val.length < 10) { valid = false; msg = 'Please provide a bit more detail (at least 10 characters).'; }
    } else if (input.id === 'contactCaptcha') {
      if (!val) { valid = false; msg = 'Please solve the anti-spam calculation.'; }
      else if (parseInt(val, 10) !== captchaResult) { valid = false; msg = 'Incorrect answer. Please try again.'; }
    }

    if (valid) {
      input.classList.remove('is-invalid');
      input.classList.add('is-valid');
      if (errEl) { errEl.textContent = ''; errEl.style.display = 'none'; }
    } else {
      input.classList.remove('is-valid');
      input.classList.add('is-invalid');
      if (errEl) { errEl.textContent = msg; errEl.style.display = 'block'; }
    }
    return valid;
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const isNameOk = validateContactInput(nameInput);
    const isEmailOk = validateContactInput(emailInput);
    const isSubjectOk = validateContactInput(subjectInput);
    const isMsgOk = validateContactInput(messageInput);
    const isCaptchaOk = validateContactInput(captchaInput);

    if (!isNameOk || !isEmailOk || !isSubjectOk || !isMsgOk || !isCaptchaOk) {
      const firstInv = form.querySelector('.is-invalid');
      if (firstInv) firstInv.focus();
      return;
    }

    // Submit Simulation
    const submitBtn = form.querySelector('button[type="submit"]');
    const origText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
      <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
      Sending Message...
    `;

    setTimeout(() => {
      submitBtn.disabled = false;
      submitBtn.innerHTML = origText;

      if (alertContainer) {
        alertContainer.innerHTML = `
          <div class="alert alert-success alert-dismissible fade show d-flex align-items-center gap-3 p-3 mb-4 rounded-3 shadow-sm" role="alert">
            <i class="bi bi-check-circle-fill fs-3 text-success flex-shrink-0"></i>
            <div>
              <strong class="d-block mb-1">Message Dispatched Successfully!</strong>
              <span>Thank you, <strong>${escapeHtml(nameInput.value.trim())}</strong>. Your inquiry regarding "<em>${escapeHtml(subjectInput.value.trim())}</em>" has been routed to our Admissions & Support Team. An advisor will contact you within 24 business hours.</span>
            </div>
            <button type="button" class="btn-close ms-auto" data-bs-dismiss="alert" aria-label="Close"></button>
          </div>
        `;
        alertContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }

      form.reset();
      document.querySelectorAll('#contactForm .is-valid').forEach(el => el.classList.remove('is-valid'));
      generateCaptcha();
    }, 1000);
  });
}

/**
 * XSS prevention helper
 */
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
