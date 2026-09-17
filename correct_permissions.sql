-- 重新创建反馈表 - 修正权限配置
-- 执行位置：Supabase SQL Editor
-- 时间：2026年1月9日

-- 1. 删除现有表（如果存在）
DROP TABLE IF EXISTS feedback CASCADE;

-- 2. 创建新的反馈表
CREATE TABLE feedback (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    relation TEXT NOT NULL,
    device TEXT NOT NULL,
    message TEXT NOT NULL,
    version TEXT DEFAULT 'V3' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3. 创建索引
CREATE INDEX idx_feedback_created_at ON feedback(created_at);
CREATE INDEX idx_feedback_relation ON feedback(relation);
CREATE INDEX idx_feedback_device ON feedback(device);

-- 4. 启用行级安全策略
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- ===== 访客权限（严格按照课程要求） =====

-- 访客只能插入新反馈（允许创建）
CREATE POLICY "Allow visitors to insert feedback" ON feedback
    FOR INSERT TO anon
    WITH CHECK (true);

-- 拒绝所有读取操作（访客不能查看反馈）
CREATE POLICY "Deny all read access to visitors" ON feedback
    FOR SELECT TO anon
    USING (false);

-- 拒绝所有更新操作（访客不能修改反馈）
CREATE POLICY "Deny all update access to visitors" ON feedback
    FOR UPDATE TO anon
    USING (false);

-- 拒绝所有删除操作（访客不能删除反馈）
CREATE POLICY "Deny all delete access to visitors" ON feedback
    FOR DELETE TO anon
    USING (false);

-- ===== 管理员权限（所有者可以操作所有数据） =====

-- 允许管理员查看所有反馈
CREATE POLICY "Allow owner to read all feedback" ON feedback
    FOR SELECT TO authenticated
    USING (true);

-- 允许管理员更新所有反馈
CREATE POLICY "Allow owner to update all feedback" ON feedback
    FOR UPDATE TO authenticated
    USING (true);

-- 允许管理员删除所有反馈
CREATE POLICY "Allow owner to delete all feedback" ON feedback
    FOR DELETE TO authenticated
    USING (true);

-- ===== 权限分配 =====

-- 给匿名用户插入权限
GRANT INSERT ON feedback TO anon;

-- 给认证用户所有权限
GRANT ALL PRIVILEGES ON feedback TO authenticated;

-- 6. 验证配置
-- 可以使用以下查询验证（管理员身份）：
-- SELECT COUNT(*) as record_count FROM feedback;
