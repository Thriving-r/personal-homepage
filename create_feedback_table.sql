-- 创建 feedback 表
CREATE TABLE feedback (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name TEXT,
    relation TEXT NOT NULL,
    device TEXT NOT NULL,
    message TEXT NOT NULL,
    version TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 开启行级安全策略
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- 创建访客只能插入新记录的策略
CREATE POLICY "Allow visitors to insert feedback" ON feedback 
    FOR INSERT TO PUBLIC 
    WITH CHECK (true);

-- 创建所有者可以读取所有记录的策略
CREATE POLICY "Allow owner to read all feedback" ON feedback 
    FOR SELECT TO authenticated 
    USING (true);

-- 拒绝其他所有操作（包括读取、更新、删除）
DROP POLICY IF EXISTS "Allow authenticated to read feedback" ON feedback;
DROP POLICY IF EXISTS "Allow authenticated to update feedback" ON feedback;
DROP POLICY IF EXISTS "Allow authenticated to delete feedback" ON feedback;

-- 插入一些测试数据（可选）
INSERT INTO feedback (name, relation, device, message, version) VALUES 
('匿名访客', '同学', '电脑', '个人主页设计很棒！', 'V3');
INSERT INTO feedback (name, relation, device, message, version) VALUES 
('测试用户', '朋友', '手机', '反馈功能工作正常', 'V3');