document.addEventListener("DOMContentLoaded", function () {
    const steps = document.querySelectorAll('.step-section');
    const progressItems = document.querySelectorAll('.progressbar li');
    let current = 0;
  
    const form = document.querySelector("form[name='frm']");
    const modal = document.getElementById("signatureModal");
    const typedSignature = document.getElementById("typed-signature");
    const hiddenSignatureInput = document.getElementById("f_67469649_ID0EWAAC");
    const hiddenDateInput = document.getElementById("f_67469650_ID0EGBAC");
  
    function showStep(step) {
      steps.forEach((s, i) => s.classList.toggle('active', i === step));
      progressItems.forEach((p, i) => p.classList.toggle('active', i <= step));
    }
  
    window.nextStep = function () {
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
  
    showStep(current);
  
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
  });
  