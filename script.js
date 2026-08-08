(function () {
  'use strict';

  // ---------- helpers ----------
  function $(sel, root) {
    return (root || document).querySelector(sel);
  }
  function $$(sel, root) {
    return Array.from((root || document).querySelectorAll(sel));
  }

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function animateNumber(from, to, duration, onUpdate, onDone) {
    var start = null;
    var raf = null;
    function frame(now) {
      if (start === null) start = now;
      var t = Math.min((now - start) / duration, 1);
      var value = from + (to - from) * easeOutCubic(t);
      onUpdate(value);
      if (t < 1) {
        raf = requestAnimationFrame(frame);
      } else {
        onUpdate(to);
        if (onDone) onDone();
      }
    }
    raf = requestAnimationFrame(frame);
    return function cancel() {
      if (raf) cancelAnimationFrame(raf);
    };
  }

  // ---------- typewriter ----------
  function initTypewriter() {
    var el = $('#typewriter-text');
    if (!el) return;
    var full = 'Stop paying for\nsubscriptions you forgot';
    var i = 0;
    function tick() {
      if (i >= full.length) {
        setTimeout(function () {
          var c = $('.cursor');
          if (c) {
            c.style.animation = 'none';
            c.style.opacity = '0';
          }
        }, 1800);
        return;
      }
      var ch = full.charAt(i);
      el.innerHTML += ch === '\n' ? '<br>' : ch;
      i++;
      setTimeout(tick, 55);
    }
    setTimeout(tick, 400);
  }

  // ---------- smooth scroll ----------
  function initSmoothScroll() {
    $$('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var id = a.getAttribute('href');
        if (!id || id === '#') return;
        var target = $(id);
        if (!target) return;
        e.preventDefault();
        var nav = $('.nav');
        var offset = nav ? nav.offsetHeight + 12 : 12;
        var top = target.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({ top: top, behavior: 'smooth' });
      });
    });
  }

  // ---------- pricing toggle ----------
  function initPricing() {
    var toggle = $('#billingToggle');
    var priceEl = $('#proPriceDisplay');
    var periodEl = $('#proPeriod');
    var labelM = $('#label-monthly');
    var labelY = $('#label-yearly');
    var badge = $('#saveBadge');
    if (!toggle || !priceEl) return;

    var current = 2.99;
    var cancelAnim = null;

    function setLabels(yearly) {
      if (labelY) labelY.classList.toggle('active', yearly);
      if (labelM) labelM.classList.toggle('active', !yearly);
      if (badge) badge.classList.toggle('active', yearly);
      if (periodEl) periodEl.textContent = yearly ? '/yr' : '/mo';
    }

    toggle.addEventListener('change', function () {
      var yearly = toggle.checked;
      var target = yearly ? 19.99 : 2.99;
      setLabels(yearly);
      if (cancelAnim) cancelAnim();
      cancelAnim = animateNumber(current, target, 380, function (v) {
        current = v;
        priceEl.textContent = '$' + v.toFixed(2);
      });
    });
  }

  // ---------- waitlist ----------
  function initWaitlist() {
    var form = $('#waitlistForm');
    if (!form) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      form.hidden = true;
      var ok = $('#formSuccess');
      if (ok) ok.hidden = false;
    });
  }

  // ---------- KILL BUTTONS (the important part) ----------
  function initKillButtons() {
    var leakEl = $('#leakAmount');
    var annualEl = $('#annualSavings');
    var list = $('#subsList');
    if (!leakEl || !annualEl || !list) {
      console.warn('Kill UI elements missing');
      return;
    }

    var leak = 118.99;
    var annual = 0;
    var cancelAnim = null;

    function formatLeak(n) {
      return '$' + n.toFixed(2);
    }
    function formatAnnual(n) {
      return '$' + Math.round(n).toLocaleString('en-US');
    }

    function pulse(el) {
      el.classList.remove('pulse');
      void el.offsetWidth;
      el.classList.add('pulse');
      setTimeout(function () {
        el.classList.remove('pulse');
      }, 280);
    }

    function updateMoney(nextLeak, nextAnnual) {
      if (cancelAnim) cancelAnim();
      var fromL = leak;
      var fromA = annual;
      pulse(leakEl);
      pulse(annualEl);
      cancelAnim = animateNumber(0, 1, 550, function (t) {
        // t goes 0→1; interpolate both
        leak = fromL + (nextLeak - fromL) * t;
        annual = fromA + (nextAnnual - fromA) * t;
        leakEl.textContent = formatLeak(leak);
        annualEl.textContent = formatAnnual(annual);
      }, function () {
        leak = nextLeak;
        annual = nextAnnual;
        leakEl.textContent = formatLeak(leak);
        annualEl.textContent = formatAnnual(annual);
      });
    }

    // Event delegation — works even if buttons are re-rendered
    list.addEventListener('click', function (e) {
      var btn = e.target.closest('.kill-btn');
      if (!btn || btn.classList.contains('killed') || btn.disabled) return;

      var row = btn.closest('.sub-row');
      if (!row) return;

      var amount = parseFloat(row.getAttribute('data-amount'));
      if (isNaN(amount) || amount <= 0) return;

      // Button: fixed size, slowly turns green
      btn.classList.add('killed');
      btn.textContent = 'Killed';
      btn.disabled = true;

      // Row fades
      row.classList.add('killed');

      // Leakage DOWN, annual savings UP
      var nextLeak = Math.max(0, Math.round((leak - amount) * 100) / 100);
      var nextAnnual = Math.round((annual + amount * 12) * 100) / 100;
      updateMoney(nextLeak, nextAnnual);
    });
  }

  // ---------- boot ----------
  function boot() {
    initTypewriter();
    initSmoothScroll();
    initPricing();
    initWaitlist();
    initKillButtons();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
