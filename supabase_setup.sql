-- 创建反馈表
-- 执行位置：Supabase SQL Editor
-- 时间：2026年1月9日

CREATE TABLE feedback (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    relation TEXT NOT NULL,
    device TEXT NOT NULL,
    message TEXT NOT NULL,
    version TEXT DEFAULT 'V3' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 创建索引
CREATE INDEX idx_feedback_created_at ON feedback(created_at);
CREATE INDEX idx_feedback_relation ON feedback(relation);
CREATE INDEX idx_feedback_device ON feedback(device);

-- 创建行级安全策略
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- 允许所有人查看反馈记录
CREATE POLICY "Public feedback view" ON feedback
FOR SELECT USING (true);

-- 允许插入反馈（公开反馈功能）
CREATE POLICY "Allow insert feedback" ON feedback
FOR INSERT WITH CHECK (true);

-- 给公共使用权限
GRANT INSERT ON feedback TO anon, authenticated;
GRANT SELECT ON feedback TO anon, authenticated;