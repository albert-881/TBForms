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

  function enableSubmitButton() {
    if (current === steps.length - 1) {
      nextSubmitBtn.disabled = false;
    }
  }

  function disableSubmitButton() {
    if (current === steps.length - 1) {
      nextSubmitBtn.disabled = true;
    }
  }

  function showStep(step) {
    steps.forEach((s, i) => s.classList.toggle('active', i === step));
    progressItems.forEach((p, i) => p.classList.toggle('active', i <= step));

    prevBtn.style.display = step === 0 ? "none" : "inline-block";

    if (step === steps.length - 1) {
      nextSubmitBtn.textContent = "SUBMIT";
      nextSubmitBtn.disabled = true; // disable initially
    } else {
      nextSubmitBtn.textContent = "NEXT";
      nextSubmitBtn.disabled = false;
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
      grecaptcha.reset();
      disableSubmitButton();
    }
  };

  window.prevStep = function () {
    if (current > 0) {
      current--;
      showStep(current);
      grecaptcha.reset();
      disableSubmitButton();
    }
  };

  window.handleNextOrSubmit = function () {
    if (!validateStep()) return;

    if (current === steps.length - 1) {
      // Last step, check signature then verify captcha and submit
      if (!hiddenSignatureInput.value || !hiddenDateInput.value) {
        showSignatureModal();
      } else {
        verifyCaptchaAndSubmit();
      }
    } else {
      current++;
      showStep(current);
      grecaptcha.reset();
      disableSubmitButton();
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

    verifyCaptchaAndSubmit();
  };

  async function verifyCaptchaAndSubmit() {
    const captchaToken = grecaptcha.getResponse();
    if (!captchaToken) {
      alert("Please complete the CAPTCHA.");
      return;
    }

    try {
      nextSubmitBtn.disabled = true;
      nextSubmitBtn.textContent = "Verifying CAPTCHA...";

      const response = await fetch('https://zrsbahc7da.execute-api.us-east-2.amazonaws.com/default/captchaValidation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: captchaToken }),
      });

      if (!response.ok) throw new Error(`Server error: ${response.status}`);

      const result = await response.json();

      if (result.success) {
        nextSubmitBtn.textContent = "Submitting form...";
        form.submit();
      } else {
        alert("CAPTCHA verification failed: " + (result.message || "Unknown error"));
        grecaptcha.reset();
        nextSubmitBtn.disabled = false;
        nextSubmitBtn.textContent = "SUBMIT";
      }
    } catch (error) {
      alert("Error verifying CAPTCHA: " + error.message);
      grecaptcha.reset();
      nextSubmitBtn.disabled = false;
      nextSubmitBtn.textContent = "SUBMIT";
    }
  }

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

  // Expose enable/disable so Google can call them on captcha callbacks
  window.enableSubmitButton = enableSubmitButton;
  window.disableSubmitButton = disableSubmitButton;

  showStep(current);
});
