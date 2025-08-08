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

  // Change NEXT button to SUBMIT on last step
  function updateButtonState() {
    if (current === steps.length - 1) {
      nextBtn.textContent = "SUBMIT";
      nextBtn.onclick = function () {
        if (!validateCurrentStep()) return;
        showSignatureModal();
      };
    } else {
      nextBtn.textContent = "NEXT";
      nextBtn.onclick = function () {
        nextStep();
      };
    }
  }

  // Validation for current step's required fields
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

    // Check required radio groups explicitly
    const requiredRadioGroups = [
      'f_67343722', // Primary Shift
      'f_67343723', // Years of Clinical Experience
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
    }
  };

  window.prevStep = function () {
    if (current > 0) {
      current--;
      showStep(current);
    }
  };

  form.addEventListener("submit", function (e) {
    // Prevent form submission if signature or date are missing
    if (!hiddenSignatureInput.value || !hiddenDateInput.value) {
      e.preventDefault();
      showSignatureModal();
    }
  });

  window.confirmSignature = function () {
    const signature = typedSignature.value.trim();
    if (!signature) {
      alert("Please type your full name to sign.");
      return;
    }

    // Fill hidden fields
    hiddenSignatureInput.value = signature;
    const today = new Date().toISOString().split('T')[0];
    hiddenDateInput.value = today;

    // Hide modal and resubmit form
    modal.style.display = "none";
    form.submit();
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

  // Initial load
  showStep(current);
});
