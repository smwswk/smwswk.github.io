# 电影推荐系统

基于多维度问答调查的本地电影推荐程序。通过了解你的观影场景、心情状态和偏好，从 257 部精选电影中为你推荐最适合的影片。

## 功能

- **多维问答**：时间、设备、注意力、观影对象、心情、类型偏好、时长、年代、豆瓣评分
- **豆瓣集成**：可选抓取豆瓣已看记录，自动排除已看影片并分析类型偏好
- **精准匹配**：心情不匹配的电影自动过滤，推荐结果高度相关
- **智能理由**：每部推荐附带一句话推荐理由
- **跨平台**：支持 macOS 和 Windows
- **本地运行**：问卷答案和可选豆瓣 Cookie 不会上传到作者服务器

## 快速开始

### macOS

1. 确保已安装 **Python 3**（终端运行 `python3 --version` 检查）
   - 如未安装：`brew install python3`
2. 双击 `run_mac.command`
   - 首次双击如遇安全提示，请 **右键 → 打开**
3. 首次运行会自动创建虚拟环境并安装依赖，约需 30 秒
4. 按提示回答问卷，获取推荐

### Windows

1. 确保已安装 **Python 3**
   - 下载地址：https://www.python.org/downloads/
   - **安装时必须勾选 "Add Python to PATH"**
2. 双击 `run_windows.bat`
3. 首次运行会自动创建虚拟环境并安装依赖
4. 按提示回答问卷，获取推荐

## 豆瓣已看记录抓取

在问卷最后选择 "y" 启用豆瓣抓取，然后输入：

- **豆瓣用户 ID**：打开 https://movie.douban.com/mine ，URL 中 `people/` 后面的字符串
- **Cookies**：在豆瓣页面按 F12 → Network → 刷新页面 → 点击第一个请求 → Headers 中复制 Cookie 字段的全部内容

抓取结果会缓存在本地，24 小时内无需重复抓取。

隐私说明：

- Cookie 只传给豆瓣网页请求，用于读取你自己的已看 / 想看列表。
- 程序不会把 Cookie 发送给作者或第三方统计服务。
- 本地缓存文件形如 `data/douban_<user_id>_<list_type>.json`，可随时删除；这些缓存已被 `.gitignore` 排除。
- 如果不想处理 Cookie，问卷里选择不启用豆瓣抓取即可，推荐逻辑仍能运行。

## 文件说明

| 文件 | 说明 |
|------|------|
| `run_mac.command` | macOS 双击启动脚本 |
| `run_windows.bat` | Windows 双击启动脚本 |
| `main.py` | 主程序 |
| `survey.py` | 问卷调查模块 |
| `recommender.py` | 推荐引擎 |
| `movie_db.py` | 电影数据库管理 |
| `douban_scraper.py` | 豆瓣数据抓取 |
| `data/movies.json` | 257 部精选电影数据库 |
| `requirements.txt` | Python 依赖 |
| `.gitignore` | 排除虚拟环境、日志和本地豆瓣缓存 |

## 技术栈

- Python 3
- [rich](https://github.com/Textualize/rich) — 终端美化
- [requests](https://requests.readthedocs.io/) + [beautifulsoup4](https://www.crummy.com/software/BeautifulSoup/) — 豆瓣抓取

## License

MIT
