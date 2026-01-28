#!/bin/bash

# Git 历史清理脚本
# 彻底删除所有 Git 历史记录，从干净状态重新开始

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}=========================================${NC}"
echo -e "${YELLOW}Git 历史清理工具${NC}"
echo -e "${YELLOW}=========================================${NC}"
echo ""

cd /root/book-dashboard

echo -e "${YELLOW}⚠️  警告：此操作将：${NC}"
echo "   - 删除所有 Git 历史记录"
echo "   - 重新初始化仓库"
echo "   - 需要强制推送到远程仓库"
echo ""

read -p "确认继续？(输入 yes 确认): " confirm
if [ "$confirm" != "yes" ]; then
    echo -e "${RED}已取消${NC}"
    exit 0
fi

echo ""
echo -e "${YELLOW}[1/5]${NC} 备份当前 Git 配置..."
BRANCH=$(git branch --show-current)
REMOTE_URL=$(git remote get-url origin)
echo "  当前分支: $BRANCH"
echo "  远程仓库: $REMOTE_URL"

echo ""
echo -e "${YELLOW}[2/5]${NC} 删除 .git 目录..."
rm -rf .git

echo ""
echo -e "${YELLOW}[3/5]${NC} 重新初始化 Git 仓库..."
git init
git config user.name "root"
git config user.email "root@$(hostname)"

echo ""
echo -e "${YELLOW}[4/5]${NC} 添加所有文件..."
git add .
git add .gitignore
git add SECURITY_REPORT.md

echo ""
echo -e "${YELLOW}[5/5]${NC} 创建初始提交..."
git commit -m "Initial commit

- 书籍数据展示面板
- 添加 .gitignore 防止提交日志和依赖
- 安全配置完成"

echo ""
echo -e "${YELLOW}添加远程仓库...${NC}"
git remote add origin "$REMOTE_URL"
git branch -M main

echo ""
echo -e "${GREEN}✓ Git 历史已清理${NC}"
echo ""
echo -e "${YELLOW}下一步操作：${NC}"
echo "  1. 检查文件状态: git status"
echo "  2. 强制推送到 GitHub: git push -f origin main"
echo ""
echo -e "${RED}⚠️  注意：需要强制推送（-f）来覆盖远程历史${NC}"
