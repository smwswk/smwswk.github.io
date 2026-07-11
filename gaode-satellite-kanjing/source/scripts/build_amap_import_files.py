#!/usr/bin/env python3
import argparse
import csv
import html
import json
from pathlib import Path


def get(row, key, default=""):
    value = row.get(key, default)
    return default if value is None else value


def row_name(row):
    category = get(row, "category", "候选点")
    idx = get(row, "index", "")
    area = get(row, "township") or get(row, "district") or "未知区域"
    return f"{category}{idx}-{area}"


def description(row):
    fields = [
        ("理由", get(row, "reason")),
        ("地址参考", get(row, "formatted_address")),
        ("卫星瓦片", get(row, "tile")),
        ("综合分", f"{float(get(row, 'overall', 0) or 0):.2f}"),
        ("高德查看", get(row, "amap_url")),
    ]
    return "\n".join(f"{k}: {v}" for k, v in fields if v != "")


def build_kml(rows, folder_name):
    placemarks = []
    for row in rows:
        lon = float(row["lon"])
        lat = float(row["lat"])
        placemarks.append(
            f"""    <Placemark>
      <name>{html.escape(row_name(row))}</name>
      <description>{html.escape(description(row))}</description>
      <Point><coordinates>{lon:.8f},{lat:.8f},0</coordinates></Point>
    </Placemark>"""
        )
    return f"""<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>{html.escape(folder_name)}</name>
    <Folder>
      <name>{html.escape(folder_name)}</name>
{chr(10).join(placemarks)}
    </Folder>
  </Document>
</kml>
"""


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("candidates_json", type=Path)
    parser.add_argument("--out-dir", type=Path, default=Path("."))
    parser.add_argument("--folder-name", default="有待探索的拍摄地点")
    args = parser.parse_args()

    rows = json.loads(args.candidates_json.read_text(encoding="utf-8"))
    args.out_dir.mkdir(parents=True, exist_ok=True)

    kml_path = args.out_dir / f"{args.folder_name}.kml"
    csv_path = args.out_dir / f"{args.folder_name}.csv"

    kml_path.write_text(build_kml(rows, args.folder_name), encoding="utf-8")

    with csv_path.open("w", newline="", encoding="utf-8-sig") as f:
        writer = csv.writer(f)
        writer.writerow(["名称", "经度", "纬度", "地址", "描述"])
        for row in rows:
            writer.writerow(
                [
                    row_name(row),
                    f"{float(row['lon']):.8f}",
                    f"{float(row['lat']):.8f}",
                    get(row, "formatted_address"),
                    description(row),
                ]
            )

    print(kml_path)
    print(csv_path)


if __name__ == "__main__":
    main()
