document.addEventListener("DOMContentLoaded", function () {
  const form = document.querySelector("form[name='frm']");
  const modal = document.getElementById("signatureModal");
  const typedSignature = document.getElementById("typed-signature");
  const guardianSignature = document.getElementById("guardian-signature");
  const guardianText = document.getElementById("guardian-text");
  const acknowledgmentCheckbox = document.getElementById("acknowledgment-checkbox");
  const teamdeskSignature = document.getElementById("f_67361887_ID0EKIAC");
  const teamdeskGuardianSignature = document.getElementById("f_67361926_ID0EYIAC");
  const dobInput = document.getElementById("f_67289239_ID0ENC");

  // Multi-step form elements
  const steps = document.querySelectorAll('.step-section');
  const progressItems = document.querySelectorAll('.progressbar li');
  const nextBtn = document.getElementById('nextBtn');
  const prevBtn = document.querySelector('button[onclick="prevStep()"]');
  let currentStepIndex = 0;

  // Phone formatting
  const phoneInputs = document.querySelectorAll('input[type="tel"]');
  phoneInputs.forEach((input) => {
    input.addEventListener("input", function (e) {
      let numbers = e.target.value.replace(/\D/g, "");
      if (numbers.length > 10) numbers = numbers.slice(0, 10);
      let formatted = "";
      if (numbers.length > 6) {
        formatted = numbers.slice(0, 3) + "-" + numbers.slice(3, 6) + "-" + numbers.slice(6);
      } else if (numbers.length > 3) {
        formatted = numbers.slice(0, 3) + "-" + numbers.slice(3);
      } else {
        formatted = numbers;
      }
      e.target.value = formatted;
    });
  });

  // Show a specific step and update UI accordingly
  function showStep(index) {
    steps.forEach((step, i) => step.classList.toggle('active', i === index));
    progressItems.forEach((p, i) => p.classList.toggle('active', i <= index));
    currentStepIndex = index;
    validateStepFields();
    updateButtons();
  }

  // Validate all required fields in current step, enable/disable NEXT button
  function validateStepFields() {
    const currentStep = steps[currentStepIndex];
    const requiredFields = currentStep.querySelectorAll('[required]');
    let allFilled = true;

    requiredFields.forEach(field => {
      if (field.type === 'checkbox' || field.type === 'radio') {
        if (field.type === 'radio') {
          const name = field.name;
          const radios = currentStep.querySelectorAll(`input[name="${name}"]`);
          const isAnyChecked = Array.from(radios).some(radio => radio.checked);
          if (!isAnyChecked) allFilled = false;
        } else if (!field.checked) {
          allFilled = false;
        }
      } else if (!field.value.trim()) {
        allFilled = false;
      }
    });

    nextBtn.disabled = !allFilled;
  }

  // Update PREVIOUS button visibility and NEXT button text
  function updateButtons() {
    prevBtn.style.display = currentStepIndex === 0 ? 'none' : 'inline-block';
    nextBtn.textContent = currentStepIndex === steps.length - 1 ? 'Submit' : 'NEXT';
  }

  // Next button handler
  window.nextStep = function () {
    if (nextBtn.disabled) return; // prevent if validation fails

    if (currentStepIndex < steps.length - 1) {
      showStep(currentStepIndex + 1);
    } else {
      // On last step, check signature and submit or show modal
      if (!teamdeskSignature.value.trim()) {
        checkAgeAndShowModal();
      } else {
        form.submit();
      }
    }
  };

  // Previous button handler
  window.prevStep = function () {
    if (currentStepIndex > 0) {
      showStep(currentStepIndex - 1);
    }
  };

  // Add event listeners to inputs in each step for real-time validation
  steps.forEach(step => {
    const inputs = step.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
      input.addEventListener('input', validateStepFields);
      input.addEventListener('change', validateStepFields);
    });
  });

  // Form submit handler - if signature missing, prevent and show modal
  form.addEventListener("submit", function (e) {
    if (!teamdeskSignature.value.trim()) {
      e.preventDefault();
      checkAgeAndShowModal();
    }
  });

  // Show signature modal and check age to toggle guardian fields
  function checkAgeAndShowModal() {
    const dobValue = dobInput.value;
    if (!dobValue) {
      alert("Please enter your Date of Birth.");
      return;
    }
    const today = new Date();
    const dobDate = new Date(dobValue);
    let age = today.getFullYear() - dobDate.getFullYear();
    const m = today.getMonth() - dobDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dobDate.getDate())) {
      age--;
    }
    if (age < 18) {
      guardianSignature.style.display = "block";
      guardianText.style.display = "block";
    } else {
      guardianSignature.style.display = "none";
      guardianSignature.value = "";
      guardianText.style.display = "none";
    }
    showSignatureModal();
  }

  // Confirm signature and submit form via fetch
  window.confirmSignature = function () {
    if (typedSignature.value.trim() === "") {
      alert("Please type your signature.");
      return;
    }
    if (guardianSignature.style.display !== "none" && guardianSignature.value.trim() === "") {
      alert("Guardian signature is required for applicants under 18.");
      return;
    }
    if (!acknowledgmentCheckbox.checked) {
      alert("You must acknowledge and agree to the terms.");
      return;
    }
    teamdeskSignature.value = typedSignature.value.trim();
    teamdeskGuardianSignature.value = guardianSignature.value.trim();
    modal.style.display = "none";

    const formData = new FormData(form);

    fetch(form.action, {
      method: "POST",
      body: formData,
      mode: "no-cors"
    })
    .then(() => {
      window.location.href = "thankyou.html";
    })
    .catch(() => {
      alert("Error submitting the form. Please try again.");
    });
  };

  // Show the signature modal styling
  function showSignatureModal() {
    modal.style.display = "flex";
    modal.style.position = "fixed";
    modal.style.top = "0";
    modal.style.left = "0";
    modal.style.width = "100%";
    modal.style.height = "100%";
    modal.style.background = "rgba(0,0,0,0.7)";
    modal.style.justifyContent = "center";
    modal.style.alignItems = "center";
  }

  // Initialize first step and buttons
  showStep(currentStepIndex);
});
