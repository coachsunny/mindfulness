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
  let sharedAudioCtx = null;
  function getSharedAudioContext() {
    if (!sharedAudioCtx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        sharedAudioCtx = new AudioCtx();
      }
    }
    if (sharedAudioCtx && sharedAudioCtx.state === 'suspended') {
      try { sharedAudioCtx.resume(); } catch (e) {}
    }
    return sharedAudioCtx;
  }

  function playSingingBowl(volumeScale) {
    const scale = typeof volumeScale === 'number' ? volumeScale : 1.0;
    try {
      const ctx = getSharedAudioContext();
      if (!ctx) return;
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

  // ---------- 8. 真人級普通話智者音訊 (HTML5 Audio) + 標準普通話 Web Speech 雙引擎引導器 ----------
  let speechTimeoutIds = [];
  let activeUtterances = []; // 防止瀏覽器 V8 垃圾回收 (GC) 導致語音突然停止
  let cachedChineseVoices = [];
  let speechKeepAliveTimer = null;
  let isSpeechSpeaking = false;

  // 共享單一 HTML5 Audio 實例：在微信內建瀏覽器 (XWeb / WKWebView)、iOS Safari、Android Chrome 皆可透過點擊手勢一次解鎖後全程自動播放
  let guidanceAudio = null;
  if (typeof Audio !== 'undefined') {
    guidanceAudio = new Audio();
    guidanceAudio.preload = 'auto';
    guidanceAudio.setAttribute('playsinline', 'true');
    guidanceAudio.setAttribute('webkit-playsinline', 'true');
  }

  // 判斷是否為粵語/香港語音（嚴格排除，確保 100% 只說標準普通話/國語）
  function isCantoneseVoice(v) {
    if (!v) return true;
    const lang = (v.lang || '').toLowerCase();
    const name = (v.name || '').toLowerCase();
    const uri = (v.voiceURI || '').toLowerCase();
    if (
      lang.indexOf('yue') !== -1 ||
      lang.indexOf('zh-hk') !== -1 ||
      lang.indexOf('zh_hk') !== -1 ||
      lang.indexOf('zh-mo') !== -1 ||
      lang.indexOf('zh_mo') !== -1
    ) {
      return true;
    }
    const cantoneseKeywords = [
      'cantonese', 'hong kong', 'hongkong', '粤', '粵', '香港',
      'sin-ji', 'sinji', 'danny', 'wanlung', 'hiumaan', 'hiugaai', '善怡'
    ];
    for (let i = 0; i < cantoneseKeywords.length; i++) {
      const kw = cantoneseKeywords[i];
      if (name.indexOf(kw) !== -1 || uri.indexOf(kw) !== -1) {
        return true;
      }
    }
    return false;
  }

  function loadChineseVoices() {
    if (!('speechSynthesis' in window)) return [];
    try {
      const allVoices = window.speechSynthesis.getVoices() || [];
      cachedChineseVoices = allVoices.filter(function (v) {
        if (!v || !v.lang) return false;
        const lang = v.lang.toLowerCase();
        const isMandarinLang = (
          lang.indexOf('zh-cn') !== -1 ||
          lang.indexOf('zh_cn') !== -1 ||
          lang.indexOf('zh-tw') !== -1 ||
          lang.indexOf('zh_tw') !== -1 ||
          lang.indexOf('zh-sg') !== -1 ||
          lang.indexOf('cmn') !== -1 ||
          lang === 'zh'
        );
        return isMandarinLang && !isCantoneseVoice(v);
      });
    } catch (e) {}
    return cachedChineseVoices;
  }

  if ('speechSynthesis' in window) {
    loadChineseVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = function () {
        loadChineseVoices();
      };
    }
  }

  // 專門挑選標準普通話（排除粵語）男性老者、磁性、沉穩智者風格的中文發音引擎
  function pickGentleChineseVoice() {
    if (!('speechSynthesis' in window)) return null;
    const zhVoices = cachedChineseVoices.length > 0 ? cachedChineseVoices : loadChineseVoices();
    if (zhVoices.length === 0) return null;

    // 優先挑選標準普通話磁性、成熟、智者風格的男聲關鍵字（嚴格不含 sin-ji / danny 等粵語聲音）：
    const preferredMandarinMaleKeywords = [
      'yunjian',   // 微软云健（标准普通话 · 沉稳成熟叙事老者）
      'yunyang',   // 微软云扬（标准普通话 · 磁性从容男声）
      'yunxi',     // 微软云希（标准普通话男声）
      'kangkang',  // 康康（标准普通话沉稳男声）
      'zhiwei',    // 志伟（国语男声）
      'male',      // 包含 male 标识的普通话男声
      '男'         // 中文标号含「男」
    ];

    for (let i = 0; i < preferredMandarinMaleKeywords.length; i++) {
      const kw = preferredMandarinMaleKeywords[i];
      const match = zhVoices.find(function (v) {
        return v.name && v.name.toLowerCase().indexOf(kw) !== -1;
      });
      if (match) return match;
    }

    // 次選：優先挑選 zh-CN 標準普通話語音（如 Ting-Ting / Xiaoxiao / Google 普通話）
    const cnVoice = zhVoices.find(function (v) {
      const l = (v.lang || '').toLowerCase();
      return l.indexOf('zh-cn') !== -1 || l.indexOf('zh_cn') !== -1 || l.indexOf('cmn-cn') !== -1;
    });
    if (cnVoice) return cnVoice;

    return zhVoices[0];
  }

  function stopGentleSpeech() {
    speechTimeoutIds.forEach(function (id) {
      clearTimeout(id);
    });
    speechTimeoutIds = [];
    isSpeechSpeaking = false;
    if (speechKeepAliveTimer) {
      clearInterval(speechKeepAliveTimer);
      speechKeepAliveTimer = null;
    }
    if (guidanceAudio) {
      try {
        guidanceAudio.pause();
        guidanceAudio.currentTime = 0;
        guidanceAudio.onended = null;
        guidanceAudio.onerror = null;
      } catch (e) {}
    }
    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {}
    }
    activeUtterances = [];
  }

  // 使用者手勢同步解鎖（解決微信內建瀏覽器 / iOS Safari 延遲發聲被自動阻擋問題）
  function primeAudioAndSpeech() {
    getSharedAudioContext();
  }

  // 微信內建瀏覽器專屬 WeixinJSBridge 預先就緒支援
  if (typeof document !== 'undefined') {
    document.addEventListener('WeixinJSBridgeReady', function () {
      getSharedAudioContext();
    }, false);
  }

  // 後備方案：當預生成普通話 MP3 無法載入時，使用標準普通話 Web Speech API 朗讀
  function speakFallbackMandarinTTS(text, onComplete) {
    if (!('speechSynthesis' in window) || !text) {
      isSpeechSpeaking = false;
      if (typeof onComplete === 'function') onComplete();
      return;
    }

    try {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
    } catch (e) {}

    const cleanText = text.replace(/[「」“”『』"]/g, '');
    const sentences = cleanText
      .split(/[。；！…？?]+/)
      .map(function (s) { return s.trim(); })
      .filter(function (s) { return s.length > 0; });

    if (sentences.length === 0) {
      isSpeechSpeaking = false;
      if (typeof onComplete === 'function') onComplete();
      return;
    }

    const voice = pickGentleChineseVoice();
    let currentIdx = 0;
    isSpeechSpeaking = true;

    if (speechKeepAliveTimer) clearInterval(speechKeepAliveTimer);
    speechKeepAliveTimer = setInterval(function () {
      if ('speechSynthesis' in window && window.speechSynthesis.speaking) {
        window.speechSynthesis.pause();
        window.speechSynthesis.resume();
      } else {
        clearInterval(speechKeepAliveTimer);
        speechKeepAliveTimer = null;
      }
    }, 9000);

    function speakNext() {
      if (currentIdx >= sentences.length || !isSpeechSpeaking) {
        isSpeechSpeaking = false;
        if (speechKeepAliveTimer) {
          clearInterval(speechKeepAliveTimer);
          speechKeepAliveTimer = null;
        }
        if (typeof onComplete === 'function') onComplete();
        return;
      }

      const sText = sentences[currentIdx];
      const utter = new SpeechSynthesisUtterance(sText);
      if (voice) {
        utter.voice = voice;
        utter.lang = voice.lang;
      } else {
        // 強制使用標準普通話 zh-CN，絕不因系統地區為香港而落入 zh-HK 粵語
        utter.lang = 'zh-CN';
      }

      utter.pitch = 0.74;
      utter.rate = 0.74;
      utter.volume = 1.0;

      activeUtterances.push(utter);

      function advance() {
        const uIdx = activeUtterances.indexOf(utter);
        if (uIdx !== -1) activeUtterances.splice(uIdx, 1);
        currentIdx++;
        if (currentIdx < sentences.length && isSpeechSpeaking) {
          const tid = setTimeout(function () {
            speakNext();
          }, 1800);
          speechTimeoutIds.push(tid);
        } else {
          isSpeechSpeaking = false;
          if (typeof onComplete === 'function') onComplete();
        }
      }

      utter.onend = function () {
        advance();
      };

      utter.onerror = function () {
        advance();
      };

      try {
        window.speechSynthesis.speak(utter);
      } catch (err) {
        advance();
      }
    }

    // 同步直接呼叫 speakNext()，保留行動端與微信的手勢啟動權限
    speakNext();
  }

  // 主語音引導函式：優先播放預先生成的「微軟雲健 (zh-CN-YunjianNeural) 標準普通話老者男聲」MP3，微信內直開即有聲
  function speakGentlePrompt(text, onComplete, audioUrl) {
    stopGentleSpeech();
    isSpeechSpeaking = true;

    if (guidanceAudio && audioUrl) {
      try {
        guidanceAudio.src = audioUrl;
        guidanceAudio.volume = 1.0;
        guidanceAudio.onended = function () {
          isSpeechSpeaking = false;
          if (typeof onComplete === 'function') onComplete();
        };
        guidanceAudio.onerror = function () {
          // 若音訊檔載入失敗，無縫切換至標準普通話 Web Speech TTS
          speakFallbackMandarinTTS(text, onComplete);
        };
        const playPromise = guidanceAudio.play();
        if (playPromise !== undefined) {
          playPromise.catch(function () {
            speakFallbackMandarinTTS(text, onComplete);
          });
        }
        return;
      } catch (e) {
        speakFallbackMandarinTTS(text, onComplete);
        return;
      }
    }

    speakFallbackMandarinTTS(text, onComplete);
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

    // 從 DOM 讀取當週的引導語陣列與預生成普通話 MP3 音訊路徑
    function getCuesFromDOM() {
      const container = document.getElementById('guidanceScriptData');
      if (!container) return [];
      const items = container.querySelectorAll('.guidance-cue-item');
      const cues = [];
      items.forEach(function (el) {
        const pct = parseFloat(el.getAttribute('data-pct')) || 0;
        const audioUrl = el.getAttribute('data-audio') || '';
        const stageEl = el.querySelector('.cue-stage');
        const textEl = el.querySelector('.cue-text');
        cues.push({
          pct: pct,
          audioUrl: audioUrl,
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
        if (liveStageTag) liveStageTag.textContent = '🌙 ' + cue.stage + ' · 🎙️ 智者導引中...';
        if (isFirstCue) {
          // 第一段引導在使用者點擊「開始睡前冥想」當下同步立即播放，確保微信與手機瀏覽器 100% 授權發聲
          speakGentlePrompt(cue.text, function () {
            if (liveStageTag) liveStageTag.textContent = '🌙 ' + cue.stage;
          }, cue.audioUrl);
        } else {
          const tid = setTimeout(function () {
            speakGentlePrompt(cue.text, function () {
              if (liveStageTag) liveStageTag.textContent = '🌙 ' + cue.stage;
            }, cue.audioUrl);
          }, 900);
          speechTimeoutIds.push(tid);
        }
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
        primeAudioAndSpeech();
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
        primeAudioAndSpeech();
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

    // 試聽 / 即時朗讀當前引導語按鈕（具備雙向切換功能）
    if (testVoiceBtn) {
      testVoiceBtn.addEventListener('click', function () {
        primeAudioAndSpeech();
        if (isSpeechSpeaking) {
          stopGentleSpeech();
          testVoiceBtn.textContent = '🔊 試聽 / 朗讀此段語音';
          if (liveStageTag) liveStageTag.textContent = '✨ 準備開始 · 睡前引導語預覽';
          return;
        }

        const cues = getCuesFromDOM();
        const activeIdx = (lastTriggeredCueIndex >= 0 && lastTriggeredCueIndex < cues.length)
          ? lastTriggeredCueIndex
          : 0;
        const targetCue = (cues.length > 0) ? cues[activeIdx] : null;
        const sampleText = targetCue ? targetCue.text : '現在，請用最舒服的姿勢平躺在床上，輕輕閉上雙眼，把白天的重量交給床鋪。';
        const sampleAudioUrl = targetCue ? targetCue.audioUrl : '';

        testVoiceBtn.textContent = '⏹️ 停止朗讀';
        if (liveStageTag) liveStageTag.textContent = (targetCue ? '🌙 ' + targetCue.stage : '🌙 睡前引導') + ' · 🎙️ 智者導引中...';

        speakGentlePrompt(sampleText, function () {
          testVoiceBtn.textContent = '🔊 試聽 / 朗讀此段語音';
          if (liveStageTag) liveStageTag.textContent = targetCue ? '🌙 ' + targetCue.stage : '✨ 睡前引導';
        }, sampleAudioUrl);
      });
    }

    if (startBtn) {
      startBtn.addEventListener('click', function () {
        primeAudioAndSpeech();
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
          if (testVoiceBtn) testVoiceBtn.textContent = '🔊 試聽 / 朗讀此段語音';
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
        if (testVoiceBtn) testVoiceBtn.textContent = '🔊 試聽 / 朗讀此段語音';
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
