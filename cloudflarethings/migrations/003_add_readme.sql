-- 003_add_readme.sql
-- Insert README.md content into dialogues table as a single row
-- The INSERT uses a WHERE NOT EXISTS guard on session_id to avoid duplicate inserts

BEGIN TRANSACTION;
-- Insert short prompt messages for each sheet to be used by the frontend typing prompt.
-- Each insert guards on a unique combination to avoid duplicates.

INSERT INTO dialogues (session_id, role, message, metadata)
SELECT 'import-readme-sheet1', 'system', '表格 1 (累積趨勢)：顯示多年來各項目累積數值變化，注意每年 4-5 月的高峰與年末低谷。請用這個圖表來討論年度高峰與趨勢變化。', '{"sheet":"sheet1"}'
WHERE NOT EXISTS (SELECT 1 FROM dialogues WHERE session_id = 'import-readme-sheet1');

INSERT INTO dialogues (session_id, role, message, metadata)
SELECT 'import-readme-sheet2', 'system', '表格 2 (累積趨勢)：觀察不同等級的分佈與累積成長，特別注意 4 級與 5* 級的變化趨勢。', '{"sheet":"sheet2"}'
WHERE NOT EXISTS (SELECT 1 FROM dialogues WHERE session_id = 'import-readme-sheet2');

INSERT INTO dialogues (session_id, role, message, metadata)
SELECT 'import-readme-sheet3', 'system', '表格 3 (核心科目)：分析核心科目和選修科目之間的差異，並檢視 332A / 333A 等級的變動。', '{"sheet":"sheet3"}'
WHERE NOT EXISTS (SELECT 1 FROM dialogues WHERE session_id = 'import-readme-sheet3');
