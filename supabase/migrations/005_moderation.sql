-- =====================================================
-- MODERATION SYSTEM
-- =====================================================

-- Reports table for flagging inappropriate content
CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporter_id UUID NOT NULL REFERENCES parents(id) ON DELETE CASCADE,
    post_id UUID REFERENCES posts(id) ON DELETE SET NULL,
    comment_id UUID REFERENCES comments(id) ON DELETE SET NULL,
    reason TEXT NOT NULL CHECK (reason IN ('spam', 'harassment', 'inappropriate', 'misinformation', 'other')),
    description TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'removed', 'dismissed')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT report_target CHECK (post_id IS NOT NULL OR comment_id IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_reporter ON reports(reporter_id);

-- Blocked users table
CREATE TABLE IF NOT EXISTS blocked_users (
    blocker_id UUID NOT NULL REFERENCES parents(id) ON DELETE CASCADE,
    blocked_id UUID NOT NULL REFERENCES parents(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (blocker_id, blocked_id)
);

CREATE INDEX IF NOT EXISTS idx_blocked_users_blocker ON blocked_users(blocker_id);

-- Community terms acceptance
CREATE TABLE IF NOT EXISTS terms_acceptance (
    parent_id UUID PRIMARY KEY REFERENCES parents(id) ON DELETE CASCADE,
    accepted_at TIMESTAMPTZ DEFAULT NOW(),
    version TEXT NOT NULL DEFAULT '1.0'
);
