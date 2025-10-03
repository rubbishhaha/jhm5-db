-- 003_add_readme.sql
-- Insert README.md content into dialogues table as a single row
-- The INSERT uses a WHERE NOT EXISTS guard on session_id to avoid duplicate inserts

BEGIN TRANSACTION;

INSERT INTO dialogues (session_id, role, message, metadata)
SELECT 'import-readme', 'system', 
'#jhm5-db   DSEAnalysissssss
分析這個DSE搜尋趨勢數據，我可以觀察到以下幾個明顯的模式和趨勢：

## 季節性趨勢

**年度高峰期（4-5月）**：
- 每年4月中到5月初出現明顯高峰
- 峰值：2020年(76), 2021年(72), 2022年(78), 2023年(87), 2024年(96), 2025年(100)
- 這對應香港中學文憑考試(DSE)的主要考試期

**次要高峰期（7月）**：
- 每年7月中出現次高峰
- 可能與DSE放榜和相關討論有關

**低谷期**：
- 每年5月底到6月、12月到1月初搜尋量較低
- 對應考試間隔期和假期

## 長期趨勢

**搜尋量逐年上升**：
- 年度峰值從2020年的76增長到2025年的100
- 顯示DSE相關搜尋的長期增長趨勢
- 可能反映教育關注度提升或線上搜尋行為增加

## 具體觀察

**2023-2024年特點**：
- 2023年峰值87，2024年峰值96，增長明顯
- 2024年4月7日達到96的高點
- 2025年預測峰值達到100（3月30日）

**月度波動模式**：
- 學年期間（9月-次年4月）搜尋量相對穩定
- 假期期間（6-8月，12-1月）波動較大

## 潛在影響因素

1. **考試周期**：嚴格跟隨香港DSE考試時間表
2. **數位化趨勢**：可能反映更多學生和家長使用網路搜尋考試資訊
3. **教育關注度**：逐年增長的峰值可能顯示教育重要性的提升

## 預測建議

基於歷史模式，未來DSE相關搜尋可能：
- 繼續保持年度周期性
- 峰值可能進一步小幅增長
- 4月中到5月初仍是關鍵關注期

這個趨勢分析有助於教育機構、補習社和相關服務提供商規劃資源和宣傳時機。
',
'{"source":"README.md"}'
WHERE NOT EXISTS (SELECT 1 FROM dialogues WHERE session_id = 'import-readme');

COMMIT;
