-- 清空现有feedback表数据并重新配置权限
-- 执行位置：Supabase SQL Editor
-- 时间：2026年1月9日

-- 1. 清空现有数据
TRUNCATE TABLE feedback CASCADE;

-- 2. 重新配置行级安全策略
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- 3. 删除现有策略（如果存在）
DROP POLICY IF EXISTS "访客只能创建反馈" ON feedback;
DROP POLICY IF EXISTS "拒绝所有读取" ON feedback;
DROP POLICY IF EXISTS "拒绝所有更新" ON feedback;
DROP POLICY IF EXISTS "拒绝所有删除" ON feedback;
DROP POLICY IF EXISTS "管理员可以查看所有反馈" ON feedback;
DROP POLICY IF EXISTS "管理员可以更新所有反馈" ON feedback;
DROP POLICY IF EXISTS "管理员可以删除所有反馈" ON feedback;

-- 4. 按照课程要求重新创建策略

-- 访客只能插入新反馈（允许创建）
CREATE POLICY "访客只能创建反馈" ON feedback
    FOR INSERT TO anon 
    WITH CHECK (true);

-- 拒绝所有读取操作（访客不能查看反馈）
CREATE POLICY "拒绝所有读取" ON feedback
    FOR SELECT TO anon 
    USING (false);

-- 拒绝所有更新操作（访客不能修改反馈）
CREATE POLICY "拒绝所有更新" ON feedback
    FOR UPDATE TO anon 
    USING (false);

-- 拒绝所有删除操作（访客不能删除反馈）
CREATE POLICY "拒绝所有删除" ON feedback
    FOR DELETE TO anon 
    USING (false);

-- ===== 管理员权限（所有者可以查看所有数据） =====

-- 允许管理员查看所有反馈
CREATE POLICY "管理员可以查看所有反馈" ON feedback
    FOR SELECT TO authenticated 
    USING (true);

-- 允许管理员更新所有反馈
CREATE POLICY "管理员可以更新所有反馈" ON feedback
    FOR UPDATE TO authenticated 
    USING (true);

-- 允许管理员删除所有反馈
CREATE POLICY "管理员可以删除所有反馈" ON feedback
    FOR DELETE TO authenticated 
    USING (true);

-- ===== 权限分配 =====

-- 给匿名用户插入权限
GRANT INSERT ON feedback TO anon;

-- 给认证用户所有权限
GRANT ALL PRIVILEGES ON feedback TO authenticated;

-- 5. 重新创建索引
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON feedback(created_at);
CREATE INDEX IF NOT EXISTS idx_feedback_relation ON feedback(relation);
CREATE INDEX IF NOT EXISTS idx_feedback_device ON feedback(device);

-- 6. 验证配置成功
-- 可以执行以下查询验证（管理员身份）
-- SELECT COUNT(*) as record_count FROM feedback;