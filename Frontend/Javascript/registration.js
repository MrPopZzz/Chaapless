document.addEventListener('DOMContentLoaded', function() {
  const registrationForm = document.getElementById('registration-form');

  registrationForm.addEventListener('submit', function(e) {
    e.preventDefault();

    window.location.href = "/HTML/subscription.html";
  });
});
  
    
  
