-- profilesテーブルのfull_nameカラムをnameに変更

-- カラム名変更
ALTER TABLE profiles RENAME COLUMN full_name TO name;

-- インデックス名も変更
DROP INDEX IF EXISTS profiles_full_name_idx;
CREATE INDEX profiles_name_idx ON profiles (name);
