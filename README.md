# 夜嶼靜心 · 睡前正念療癒誌 (Jekyll 網站)

這是一個專為**每週 10～15 分鐘睡前正念冥想**打造的 GitHub Pages 網站，架構承襲自 `D:\blog`（心茶記），並針對「睡前正念療癒」進行了專屬視覺與功能升級：

- 🌙 **預設低藍光「睡前微光夜色模式」**：深邃靜夜藍搭配溫暖燭光珀色，睡前在床頭用手機閱讀不刺眼、不干擾褪黑激素（亦支援一鍵切換為「☀️ 日間暖紙模式」）。
- 🔔 **內建 10～15 分鐘睡前冥想計時器與 4-6 助眠呼吸光圈**：每篇文章上方皆內建呼吸節律器（吸氣 4 秒 · 吐氣 6 秒）與 Web Audio 合成的低頻舒緩頌缽音。
- 🛌 **專屬「結束時靜音（直接入睡不喚醒）」開關**：勾選後，當 12 或 15 分鐘冥想結束時不會發出聲響，讓你做完冥想後直接安然入睡。
- 🌿 **固定四段式文章結構**：
  1. **睡前正念小文章**
  2. **背後的簡要學理**
  3. **10～15 分鐘睡前冥想進行方式**
  4. **最後一句正念話語（專屬晚安卡片）**

---

## 🚀 如何部署到 GitHub Pages

1. 在 GitHub 上建立一個新的公開倉庫（Public Repository），倉庫名稱建議命名為 **`mindfulness`**（若取其他名稱，請修改 `_config.yml` 中的 `baseurl`）。
2. 在本資料夾（`d:\正念療愈`）執行以下 Git 指令推送：

```bash
git init
git add .
git commit -m "初始提交：夜嶼靜心 睡前正念療癒網站與 Week 01 練習"
git branch -M main
git remote add origin https://github.com/coachsunny/mindfulness.git
git push -u origin main
```

3. 進入 GitHub 倉庫的 **Settings** → **Pages**，在 **Build and deployment** 選擇：
   - Source: `Deploy from a branch`
   - Branch: `main` / `/ (root)`
4. 等待 1～2 分鐘，即可透過 `https://coachsunny.github.io/mindfulness/` 瀏覽！
