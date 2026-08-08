// Typewriter effect for the hero headline
const typewriterText = document.getElementById('typewriter-text');
const fullText = 'Stop paying for\nsubscriptions you forgot';
let i = 0;
const speed = 55; // ms per character

function typeWriter() {
  if (i < fullText.length) {
    const char = fullText.charAt(i);
    if (char === '\n') {
      typewriterText.innerHTML += '<br>';
    } else {
      typewriterText.innerHTML += char;
    }
    i++;
    setTimeout(typeWriter, speed);
  } else {
    // Optional: stop the cursor blinking after a short delay
    setTimeout(() => {
      const cursor = document.querySelector('.cursor');
      if (cursor) cursor.style.animation = 'none';
      if (cursor) cursor.style.opacity = '0';
    }, 1800);
  }
}

// Start typing after a tiny delay so the page feels ready
setTimeout(typeWriter, 400);

// Smooth scroll for navigation links (accounts for sticky nav height)
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const targetId = this.getAttribute('href');
    if (targetId === '#') return;

    const target = document.querySelector(targetId);
    if (target) {
      e.preventDefault();

      const navHeight = document.querySelector('.nav').offsetHeight;
      const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navHeight - 12;

      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    }
  });
});

// Waitlist form
document.getElementById('waitlistForm').addEventListener('submit', function (e) {
  e.preventDefault();
  const form = e.target;
  const success = document.getElementById('formSuccess');

  form.hidden = true;
  success.hidden = false;

  const email = form.querySelector('input[type="email"]').value;
  console.log('Waitlist signup:', email);
});

// Mock Kill buttons interaction
document.querySelectorAll('.kill-btn').forEach(btn => {
  btn.addEventListener('click', function () {
    const row = this.closest('.sub-row');
    this.textContent = 'Killed';
    this.style.background = '#22c55e';
    this.disabled = true;
    row.style.opacity = '0.55';
  });
});