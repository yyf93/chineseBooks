#!/bin/bash

# Git 自动提交推送脚本
# 用法: ./git_push.sh "提交信息"

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# 进入项目目录
cd "$(dirname "$0")"

# 获取提交信息
if [ -z "$1" ]; then
    echo -e "${YELLOW}请输入提交信息:${NC}"
    read -r COMMIT_MSG
else
    COMMIT_MSG="$*"
fi

if [ -z "$COMMIT_MSG" ]; then
    echo -e "${RED}错误: 提交信息不能为空${NC}"
    exit 1
fi

echo -e "${YELLOW}=========================================${NC}"
echo -e "${YELLOW}Git 自动提交推送工具${NC}"
echo -e "${YELLOW}=========================================${NC}"
echo ""

# 1. 检查 Git 状态
echo -e "${YELLOW}[1/4]${NC} 检查文件状态..."
if git diff --quiet && git diff --cached --quiet; then
    echo -e "${YELLOW}没有需要提交的更改${NC}"
    exit 0
fi
echo -e "${GREEN}✓${NC} 发现更改"

# 2. 添加所有更改
echo ""
echo -e "${YELLOW}[2/4]${NC} 添加文件..."
git add .
CHANGES=$(git diff --cached --name-status | wc -l)
echo -e "${GREEN}✓${NC} 已添加 $CHANGES 个文件"

# 3. 提交更改
echo ""
echo -e "${YELLOW}[3/4]${NC} 提交更改..."
git commit -m "$COMMIT_MSG"
echo -e "${GREEN}✓${NC} 提交成功"

# 4. 推送到 GitHub
echo ""
echo -e "${YELLOW}[4/4]${NC} 推送到 GitHub..."
if git push; then
    echo ""
    echo -e "${GREEN}=========================================${NC}"
    echo -e "${GREEN}✓ 推送成功！${NC}"
    echo -e "${GREEN}=========================================${NC}"
    echo ""
    echo "提交信息: $COMMIT_MSG"
    echo "提交哈希: $(git log -1 --oneline | cut -d' ' -f1)"
    echo ""
    echo "仓库地址: $(git remote get-url origin)"
    echo ""
else
    echo ""
    echo -e "${RED}=========================================${NC}"
    echo -e "${RED}✗ 推送失败${NC}"
    echo -e "${RED}=========================================${NC}"
    echo ""
    echo "可能的原因:"
    echo "  - 网络连接问题"
    echo "  - GitHub 认证失败"
    echo "  - 远程仓库有冲突"
    echo ""
    echo "解决方法:"
    echo "  1. 检查网络连接"
    echo "  2. 验证 SSH 密钥: ssh -T git@github.com"
    echo "  3. 拉取远程更改: git pull --rebase"
    echo "  4. 重新推送: git push"
    echo ""
    exit 1
fi
