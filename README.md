# SMWSWK · 一个人 + AI 工作台

一个部署在 Render 上的个人 AI 工作台索引。这里把已经上线的自动化工具、业务原型、内容处理页面、交互实验和视觉作品按使用场景组织，作为“一个人 + AI”服务能力的公开作品集。

**Live demo:** https://ai-independent-builder.onrender.com/

**Legacy mirror:** https://smwswk.github.io/

![SMWSWK homepage](docs/screenshots/homepage-business.png)

## 项目动机

这个站点不是单纯的个人主页，而是一个持续更新的公开工作台：

- 展示 AI 自动化咨询可以交付什么，而不是只展示抽象能力。
- 把零散工具包装成可访问、可演示、可复用的项目入口。
- 让客户能从具体业务场景进入：流程录入、票据表单、业务后台、内容处理、教育培训、零售顾问。
- 给未来的小工具仓库提供统一包装标准：README、截图、在线 demo、使用方式、LICENSE、`.gitignore`。

## 在线项目索引

### 企业自动化与咨询

| 项目 | 场景 | 在线入口 |
| --- | --- | --- |
| 首页服务索引 | AI 自动化咨询与系统交付 | https://ai-independent-builder.onrender.com/ |
| AI 自动化需求诊断 | 6 个问题收集流程、材料、系统限制和交付目标 | https://ai-independent-builder.onrender.com/ai-diagnostic/ |
| 发票申请自动化案例 | 票据识别、模板填充、表单提交、过程留痕 | https://ai-independent-builder.onrender.com/invoice-automation-case/ |
| 系统录入自动化案例 | 材料解析、字段映射、附件上传、表单录入、状态回写 | https://ai-independent-builder.onrender.com/system-entry-automation-case/ |
| 账单 / 对账表自动化案例 | 流水清洗、分类规则、专项支出识别、汇总表写入 | https://ai-independent-builder.onrender.com/billing-reconciliation-case/ |
| 艺术家画册订单后台 | 小团队订单、客户、库存、项目后台样本 | https://artist-book-orders.onrender.com/ |
| 音视频内容处理台 | 会议、课程、录音和视频资料整理 | https://ai-independent-builder.onrender.com/audio-video-summary/ |
| AI 穿搭顾问 | 零售、私域、电商顾问型 AI 前台 | https://ai-independent-builder.onrender.com/style-advisor/ |
| 考公罗盘 | 教育培训 AI 私教产品样本 | https://ai-independent-builder.onrender.com/exam-compass/ |

![AI diagnostic mobile](docs/screenshots/ai-diagnostic-mobile.png)

### 小工具与工作流

| 项目 | 说明 | 在线入口 |
| --- | --- | --- |
| 双机屏幕切换包 | 旧系统和共享显示器的快捷切换工具包 | https://ai-independent-builder.onrender.com/display-switch/ |
| 跨平台光盘刻录工具 | Mac / Windows 旧系统刻录脚本和下载包 | https://ai-independent-builder.onrender.com/disc-burner/ |
| 蓝牙音质切换 | macOS 蓝牙耳机 HFP / A2DP 音质切换 | https://ai-independent-builder.onrender.com/bluetooth-audio-switch/ |

### 交互实验与内容作品

| 项目 | 类型 | 在线入口 |
| --- | --- | --- |
| 空间错误 / Backrooms | 3D 浏览器交互 demo | https://ai-independent-builder.onrender.com/backrooms-space-error-ios/ |
| 像素僵尸射击 | 移动端 Canvas 生存射击 | https://ai-independent-builder.onrender.com/pixel-zombie/ |
| 课间发波 | 回合制卡牌爬塔原型 | https://ai-independent-builder.onrender.com/fa-bo-spire/ |
| NINJA SLASH | 浏览器动作原型 | https://ai-independent-builder.onrender.com/ninja-slash/ |
| 摄影 Gallery | 个人摄影作品入口 | https://ai-independent-builder.onrender.com/photo/ |
| 播客名片 | 独立播客播客商务名片 | https://ai-independent-builder.onrender.com/podcast/ |

### 视觉生成与内容资产

