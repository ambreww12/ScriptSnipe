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

let proCurrent = MONTHLY;
let proRaf = null;

function renderPro(value) {
  proPriceDisplay.textContent = '$' + value.toFixed(2);
}

function animatePro(to) {
  if (proRaf) cancelAnimationFrame(proRaf);
  const from = proCurrent;
  const start = performance.now();
  const duration = 380;

  function step(now) {
    const t = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - t, 3);
    proCurrent = from + (to - from) * eased;
    renderPro(proCurrent);
    if (t < 1) {
      proRaf = requestAnimationFrame(step);
    } else {
      proCurrent = to;
      renderPro(to);
      proRaf = null;
    }
  }
  proRaf = requestAnimationFrame(step);
}

function updatePricing() {
  const isYearly = billingToggle.checked;
  animatePro(isYearly ? YEARLY : MONTHLY);
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
});

// ========== Kill buttons ==========
const leakEl = document.getElementById('leakAmount');
const annualEl = document.getElementById('annualSavings');

let leakValue = 118.99;
let annualValue = 0;
let moneyRaf = null;

function formatLeak(n) {
  return '$' + n.toFixed(2);
}

function formatAnnual(n) {
  return '$' + Math.round(n).toLocaleString('en-US');
}

function pulse(el) {
  el.classList.remove('pulse');
  // force reflow so animation can replay
  void el.offsetWidth;
  el.classList.add('pulse');
  setTimeout(() => el.classList.remove('pulse'), 220);
}

function animateMoney(leakTo, annualTo) {
  if (moneyRaf) cancelAnimationFrame(moneyRaf);

  const leakFrom = leakValue;
  const annualFrom = annualValue;
  const start = performance.now();
  const duration = 550;

  function step(now) {
    const t = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - t, 3);

    leakValue = leakFrom + (leakTo - leakFrom) * eased;
    annualValue = annualFrom + (annualTo - annualFrom) * eased;

    leakEl.textContent = formatLeak(leakValue);
    annualEl.textContent = formatAnnual(annualValue);

    if (t < 1) {
      moneyRaf = requestAnimationFrame(step);
    } else {
      leakValue = leakTo;
      annualValue = annualTo;
      leakEl.textContent = formatLeak(leakTo);
      annualEl.textContent = formatAnnual(annualTo);
      moneyRaf = null;
    }
  }

  moneyRaf = requestAnimationFrame(step);
  pulse(leakEl);
  pulse(annualEl);
}

document.querySelectorAll('.kill-btn').forEach(btn => {
  btn.addEventListener('click', function () {
    if (this.disabled) return;

    const row = this.closest('.sub-row');
    const amount = parseFloat(row.getAttribute('data-amount')) || 0;

    // Button: fixed size, slowly turns green, text becomes Killed
    this.disabled = true;
    this.classList.add('killed');
    this.textContent = 'Killed';

    // Row fades
    row.classList.add('killed');

    // Numbers: leakage down, annual savings up
    const nextLeak = Math.max(0, +(leakValue - amount).toFixed(2));
    const nextAnnual = +(annualValue + amount * 12).toFixed(2);
    animateMoney(nextLeak, nextAnnual);
  });
});