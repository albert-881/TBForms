document.addEventListener("DOMContentLoaded", function () {
  const steps = document.querySelectorAll('.step-section');
  const progressItems = document.querySelectorAll('.progressbar li');
  let current = 0;

  const form = document.querySelector("form[name='frm']");
  const modal = document.getElementById("signatureModal");
  const typedSignature = document.getElementById("typed-signature");
  const hiddenSignatureInput = document.getElementById("f_67469649_ID0EWAAC");
  const hiddenDateInput = document.getElementById("f_67469650_ID0EGBAC");

  const prevBtn = document.getElementById("prevBtn");
  const nextSubmitBtn = document.getElementById("nextSubmitBtn");

  function showStep(step) {
    steps.forEach((s, i) => s.classList.toggle('active', i === step));
    progressItems.forEach((p, i) => p.classList.toggle('active', i <= step));

    // Show or hide PREVIOUS button
    prevBtn.style.display = step === 0 ? "none" : "inline-block";

    // Change NEXT button text to SUBMIT on last step
    if (step === steps.length - 1) {
      nextSubmitBtn.textContent = "SUBMIT";
    } else {
      nextSubmitBtn.textContent = "NEXT";
    }
  }

  function validateStep() {
    const inputs = steps[current].querySelectorAll("input, textarea");
    for (const input of inputs) {
      if (input.type === "radio") {
        const group = steps[current].querySelectorAll(`input[name='${input.name}']`);
        if (![...group].some(r => r.checked)) {
          alert("Please answer all required questions.");
          return false;
        }
      } else if (input.hasAttribute("required") && !input.value) {
        alert("Please complete all required fields before continuing.");
        return false;
      }
    }
    return true;
  }

  window.nextStep = function () {
    if (!validateStep()) return;
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

  window.handleNextOrSubmit = function () {
    if (!validateStep()) return;

    if (current === steps.length - 1) {
      // Last step, submit form if signature filled, else show signature modal
      if (!hiddenSignatureInput.value || !hiddenDateInput.value) {
        showSignatureModal();
      } else {
        form.submit();
      }
    } else {
      current++;
      showStep(current);
    }
  };

  form.addEventListener("submit", function (e) {
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

    hiddenSignatureInput.value = signature;
    const today = new Date().toISOString().split('T')[0];
    hiddenDateInput.value = today;

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

  showStep(current);
});
