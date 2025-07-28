
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
  
    form.addEventListener("submit", function (e) {
      if (!teamdeskSignature.value.trim()) {
        e.preventDefault();
        checkAgeAndShowModal();
      }
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
  });
  
  