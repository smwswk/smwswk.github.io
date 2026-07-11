---
name: gaode-satellite-kanjing
description: 高德地图卫星堪景工作流。用于用户要在指定区域，通过高德 API、Google Maps API、卫星瓦片或地图影像寻找“不一定被命名”的奇怪地貌、工厂水系、圆形结构、裸地施工、工业纹理等潜在拍摄地点，并生成拍摄规划、KML/CSV 导入文件，做 Google 卫星二次堪景复核，或导入高德地图工作台/地图小程序文件夹时。
---

# 高德卫星堪景

## 核心原则

- 先找“卫星图上视觉异常”的地方，再用高德 POI/逆地理编码补充地址；不要先按景点、建筑、地名推荐。
- 默认目标是拍摄探索候选，不是导航攻略。输出要保留不确定性、坐标、查看链接、视觉理由和实地风险。
- 用户是本地人时，降低命名 POI 权重，提高无名水系、厂区边界、堆场、圆形设施、桥下空间、施工裸地、规则纹理的权重。
- 涉及高德账号内导入或重命名时，优先使用网页 UI 或官方接口的真实结果验证，不要只说文件已生成。
- Google 二次堪景只做小范围复核，不要大规模抓瓦片；先复用高德筛出的候选点，再拉 Google 同点位卫星图确认异常是否跨图源成立。

## 常用输入

- 区域：如“某城市及周边”“某坐标 30km”“某镇附近”。
- 偏好：怪、无名、卫星图异常、可拍摄、工业/水系/施工/圆形结构。
- 高德 WebService Key：优先读 `AMAP_WEBSERVICE_KEY`。若用户提供 key，建议写入 macOS Keychain，再在 shell env 暴露。
- Google Maps API Key：优先读 `GOOGLE_MAPS_API_KEY`，也可读 macOS Keychain 项 `satellite_kanjing.google_maps_api_key`。至少需要 Map Tiles API；若要反查地址，还需要 Geocoding API；若要排除/补充 POI，再启用 Places API (New)。

## 推荐流程

1. 明确范围
   - 以城市中心、行政区边界或用户给定坐标生成 AOI。
   - 默认按用户指定区域生成 AOI；不要在公开版本里写死个人常用城市或私人坐标。

2. 获取候选
   - 用高德行政区、地理编码、逆地理编码、POI 搜索只做定位和标注。
   - 用卫星瓦片或静态图扫描 AOI。建议 z15 起步，必要时对候选点再拉 z16/z17。
   - 给瓦片或候选点打分：水面比例、边缘密度、蓝顶/白顶厂房、裸地颜色、圆形/Hough 圆、长直线、规则矩形、纹理复杂度。

3. 二次筛选
   - 合并相邻瓦片，去掉已知热门景点和普通商业 POI。
   - 每类保留少量强候选：水系几何、圆形结构、工业堆场、裸地施工、厂房边界、桥路交汇。
   - 每个候选保留：名称、经纬度、理由、地址参考、分类、优先级、地图链接。

4. Google 二次堪景（可选但推荐）
   - 触发条件：用户说“用谷歌再看一遍”“二次堪景”“Google 卫星复核”，或高德结果怀疑有瓦片偏差/命名偏差。
   - 先验证 API：Map Tiles `createSession` 应返回 200；Geocoding/Places 未启用时要说明具体错误，不要把它伪装成无结果。
   - 坐标处理：高德/国内候选坐标通常按 GCJ-02 估计；拉 Google 瓦片前转 WGS84；生成高德导入 KML 时仍使用原高德坐标。
   - 只对精选候选复核，例如 20-30 个点；不要对整个 AOI 用 Google 扫描。
   - 输出 Google 联系表、按 Google 图像重新排序的 JSON、优先探索 KML 和 Markdown 报告。

5. 交付规划
   - 输出 Markdown 拍摄计划：分组、路线建议、适合时段、拍摄风险、到场验证点。
   - 输出联系表或缩略图图集，便于用户快速扫图。
   - 输出结构化 JSON，后续可复用生成 KML/CSV/Excel。

6. 导入高德地图工作台
   - 优先生成 KML 并在网页端选择“无明确来源”上传。KML 对无名点最稳，也能绕开 Excel 的自定义字段分组校验。
   - 上传成功后确认页面显示“成功导入 N 个数据”。
   - 如果高德自动创建“批量导入 日期 时间”文件夹，立刻重命名为用户指定文件夹，如“有待探索的拍摄地点”。
   - 再确认左侧列表显示目标文件夹和点数，例如 `有待探索的拍摄地点 (23)`。

## 导入文件生成

使用脚本：

```bash
python3 scripts/build_amap_import_files.py <candidates.json> --out-dir <output-dir> --folder-name 有待探索的拍摄地点
```

脚本输入为候选 JSON 列表。每条记录至少需要：

- `lon`
- `lat`
- `category`
- `index`
- `reason`

可选字段：

- `township`
- `district`
- `formatted_address`
- `tile`
- `overall`
- `amap_url`

## Google 二次堪景生成

使用脚本：

```bash
python3 scripts/google_satellite_second_pass.py <candidates.json> --out-dir <output-dir> --folder-name 谷歌二次堪景_优先探索点 --top-k 12 --confirm-api-fetch
```

脚本输入为高德初筛候选 JSON 列表。每条记录至少需要：

- `lon`
- `lat`
- `category`
- `reason`

脚本会生成：

- `google_satellite_second_pass.md`：Google 二筛报告。
- `google_satellite_second_pass_contact_sheet.jpg`：Google 卫星联系表。
- `google_satellite_second_pass_candidates.json`：带 Google WGS84 坐标、视觉分、反查地址的结构化结果。
- `<folder-name>.kml`：使用原高德坐标的 KML，可继续导入高德地图工作台。

注意：

- 第一次运行前确认 `GOOGLE_MAPS_API_KEY` 或 Keychain `satellite_kanjing.google_maps_api_key` 已配置。
- 如果用户直接把 Google API key 发来，写入 Keychain 和环境后不要在最终回复中复述 key。
- Google Maps API key 已在聊天中暴露时，建议用户到 Google Cloud 限制 API 范围到 Map Tiles API、Geocoding API、Places API (New)，必要时轮换 key。
- `--max-candidates 2` 可用于小样本测试；正式二筛再去掉该参数。公开版仍必须显式加 `--confirm-api-fetch`，避免误触发 API 配额消耗。

## 高德导入注意事项

- 网页端入口通常是高德地图工作台/地图小程序页面的“批量导入”。
- “高德地图(推荐)”旁边的“下载模板”实际可能是静态 `template.xlsx`，不一定匹配后端当前校验。
- 如果 Excel 上传报“不符合自定义字段分组及字段命名规则”，不要继续反复改列名；改用 KML，数据源选“无明确来源”。
- 如果 Safari 文件格式报错，先确认文件真实扩展名和 MIME；KML/CSV 通常比 XLSX 更稳。
- KML 上传后，高德可能不会保留 KML Folder 名，需在导入后手动或自动重命名文件夹。

## 高德 App 查看

导入地图工作台后，用户在高德 App 中查看：

1. 登录同一高德账号。
2. 进入 `我的`。
3. 找 `地图小程序`，如未显示则进 `更多工具` 找。
4. 打开对应地图，再查看导入文件夹。

## 验证标准

- 本地文件存在：KML/CSV/Markdown/JSON。
- 上传页面显示成功导入的数量。
- 地图左侧列表出现目标文件夹名和数量。
- 地图上可见聚集点或点位标签。
- 若无法完成线上导入，最终回复必须说明具体失败文案和已生成的本地备用文件路径。
