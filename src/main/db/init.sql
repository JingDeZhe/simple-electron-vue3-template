-- AI 配置表
CREATE TABLE IF NOT EXISTS ai_configs (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  base_url TEXT NOT NULL,
  api_key TEXT NOT NULL,
  model TEXT,
  temperature REAL,
  max_tokens INTEGER,
  top_p REAL,
  frequency_penalty REAL,
  presence_penalty REAL,
  is_default INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_ai_configs_is_default ON ai_configs(is_default);
CREATE INDEX IF NOT EXISTS idx_ai_configs_created_at ON ai_configs(created_at);
