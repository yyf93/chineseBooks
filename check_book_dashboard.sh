#!/bin/bash

# Book Dashboard 守护脚本
# 每5分钟检查服务是否运行，如果挂了则自动启动

# 配置
LOG_FILE="/var/log/book_dashboard_watchdog.log"
SERVICE_NAME="book-dashboard"
PORT=80
PROJECT_DIR="/root/book-dashboard"

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 日志函数 - 终端输出带颜色，日志文件纯文本
log() {
    local message="$1"
    local timestamp="[$(date '+%Y-%m-%d %H:%M:%S')]"

    # 去除颜色代码（用于日志文件）
    local clean_message=$(echo -e "$message" | sed 's/\x1b\[[0-9;]*m//g')

    # 终端输出（带颜色，如果支持的话）
    if [ -t 1 ]; then
        echo -e "${timestamp} ${message}"
    else
        echo "${timestamp} ${clean_message}"
    fi

    # 日志文件（纯文本）
    echo "${timestamp} ${clean_message}" >> "$LOG_FILE"
}

# 检查服务进程是否运行
check_process() {
    # 方法1: 检查是否有 node server.js 进程
    if pgrep -f "node server.js" > /dev/null 2>&1; then
        return 0
    fi

    # 方法2: 检查端口是否监听
    if ss -tlnp 2>/dev/null | grep -q ":$PORT "; then
        return 0
    fi

    # 方法3: 尝试访问健康检查接口
    if command -v curl &> /dev/null; then
        if curl -s "http://localhost:$PORT/api/data" > /dev/null 2>&1; then
            return 0
        fi
    fi

    return 1
}

# 启动服务
start_service() {
    log "${YELLOW}尝试启动 book-dashboard...${NC}"

    # 进入项目目录
    cd "$PROJECT_DIR" || {
        log "${RED}✗ 无法进入项目目录: $PROJECT_DIR${NC}"
        return 1
    }

    # 检查必要文件
    if [ ! -f "server.js" ]; then
        log "${RED}✗ server.js 文件不存在${NC}"
        return 1
    fi

    # 检查依赖
    if [ ! -d "node_modules" ]; then
        log "${YELLOW}⚠ node_modules 不存在，正在安装依赖...${NC}"
        if npm install >> "$LOG_FILE" 2>&1; then
            log "${GREEN}✓ 依赖安装成功${NC}"
        else
            log "${RED}✗ 依赖安装失败${NC}"
            return 1
        fi
    fi

    # 启动服务（使用 nohup 后台运行）
    nohup node server.js >> /var/log/book_dashboard_server.log 2>&1 &
    START_PID=$!

    # 等待服务启动
    sleep 3

    # 验证是否启动成功
    if ps -p "$START_PID" > /dev/null 2>&1; then
        # 进一步检查端口是否监听
        sleep 2
        if ss -tlnp 2>/dev/null | grep -q ":$PORT "; then
            log "${GREEN}✓ book-dashboard 已启动 (PID: $START_PID, Port: $PORT)${NC}"
            return 0
        else
            log "${YELLOW}⚠ 进程启动但端口未监听，可能有问题${NC}"
            return 1
        fi
    else
        log "${RED}✗ book-dashboard 启动失败${NC}"
        return 1
    fi
}

# 主逻辑
main() {
    if check_process; then
        # 服务正在运行
        PIDS=$(pgrep -f "node server.js" | tr '\n' ' ')
        log "${GREEN}book-dashboard 正在运行 (PIDs: $PIDS)${NC}"

        # 检查端口状态
        if ss -tlnp 2>/dev/null | grep -q ":$PORT "; then
            CONN_COUNT=$(ss -tnp 2>/dev/null | grep ":$PORT " | wc -l)
            log "${GREEN}端口 $PORT 正常监听 (活跃连接: $CONN_COUNT)${NC}"
        fi
    else
        # 服务未运行，尝试启动
        log "${RED}book-dashboard 未运行，尝试重启...${NC}"

        # 先清理可能的僵尸进程
        pkill -9 -f "node server.js" 2>/dev/null || true

        # 等待端口释放
        sleep 2

        if start_service; then
            log "${GREEN}book-dashboard 重启成功${NC}"
        else
            log "${RED}book-dashboard 重启失败，请检查日志${NC}"
            log "${YELLOW}日志文件: /var/log/book_dashboard_server.log${NC}"
        fi
    fi
}

# 执行主函数
main
