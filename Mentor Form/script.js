document.addEventListener("DOMContentLoaded", function () {
  const steps = document.querySelectorAll('.step-section');
  const progressItems = document.querySelectorAll('.progressbar li');
  let current = 0;

  const form = document.querySelector("form[name='frm']");
  const modal = document.getElementById("signatureModal");
  const typedSignature = document.getElementById("typed-signature");
  const hiddenSignatureInput = document.getElementById("f_67469619_ID0E4F");
  const hiddenDateInput = document.getElementById("f_67469620_ID0ENG");

  const nextBtn = document.querySelector('button[onclick="nextStep()"]');
  const prevBtn = document.querySelector('button[onclick="prevStep()"]');

  function showStep(step) {
    steps.forEach((s, i) => s.classList.toggle('active', i === step));
    progressItems.forEach((p, i) => p.classList.toggle('active', i <= step));
    updateButtonState();
  }

  function isCaptchaCompleted() {
    return grecaptcha && grecaptcha.getResponse().length > 0;
  }

  window.enableSubmitButton = function () {
    if (current === steps.length - 1) {
      nextBtn.disabled = false;
    }
  };

  window.disableSubmitButton = function () {
    if (current === steps.length - 1) {
      nextBtn.disabled = true;
    }
  };

  function updateButtonState() {
    // Show/hide PREVIOUS button
    prevBtn.style.display = current === 0 ? "none" : "inline-block";
  
    if (current === steps.length - 1) {
      nextBtn.textContent = "SUBMIT";
      nextBtn.disabled = true; // Disabled until CAPTCHA is done
      nextBtn.onclick = async function () {
        if (!validateCurrentStep()) return;
        if (!isCaptchaCompleted()) {
          alert("Please complete the CAPTCHA before submitting.");
          return;
        }
        // Validate captcha with Lambda before showing signature modal
        const token = grecaptcha.getResponse();
        try {
          const res = await fetch(
            "https://zrsbahc7da.execute-api.us-east-2.amazonaws.com/default/captchaValidation",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ token }),
            }
          );
          const data = await res.json();
          if (res.ok && data.success) {
            showSignatureModal();
          } else {
            alert("CAPTCHA verification failed. Please try again.");
            grecaptcha.reset();
            nextBtn.disabled = false;
          }
        } catch (e) {
          alert("Error verifying CAPTCHA. Please try again.");
          grecaptcha.reset();
          nextBtn.disabled = false;
        }
      };
    } else {
      nextBtn.textContent = "NEXT";
      nextBtn.disabled = false;
      nextBtn.onclick = function () {
        nextStep();
      };
    }
  }
  

  function validateCurrentStep() {
    const currentStep = steps[current];
    const requiredFields = currentStep.querySelectorAll('input[required], textarea[required]');
    for (const field of requiredFields) {
      if (field.type === 'checkbox') {
        if (!field.checked) {
          alert("Please complete all required fields before proceeding.");
          field.focus();
          return false;
        }
      } else if (!field.value.trim()) {
        alert("Please fill in all required fields before proceeding.");
        field.focus();
        return false;
      }
    }

    const requiredRadioGroups = [
      'f_67343722',
      'f_67343723',
    ];

    for (const groupName of requiredRadioGroups) {
      const radios = currentStep.querySelectorAll(`input[name="${groupName}"]`);
      if (radios.length > 0 && !Array.from(radios).some(r => r.checked)) {
        alert("Please complete all required selections before proceeding.");
        return false;
      }
    }

    return true;
  }

  window.nextStep = function () {
    if (!validateCurrentStep()) return;
    if (current < steps.length - 1) {
      current++;
      showStep(current);
      if (current !== steps.length - 1 && grecaptcha) {
        grecaptcha.reset();
      }
    }
  };

  window.prevStep = function () {
    if (current > 0) {
      current--;
      showStep(current);
      if (current !== steps.length - 1 && grecaptcha) {
        grecaptcha.reset();
      }
    }
  };

  form.addEventListener("submit", function (e) {
    // Prevent default submission — we'll submit manually after signature
    e.preventDefault();
    if (!hiddenSignatureInput.value || !hiddenDateInput.value) {
      showSignatureModal();
    } else {
      form.submit(); // Already signed, just submit
    }
  });

  window.confirmSignature = function () {
    const signature = typedSignature.value.trim();
    if (!signature) {
      alert("Please type your full name to sign.");
      return;
    }

    hiddenSignatureInput.value = signature;
    const today = new Date().toISOString().split('T')[0];
    hiddenDateInput.value = today;

    modal.style.display = "none";

    form.submit(); // Submit form normally after signature
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
    modal.style.zIndex = "9999";
  }

  showStep(current);
});
