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

  const steps = document.querySelectorAll('.step-section');
  const progressItems = document.querySelectorAll('.progressbar li');
  const nextBtn = document.getElementById('nextBtn');
  const prevBtn = document.querySelector('button[onclick="prevStep()"]');

  let currentStepIndex = 0;

  // Format phone inputs
  const phoneInputs = document.querySelectorAll('input[type="tel"]');
  phoneInputs.forEach(input => {
    input.addEventListener("input", e => {
      let numbers = e.target.value.replace(/\D/g, "").slice(0, 10);
      let formatted = numbers.length > 6
        ? `${numbers.slice(0, 3)}-${numbers.slice(3, 6)}-${numbers.slice(6)}`
        : numbers.length > 3
          ? `${numbers.slice(0, 3)}-${numbers.slice(3)}`
          : numbers;
      e.target.value = formatted;
    });
  });

  function showStep(index) {
    steps.forEach((step, i) => step.classList.toggle('active', i === index));
    progressItems.forEach((p, i) => p.classList.toggle('active', i <= index));
    currentStepIndex = index;
    validateStepFields();
    updateButtons();
  }

  function validateStepFields() {
    const currentStep = steps[currentStepIndex];
    const requiredFields = currentStep.querySelectorAll('[required]');
    let allValid = true;

    requiredFields.forEach(field => {
      if (field.type === 'email') {
        const emailPattern = /^[^@]+@[^@]+\.[^@]+$/;
        if (!emailPattern.test(field.value.trim())) allValid = false;
      } else if (field.type === 'checkbox' && !field.checked) {
        allValid = false;
      } else if (field.type === 'radio') {
        const group = currentStep.querySelectorAll(`input[name="${field.name}"]`);
        if (!Array.from(group).some(f => f.checked)) allValid = false;
      } else if (!field.value.trim()) {
        allValid = false;
      }
    });

    // On last step, require CAPTCHA
    if (currentStepIndex === steps.length - 1) {
      const captchaResponse = grecaptcha.getResponse();
      if (!captchaResponse) allValid = false;
    }

    nextBtn.disabled = !allValid;
    const msg = document.getElementById("next-disabled-message");
    if (msg) msg.style.display = allValid ? "none" : "block";

    return allValid;
  }

  function updateButtons() {
    prevBtn.style.display = currentStepIndex === 0 ? 'none' : 'inline-block';
    nextBtn.textContent = currentStepIndex === steps.length - 1 ? 'Submit' : 'NEXT';
  }

  async function validateCaptchaServerSide(token) {
    try {
      const response = await fetch("https://zrsbahc7da.execute-api.us-east-2.amazonaws.com/default/captchaValidation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token })
      });
      if (!response.ok) throw new Error("Server error");
      const data = await response.json();
      return data.success;
    } catch (err) {
      console.error("CAPTCHA verification failed:", err);
      return false;
    }
  }

  window.nextStep = async function () {
    const valid = validateStepFields();
    if (!valid) return;

    // If not last step, just go forward
    if (currentStepIndex < steps.length - 1) {
      showStep(currentStepIndex + 1);
      return;
    }

    // On final step → validate CAPTCHA server-side
    const captchaResponse = grecaptcha.getResponse();
    if (!captchaResponse) {
      alert("Please complete the CAPTCHA.");
      return;
    }

    const captchaValid = await validateCaptchaServerSide(captchaResponse);
    if (!captchaValid) {
      alert("CAPTCHA verification failed. Please try again.");
      grecaptcha.reset();
      return;
    }

    // If signature not filled → show modal, else submit
    if (!teamdeskSignature.value.trim()) {
      checkAgeAndShowModal();
    } else {
      confirmSignature();
    }
  };

  window.prevStep = function () {
    if (currentStepIndex > 0) {
      showStep(currentStepIndex - 1);
    }
  };

  steps.forEach(step => {
    const inputs = step.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
      input.addEventListener('input', validateStepFields);
      input.addEventListener('change', validateStepFields);
    });
  });

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
    if (m < 0 || (m === 0 && today.getDate() < dobDate.getDate())) age--;

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

  window.confirmSignature = function () {
    const captchaResponse = grecaptcha.getResponse();
    if (!captchaResponse) {
      alert("Please complete the CAPTCHA.");
      return;
    }

    if (!typedSignature.value.trim()) {
      alert("Please type your signature.");
      return;
    }

    if (guardianSignature.style.display !== "none" && !guardianSignature.value.trim()) {
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
      .then(() => window.location.href = "thankyou.html")
      .catch(() => alert("Error submitting the form. Please try again."));
  };

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

  window.enableSubmitButton = function () {
    if (currentStepIndex === steps.length - 1) {
      nextBtn.disabled = false;
    }
  };

  window.disableSubmitButton = function () {
    if (currentStepIndex === steps.length - 1) {
      nextBtn.disabled = true;
    }
  };

  showStep(currentStepIndex);
});
