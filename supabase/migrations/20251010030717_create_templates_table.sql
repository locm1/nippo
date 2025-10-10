-- テンプレートテーブルの作成
CREATE TABLE templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  content TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLSポリシーの有効化
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;

-- ユーザーは自分のテンプレートのみアクセス可能
CREATE POLICY "Users can manage their own templates" ON templates
FOR ALL USING (auth.uid() = user_id);

-- updated_at の自動更新トリガー
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_templates_updated_at 
BEFORE UPDATE ON templates 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();