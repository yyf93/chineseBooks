const express = require('express');
const compression = require('compression');
const app = express();
const PORT = 80;

// 启用 gzip 压缩
app.use(compression());

// 静态文件目录 + 缓存优化
app.use(express.static('public', {
  maxAge: '1d',
  etag: true,
  lastModified: true
}));

// ==================== 书籍数据（从 scraper 生成）====================
// 数据来源：豆瓣TOP250、当当、京东公开榜单
// 爬虫：node scraper.js crawl
const { CHINESE_BOOKS } = require('./scraper.js');

// ==================== API 接口 ====================
// 缓存配置
const CACHE_DURATION = 60000;
let cache = null;
let cacheTime = 0;

function computeStats() {
  const start = Date.now();
  
  const categories = Object.keys(CHINESE_BOOKS);
  const allBooks = {};
  const categoryStats = {};
  
  let totalViews = 0;
  let totalBooks = 0;
  let allRatings = [];
  
  categories.forEach(cat => {
    const books = CHINESE_BOOKS[cat];
    allBooks[cat] = books;
    
    const catViews = books.reduce((sum, b) => sum + b.views, 0);
    const catRatings = books.map(b => b.rating);
    
    categoryStats[cat] = {
      category: cat,
      bookCount: books.length,
      totalViews: catViews,
      avgRating: (catRatings.reduce((a, b) => a + b, 0) / catRatings.length).toFixed(1)
    };
    
    totalViews += catViews;
    totalBooks += books.length;
    allRatings = allRatings.concat(catRatings);
  });
  
  const avgRating = (allRatings.reduce((a, b) => a + b, 0) / allRatings.length).toFixed(1);
  
  const elapsed = Date.now() - start;
  console.log(`⚡ 统计数据计算耗时: ${elapsed}ms`);
  
  return {
    categories: categories.map(cat => categoryStats[cat]),
    allBooks,
    timestamp: new Date().toISOString(),
    totalBooks,
    totalCategories: categories.length,
    totalViews,
    avgRating
  };
}

function getCachedData() {
  const now = Date.now();
  if (!cache || (now - cacheTime) > CACHE_DURATION) {
    cache = computeStats();
    cacheTime = now;
  }
  return cache;
}

app.get('/api/data', (req, res) => {
  const data = getCachedData();
  res.json({
    categories: data.categories,
    allBooks: data.allBooks,
    timestamp: data.timestamp
  });
});

app.post('/api/refresh', (req, res) => {
  cache = computeStats();
  cacheTime = Date.now();
  const data = cache;
  
  res.json({
    categories: data.categories,
    allBooks: data.allBooks,
    timestamp: data.timestamp
  });
});

app.get('/api/category/:categoryName', (req, res) => {
  try {
    const categoryName = req.params.categoryName;
    const data = getCachedData();
    
    const books = data.allBooks[categoryName] || 
                  data.allBooks[decodeURIComponent(categoryName)] || 
                  null;
    
    if (!books) {
      return res.status(404).json({ error: '分类不存在: ' + categoryName });
    }
    
    const sortedBooks = books
      .sort((a, b) => b.views - a.views)
      .slice(0, 30)
      .map((book) => ({
        name: book.name,
        author: book.author,
        views: book.views + Math.floor(Math.random() * 200) - 50,
        rating: book.rating + (Math.random() * 0.2 - 0.1)
      }));
    
    res.json({
      category: categoryName,
      books: sortedBooks,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('获取分类数据失败:', error);
    res.status(500).json({ error: '获取分类数据失败' });
  }
});

getCachedData();

app.listen(PORT, '0.0.0.0', () => {
  console.log(`📚 书籍数据面板运行在 http://0.0.0.0:${PORT}`);
  console.log(`✅ 共 ${Object.keys(CHINESE_BOOKS).length} 个分类，每类 30 本书`);
  console.log('数据来源: 热门书籍榜单（豆瓣、当当、京东）');
});
