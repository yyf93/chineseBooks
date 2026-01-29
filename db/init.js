/**
 * 数据库初始化脚本
 * 运行: node db/init.js
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// 数据库配置
const config = {
    host: process.env.DB_HOST || process.env.PGHOST || 'localhost',
    port: process.env.DB_PORT || process.env.PGPORT || 5432,
    database: process.env.DB_NAME || process.env.PGDATABASE || 'books_db',
    user: process.env.DB_USER || process.env.PGUSER || 'postgres',
    password: process.env.DB_PASSWORD || process.env.PGPASSWORD || ''
};

async function initDatabase() {
    const client = new Client(config);

    try {
        console.log('📦 连接数据库...');
        await client.connect();
        console.log('✅ 数据库连接成功');

        // 读取 SQL 文件
        const sqlFile = path.join(__dirname, 'init.sql');
        const sql = fs.readFileSync(sqlFile, 'utf8');

        console.log('🔧 执行数据库初始化...');
        await client.query(sql);

        console.log('✅ 数据库初始化完成!');
        console.log('\n📊 创建的对象:');
        console.log('  - 表: categories, books');
        console.log('  - 索引: 6个索引');
        console.log('  - 触发器: 更新时间戳');
        console.log('  - 视图: popular_books, category_stats');
        console.log('  - 数据: 22个分类');

        // 验证表创建
        const result = await client.query(`
            SELECT tablename
            FROM pg_tables
            WHERE schemaname = 'public'
            ORDER BY tablename;
        `);

        console.log('\n✅ 数据库表:');
        result.rows.forEach(row => {
            console.log(`  - ${row.tablename}`);
        });

    } catch (err) {
        console.error('❌ 错误:', err.message);
        process.exit(1);
    } finally {
        await client.end();
        console.log('\n👋 数据库连接已关闭');
    }
}

// 如果直接运行此文件
if (require.main === module) {
    initDatabase();
}

module.exports = { initDatabase };
