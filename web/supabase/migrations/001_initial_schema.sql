-- ============================================================
-- my-job-agent-web: Initial Schema
-- ============================================================

-- 에피소드 테이블
CREATE TABLE IF NOT EXISTS episodes (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  episode_id        TEXT NOT NULL,
  source            TEXT,
  title             TEXT NOT NULL,
  primary_competency TEXT NOT NULL,
  tags              TEXT[] NOT NULL DEFAULT '{}',
  strength          INTEGER CHECK (strength BETWEEN 1 AND 5),
  situation         TEXT,
  task              TEXT,
  action            TEXT,
  result            TEXT,
  core_message      TEXT,
  used_count        INTEGER DEFAULT 0,
  last_used         TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- 공고 테이블
CREATE TABLE IF NOT EXISTS jobs (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  job_id       TEXT NOT NULL,
  company      TEXT NOT NULL,
  title        TEXT NOT NULL,
  deadline     DATE,
  status       TEXT DEFAULT '수집완료',
  body         TEXT,
  questions    JSONB DEFAULT '[]',
  linked_files JSONB DEFAULT '{}',
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- 자소서 테이블
CREATE TABLE IF NOT EXISTS essays (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  job_id          UUID REFERENCES jobs(id) ON DELETE CASCADE NOT NULL,
  question_number INTEGER NOT NULL,
  question_text   TEXT,
  content         TEXT DEFAULT '',
  episode_ids     UUID[] DEFAULT '{}',
  status          TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'final')),
  review_notes    TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, job_id, question_number)
);

-- 기업 분석 리포트 테이블
CREATE TABLE IF NOT EXISTS company_reports (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  job_id     UUID REFERENCES jobs(id) ON DELETE CASCADE,
  company    TEXT NOT NULL,
  content    TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- RLS (Row Level Security)
-- ============================================================

ALTER TABLE episodes        ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs             ENABLE ROW LEVEL SECURITY;
ALTER TABLE essays           ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_reports  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own data only" ON episodes
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "own data only" ON jobs
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "own data only" ON essays
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "own data only" ON company_reports
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- ============================================================
-- Triggers
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER essays_updated_at
  BEFORE UPDATE ON essays
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
