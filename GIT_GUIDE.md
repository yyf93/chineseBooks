# Git 自动推送脚本使用指南

## 脚本位置
`/root/book-dashboard/git_push.sh`

## 使用方法

### 方法 1: 直接传递提交信息
```bash
cd /root/book-dashboard
./git_push.sh "feat: 添加新功能"
```

### 方法 2: 交互式输入提交信息
```bash
cd /root/book-dashboard
./git_push.sh
# 然后输入您的提交信息
```

### 方法 3: 绝对路径调用
```bash
/root/book-dashboard/git_push.sh "fix: 修复 bug"
```

## 提交信息格式建议

```
feat:     新功能
fix:      修复 bug
docs:     文档更新
style:    代码格式调整
refactor: 代码重构
test:     测试相关
chore:    构建/工具相关
```

## 示例

```bash
# 添加新功能
./git_push.sh "feat: 增加用户认证功能"

# 修复 bug
./git_push.sh "fix: 修复登录失败的问题"

# 更新文档
./git_push.sh "docs: 更新 README 文档"

# 代码重构
./git_push.sh "refactor: 优化数据查询逻辑"
```

## 脚本功能

✅ 自动检测文件更改
✅ 自动添加所有文件（git add .）
✅ 自动提交并推送到 GitHub
✅ 显示详细的操作步骤
✅ 推送失败时提供解决建议

## 故障排查

### 推送失败时，执行以下步骤：

1. **检查网络连接**
```bash
ping github.com
```

2. **验证 SSH 密钥**
```bash
ssh -T git@github.com
```

3. **拉取远程更改**
```bash
git pull --rebase
```

4. **重新推送**
```bash
git push
```

## 快捷别名（可选）

在 `~/.bashrc` 中添加：
```bash
alias gp='/root/book-dashboard/git_push.sh'
```

然后就可以在任何地方使用：
```bash
gp "commit message"
```
