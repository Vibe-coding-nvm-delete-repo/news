-- Settings table (single row for global settings)
CREATE TABLE settings (
  id SERIAL PRIMARY KEY,
  api_key TEXT,
  selected_model TEXT,
  search_instructions TEXT NOT NULL DEFAULT 'Search for the latest news and developments about this topic. Focus on events from the past 7 days. Include important updates, trends, and notable discussions.',
  format_prompt TEXT NOT NULL DEFAULT 'Analyze all the news results and create a JSON response with this schema:
{
  "stories": [
    {
      "title": "Clear headline",
      "rating": 1-10 (how interesting/important),
      "summary": "2-3 sentence summary",
      "source": "Source name",
      "url": "Article URL if available",
      "date": "YYYY-MM-DD"
    }
  ]
}

Rate each story based on significance, novelty, and relevance. Sort by rating (highest to lowest).',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert initial settings row
INSERT INTO settings (id) VALUES (1);

-- Keywords table
CREATE TABLE keywords (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  text TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reports table
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  total_cost DECIMAL(10, 6) NOT NULL,
  stage1_results JSONB,
  stage2_result JSONB
);

-- Stories table
CREATE TABLE stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID REFERENCES reports(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  rating DECIMAL(3, 1) NOT NULL,
  summary TEXT,
  source TEXT,
  url TEXT,
  date DATE,
  archived BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;

-- Create policies (allow all for now - adjust based on auth requirements)
CREATE POLICY "Allow all on settings" ON settings FOR ALL USING (true);
CREATE POLICY "Allow all on keywords" ON keywords FOR ALL USING (true);
CREATE POLICY "Allow all on reports" ON reports FOR ALL USING (true);
CREATE POLICY "Allow all on stories" ON stories FOR ALL USING (true);

-- Create indexes
CREATE INDEX idx_keywords_enabled ON keywords(enabled);
CREATE INDEX idx_stories_report_id ON stories(report_id);
CREATE INDEX idx_stories_archived ON stories(archived);
CREATE INDEX idx_stories_rating ON stories(rating DESC);
