#!/usr/bin/env python3
import argparse
import html
import io
import json
import math
import os
import subprocess
import time
from pathlib import Path

import numpy as np
import requests
from PIL import Image, ImageDraw


PI = math.pi
AXIS = 6378245.0
EE = 0.00669342162296594323


def get_api_key():
    key = os.environ.get("GOOGLE_MAPS_API_KEY", "").strip()
    if key:
        return key
    service = os.environ.get("GOOGLE_MAPS_KEYCHAIN_SERVICE", "satellite_kanjing.google_maps_api_key")
    try:
        return subprocess.check_output(
            [
                "security",
                "find-generic-password",
                "-a",
                os.environ.get("USER", ""),
                "-s",
                service,
                "-w",
            ],
            text=True,
            stderr=subprocess.DEVNULL,
        ).strip()
    except Exception as exc:
        raise SystemExit(f"Missing GOOGLE_MAPS_API_KEY and Keychain item {service}") from exc


def out_of_china(lon, lat):
    return lon < 72.004 or lon > 137.8347 or lat < 0.8293 or lat > 55.8271


def transform_lat(x, y):
    ret = -100.0 + 2.0 * x + 3.0 * y + 0.2 * y * y + 0.1 * x * y + 0.2 * math.sqrt(abs(x))
    ret += (20.0 * math.sin(6.0 * x * PI) + 20.0 * math.sin(2.0 * x * PI)) * 2.0 / 3.0
    ret += (20.0 * math.sin(y * PI) + 40.0 * math.sin(y / 3.0 * PI)) * 2.0 / 3.0
    ret += (160.0 * math.sin(y / 12.0 * PI) + 320.0 * math.sin(y * PI / 30.0)) * 2.0 / 3.0
    return ret


def transform_lon(x, y):
    ret = 300.0 + x + 2.0 * y + 0.1 * x * x + 0.1 * x * y + 0.1 * math.sqrt(abs(x))
    ret += (20.0 * math.sin(6.0 * x * PI) + 20.0 * math.sin(2.0 * x * PI)) * 2.0 / 3.0
    ret += (20.0 * math.sin(x * PI) + 40.0 * math.sin(x / 3.0 * PI)) * 2.0 / 3.0
    ret += (150.0 * math.sin(x / 12.0 * PI) + 300.0 * math.sin(x / 30.0 * PI)) * 2.0 / 3.0
    return ret


def gcj02_to_wgs84(lon, lat):
    if out_of_china(lon, lat):
        return lon, lat
    dlat = transform_lat(lon - 105.0, lat - 35.0)
    dlon = transform_lon(lon - 105.0, lat - 35.0)
    radlat = lat / 180.0 * PI
    magic = math.sin(radlat)
    magic = 1 - EE * magic * magic
    sqrtmagic = math.sqrt(magic)
    dlat = (dlat * 180.0) / ((AXIS * (1 - EE)) / (magic * sqrtmagic) * PI)
    dlon = (dlon * 180.0) / (AXIS / sqrtmagic * math.cos(radlat) * PI)
    return lon * 2 - (lon + dlon), lat * 2 - (lat + dlat)


def lonlat_to_tile(lon, lat, zoom):
    lat = max(min(lat, 85.05112878), -85.05112878)
    n = 2**zoom
    x = int((lon + 180.0) / 360.0 * n)
    lat_rad = math.radians(lat)
    y = int((1.0 - math.log(math.tan(lat_rad) + 1.0 / math.cos(lat_rad)) / PI) / 2.0 * n)
    return x, y


def create_session(key):
    resp = requests.post(
        f"https://tile.googleapis.com/v1/createSession?key={key}",
        json={"mapType": "satellite", "language": "zh-CN", "region": "CN"},
        timeout=20,
    )
    resp.raise_for_status()
    data = resp.json()
    if "session" not in data:
        raise RuntimeError(f"Map Tiles createSession failed: {data}")
    return data["session"]


def fetch_tile(key, session, tile_dir, x, y, zoom):
    out = tile_dir / f"{zoom}_{x}_{y}.jpg"
    if out.exists() and out.stat().st_size > 1000:
        return Image.open(out).convert("RGB")
    url = f"https://tile.googleapis.com/v1/2dtiles/{zoom}/{x}/{y}?session={session}&key={key}"
    resp = requests.get(url, timeout=20)
    resp.raise_for_status()
    out.write_bytes(resp.content)
    return Image.open(io.BytesIO(resp.content)).convert("RGB")


def make_mosaic(key, session, tile_dir, mosaic_dir, lon, lat, idx, zoom):
    x, y = lonlat_to_tile(lon, lat, zoom)
    mosaic = Image.new("RGB", (768, 768))
    for dy in (-1, 0, 1):
        for dx in (-1, 0, 1):
            tile = fetch_tile(key, session, tile_dir, x + dx, y + dy, zoom)
            mosaic.paste(tile, ((dx + 1) * 256, (dy + 1) * 256))
            time.sleep(0.03)
    draw = ImageDraw.Draw(mosaic)
    draw.line((384, 350, 384, 418), fill=(255, 40, 40), width=3)
    draw.line((350, 384, 418, 384), fill=(255, 40, 40), width=3)
    out = mosaic_dir / f"{idx:02d}_google_z{zoom}.jpg"
    mosaic.save(out, quality=92)
    return out, mosaic


