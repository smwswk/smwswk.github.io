# 量子速读 Skill 安装说明

版本：2026.07.02

## 安装

```bash
mkdir -p ~/.codex/skills/quantum-speed-reading
cp -R quantum-speed-reading/* ~/.codex/skills/quantum-speed-reading/
```

如果你是从 zip 解压：

```bash
unzip quantum-speed-reading.zip
mkdir -p ~/.codex/skills/quantum-speed-reading
cp -R quantum-speed-reading/* ~/.codex/skills/quantum-speed-reading/
```

## 自检

安装前或安装后都可以离线自检，不需要 API key：

```bash
cd quantum-speed-reading
python3 scripts/validate_skill.py
python3 scripts/asr_benchmark.py --help
python3 scripts/transcribe_global.py --help
```

自检通过只代表 Skill 包结构和脚本入口可用。真正跑音视频转录前，还需要配置 `SF_KEY`、`SILICONFLOW_API_KEY` 或 `~/.config/siliconflow/api_key`，并安装 `ffmpeg`。

## 使用

在 Codex 里直接说：

```text
跑量子速读
```

或：

```text
用量子速读处理这一批 B站、小宇宙、小红书和公众号链接
```

也可以说：

```text
跑内容引擎
跑一波
处理这些小红书、B站、公众号、知乎和本地音视频
```

## 交付内容

- `SKILL.md`
- `scripts/asr_benchmark.py`
- `scripts/transcribe_global.py`
- `scripts/validate_skill.py`
- `agents/openai.yaml`

## 能处理什么

- 小红书：视频走下载、切片、ASR；图文走正文和图片 OCR。
- B站：下载音频后 ASR；官方字幕只能辅助校验。
- 小宇宙：从页面提取当前音频地址后转录。
- 公众号：先抓正文，反爬或正文过短时标记补采。
- 知乎：优先抓可用正文，截断或反爬时标记补采。
- 本地音视频：按文件切片、转录、总结。

## 输出标准

最终摘要不是抽句拼贴。每条内容至少要有：

- 质量门禁；
- 一句话概括；
- 内容复原；
- 核心内容；
- 核心论点与推导；
- 高光亮点；
- 金句或短引述；
- 与用户项目相关的判断；
- 编辑层提炼；
- 补采或失败项。

## 注意

这个 Skill 是内容摄入框架，不内置平台登录态、转录 API key、Cookie 或任何本机私有路径。首次使用时需要按你的环境配置 Cookie、SiliconFlow / TeleSpeechASR key、`ffmpeg` 和平台抓取工具。

如果只完成下载、切片或转录，还不能当成最终交付。必须等理解式摘要写完并通过质量门禁，才可以清理提醒事项或稍后再看列表。
