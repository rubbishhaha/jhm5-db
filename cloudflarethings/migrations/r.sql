DROP TABLE IF EXISTS sheet1;
CREATE TABLE sheet1 (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  label TEXT,
  all_male INTEGER,
  all_female INTEGER,
  all_total INTEGER
);

DROP TABLE IF EXISTS sheet2;
CREATE TABLE sheet2 (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  label TEXT,
  all_male INTEGER,
  all_female INTEGER,
  all_total INTEGER
);

DROP TABLE IF EXISTS sheet3;
CREATE TABLE sheet3 (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  label TEXT,
  all_male INTEGER,
  all_female INTEGER,
  all_total INTEGER
);

-- dialogues table: store imported README and prompts
DROP TABLE IF EXISTS dialogues;
CREATE TABLE dialogues (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT,
  role TEXT,
  message TEXT,
  metadata TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


INSERT INTO sheet1 (label, all_male, all_female, all_total) VALUES ('(a) 於中國語文科、英國語文科及數學科取得 2 級或以上，以及公民與社會發展科取得「達標」 Level 2+ in Chinese Language, English Language and Mathematics, and ‘Attained’ in Citizenship and Social Development', 15634, 15246, 30880);
INSERT INTO sheet1 (label, all_male, all_female, all_total) VALUES ('(b) 於五科甲類學科中取得 2 級或以上 Level 2+ in five Category A subjects', 17079, 17018, 34097);
INSERT INTO sheet1 (label, all_male, all_female, all_total) VALUES ('(c) 於五科甲類學科／乙類學科#中取得2 級或以上 Level 2+ in five Category A / B subjects #', 17195, 17077, 34272);
INSERT INTO sheet1 (label, all_male, all_female, all_total) VALUES ('(d) 於五科甲類學科中取得 2 級或以上，其中包括中國語文科及英國語文科 Level 2+ in five Category A subjects, including Chinese Language and English Language', 16028, 15524, 31552);
INSERT INTO sheet1 (label, all_male, all_female, all_total) VALUES ('(e) 於五科甲類學科／乙類學科# 中取得2 級或以上，其中包括中國語文科及英國語文科 Level 2+ in five Category A / B subjects #, including Chinese Language and English Language', 16073, 15535, 31608);
INSERT INTO sheet1 (label, all_male, all_female, all_total) VALUES ('(f) 於五科甲類學科中取得 2 級或以上， 其中包括中國語文科、英國語文科及數學科 Level 2+ in five Category A subjects, including Chinese Language, English Language and Mathematics', 15465, 15155, 30620);
INSERT INTO sheet1 (label, all_male, all_female, all_total) VALUES ('(g) 於五科甲類學科／乙類學科# 中取得2 級或以上，其中包括中國語文科、英國語文科及數學科 Level 2+ in five Category A / B subjects #, including Chinese Language, English Language and Mathematics', 15484, 15162, 30646);
INSERT INTO sheet2 (label, all_male, all_female, all_total) VALUES ('五科取得5** 級或以上', 30, 16, 46);
INSERT INTO sheet2 (label, all_male, all_female, all_total) VALUES ('五科取得5* 級或以上', 245, 234, 479);
INSERT INTO sheet2 (label, all_male, all_female, all_total) VALUES ('五科取得5 級或以上', 877, 899, 1776);
INSERT INTO sheet2 (label, all_male, all_female, all_total) VALUES ('五科取得4 級或以上', 3328, 3495, 6823);
INSERT INTO sheet2 (label, all_male, all_female, all_total) VALUES ('五科取得3 級或以上', 8109, 8300, 16409);
INSERT INTO sheet2 (label, all_male, all_female, all_total) VALUES ('五科取得2 級或以上', 17077, 16200, 33277);
INSERT INTO sheet2 (label, all_male, all_female, all_total) VALUES ('五科取得1 級或以上', 19464, 18112, 37576);
INSERT INTO sheet2 (label, all_male, all_female, all_total) VALUES ('四科取得1 級或以上', 20502, 18750, 39252);
INSERT INTO sheet2 (label, all_male, all_female, all_total) VALUES ('三科取得1 級或以上', 21091, 19122, 40213);
INSERT INTO sheet2 (label, all_male, all_female, all_total) VALUES ('兩科取得1 級或以上', 21467, 19358, 40825);
INSERT INTO sheet2 (label, all_male, all_female, all_total) VALUES ('一科取得1 級或以上', 21726, 19485, 41211);
INSERT INTO sheet3 (label, all_male, all_female, all_total) VALUES ('(a) 於核心科目中取得「332A」或更佳成績 Core subjects at 332A or better', 10481, 8781, 19262);
INSERT INTO sheet3 (label, all_male, all_female, all_total) VALUES ('(b) 於核心科目中取得「332A」或更佳成績，並於一個選修科目取得 2 級或以上# 成績 Core subjects at 332A or better, with one elective at level 2+#', 10438, 8744, 19182);
INSERT INTO sheet3 (label, all_male, all_female, all_total) VALUES ('(c) 於核心科目中取得「332A」或更佳成績，並於兩個選修科目取得 2 級或以上# 成績 Core subjects at 332A or better, with two electives at level 2+#', 10019, 8436, 18455);
INSERT INTO sheet3 (label, all_male, all_female, all_total) VALUES ('(d) 於核心科目中取得「332A」或更佳成績，並於一個選修科目取得 3 級或以上# 成績 Core subjects at 332A or better, with one elective at level 3+#', 9912, 8510, 18422);
INSERT INTO sheet3 (label, all_male, all_female, all_total) VALUES ('(e) 於核心科目中取得「332A」或更佳成績，並於兩個選修科目取得 3 級或以上# 成績 Core subjects at 332A or better, with two electives at level 3+#', 8672, 7666, 16338);
INSERT INTO sheet3 (label, all_male, all_female, all_total) VALUES ('(f) 於核心科目中取得「333A」或更佳成績，並於一個選修科目取得 3 級或以上# 成績 Core subjects at 333A or better, with one elective at level 3+#', 8894, 7996, 16890);
INSERT INTO sheet3 (label, all_male, all_female, all_total) VALUES ('(g) 於核心科目中取得「333A」或更佳成績，並於兩個選修科目取得 3 級或以上# 成績 Core subjects at 333A or better, with two electives at level 3+#', 8011, 7333, 15344);
INSERT INTO sheet3 (label, all_male, all_female, all_total) VALUES ('(h) 於核心科目中取得「332A」或更佳成績，並於一個選修科目取得 4 級或以上# 成績 Core subjects at 332A or better, with one elective at level 4+#', 7821, 7119, 14940);
INSERT INTO sheet3 (label, all_male, all_female, all_total) VALUES ('(i) 於核心科目中取得「332A」或更佳成績，並於兩個選修科目取得 4 級或以上# 成績 Core subjects at 332A or better, with two electives at level 4+#', 5487, 5404, 10891);
INSERT INTO sheet3 (label, all_male, all_female, all_total) VALUES ('(j) 於核心科目中取得「332A」或更佳成績，並於一個選修科目取得 5 級或以上成績 Core subjects at 332A or better, with one elective at level 5+', 3772, 4207, 7979);
INSERT INTO sheet3 (label, all_male, all_female, all_total) VALUES ('(k) 於核心科目中取得「332A」或更佳成績，並於兩個選修科目取得 5 級或以上成績 Core subjects at 332A or better, with two electives at level 5+', 1965, 2523, 4488);
INSERT INTO sheet3 (label, all_male, all_female, all_total) VALUES ('(l) 於核心科目中取得「332A」或更佳成績，數學延伸部分取得 2 級或以上成績，並於一個選修科目取得 2 級或以上# 成績 Core subjects at 332A or better, with Mathematics Extended Part
at level 2+ and one elective at level 2+#', 2074, 3313, 5387);
INSERT INTO sheet3 (label, all_male, all_female, all_total) VALUES ('(m) 於核心科目中取得「332A」或更佳成績，數學延伸部分取得 3 級或以上成績，並於一個選修科目取得 2 級或以上# 成績 Core subjects at 332A or better, with Mathematics Extended Part
at level 3+ and one elective at level 2+#', 1798, 3034, 4832);
INSERT INTO sheet3 (label, all_male, all_female, all_total) VALUES ('(n) 於核心科目中取得「332A」或更佳成績，數學延伸部分取得 3 級或以上成績，並於一個選修科目取得 3 級或以上# 成績 Core subjects at 332A or better, with Mathematics Extended Part
at level 3+ and one elective at level 3+#', 1783, 3021, 4804);



-- 003_add_readme.sql
-- Insert README.md content into dialogues table as a single row
-- The INSERT uses a WHERE NOT EXISTS guard on session_id to avoid duplicate inserts

-- BEGIN TRANSACTION;
-- Insert short prompt messages for each sheet to be used by the frontend typing prompt.
-- Each insert guards on a unique combination to avoid duplicates.

INSERT INTO dialogues (session_id, role, message, metadata)
SELECT 'import-readme-sheet1', 'system', '## 主要趨勢

### 1. 性別表現差異
- 在所有成績組合中，女性考生人數和達標率普遍高於男性
- 特別是語言相關科目（中英文）的組合，女性優勢更明顯

### 2. 核心科目重要性
- 包含「中文、英文、數學」三科核心科目的組合（a,f,g）達標人數相對較少
- 顯示核心科目是主要篩選關卡，許多學生在其中一科未能達標

### 3. 科目組合彈性影響
- 包含乙類學科（應用學習科目）的組合（c,e,g）比純甲類學科組合達標人數略多
- 顯示乙類學科為學生提供了額外的達標途徑

## 可能原因分析

### 教育政策因素
- 公民與社會發展科取代通識教育科後，「達標」要求相對容易達到
- 乙類應用學習科目的納入，為學術表現較弱的學生提供了替代選擇

### 社會文化因素
- 香港教育體系中，女性在語言學習和考試表現上傳統較優
- 男性可能更傾向選擇非傳統學科或職業導向路徑

### 課程設計影響
- 核心科目（中英數）要求較高，成為主要瓶頸
- 乙類實用科目的加入稍微緩解了學術壓力

### 就業市場導向
- 基礎學歷要求（5科2級）成為就業和升學的基本門檻
- 包含中英文的組合更符合實際就業需求

這些趨勢反映了香港教育改革的方向：在維持基本學術標準的同時，透過科目多元化和實用化，讓更多學生能夠達到基礎學歷要求。', '{"sheet":"sheet1"}'
WHERE NOT EXISTS (SELECT 1 FROM dialogues WHERE session_id = 'import-readme-sheet1');

INSERT INTO dialogues (session_id, role, message, metadata)
SELECT 'import-readme-sheet2', 'system', '## 主要趨勢

### 1. 成績金字塔效應
- 呈現典型的「金字塔」分布：成績要求越高，達標人數越少
- 5科2級或以上：32,081人
- 5科5級或以上：1,756人  
- 5科5**級或以上：僅475人
- 顯示頂尖成績的學生比例極少

### 2. 性別差異隨成績水平變化
- 中等成績區間（5科3級/4級）：女性優勢明顯
- 頂尖成績區間（5科5級/5**級）：性別差異縮小，甚至男性在某些頂尖層級略多
- 基礎成績區間（1-2級）：性別比例相對均衡

### 3. 科目數量門檻效應
- 從「五科達標」到「一科達標」人數逐漸增加
- 但增長幅度不大，顯示大多數學生至少能在一科取得1級
- 約有1,000多名學生未能在一科取得1級

## 可能原因分析

### 教育分流機制
- 成績分布反映香港教育的嚴格篩選功能
- 頂尖大學學位有限，通過考試成績進行自然分流

### 性別學習模式差異
- 女性在中等成績區間表現穩定優秀
- 男性可能在頂尖層級有更極端的表現分布
- 符合「男性方差較大」的教育研究發現

### 社會期望與支持
- 基礎教育普及，絕大多數學生能達到基本水平
- 但追求卓越的競爭激烈，頂尖成績難度極高

### 教育政策影響
- 1級作為基礎認證，確保大部分學生有基本學歷
- 高等級成績作為精英教育的篩選標準

這些趨勢顯示香港教育體系在「普及基礎教育」與「選拔精英人才」之間的平衡，同時反映了不同性別在學業表現上的細微差異模式。', '{"sheet":"sheet2"}'
WHERE NOT EXISTS (SELECT 1 FROM dialogues WHERE session_id = 'import-readme-sheet2');

INSERT INTO dialogues (session_id, role, message, metadata)
SELECT 'import-readme-sheet3', 'system', '## 主要趨勢

### 1. 核心科目「332A」是主要瓶頸
- 達到基本大學入學要求（332A）的學生約18,376人
- 但隨着選修科目要求提高，符合資格人數急劇下降
- 顯示核心科目要求已篩選掉大部分學生

### 2. 選修科目要求產生層級篩選
- 從2級到5級：每提高一個等級，符合人數約減少40-50%
- 兩個選修科目要求比一個科目要求淘汰更多學生
- 達到兩個選修科目5級以上的僅4,321人（約23.5%的332A達標者）

### 3. 性別優勢反轉現象
- 在基礎至中等要求（2-4級）：女性人數佔優
- 在高等要求（5級以上）：男性反超女性
- 特別是兩個選修科目5級以上：男性2,523人 vs 女性1,965人

### 4. 數學延伸部分顯示明顯性別差異
- 數學延伸部分達標者中，男性明顯多於女性（約3:2比例）
- 反映STEM科目的性別傾向

## 可能原因分析

### 大學收生競爭機制
- 核心科目332A設定基本門檻
- 選修科目成績成為大學專業選擇的關鍵篩選標準
- 熱門學科通過提高選修科目要求來篩選學生

### 學科能力性別分化
- 女性在語言和基礎學科表現穩定優秀
- 男性在數理和高階選修科目上可能更具優勢
- 符合傳統的學科性別傾向模式

### 教育資源分配
- 達到基本大學門檻的學生數量相對充足
- 但優質大學學位有限，通過選修科目成績進一步分流
- 反映香港高等教育供需不平衡

### 課程設計影響
- 核心科目重視基本能力，選修科目反映專業傾向
- 數學延伸部分作為進階數理能力的指標

這些趨勢顯示香港教育體系通過「核心科目+選修科目」的雙重篩選機制，在確保基本教育質量的同時，實現對高等教育入學的精密分流，同時也反映了學科能力上的性別差異模式。
', '{"sheet":"sheet3"}'
WHERE NOT EXISTS (SELECT 1 FROM dialogues WHERE session_id = 'import-readme-sheet3');

--COMMIT;
