-- Add title column to nippo table
ALTER TABLE nippo ADD COLUMN title text;

-- Set default titles for existing records
UPDATE nippo 
SET title = (
  EXTRACT(YEAR FROM report_date) || '/' || 
  LPAD(EXTRACT(MONTH FROM report_date)::text, 2, '0') || '/' || 
  LPAD(EXTRACT(DAY FROM report_date)::text, 2, '0') || 'の日報'
)
WHERE title IS NULL;

-- Make title column not null after setting defaults
ALTER TABLE nippo ALTER COLUMN title SET NOT NULL;