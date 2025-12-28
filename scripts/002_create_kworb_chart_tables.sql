-- Charts table: 차트 메타데이터 (주간/월간 기간)
CREATE TABLE IF NOT EXISTS charts (
  id SERIAL PRIMARY KEY,
  chart_type VARCHAR(20) NOT NULL DEFAULT 'weekly',
  week_ending DATE NOT NULL,
  region VARCHAR(10) NOT NULL DEFAULT 'kr',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(chart_type, week_ending, region)
);

CREATE INDEX IF NOT EXISTS idx_charts_week_ending ON charts(week_ending DESC);
CREATE INDEX IF NOT EXISTS idx_charts_type_week ON charts(chart_type, week_ending DESC);

-- Chart entries table: 차트 순위 데이터
CREATE TABLE IF NOT EXISTS chart_entries (
  id SERIAL PRIMARY KEY,
  chart_id INTEGER NOT NULL REFERENCES charts(id) ON DELETE CASCADE,
  rank INTEGER NOT NULL,
  artist VARCHAR(300) NOT NULL,
  title VARCHAR(300) NOT NULL,
  video_id VARCHAR(20) NOT NULL,
  streams BIGINT NOT NULL DEFAULT 0,
  streams_delta BIGINT DEFAULT 0,
  rank_change VARCHAR(10),
  peak_rank INTEGER,
  weeks_on_chart INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(chart_id, rank)
);

CREATE INDEX IF NOT EXISTS idx_entries_chart_rank ON chart_entries(chart_id, rank);
CREATE INDEX IF NOT EXISTS idx_entries_video_id ON chart_entries(video_id);
CREATE INDEX IF NOT EXISTS idx_entries_artist_title ON chart_entries(artist, title);

-- Cover videos table: 커버 영상 큐레이션
CREATE TABLE IF NOT EXISTS cover_videos (
  id SERIAL PRIMARY KEY,
  original_video_id VARCHAR(20) NOT NULL,
  cover_video_id VARCHAR(20) NOT NULL,
  cover_artist VARCHAR(200),
  cover_title VARCHAR(300) NOT NULL,
  thumbnail_url VARCHAR(500),
  view_count BIGINT DEFAULT 0,
  rank_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(original_video_id, cover_video_id)
);

CREATE INDEX IF NOT EXISTS idx_covers_original ON cover_videos(original_video_id, rank_order);
