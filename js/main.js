/* ============================================
   夜嶼靜心 · 睡前正念療癒誌 主腳本
   功能：睡前夜色/日間模式切換 / 導覽列 / Web Audio 低頻助眠頌缽 / 閉眼語音引導與 4-6 助眠呼吸計時器
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
  function playSingingBowl(volumeScale) {
    const scale = typeof volumeScale === 'number' ? volumeScale : 1.0;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      // 睡前溫暖低頻泛音列（174Hz / 285Hz / 432Hz 舒緩頻率）
      const freqs = [174, 285, 432];
      const gains = [0.20 * scale, 0.12 * scale, 0.05 * scale];

      freqs.forEach(function (freq, idx) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.exponentialRampToValueAtTime(Math.max(gains[idx], 0.002), now + 0.15);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 5.8);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 6.0);
      });
    } catch (e) {
      // 忽略瀏覽器音效限制錯誤
    }
  }

  // ---------- 8. Web Speech API 溫柔慢速語音引導器 ----------
  let speechTimeoutIds = [];

  function stopGentleSpeech() {
    speechTimeoutIds.forEach(function (id) {
      clearTimeout(id);
    });
    speechTimeoutIds = [];
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  function pickGentleChineseVoice() {
    if (!('speechSynthesis' in window)) return null;
    const voices = window.speechSynthesis.getVoices() || [];
    const zhVoices = voices.filter(function (v) {
      return v.lang && (v.lang.toLowerCase().indexOf('zh') !== -1 || v.lang.toLowerCase().indexOf('cmn') !== -1);
    });
    if (zhVoices.length === 0) return null;

    // 優先挑選自然溫柔女聲（如 Xiaoxiao, HsiaoChen, Mei-Jia, Tingting, Google 國語/普通話）
    const preferredKeywords = ['xiaoxiao', 'hsiaochen', 'xiaoyi', 'yunxi', 'mei-jia', 'meijia', 'ting-ting', 'tingting', 'natural', 'google'];
    for (let i = 0; i < preferredKeywords.length; i++) {
      const kw = preferredKeywords[i];
      const match = zhVoices.find(function (v) {
        return v.name.toLowerCase().indexOf(kw) !== -1;
      });
      if (match) return match;
    }
    return zhVoices[0];
  }

  if ('speechSynthesis' in window && window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = function () {
      pickGentleChineseVoice();
    };
  }

  function speakGentlePrompt(text) {
    if (!('speechSynthesis' in window) || !text) return;
    stopGentleSpeech();

    // 將句子依句號、分號或刪節號拆開，句子之間留出 1.6 秒的呼吸留白
    const sentences = text
      .replace(/[「」“”]/g, '')
      .split(/[。；！…]+/)
      .map(function (s) { return s.trim(); })
      .filter(function (s) { return s.length > 0; });

    const voice = pickGentleChineseVoice();

    function speakIndex(idx) {
      if (idx >= sentences.length) return;
      const utter = new SpeechSynthesisUtterance(sentences[idx]);
      if (voice) utter.voice = voice;
      utter.lang = voice ? voice.lang : 'zh-TW';
      utter.rate = 0.80;   // 睡前放慢語速
      utter.pitch = 0.92;  // 溫潤略低的聲線
      utter.volume = 0.85;

      utter.onend = function () {
        if (idx + 1 < sentences.length) {
          const tid = setTimeout(function () {
            speakIndex(idx + 1);
          }, 1600);
          speechTimeoutIds.push(tid);
        }
      };
      window.speechSynthesis.speak(utter);
    }

    speakIndex(0);
  }

  // ---------- 9. 內建 10~15 分鐘睡前冥想計時器與分段引導 ----------
  const timerCard = document.getElementById('mindfulTimer');
  if (timerCard) {
    const displayEl = document.getElementById('timerDisplay');
    const startBtn = document.getElementById('timerStartBtn');
    const resetBtn = document.getElementById('timerResetBtn');
    const bellBtn = document.getElementById('timerBellBtn');
    const testVoiceBtn = document.getElementById('testVoiceBtn');
    const silentEndCheck = document.getElementById('silentEndCheck');
    const visualizer = document.getElementById('breathVisualizer');
    const breathLabel = document.getElementById('breathLabel');
    const liveStageTag = document.getElementById('liveStageTag');
    const liveGuidanceText = document.getElementById('liveGuidanceText');
    const presetBtns = timerCard.querySelectorAll('.preset-btn');
    const modeBtns = timerCard.querySelectorAll('.mode-btn');

    let selectedMinutes = 12;
    let totalSeconds = selectedMinutes * 60;
    let remainingSeconds = totalSeconds;
    let guidanceMode = 'voice'; // 'voice' | 'bell' | 'silent'
    let timerInterval = null;
    let breathInterval = null;
    let isRunning = false;
    let lastTriggeredCueIndex = -1;

    // 從 DOM 讀取當週的引導語陣列（支援 OpenCC 轉換後的簡體或繁體文字）
    function getCuesFromDOM() {
      const container = document.getElementById('guidanceScriptData');
      if (!container) return [];
      const items = container.querySelectorAll('.guidance-cue-item');
      const cues = [];
      items.forEach(function (el) {
        const pct = parseFloat(el.getAttribute('data-pct')) || 0;
        const stageEl = el.querySelector('.cue-stage');
        const textEl = el.querySelector('.cue-text');
        cues.push({
          pct: pct,
          stage: stageEl ? stageEl.textContent.trim() : '睡前正念引導',
          text: textEl ? textEl.textContent.trim() : ''
        });
      });
      return cues;
    }

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

    function triggerStageCue(cue, isFirstCue) {
      if (!cue) return;
      if (liveStageTag) liveStageTag.textContent = '🌙 ' + cue.stage;
      if (liveGuidanceText) liveGuidanceText.textContent = '「' + cue.text + '」';

      if (guidanceMode === 'voice') {
        if (!isFirstCue) {
          playSingingBowl(0.45);
        }
        const tid = setTimeout(function () {
          speakGentlePrompt(cue.text);
        }, isFirstCue ? 900 : 1400);
        speechTimeoutIds.push(tid);
      } else if (guidanceMode === 'bell') {
        if (!isFirstCue) {
          playSingingBowl(0.55);
        }
      }
    }

    function checkAndTriggerCue() {
      const cues = getCuesFromDOM();
      if (cues.length === 0 || totalSeconds <= 0) return;
      const elapsed = totalSeconds - remainingSeconds;
      const elapsedPct = elapsed / totalSeconds;

      let targetIdx = -1;
      for (let i = 0; i < cues.length; i++) {
        if (elapsedPct >= cues[i].pct) {
          targetIdx = i;
        }
      }

      if (targetIdx !== -1 && targetIdx > lastTriggeredCueIndex) {
        lastTriggeredCueIndex = targetIdx;
        triggerStageCue(cues[targetIdx], targetIdx === 0);
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

    // 切換引導方式（語音 / 頌缽 / 靜音）
    modeBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        modeBtns.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        guidanceMode = btn.getAttribute('data-mode') || 'voice';
        if (guidanceMode !== 'voice') {
          stopGentleSpeech();
        }
      });
    });

    // 切換時間長度（10 / 12 / 15 分鐘）
    presetBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (isRunning) {
          clearInterval(timerInterval);
          isRunning = false;
          startBtn.textContent = '開始睡前冥想';
          stopBreathingGuide();
          stopGentleSpeech();
        }
        presetBtns.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        selectedMinutes = parseInt(btn.getAttribute('data-minutes'), 10) || 12;
        totalSeconds = selectedMinutes * 60;
        remainingSeconds = totalSeconds;
        lastTriggeredCueIndex = -1;
        updateDisplay();
      });
    });

    // 試聽語音引導按鈕
    if (testVoiceBtn) {
      testVoiceBtn.addEventListener('click', function () {
        const cues = getCuesFromDOM();
        const sampleText = (cues.length > 0 && cues[0].text)
          ? cues[0].text
          : '現在，請用最舒服的姿勢平躺在床上，輕輕閉上雙眼，把白天的重量交給床鋪。';
        speakGentlePrompt(sampleText);
      });
    }

    if (startBtn) {
      startBtn.addEventListener('click', function () {
        if (!isRunning) {
          if (remainingSeconds <= 0) {
            totalSeconds = selectedMinutes * 60;
            remainingSeconds = totalSeconds;
            lastTriggeredCueIndex = -1;
          }
          isRunning = true;
          startBtn.textContent = '暫停冥想';
          playSingingBowl(0.85);
          startBreathingGuide();
          checkAndTriggerCue();

          timerInterval = setInterval(function () {
            remainingSeconds -= 1;
            updateDisplay();
            checkAndTriggerCue();

            if (remainingSeconds <= 0) {
              clearInterval(timerInterval);
              isRunning = false;
              startBtn.textContent = '開始睡前冥想';
              stopBreathingGuide();
              if (breathLabel) breathLabel.textContent = '晚安好眠 🌙';
              if (liveStageTag) liveStageTag.textContent = '🌙 冥想圓滿 · 安然入夢';
              if (!silentEndCheck || !silentEndCheck.checked) {
                playSingingBowl(0.7);
              }
            }
          }, 1000);
        } else {
          clearInterval(timerInterval);
          isRunning = false;
          startBtn.textContent = '繼續冥想';
          stopBreathingGuide();
          stopGentleSpeech();
        }
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener('click', function () {
        if (timerInterval) clearInterval(timerInterval);
        isRunning = false;
        totalSeconds = selectedMinutes * 60;
        remainingSeconds = totalSeconds;
        lastTriggeredCueIndex = -1;
        updateDisplay();
        if (startBtn) startBtn.textContent = '開始睡前冥想';
        stopBreathingGuide();
        stopGentleSpeech();
        const cues = getCuesFromDOM();
        if (cues.length > 0) {
          if (liveStageTag) liveStageTag.textContent = '✨ 準備開始 · 睡前引導語預覽';
          if (liveGuidanceText) liveGuidanceText.textContent = '「' + cues[0].text + '」';
        }
      });
    }

    if (bellBtn) {
      bellBtn.addEventListener('click', function () {
        playSingingBowl(0.85);
      });
    }
  }
})();
