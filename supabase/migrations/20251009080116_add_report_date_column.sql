-- Add report_date column to nippo table
alter table nippo add column report_date date not null default current_date;

-- Create index for better performance on date queries
create index nippo_report_date_idx on nippo(report_date desc);

-- Create index for user_id and report_date combination (useful for user's daily reports)
create index nippo_user_report_date_idx on nippo(user_id, report_date desc);