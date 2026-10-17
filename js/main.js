/* ============================================
   夜嶼靜心 · 睡前正念療癒誌 主腳本
   功能：睡前夜色/日間模式切換 / 導覽列 / Web Audio 低頻助眠頌缽 / 4-6 助眠呼吸與靜音入睡計時器
   ============================================ */

(function () {
  'use strict';

  // ---------- 1. 睡前夜色 / 日間暖紙模式切換 ----------
  const themeToggle = document.getElementById('themeToggle');
  function updateThemeButton() {
    if (!themeToggle) return;
    const current = document.documentElement.getAttribute('data-theme') || 'night';
    if (current === 'night') {
      themeToggle.textContent = '🌙 夜色護眼';
      themeToggle.title = '目前為睡前低藍光夜色模式，點擊可切換為日間暖紙模式';
    } else {
      themeToggle.textContent = '☀️ 日間暖紙';
      themeToggle.title = '目前為日間暖紙模式，點擊可切換為睡前低藍光夜色模式';
    }
  }
  updateThemeButton();

  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      const current = document.documentElement.getAttribute('data-theme') || 'night';
      const next = current === 'night' ? 'day' : 'night';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('mindful_theme', next);
      updateThemeButton();
    });
  }

  // ---------- 2. 導覽列滾動效果 ----------
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    const handleNavScroll = function () {
      if (window.scrollY > 10) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    };
    handleNavScroll();
    window.addEventListener('scroll', handleNavScroll, { passive: true });
  }

  // ---------- 3. 行動端選單 ----------
  const menuToggle = document.querySelector('.menu-toggle');
  const navLinks = document.querySelector('.navbar-links');

  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', function () {
      const isOpen = navLinks.classList.toggle('open');
      const icons = menuToggle.querySelectorAll('svg');
      icons.forEach(function (icon) {
        icon.style.display = isOpen
          ? icon.dataset.icon === 'close' ? 'block' : 'none'
          : icon.dataset.icon === 'menu' ? 'block' : 'none';
      });
      menuToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
  }

  // ---------- 4. 回到頂部按鈕 ----------
  const backToTop = document.querySelector('.back-to-top');
  if (backToTop) {
    const handleBackToTopScroll = function () {
      if (window.scrollY > 400) {
        backToTop.classList.add('visible');
      } else {
        backToTop.classList.remove('visible');
      }
    };
    handleBackToTopScroll();
    window.addEventListener('scroll', handleBackToTopScroll, { passive: true });

    backToTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ---------- 5. 滾動淡入動畫 ----------
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    document.querySelectorAll('.scroll-fade').forEach(function (el) {
      el.style.opacity = '0';
      el.style.transform = 'translateY(18px)';
      el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      observer.observe(el);
    });
  }

  // ---------- 6. 微信社群彈窗 ----------
  const wechatBtn = document.getElementById('wechatBtn');
  const wechatModal = document.getElementById('wechatModal');
  const wechatModalClose = document.getElementById('wechatModalClose');

  if (wechatBtn && wechatModal) {
    wechatBtn.addEventListener('click', function (e) {
      e.preventDefault();
      wechatModal.classList.add('active');
    });
    if (wechatModalClose) {
      wechatModalClose.addEventListener('click', function () {
        wechatModal.classList.remove('active');
      });
    }
    wechatModal.addEventListener('click', function (e) {
      if (e.target === wechatModal) {
        wechatModal.classList.remove('active');
      }
    });
  }

  // ---------- 7. Web Audio 合成溫柔睡前低頻頌缽泛音 ----------
  function playSingingBowl() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      // 睡前溫暖低頻泛音列（174Hz / 285Hz / 432Hz 舒緩頻率）
      const freqs = [174, 285, 432];
      const gains = [0.20, 0.12, 0.05];

      freqs.forEach(function (freq, idx) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.exponentialRampToValueAtTime(gains[idx], now + 0.12);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 6.0);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 6.2);
      });
    } catch (e) {
      // 忽略瀏覽器音效限制錯誤
    }
  }

  // ---------- 8. 內建 10~15 分鐘睡前冥想計時器與 4-6 助眠呼吸 ----------
  const timerCard = document.getElementById('mindfulTimer');
  if (timerCard) {
    const displayEl = document.getElementById('timerDisplay');
    const startBtn = document.getElementById('timerStartBtn');
    const resetBtn = document.getElementById('timerResetBtn');
    const bellBtn = document.getElementById('timerBellBtn');
    const silentEndCheck = document.getElementById('silentEndCheck');
    const visualizer = document.getElementById('breathVisualizer');
    const breathLabel = document.getElementById('breathLabel');
    const presetBtns = timerCard.querySelectorAll('.preset-btn');

    let selectedMinutes = 12;
    let remainingSeconds = selectedMinutes * 60;
    let timerInterval = null;
    let breathInterval = null;
    let isRunning = false;

    function formatTime(secs) {
      const m = Math.floor(secs / 60);
      const s = secs % 60;
      return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
    }

    function updateDisplay() {
      if (displayEl) {
        displayEl.textContent = formatTime(remainingSeconds);
      }
    }

    function startBreathingGuide() {
      if (!visualizer || !breathLabel) return;
      visualizer.classList.add('active');
      let cycleSec = 0;
      breathLabel.textContent = '吸氣 4秒';
      breathInterval = setInterval(function () {
        cycleSec = (cycleSec + 1) % 10;
        if (cycleSec < 4) {
          breathLabel.textContent = '鼻吸氣 (' + (4 - cycleSec) + ')';
        } else {
          breathLabel.textContent = '慢吐氣 (' + (10 - cycleSec) + ')';
        }
      }, 1000);
    }

    function stopBreathingGuide() {
      if (breathInterval) {
        clearInterval(breathInterval);
        breathInterval = null;
      }
      if (visualizer) visualizer.classList.remove('active');
      if (breathLabel) breathLabel.textContent = '吸 4 · 吐 6';
    }

    presetBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (isRunning) {
          clearInterval(timerInterval);
          isRunning = false;
          startBtn.textContent = '開始睡前冥想';
          stopBreathingGuide();
        }
        presetBtns.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        selectedMinutes = parseInt(btn.getAttribute('data-minutes'), 10) || 12;
        remainingSeconds = selectedMinutes * 60;
        updateDisplay();
      });
    });

    if (startBtn) {
      startBtn.addEventListener('click', function () {
        if (!isRunning) {
          if (remainingSeconds <= 0) {
            remainingSeconds = selectedMinutes * 60;
          }
          isRunning = true;
          startBtn.textContent = '暫停冥想';
          playSingingBowl();
          startBreathingGuide();

          timerInterval = setInterval(function () {
            remainingSeconds -= 1;
            updateDisplay();
            if (remainingSeconds <= 0) {
              clearInterval(timerInterval);
              isRunning = false;
              startBtn.textContent = '開始睡前冥想';
              stopBreathingGuide();
              if (breathLabel) breathLabel.textContent = '晚安好眠 🌙';
              // 若未勾選「結束時靜音直接入睡」，才敲響結束頌缽
              if (!silentEndCheck || !silentEndCheck.checked) {
                playSingingBowl();
              }
            }
          }, 1000);
        } else {
          clearInterval(timerInterval);
          isRunning = false;
          startBtn.textContent = '繼續冥想';
          stopBreathingGuide();
        }
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener('click', function () {
        if (timerInterval) clearInterval(timerInterval);
        isRunning = false;
        remainingSeconds = selectedMinutes * 60;
        updateDisplay();
        if (startBtn) startBtn.textContent = '開始睡前冥想';
        stopBreathingGuide();
      });
    }

    if (bellBtn) {
      bellBtn.addEventListener('click', function () {
        playSingingBowl();
      });
    }
  }
})();
