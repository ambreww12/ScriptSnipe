document.getElementById('waitlistForm').addEventListener('submit', function (e) {
  e.preventDefault();
  const form = e.target;
  const success = document.getElementById('formSuccess');

  // For now just show success (replace with real backend later)
  form.hidden = true;
  success.hidden = false;

  // Optional: log email for testing
  const email = form.querySelector('input[type="email"]').value;
  console.log('Waitlist signup:', email);
});

// Tiny interaction on the mock Kill buttons
document.querySelectorAll('.kill-btn').forEach(btn => {
  btn.addEventListener('click', function () {
    const row = this.closest('.sub-row');
    this.textContent = 'Killed';
    this.style.background = '#22c55e';
    this.disabled = true;
    row.style.opacity = '0.55';
  });
});