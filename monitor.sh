#!/bin/bash
# Book Dashboard 监控脚本
# 功能: 定期检查服务是否运行，如果宕机则自动重启

PROJECT_DIR="/root/book-dashboard"
SERVER_PORT=80
LOG_FILE="$PROJECT_DIR/monitor.log"
PID_FILE="$PROJECT_DIR/server.pid"

# 记录日志函数
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# 检查服务是否运行
check_service() {
    # 尝试 curl 本地 API
    if curl -s -f "http://localhost:$SERVER_PORT/api/data" > /dev/null 2>&1; then
        return 0  # 运行中
    else
        return 1  # 未运行
    fi
}

# 获取进程 PID
get_pid() {
    if [ -f "$PID_FILE" ]; then
        cat "$PID_FILE"
    fi
}

# 检查进程是否存在
check_process() {
    local pid=$(get_pid)
    if [ -n "$pid" ] && kill -0 "$pid" 2>/dev/null; then
        return 0
    fi
    return 1
}

# 启动服务
start_service() {
    log "检测到服务未运行，正在启动..."

    # 杀掉可能的残留进程
    pkill -f "node $PROJECT_DIR/server.js" 2>/dev/null
    sleep 1

    # 启动服务
    cd "$PROJECT_DIR"
    nohup node server.js > /dev/null 2>&1 &
    SERVER_PID=$!
    echo "$SERVER_PID" > "$PID_FILE"

    # 等待服务启动
    sleep 2

    # 验证启动成功
    if check_service; then
        log "✅ 服务启动成功 (PID: $SERVER_PID)"
        return 0
    else
        log "❌ 服务启动失败"
        return 1
    fi
}

# 主监控逻辑
main() {
    log "========== 监控开始 =========="

    while true; do
        if check_service; then
            # 服务运行中
            log "✅ 服务运行正常"
        else
            # 服务未运行，尝试检查进程
            if check_process; then
                log "⚠️ 进程存在但无响应，重启中..."
                kill $(get_pid) 2>/dev/null
                sleep 1
                start_service
            else
                log "⚠️ 服务未运行，立即启动..."
                start_service
            fi
        fi

        # 每 30 秒检查一次
        sleep 30
    done
}

# 停止监控
stop() {
    log "停止监控脚本..."
    local pid=$(pgrep -f "monitor.sh")
    if [ -n "$pid" ]; then
        kill "$pid" 2>/dev/null
    fi
    exit 0
}

# 启动时检查一次
case "${1:-start}" in
    start)
        main
        ;;
    stop)
        stop
        ;;
    restart)
        stop
        sleep 2
        main
        ;;
    status)
        if check_service; then
            echo "✅ 服务运行正常"
            exit 0
        else
            echo "❌ 服务未运行"
            exit 1
        fi
        ;;
    once)
        if check_service; then
            log "✅ 服务运行正常"
        else
            log "⚠️ 服务未运行，立即启动..."
            start_service
        fi
        ;;
    *)
        echo "用法: $0 {start|stop|restart|status|once}"
        exit 1
        ;;
esac
