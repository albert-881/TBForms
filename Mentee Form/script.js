document.addEventListener("DOMContentLoaded", function () {
  const steps = document.querySelectorAll('.step-section');
  const progressItems = document.querySelectorAll('.progressbar li');
  let current = 0;

  const form = document.querySelector("form[name='frm']");
  const modal = document.getElementById("signatureModal");
  const typedSignature = document.getElementById("typed-signature");
  const signatureDateInput = document.getElementById("signature-date");
  const hiddenSignatureInput = document.getElementById("f_67469649_ID0EWAAC");
  const hiddenDateInput = document.getElementById("f_67469650_ID0EGBAC");

  const prevBtn = document.getElementById("prevBtn");
  const nextSubmitBtn = document.getElementById("nextSubmitBtn");

  function showStep(step) {
    steps.forEach((s, i) => s.classList.toggle('active', i === step));
    progressItems.forEach((p, i) => p.classList.toggle('active', i <= step));

    prevBtn.style.display = step === 0 ? "none" : "inline-block";

    nextSubmitBtn.textContent = step === steps.length - 1 ? "SUBMIT" : "NEXT";
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
      } else if (input.hasAttribute("required") && !input.value.trim()) {
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

  // Check if captcha completed
  function isCaptchaCompleted() {
    return grecaptcha && grecaptcha.getResponse().length > 0;
  }

  // Verify CAPTCHA token by sending to your Lambda
  async function verifyCaptcha(token) {
    try {
      const res = await fetch('https://zrsbahc7da.execute-api.us-east-2.amazonaws.com/default/captchaValidation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      if (!res.ok) throw new Error(`Captcha verification failed: ${res.status}`);
      const data = await res.json();
      return data.success;
    } catch (err) {
      alert("Captcha verification error: " + err.message);
      return false;
    }
  }

  // This replaces your old handleNextOrSubmit, integrates captcha verify before showing signature modal
  window.handleNextOrSubmit = async function () {
    if (!validateStep()) return;

    if (current === steps.length - 1) {
      // Check CAPTCHA before showing signature modal
      if (!isCaptchaCompleted()) {
        alert("Please complete the CAPTCHA before submitting.");
        return;
      }
      const captchaToken = grecaptcha.getResponse();
      const verified = await verifyCaptcha(captchaToken);
      if (!verified) {
        grecaptcha.reset();
        alert("Captcha verification failed. Please try again.");
        return;
      }

      // If signature info missing, show modal, else submit directly
      if (!hiddenSignatureInput.value || !hiddenDateInput.value) {
        showSignatureModal();
      } else {
        await sendFormData();
      }
    } else {
      current++;
      showStep(current);
    }
  };

  form.addEventListener("submit", function (e) {
    e.preventDefault(); // Prevent default submit

    // If signature missing, show modal
    if (!hiddenSignatureInput.value || !hiddenDateInput.value) {
      showSignatureModal();
    } else {
      sendFormData();
    }
  });

  window.confirmSignature = function () {
    const signature = typedSignature.value.trim();
    const signatureDate = signatureDateInput.value;
    if (!signature) {
      alert("Please type your full name to sign.");
      return;
    }
    if (!signatureDate) {
      alert("Please select the date.");
      return;
    }

    hiddenSignatureInput.value = signature;
    hiddenDateInput.value = signatureDate;

    modal.style.display = "none";

    sendFormData();
  };

  async function sendFormData() {
    const formData = new FormData(form);

    // Append captcha token
    const captchaToken = grecaptcha.getResponse();
    if (!captchaToken) {
      alert("Please complete the CAPTCHA.");
      return;
    }
    formData.append('g-recaptcha-response', captchaToken);

    const dataObj = {};
    formData.forEach((value, key) => {
      dataObj[key] = value;
    });

    try {
      nextSubmitBtn.disabled = true;
      nextSubmitBtn.textContent = "Submitting...";

      const response = await fetch('https://zrsbahc7da.execute-api.us-east-2.amazonaws.com/default/captchaValidation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataObj),
      });

      if (!response.ok) throw new Error(`Server error: ${response.status}`);

      const result = await response.json();

      if (result.success) {
        alert("Form submitted successfully!");
        window.location.href = "https://albert-881.github.io/TBForms/Mentee%20Form/thankyou.html";
      } else {
        alert("Submission failed: " + (result.message || "Unknown error"));
        grecaptcha.reset();
        nextSubmitBtn.disabled = false;
        nextSubmitBtn.textContent = "SUBMIT";
      }
    } catch (error) {
      alert("Submission error: " + error.message);
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

  showStep(current);
});
