# 小明工作台 · 一个人 + AI

一个持续更新的个人工作台索引：AI 自动化、接触印相播客、摄影与影像创作，以及一批为真实问题做出来的工具和 Agent Skills。

Live demo: https://ai-xiaomin.onrender.com/

Legacy mirror: https://smwswk.github.io/

## 公开范围

公开：

- 个人身份、履历、展览记录和作品集；
- 可独立复用的工具和 Agent Skills；
- 交互、视觉和桌面工具实验；
- 播客项目的公开数据页。

不公开：

- 联系方式、报价和个人服务入口；
- 真实工作数据、账号凭据、密钥、内部地址、精确位置和生产环境；
- 可直接聚合敏感空间信息的操作层；
- 客户、案件与业务相关的具体材料。

本站不承接个人 AI 咨询、代部署或定制开发。

## 主要入口

| 页面 | 说明 |
| --- | --- |
| `/` | 个人 AI 工作台索引 |
| `/ai-diagnostic/` | 只在浏览器本地保存内容的自动化自测 |
| `/skill-store/` | 脱敏开源 Skills 目录 |
| `/podcast/` | 保留的播客公开数据页 |
| `/photo/` | 不附带作者履历和账号的影像页 |
| `/system-entry-automation-case/` | 脱敏系统录入自动化案例 |
| `/billing-reconciliation-case/` | 脱敏账单整理案例 |

## 本地预览

```sh
python3 -m http.server 8027
```

然后打开 `http://localhost:8027/`。

## 发布

主站由 Render Static Site 从仓库根目录发布，GitHub Pages 保留为镜像。发布前只暂存本次修改的明确文件，不要把并行项目的未完成改动混入提交。

```sh
git status --short
git add <changed files>
git commit -m "Reduce public identity exposure"
git push origin master
```

发布后需要同时验证：

- Render 与 GitHub Pages 已出现新版本标记；
- 390px 视口没有横向溢出；
- 首页、自动化自测、开源目录、公开边界页可访问；
- 除 `/podcast/` 明确保留的内容外，公开页面不再出现个人姓名、社交账号、微信、报价或接单入口。

## 仓库结构

```text
.
├── index.html                     # 工作台首页
├── about/                         # 公开边界说明
├── ai-diagnostic/                 # 浏览器本地自动化自测
├── skill-store/                   # 开源 Skills 目录
├── podcast/                       # 播客公开数据页
├── photo/                         # 匿名影像页
├── system-entry-automation-case/  # 脱敏流程案例
├── billing-reconciliation-case/   # 脱敏流程案例
├── lit-visual/                    # 视觉实验
└── css/                           # 共享样式
```

## 维护规则

- 新页面默认不写真实姓名、单位、地区、个人社交账号和联系方式。
- 不把真实数据、账号、Cookie、Token、内部 URL、精确位置或生产配置放进页面、源码、截图、压缩包和 Git 历史。
- 对外只写已经验证的能力与边界，不写咨询、报价、客户或定制交付话术。
- 播客数据页是当前唯一明确保留的身份关联例外。
- 修改共享 CSS 后更新 query version，发布前做本地与线上移动端验收。
