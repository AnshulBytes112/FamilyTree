-- Table: translations
CREATE TABLE translations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source_text TEXT NOT NULL,
  target_language TEXT NOT NULL,
  translated_text TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(source_text, target_language)
);

-- Index for quick lookups
CREATE INDEX idx_translations_lookup ON translations(source_text, target_language);

-- Enable RLS (Service role will bypass)
ALTER TABLE translations ENABLE ROW LEVEL SECURITY;
