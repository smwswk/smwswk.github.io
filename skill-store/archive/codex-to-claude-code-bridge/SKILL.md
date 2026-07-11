---
name: codex-to-claude-code-bridge
description: 当用户要求Codex调用本机Claude Code执行边界清楚的本地文件/脚本任务时，按本skill的固定模板派工：先做Claude CLI可用性自检，再发送最小权限任务包，任务结果必须由Codex独立验收。
---

# Codex ↔ Claude Code 桥接技能

本技能用于把 Codex 的任务稳定下发给本机 Claude Code（`claude` CLI）。适用场景：文件整理、批量移动、目录扫描、脚本运行、格式转换、仅读盘点、低风险批处理。

## 0. 触发与边界

- 仅用于**本机任务**的执行后端：`claude -p`。
- 禁止直接用于：删除、覆盖、提交、外发、隐私/密钥、行政材料最终口径判断、学术论证定稿。
- 所有任务都必须是“可验收、可复核、最小权限”。

## 1. 固定前置自检

```bash
command -v claude
claude --version
claude -p --tools "" --no-session-persistence "只回复：Claude CLI 可用"
```

三项都通过后再派工。

## 2. 任务派工总模板

```bash
claude -p \
  --permission-mode acceptEdits \
  --allowedTools "Read,Write,Bash(mkdir *),Bash(mv *),Bash(test *),Bash(find *),Bash(ls *)" \
  --add-dir /path/to/allowed/input \
  --add-dir /path/to/workspace \
  --no-session-persistence \
  "【CC执行任务】
任务编号：CC-YYYYMMDD-HHMM-领域-01
主控：Codex
工作区：/path/to/workspace
任务类型：文件修改 / 脚本执行 / 只读整理 / 数据核对
协调模式：orchestrator-subagent
派工通道：claude-cli
最多返工次数：0
终止条件：完成验收 / 需要用户确认 / 触碰禁止操作

目标：

输入材料：

允许操作：

禁止操作：

验收标准：

输出格式：
1. 任务编号
2. 执行摘要
3. 修改或生成的文件
4. 验证方式与结果
5. 未完成事项或风险
6. 建议写入共享状态的内容"
```

## 3. 任务字段必须包含

- 任务编号
- 目标
- 允许操作
- 禁止操作
- 验收标准
- 输出格式（固定 6 项）

## 4. 常见错误修复（覆盖旧版失效要点）

- 不要把 `--permission-mode`、`--add-dir`、`--allowedTools` 省略。
- 旧版若泛用 `--allowedTools` 导致拒绝执行，改为最小可用集合并按命令前缀限定。
- 不要把“任务目标”写得太泛，必须落到具体路径和文件名。
- Claude 返回成功不算通过，必须进行 Codex 独立验收。

## 5. 验收（Codex必须执行）

- 目标文件存在性/目录存在性：

```bash
test -f "/path/to/expected/file" && echo file_exists

test -d "/path/to/expected/folder" && echo folder_exists
```

- 移动结果：

```bash
test -f "/Users/yourname/Desktop/文档归档/example.pdf" && echo moved_ok
```

- 保护项未误改：

```bash
test -f "/Users/yourname/Desktop/private.pdf" && echo protected_item_still_here
```

## 6. 使用建议模板（可直接粘贴）

- 任务尽量“一事一包”。
- 文件移动任务必须带“允许列表+禁止列表”。
- 写入或改动文件必须是唯一目标路径。
- 有歧义就先返回“clarify”给用户，不硬跑。
