(function () {
  'use strict';

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

  function initAverageAmericanTypewriter() {
    var el = $('#average-american-text');
    var cursor = $('.average-american-cursor');
    var section = $('#averageAmerican');
    if (!el || !cursor || !section) return;

    var full = 'The average american wastes $21 a month on unused subscriptions.';
    var i = 0;
    var started = false;

    function start() {
      if (started) return;
      started = true;

      function tick() {
        if (i >= full.length) {
          setTimeout(function () {
            cursor.style.animation = 'none';
            cursor.style.opacity = '0';
          }, 1800);
          return;
        }
        el.textContent += full.charAt(i);
        i++;
        setTimeout(tick, 45);
      }

      tick();
    }

    if ('IntersectionObserver' in window) {
      var observer = new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting) {
          start();
          observer.disconnect();
        }
      }, { threshold: 0.2 });
      observer.observe(section);
    } else {
      start();
    }
  }

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
      var from = current;
      cancelAnim = animateNumber(from, target, 380, function (v) {
        current = v;
        priceEl.textContent = '$' + v.toFixed(2);
      }, function () {
        current = target;
        priceEl.textContent = '$' + target.toFixed(2);
      });
    });
  }

  // ---------- waitlist → Formspree ----------
  function initWaitlist() {
    var form = $('#waitlistForm');
    if (!form) return;

    var submitBtn = $('#waitlistSubmit');
    var emailInput = form.querySelector('input[name="email"]');
    var successEl = $('#formSuccess');
    var errorEl = $('#formError');
    var tipEl = $('#formAlreadyTip');
    var wrap = $('#waitlistFormWrap');
    var FORMSPREE_URL = 'https://formspree.io/f/xppaqndr';
    var submitted = false;

    function lockForm() {
      submitted = true;
      form.classList.add('submitted');
      if (emailInput) {
        emailInput.disabled = true;
        emailInput.readOnly = true;
      }
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Joined';
        submitBtn.classList.add('btn-disabled');
      }
    }

    // Show tip on hover / focus of locked form controls
    function showTip() {
      if (!submitted || !tipEl) return;
      tipEl.hidden = false;
    }
    function hideTip() {
      if (!tipEl) return;
      tipEl.hidden = true;
    }

    if (wrap) {
      wrap.addEventListener('mouseenter', showTip);
      wrap.addEventListener('mouseleave', hideTip);
      wrap.addEventListener('focusin', showTip);
      wrap.addEventListener('focusout', function (e) {
        if (!wrap.contains(e.relatedTarget)) hideTip();
      });
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (submitted) return;

      if (errorEl) errorEl.hidden = true;

      var email = emailInput ? emailInput.value.trim() : '';
      if (!email) return;

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Joining…';
      }

      fetch(FORMSPREE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          email: email,
          _subject: 'ScriptSnipe waitlist signup'
        })
      })
        .then(function (res) {
          if (!res.ok) throw new Error('Formspree error');
          return res.json();
        })
        .then(function () {
          lockForm();
          if (successEl) successEl.hidden = false;
          if (errorEl) errorEl.hidden = true;
        })
        .catch(function () {
          if (errorEl) errorEl.hidden = false;
          if (submitBtn && !submitted) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Join Waitlist';
          }
        });
    });
  }

  function initKillButtons() {
    var leakEl = $('#leakAmount');
    var annualEl = $('#annualSavings');
    var list = $('#subsList');
    if (!leakEl || !annualEl || !list) return;

    var committedLeak = 118.99;
    var committedAnnual = 0;
    var displayLeak = 118.99;
    var displayAnnual = 0;
    var cancelAnim = null;

    function formatLeak(n) {
      return '$' + n.toFixed(2);
    }
    function formatAnnual(n) {
      return '$' + Math.round(n).toLocaleString('en-US');
    }

    function applyZeroState() {
      if (committedLeak <= 0.001) {
        leakEl.classList.add('zero');
        leakEl.textContent = '$0.00';
      } else {
        leakEl.classList.remove('zero');
      }
    }

    function pulse(el) {
      el.classList.remove('pulse');
      void el.offsetWidth;
      el.classList.add('pulse');
      setTimeout(function () {
        el.classList.remove('pulse');
      }, 280);
    }

    function animateToCommitted() {
      if (cancelAnim) cancelAnim();

      var fromL = displayLeak;
      var fromA = displayAnnual;
      var toL = committedLeak;
      var toA = committedAnnual;

      pulse(leakEl);
      pulse(annualEl);

      cancelAnim = animateNumber(0, 1, 500, function (t) {
        displayLeak = fromL + (toL - fromL) * t;
        displayAnnual = fromA + (toA - fromA) * t;
        leakEl.textContent = formatLeak(Math.max(0, displayLeak));
        annualEl.textContent = formatAnnual(displayAnnual);
      }, function () {
        displayLeak = toL;
        displayAnnual = toA;
        leakEl.textContent = formatLeak(Math.max(0, toL));
        annualEl.textContent = formatAnnual(toA);
        applyZeroState();
      });
    }

    list.addEventListener('click', function (e) {
      var btn = e.target.closest('.kill-btn');
      if (!btn || btn.classList.contains('killed') || btn.disabled) return;

      var row = btn.closest('.sub-row');
      if (!row) return;

      var amount = parseFloat(row.getAttribute('data-amount'));
      if (isNaN(amount) || amount <= 0) return;

      btn.classList.add('killed');
      btn.textContent = 'Killed';
      btn.disabled = true;
      row.classList.add('killed');

      committedLeak = Math.max(0, Math.round((committedLeak - amount) * 100) / 100);
      committedAnnual = Math.round((committedAnnual + amount * 12) * 100) / 100;

      animateToCommitted();
    });
  }

  function boot() {
    initTypewriter();
    initAverageAmericanTypewriter();
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