def image_features(img):
    arr = np.asarray(img.resize((384, 384))).astype(np.float32)
    r, g, b = arr[:, :, 0], arr[:, :, 1], arr[:, :, 2]
    mx = arr.max(axis=2)
    mn = arr.min(axis=2)
    sat = (mx - mn) / np.maximum(mx, 1)
    gray = 0.299 * r + 0.587 * g + 0.114 * b
    edge = float((np.abs(np.diff(gray, axis=1)).mean() + np.abs(np.diff(gray, axis=0)).mean()) / 80.0)

    water = ((b > g * 1.03) & (g > r * 0.92) & (mx < 190) & (sat > 0.08)) | ((mx < 90) & (sat > 0.05))
    bare = (r > g * 1.03) & (g > b * 1.02) & (mx > 95) & (sat > 0.08)
    bright = (mx > 185) & (sat < 0.25)
    blue_roof = (b > r * 1.10) & (b > g * 1.03) & (mx > 115) & (sat > 0.12)
    veg = (g > r * 1.03) & (g > b * 1.03) & (mx > 55) & (sat > 0.10)

    water_ratio = float(water.mean())
    bare_ratio = float(bare.mean())
    bright_ratio = float(bright.mean())
    blue_roof_ratio = float(blue_roof.mean())
    veg_ratio = float(veg.mean())
    score = (
        min(water_ratio, 0.45) * 28
        + min(bare_ratio + bright_ratio, 0.45) * 22
        + min(blue_roof_ratio, 0.25) * 18
        + min(edge, 1.0) * 16
        - max(0.0, veg_ratio - 0.55) * 12
    )
    return {
        "google_edge": edge,
        "google_water_ratio": water_ratio,
        "google_bare_ratio": bare_ratio,
        "google_bright_ratio": bright_ratio,
        "google_blue_roof_ratio": blue_roof_ratio,
        "google_veg_ratio": veg_ratio,
        "google_visual_score": score,
    }


def reverse_geocode(key, lon, lat):
    resp = requests.get(
        "https://maps.googleapis.com/maps/api/geocode/json",
        params={"latlng": f"{lat:.7f},{lon:.7f}", "language": "zh-CN", "key": key},
        timeout=12,
    )
    data = resp.json()
    if data.get("status") == "OK" and data.get("results"):
        return data["results"][0].get("formatted_address", "")
    return ""


def google_maps_url(lon, lat):
    return f"https://www.google.com/maps/search/?api=1&query={lat:.7f},{lon:.7f}"


def row_label(row):
    return f"#{row['source_index']:02d} {row.get('category', '候选')}"


