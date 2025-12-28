-- Cover candidates table: YouTube 커버 후보 자동 검색/저장
-- 각 차트 원곡에 대해 YouTube API로 발굴한 커버 후보를 저장
CREATE TABLE IF NOT EXISTS cover_candidates (
  chart_id INTEGER NOT NULL REFERENCES charts(id) ON DELETE CASCADE,
  source_video_id TEXT NOT NULL,         -- 원곡 video_id
  candidate_video_id TEXT NOT NULL,      -- 커버 후보 video_id

  rank INTEGER NOT NULL,                 -- 원곡 차트 순위(편의)
  artist TEXT NOT NULL,
  title TEXT NOT NULL,

  candidate_title TEXT,
  channel_title TEXT,
  channel_id TEXT,
  published_at TIMESTAMPTZ,
  duration_seconds INTEGER,

  view_count BIGINT,
  like_count BIGINT,
  comment_count BIGINT,

  score NUMERIC NOT NULL,
  reason TEXT,                           -- 왜 뽑혔는지(디버깅용)
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  PRIMARY KEY (chart_id, source_video_id, candidate_video_id)
);

CREATE INDEX IF NOT EXISTS idx_cover_candidates_source
  ON cover_candidates(source_video_id);

CREATE INDEX IF NOT EXISTS idx_cover_candidates_chart_rank
  ON cover_candidates(chart_id, rank);
