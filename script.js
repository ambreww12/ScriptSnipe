// Typewriter effect
const typewriterText = document.getElementById('typewriter-text');
const fullText = 'Stop paying for\nsubscriptions you forgot';
let i = 0;
const speed = 55;

function typeWriter() {
  if (i < fullText.length) {
    const char = fullText.charAt(i);
    typewriterText.innerHTML += char === '\n' ? '<br>' : char;
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

// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const targetId = this.getAttribute('href');
    if (targetId === '#') return;
    const target = document.querySelector(targetId);
    if (target) {
      e.preventDefault();
      const navHeight = document.querySelector('.nav').offsetHeight;
      const top = target.getBoundingClientRect().top + window.pageYOffset - navHeight - 12;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

// ========== Pricing toggle ==========
const billingToggle = document.getElementById('billingToggle');
const proPriceDisplay = document.getElementById('proPriceDisplay');
const proPeriod = document.getElementById('proPeriod');
const labelMonthly = document.getElementById('label-monthly');
const labelYearly = document.getElementById('label-yearly');
const saveBadge = document.querySelector('.save-badge');

const MONTHLY = 2.99;
const YEARLY = 19.99;

let currentValue = MONTHLY;
let rafId = null;

function renderPrice(value) {
  proPriceDisplay.textContent = '$' + value.toFixed(2);
}

function tick(now) {
  if (!rafId) return;

  const start = tick.start;
  const from = tick.from;
  const to = tick.to;
  const duration = 380;

  const progress = Math.min((now - start) / duration, 1);
  const eased = 1 - Math.pow(1 - progress, 3);
  currentValue = from + (to - from) * eased;
  renderPrice(currentValue);

  if (progress < 1) {
    rafId = requestAnimationFrame(tick);
  } else {
    currentValue = to;
    renderPrice(to);
    rafId = null;
  }
}

function animateTo(to) {
  if (rafId) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }

  tick.from = currentValue;
  tick.to = to;
  tick.start = performance.now();
  rafId = requestAnimationFrame(tick);
}

function updatePricing() {
  const isYearly = billingToggle.checked;
  const next = isYearly ? YEARLY : MONTHLY;

  animateTo(next);
  proPeriod.textContent = isYearly ? '/yr' : '/mo';

  labelYearly.classList.toggle('active', isYearly);
  labelMonthly.classList.toggle('active', !isYearly);
  saveBadge.classList.toggle('active', isYearly);
}

billingToggle.addEventListener('change', updatePricing);

// Waitlist
document.getElementById('waitlistForm').addEventListener('submit', function (e) {
  e.preventDefault();
  this.hidden = true;
  document.getElementById('formSuccess').hidden = false;
  console.log('Waitlist signup:', this.querySelector('input[type="email"]').value);
});

// ========== Kill buttons + leakage counter ==========
const leakEl = document.getElementById('leakAmount');
const annualEl = document.getElementById('annualSavings');

let leakValue = 118.99;
let annualValue = 1428;
let leakRaf = null;

function formatMoney(n) {
  return '$' + n.toFixed(2);
}

function formatAnnual(n) {
  return '$' + Math.round(n).toLocaleString('en-US');
}

function animateLeak(to) {
  if (leakRaf) {
    cancelAnimationFrame(leakRaf);
    leakRaf = null;
  }

  const from = leakValue;
  const annualFrom = annualValue;
  const annualTo = to * 12;
  const start = performance.now();
  const duration = 500;

  function step(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);

    leakValue = from + (to - from) * eased;
    annualValue = annualFrom + (annualTo - annualFrom) * eased;

    leakEl.textContent = formatMoney(leakValue);
    annualEl.textContent = formatAnnual(annualValue);

    if (progress < 1) {
      leakRaf = requestAnimationFrame(step);
    } else {
      leakValue = to;
      annualValue = annualTo;
      leakEl.textContent = formatMoney(to);
      annualEl.textContent = formatAnnual(annualTo);
      leakRaf = null;
    }
  }

  leakRaf = requestAnimationFrame(step);
}

document.querySelectorAll('.kill-btn').forEach(btn => {
  btn.addEventListener('click', function () {
    const row = this.closest('.sub-row');
    if (!row || this.disabled) return;

    const amount = parseFloat(row.dataset.amount) || 0;

    this.textContent = 'Killed';
    this.style.background = '#22c55e';
    this.disabled = true;
    row.style.opacity = '0.55';

    const next = Math.max(0, leakValue - amount);
    animateLeak(next);
  });
});