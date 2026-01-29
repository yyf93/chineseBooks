-- 书籍数据库表结构
-- 数据库: ai_database

-- 删除已存在的表（谨慎使用）
DROP TABLE IF EXISTS books CASCADE;
DROP TABLE IF EXISTS categories CASCADE;

-- 创建分类表
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(50),
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建书籍表
CREATE TABLE IF NOT EXISTS books (
    id SERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    author VARCHAR(500),
    isbn VARCHAR(20),
    publisher VARCHAR(200),
    publish_date DATE,
    pages INTEGER,
    price DECIMAL(10, 2),
    language VARCHAR(50) DEFAULT '中文',

    -- 评分和统计
    rating DECIMAL(3, 1) CHECK (rating >= 0 AND rating <= 10),
    rating_count INTEGER DEFAULT 0,
    views BIGINT DEFAULT 0,
    favorites INTEGER DEFAULT 0,

    -- 分类
    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,

    -- 描述和详情
    description TEXT,
    cover_url VARCHAR(500),
    info_url VARCHAR(500),

    -- 数据来源
    source VARCHAR(100), -- douban, jingdong, openlibrary, etc.
    source_id VARCHAR(100),

    -- 状态
    status VARCHAR(20) DEFAULT 'active', -- active, inactive, deleted

    -- 时间戳
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- 索引
    CONSTRAINT books_title_author_unique UNIQUE (title, author)
);

-- 创建索引
CREATE INDEX idx_books_category ON books(category_id);
CREATE INDEX idx_books_rating ON books(rating DESC);
CREATE INDEX idx_books_views ON books(views DESC);
CREATE INDEX idx_books_status ON books(status);
CREATE INDEX idx_books_source ON books(source);
CREATE INDEX idx_books_created ON books(created_at);

-- 创建全文搜索索引（PostgreSQL）
CREATE INDEX idx_books_search ON books USING gin(to_tsvector('english', title || ' ' || COALESCE(author, '') || ' ' || COALESCE(description, '')));

-- 插入初始分类数据
INSERT INTO categories (name, slug, description, sort_order) VALUES
('文学', 'literature', '小说、散文、诗歌等文学作品', 1),
('编程', 'programming', '计算机编程、软件开发等技术书籍', 2),
('商业', 'business', '商业管理、投资理财、创业等', 3),
('心理学', 'psychology', '心理学研究、自助成长等', 4),
('科技', 'technology', '科技趋势、人工智能、科学普及', 5),
('科幻', 'scifi', '科幻小说作品', 6),
('悬疑推理', 'mystery', '悬疑、推理、侦探小说', 7),
('历史', 'history', '历史研究、历史读物', 8),
('艺术', 'art', '艺术、设计、摄影等', 9),
('生活', 'lifestyle', '生活方式、个人成长等', 10),
('哲学', 'philosophy', '哲学思想、哲学史', 11),
('经济学', 'economics', '经济学理论、经济分析', 12),
('教育', 'education', '教育理论、学习方法', 13),
('医学', 'medicine', '医学知识、健康养生', 14),
('军事', 'military', '军事历史、军事理论', 15),
('宗教', 'religion', '宗教、灵性成长', 16),
('语言学习', 'language', '外语学习、语言学研究', 17),
('旅行', 'travel', '旅行指南、旅行文学', 18),
('体育', 'sports', '体育运动、健身保健', 19),
('美食', 'food', '美食烹饪、饮食文化', 20),
('物理学', 'physics', '物理学、宇宙探索', 21),
('传记', 'biography', '人物传记、回忆录', 22)
ON CONFLICT (slug) DO NOTHING;

-- 创建更新时间触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_categories_updated_at
    BEFORE UPDATE ON categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_books_updated_at
    BEFORE UPDATE ON books
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 创建视图：热门书籍统计
CREATE OR REPLACE VIEW popular_books AS
SELECT
    b.*,
    c.name as category_name,
    c.slug as category_slug,
    CASE
        WHEN b.views > 1000000 THEN '超热门'
        WHEN b.views > 500000 THEN '热门'
        WHEN b.views > 100000 THEN '受欢迎'
        ELSE '普通'
    END as popularity_level
FROM books b
LEFT JOIN categories c ON b.category_id = c.id
WHERE b.status = 'active'
ORDER BY b.views DESC;

-- 创建视图：分类统计
CREATE OR REPLACE VIEW category_stats AS
SELECT
    c.id,
    c.name,
    c.slug,
    COUNT(b.id) as book_count,
    COALESCE(AVG(b.rating), 0) as avg_rating,
    COALESCE(SUM(b.views), 0) as total_views
FROM categories c
LEFT JOIN books b ON c.id = b.category_id AND b.status = 'active'
GROUP BY c.id, c.name, c.slug
ORDER BY c.sort_order;

COMMENT ON TABLE categories IS '书籍分类表';
COMMENT ON TABLE books IS '书籍信息表';
COMMENT ON VIEW popular_books IS '热门书籍视图';
COMMENT ON VIEW category_stats IS '分类统计视图';