def build_contact_sheet(rows, out_path):
    cols = 5
    cell_w, cell_h = 240, 210
    sheet = Image.new("RGB", (cols * cell_w, math.ceil(len(rows) / cols) * cell_h), (245, 245, 245))
    draw = ImageDraw.Draw(sheet)
    for pos, row in enumerate(rows):
        img = Image.open(row["google_mosaic_path"]).convert("RGB")
        img.thumbnail((cell_w, cell_h - 30))
        x = (pos % cols) * cell_w
        y = (pos // cols) * cell_h
        sheet.paste(img, (x + (cell_w - img.width) // 2, y + 24))
        draw.rectangle((x, y, x + cell_w, y + 23), fill=(0, 0, 0))
        draw.text((x + 6, y + 5), f"{row['rank']:02d} {row_label(row)} {row['google_visual_score']:.1f}", fill=(255, 255, 255))
    sheet.save(out_path, quality=92)


def build_kml(rows, out_path, folder_name, top_k):
    items = []
    for row in rows[:top_k]:
        lon = float(row["lon"])
        lat = float(row["lat"])
        desc = "\n".join(
            part
            for part in [
                f"Google视觉分: {row['google_visual_score']:.2f}",
                f"理由: {row.get('reason', '')}",
                f"Google附近: {row.get('google_reverse_address', '')}",
                f"高德参照: {row.get('formatted_address', '')}",
                f"Google坐标(WGS84): {row['google_lon']:.7f},{row['google_lat']:.7f}",
            ]
            if not part.endswith(": ")
        )
        items.append(
            f"""    <Placemark>
      <name>{html.escape(f"G{row['rank']:02d} {row_label(row)}")}</name>
      <description>{html.escape(desc)}</description>
      <Point><coordinates>{lon:.8f},{lat:.8f},0</coordinates></Point>
    </Placemark>"""
        )
    out_path.write_text(
        "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n"
        "<kml xmlns=\"http://www.opengis.net/kml/2.2\">\n"
        f"  <Document><name>{html.escape(folder_name)}</name>\n"
        f"  <Folder><name>{html.escape(folder_name)}</name>\n"
        + "\n".join(items)
        + "\n  </Folder></Document>\n</kml>\n",
        encoding="utf-8",
    )


def build_markdown(rows, contact_path, json_path, kml_path, out_path, top_k):
    lines = [
        "# Google 卫星二次堪景",
        "",
        "用 Google Map Tiles API 复核高德候选点。高德候选坐标通常按 GCJ-02 处理，拉 Google 瓦片前转换为 WGS84；导入高德时仍使用原高德坐标。",
        "",
        f"![Google 二次堪景联系表]({contact_path.resolve()})",
        "",
        f"## 优先探索 {top_k} 点",
        "",
        "| 排名 | 原编号 | 类型 | 高德坐标 | Google校验坐标 | Google视觉分 | Google附近地址 | 地图 |",
        "|---:|---:|---|---|---|---:|---|---|",
    ]
    for row in rows[:top_k]:
        lines.append(
            f"| {row['rank']} | {row['source_index']} | {row.get('category', '')} | "
            f"{float(row['lon']):.6f},{float(row['lat']):.6f} | "
            f"{row['google_lon']:.6f},{row['google_lat']:.6f} | "
            f"{row['google_visual_score']:.1f} | {row.get('google_reverse_address', '')} | "
            f"[Google]({row['google_maps_url']}) / [高德]({row.get('amap_url', '')}) |"
        )
    lines += [
        "",
        "## 使用判断",
        "",
        "- 高分只说明卫星图视觉异常仍成立，不等于现场一定可进入或可拍。",
        "- Google 反查地址只是附近参照，不代表点本身有名字。",
        "- 工业、港口、化工区只从公共道路外部拍摄，不拍门岗、安防、内部设备。",
        "",
        "## 产物",
        "",
        f"- 联系表：`{contact_path}`",
        f"- 结构化结果：`{json_path}`",
        f"- 高德导入 KML：`{kml_path}`",
    ]
    out_path.write_text("\n".join(lines), encoding="utf-8")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("candidates_json", type=Path)
    parser.add_argument("--out-dir", type=Path, default=Path("."))
    parser.add_argument("--folder-name", default="谷歌二次堪景_优先探索点")
    parser.add_argument("--zoom", type=int, default=17)
    parser.add_argument("--top-k", type=int, default=12)
    parser.add_argument("--max-candidates", type=int, default=0, help="Limit processed rows for testing; 0 means all")
    parser.add_argument("--skip-reverse-geocode", action="store_true")
    parser.add_argument("--confirm-api-fetch", action="store_true", help="Required because this command calls Google APIs and consumes quota")
    args = parser.parse_args()
    if not args.confirm_api_fetch:
        raise SystemExit("refusing to fetch Google tiles without --confirm-api-fetch")

    key = get_api_key()
    rows = json.loads(args.candidates_json.read_text(encoding="utf-8"))
    if args.max_candidates:
        rows = rows[: args.max_candidates]

    args.out_dir.mkdir(parents=True, exist_ok=True)
    tile_dir = args.out_dir / f"google_tiles_z{args.zoom}"
    mosaic_dir = args.out_dir / "google_mosaics"
    tile_dir.mkdir(exist_ok=True)
    mosaic_dir.mkdir(exist_ok=True)

    session = create_session(key)
    enriched = []
    for idx, row in enumerate(rows, 1):
        google_lon, google_lat = gcj02_to_wgs84(float(row["lon"]), float(row["lat"]))
        mosaic_path, mosaic = make_mosaic(key, session, tile_dir, mosaic_dir, google_lon, google_lat, idx, args.zoom)
        address = ""
        if not args.skip_reverse_geocode:
            try:
                address = reverse_geocode(key, google_lon, google_lat)
            except Exception:
                address = ""
        enriched.append(
            {
                **row,
                "source_index": idx,
                "google_lon": google_lon,
                "google_lat": google_lat,
                "google_mosaic_path": str(mosaic_path),
                "google_maps_url": google_maps_url(google_lon, google_lat),
                "google_reverse_address": address,
                **image_features(mosaic),
            }
        )

    enriched.sort(key=lambda item: item["google_visual_score"], reverse=True)
    for rank, row in enumerate(enriched, 1):
        row["rank"] = rank

    contact_path = args.out_dir / "google_satellite_second_pass_contact_sheet.jpg"
    json_path = args.out_dir / "google_satellite_second_pass_candidates.json"
    kml_path = args.out_dir / f"{args.folder_name}.kml"
    md_path = args.out_dir / "google_satellite_second_pass.md"

    build_contact_sheet(enriched, contact_path)
    json_path.write_text(json.dumps(enriched, ensure_ascii=False, indent=2), encoding="utf-8")
    build_kml(enriched, kml_path, args.folder_name, min(args.top_k, len(enriched)))
    build_markdown(enriched, contact_path, json_path, kml_path, md_path, min(args.top_k, len(enriched)))

    print(md_path)
    print(contact_path)
    print(json_path)
    print(kml_path)


if __name__ == "__main__":
    main()
