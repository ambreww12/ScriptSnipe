// Typewriter effect for the hero headline
const typewriterText = document.getElementById('typewriter-text');
const fullText = 'Stop paying for\nsubscriptions you forgot';
let i = 0;
const speed = 55;

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
    setTimeout(() => {
      const cursor = document.querySelector('.cursor');
      if (cursor) {
        cursor.style.animation = 'none';
        cursor.style.opacity = '0';
      }
    }, 1800);
  }
}

setTimeout(typeWriter, 400);

// Smooth scroll for navigation links
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

// ========== Pricing Toggle + Number Counter ==========
const billingToggle = document.getElementById('billingToggle');
const proAmount = document.getElementById('proAmount');
const proPeriod = document.getElementById('proPeriod');
const labelMonthly = document.getElementById('label-monthly');
const labelYearly = document.getElementById('label-yearly');

let displayedPrice = 2.99;
let animationId = null;

function animatePrice(to, duration = 400) {
  // Cancel any running animation
  if (animationId) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }

  const from = displayedPrice;
  const start = performance.now();
  const diff = to - from;

  function tick(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
    const value = from + diff * eased;

    displayedPrice = value;
    proAmount.textContent = value.toFixed(2);

    if (progress < 1) {
      animationId = requestAnimationFrame(tick);
    } else {
      displayedPrice = to;
      proAmount.textContent = to.toFixed(2);
      animationId = null;
    }
  }

  animationId = requestAnimationFrame(tick);
}

function updatePricing() {
  const isYearly = billingToggle.checked;
  const target = isYearly ? 19.99 : 2.99;

  animatePrice(target);
  proPeriod.textContent = isYearly ? '/yr' : '/mo';

  if (isYearly) {
    labelYearly.classList.add('active');
    labelMonthly.classList.remove('active');
  } else {
    labelMonthly.classList.add('active');
    labelYearly.classList.remove('active');
  }
}

billingToggle.addEventListener('change', updatePricing);

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

// Mock Kill buttons
document.querySelectorAll('.kill-btn').forEach(btn => {
  btn.addEventListener('click', function () {
    const row = this.closest('.sub-row');
    this.textContent = 'Killed';
    this.style.background = '#22c55e';
    this.disabled = true;
    row.style.opacity = '0.55';
  });
});