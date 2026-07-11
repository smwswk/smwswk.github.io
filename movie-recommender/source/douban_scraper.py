#!/usr/bin/env python3
"""
豆瓣已看/想看列表抓取模块
用户需提供 cookies，支持缓存避免重复抓取
"""

import json
import os
import time
from pathlib import Path
from typing import Dict, List, Optional

import requests
from bs4 import BeautifulSoup


CACHE_DIR = Path(__file__).parent / "data"
CACHE_DIR.mkdir(exist_ok=True)


def parse_cookies(cookie_str: str) -> Dict[str, str]:
    """将 cookie 字符串解析为字典"""
    cookies = {}
    for item in cookie_str.split(";"):
        item = item.strip()
        if "=" in item:
            key, value = item.split("=", 1)
            cookies[key.strip()] = value.strip()
    return cookies


def scrape_douban_list(user_id: str, cookies_str: str, list_type: str = "collect") -> List[Dict]:
    """
    抓取用户的电影列表
    list_type: collect=看过, wish=想看, do=在看
    """
    cookies = parse_cookies(cookies_str)
    cache_file = CACHE_DIR / f"douban_{user_id}_{list_type}.json"

    # 检查缓存（24小时内）
    if cache_file.exists():
        mtime = cache_file.stat().st_mtime
        if time.time() - mtime < 86400:
            print(f"  使用缓存的豆瓣{list_type}列表...")
            with open(cache_file, "r", encoding="utf-8") as f:
                return json.load(f)

    movies = []
    base_url = f"https://movie.douban.com/people/{user_id}/{list_type}"

    headers = {
        "User-Agent": (
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
            "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        ),
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
        "Referer": "https://movie.douban.com/",
    }

    page = 0
    max_pages = 15

    print(f"  正在抓取豆瓣{list_type}列表...")

    while page < max_pages:
        url = f"{base_url}?start={page * 15}&sort=time&rating=all&filter=all&mode=list"
        try:
            resp = requests.get(url, headers=headers, cookies=cookies, timeout=15)
            resp.raise_for_status()
        except Exception as e:
            print(f"  请求失败: {e}")
            break

        soup = BeautifulSoup(resp.text, "html.parser")
        items = soup.find_all("div", class_="item-show")

        if not items:
            items = soup.find_all("li", class_="item")

        if not items:
            items = soup.select(".list-view .item")

        if not items:
            # 尝试另一种页面结构
            items = soup.select(".grid-view .item")

        if not items:
            print(f"  第 {page + 1} 页无数据，停止抓取")
            break

        for item in items:
            try:
                title_elem = item.find("em") or item.find("span", class_="title")
                if not title_elem:
                    continue
                title = title_elem.get_text(strip=True)

                rating_elem = item.find("span", class_=lambda x: x and "rating" in x)
                user_rating = None
                if rating_elem:
                    cls = rating_elem.get("class", [])
                    for c in cls:
                        if c.startswith("rating") and c[-1].isdigit():
                            user_rating = int(c[-1])

                date_elem = item.find("span", class_="date")
                watch_date = date_elem.get_text(strip=True) if date_elem else None

                link_elem = item.find("a", href=lambda x: x and "/subject/" in x)
                subject_id = None
                if link_elem:
                    href = link_elem.get("href", "")
                    parts = href.split("/")
                    for i, p in enumerate(parts):
                        if p == "subject" and i + 1 < len(parts):
                            subject_id = parts[i + 1]
                            break

                movies.append({
                    "title": title,
                    "user_rating": user_rating,
                    "watch_date": watch_date,
                    "subject_id": subject_id,
                })
            except Exception:
                continue

        print(f"  第 {page + 1} 页: 抓到 {len(items)} 条")
        page += 1
        time.sleep(1.5)

    # 保存缓存
    with open(cache_file, "w", encoding="utf-8") as f:
        json.dump(movies, f, ensure_ascii=False, indent=2)

    print(f"  共抓到 {len(movies)} 部电影")
    return movies


def get_user_watched_movies(user_id: str, cookies_str: str) -> Dict[str, List[Dict]]:
    """
    获取用户看过和想看的电影列表
    返回: {"watched": [...], "wish": [...]}
    """
    if not user_id or not cookies_str:
        return {"watched": [], "wish": []}

    watched = scrape_douban_list(user_id, cookies_str, "collect")
    time.sleep(2)
    wish = scrape_douban_list(user_id, cookies_str, "wish")

    return {"watched": watched, "wish": wish}


def analyze_user_genre_prefs(watched_movies: List[Dict], all_movies: List[Dict]) -> Dict[str, float]:
    """
    根据用户已看电影分析其类型偏好
    返回类型 -> 偏好权重的映射
    """
    from movie_db import find_movie_by_title

    genre_counts = {}
    total = 0

    for wm in watched_movies:
        matched = find_movie_by_title(wm["title"], all_movies)
        if matched:
            for g in matched.get("genres", []):
                genre_counts[g] = genre_counts.get(g, 0) + 1
                total += 1

    if total == 0:
        return {}

    # 归一化为权重
    weights = {g: count / total for g, count in genre_counts.items()}
    return weights
