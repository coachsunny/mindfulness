---
name: bedtime-mindfulness-weekly
description: >-
  Use this skill whenever the user asks to design, write, or publish a weekly
  bedtime mindfulness meditation activity (每週睡前正念冥想/正念療癒小活動), generate
  accompanying Simplified Chinese WeChat Moments posts and poster cards with QR
  codes, or sync weekly mindfulness content to the GitHub Pages site.
---

# 夜嶼靜心 · 每週睡前正念冥想全流程技能 (Bedtime Mindfulness Weekly Skill)

當使用者下達每週正念療癒指令時，請依循以下標準作業流程（SOP），確保每週活動具備**高度多樣性（不雷同）**、符合**四段式結構與智者語音引導規範**，並一次完成**網站文章、簡體微信貼文、二維碼圖卡與 GitHub 同步**。

---

## Step 1：檢查前幾週練習，確保「六大維度多樣性（去雷同化）」

1. 先查看 `_posts/` 目錄下已發布的週次，以及完整藍圖文件 [BEDTIME_MINDFULNESS_GUIDE.md](../../../BEDTIME_MINDFULNESS_GUIDE.md)。
2. **嚴格遵守「三不原則」**：
   * ❌ **不重複相同的開場**：不要每週都用「4-6 嘆息式吐氣」或相同的著陸詞開場。
   * ❌ **不套用死板的三階段公式**：依據當週主題自由設計 6～10 個時間軸節點（`guidance_script`）與專屬階段名稱。
   * ❌ **不重複單一學理**：每週第二部分切換不同心理學與腦科學視角（如 MBSR 雙箭理論、MBCT 去中心化、Kristin Neff 自我慈悲與催產素系統、Porges 多重迷走神經理論、CBT-I 矛盾意圖、Rick Hanson 正向神經內化等）。
3. **從「六大冥想流派與感官維度」中挑選與前一週不同的維度**：
   * **① 觸覺與重力型（Somatic Grounding）**：重量交託、緊—鬆對比（PMR）、被窩微氣候感知。
   * **② 意象與解離型（Mindful Imagery）**：夜雲觀照、卡巴金深湖靜水冥想、森林微雨溫暖木屋。
   * **③ 聽覺與開放覺察型（Auditory & Open Awareness）**：不控制呼吸，由遠及近聆聽夜聲，直至聽見聲音背後的寂靜。
   * **④ 自我慈悲與溫熱撫觸型（Self-Compassion & Metta）**：搓熱雙手貼胸腹、睡前自我寬恕、四句晚安慈心禪。
   * **⑤ 呼吸節律與光暈型（Breathwork & Prana）**：4-7-8 助眠呼吸、27 倒數牧羊呼吸、月光銀白/琥珀微光呼吸。
   * **⑥ 臣服與界線歸還型（Surrender & Boundaries）**：夜間保管箱（人際課題歸還）、CBT-I 允許清醒只做休息。

---

## Step 2：建立每週文章（`_posts/YYYY-MM-DD-weekXX-<slug>.md`）

1. **Front Matter 必填欄位**：
   ```yaml
   ---
   layout: post
   week: "03" # 依週次遞增
   title: 主題標題——副標題
   date: YYYY-MM-DD
   tags: [標籤1, 標籤2, 標籤3]
   practice_duration: 12 分鐘 # 10~15 分鐘皆可
   posture: 建議睡姿（如：舒適仰躺／雙手輕放胸腹／側臥擁抱等）
   read_time: 5
   description: 首頁卡片摘要（約 80~110 字）
   mindful_quote: 最後一句睡前正念話語（第一人稱）
   guidance_script:
     - time_pct: 0.00
       stage: "階段名稱"
       text: "符合『男性老者 · 磁性從容 · 智慧長者』口吻的溫柔引導詞。句子簡練具象，以句號或刪節號分隔，系統會自動在句間留白 1.8 秒。"
     # 依當週練習節奏設計 6～10 個 time_pct 節點（0.00 ~ 0.94），最後一段（0.94）唸出當週 mindful_quote 並道晚安。
   ---
   ```
2. **正文四段式結構**：
   * `## 一、 睡前正念小文章：...`（約 400～600 字，溫柔同在、不說教）
   * `## 二、 背後的簡要學理：...`（使用 `<div class="theory-box">...</div>` 包覆）
   * `## 三、 10～15 分鐘睡前冥想：進行方式與引導語`（使用 `<div class="practice-step-box">` 包覆各階段，內含 `<div class="guidance-script-quote">` 逐段伴讀引導詞與 `<span class="pause-hint">（……留白提示……）</span>`）
   * `## 四、 最後一句正念話語`（以 `> **「...」**` 引用區塊呈現）

---

## Step 3：生成可直接使用的「簡體字微信貼文」與「宣發圖卡」

1. **簡體字微信貼文（`social_posts/YYYY-MM-DD-weekXX-wechat-post.md`）**：
   * 必須為**純文字格式（無 `#`、`**`、`>` 等 Markdown 符號）**，讓使用者可直接全選複製貼到微信朋友圈或社群。
   * 結尾附上當週練習直達網址：`https://coachsunny.github.io/mindfulness/night/weekXX-<slug>/`
2. **簡體字宣發圖卡（`social_assets/`）**：
   * 呼叫 `image-generator` 子代理生成 3:4 直式高質感夜間正念海報，並複製至 `social_assets/YYYY-MM-DD-weekXX-<slug>-ai.jpg`。
   * 執行腳本 [add_qr_badge.ps1](./scripts/add_qr_badge.ps1) 自動在右下角合成當週網址的掃碼直達二維碼，輸出為 `social_assets/YYYY-MM-DD-weekXX-<slug>-qr.jpg`。

---

## Step 4：同步推送至 GitHub Pages

執行 `git add . && git commit -m "發布 Week XX：..." && git push origin main` 將新文章推送上線（`social_posts/` 與 `social_assets/` 已在 `.gitignore` 排除，僅保留於本地）。