| 项目 | 类型 | 在线入口 |
| --- | --- | --- |
| 商业视觉 | 品牌、电商和内容资产生成样本 | https://ai-independent-builder.onrender.com/wedding-ai-studio/commercial/ |
| 视觉生成入口 | 文本到图像的轻量入口 | https://ai-independent-builder.onrender.com/lit-visual/generate/ |
| Lit-Visual 作品集 | 小说影像化和生成式视觉项目 | https://ai-independent-builder.onrender.com/lit-visual/ |
| Prompt 工具包 | Prompt 产品化页面 | https://ai-independent-builder.onrender.com/prompt-toolkit/ |

## 使用方式

这个仓库是静态站点，主站由 Render Static Site 从仓库根目录发布。GitHub Pages 保留为旧镜像入口，不作为主要公开链接。

本地预览：

```sh
cd "$HOME/Documents/GitHub/smwswk.github.io"
python3 -m http.server 8027
```

然后打开：

```text
http://localhost:8027/
```

常用页面：

```text
http://localhost:8027/ai-diagnostic/
http://localhost:8027/invoice-automation-case/
http://localhost:8027/system-entry-automation-case/
http://localhost:8027/billing-reconciliation-case/
http://localhost:8027/style-advisor/
```

部署到 Render：

```sh
git status --short
git add <changed files>
git commit -m "Update site"
git push origin master
```

Render 服务：`smwswk-homepage`

Render 配置：

```text
Build Command: true
Publish Directory: .
Branch: master
Auto-Deploy: enabled
```

发布后要用 marker text 验证 Render 线上页面，而不是只看本地成功。旧 GitHub Pages 链接如果继续可用，只作为备用镜像验收。

## 仓库结构

```text
.
├── index.html                 # 首页：AI 自动化咨询与项目索引
├── ai-diagnostic/             # AI 自动化需求诊断公开入口
├── ai-survey/                 # 旧路径保留，等待缓存自然刷新
├── invoice-automation-case/   # 流程自动化案例
├── system-entry-automation-case/ # 系统录入自动化案例
├── billing-reconciliation-case/ # 账单 / 对账表自动化案例
├── audio-video-summary/       # 音视频内容处理台
├── style-advisor/             # AI 穿搭顾问
├── exam-compass/              # 教育培训 AI 私教样本
├── display-switch/            # 小工具项目页
├── disc-burner/               # 小工具项目页
├── bluetooth-audio-switch/    # 小工具项目页
├── lit-visual/                # 视觉生成项目
├── wedding-ai-studio/         # 商业视觉 / 婚纱样片旧入口
├── photo/                     # 摄影 Gallery
├── docs/                      # 维护说明与 README 截图
└── css/                       # 共享样式
```

保留的历史区域：

- `content/`, `config.toml`, `themes/`：Hugo 时代源文件。
- `public/`, `resources/`, `static/`：历史生成或静态资产。

不要随意移动这些目录，除非已经检查外部链接和 GitHub Pages 行为。

## 小工具仓库包装清单

把一个小工具包装成“像作品的仓库”，最小清单如下：

- `README.md`：首屏一句话说明、适用场景、在线 demo、截图、使用方式。
- `docs/screenshots/`：至少一张首屏截图；交互工具最好补一张动图或操作截图。
- Live demo：GitHub Pages、Render、Vercel 或其他稳定在线入口。
- 使用方式：本地运行、下载使用、依赖环境、常见问题。
- 项目动机：为什么做、解决谁的什么问题、边界在哪里。
- `LICENSE`：明确开源或保留权利。
- `.gitignore`：排除本地缓存、构建产物、依赖目录和私密配置。

推荐 README 模板：

```md
# Project Name

一句话：这个工具解决什么问题。

Live demo: https://...

Screenshot: docs/screenshots/demo.png

## Why

这个问题为什么值得做。

## Features

- 功能 1
- 功能 2
- 功能 3

## Usage

怎么打开、安装或运行。

## Notes

边界、限制、隐私说明、已知问题。
```

## 维护规则

- 首页项目展示优先服务商务咨询和可交付工具。
- 娱乐类、视觉类和内容类作品保留，但不占用首页主叙事。
- 老项目如果不好用，先从展示入口移除；需要彻底删除时再单独检查外部链接和历史引用。
- 修改首页 CSS 后加 cache busting，例如 `css/hyde.css?v=yyyymmdd-topic`。
- 发布前至少检查：本地预览、移动端截图、内部链接、线上 marker text。
