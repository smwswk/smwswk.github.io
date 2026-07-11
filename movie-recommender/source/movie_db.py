#!/usr/bin/env python3
"""
电影数据库管理模块
加载内置电影数据，提供查询接口
"""

import json
import os
import random
from pathlib import Path
from typing import Dict, List, Optional


DATA_FILE = Path(__file__).parent / "data" / "movies.json"


def load_movies() -> List[Dict]:
    """加载电影数据库"""
    if not DATA_FILE.exists():
        raise FileNotFoundError(f"电影数据库不存在: {DATA_FILE}")
    with open(DATA_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


def find_movie_by_title(title: str, movies: List[Dict]) -> Optional[Dict]:
    """通过片名模糊匹配电影"""
    title = title.strip().lower()
    for m in movies:
        if title in m.get("title", "").lower():
            return m
        if title in m.get("title_en", "").lower():
            return m
        for alias in m.get("aliases", []):
            if title in alias.lower():
                return m
    return None


def filter_by_duration(movies: List[Dict], limit: str) -> List[Dict]:
    """按时长过滤"""
    if limit == "无所谓":
        return movies[:]
    if limit == "90分钟以内（短片）":
        return [m for m in movies if m.get("duration", 999) <= 95]
    if limit == "120分钟以内":
        return [m for m in movies if m.get("duration", 999) <= 125]
    if limit == "超长也OK，越精彩越好":
        return movies[:]
    return movies[:]


def filter_by_era(movies: List[Dict], era: str) -> List[Dict]:
    """按年代过滤"""
    if era == "无所谓":
        return movies[:]
    if era == "经典老片（2000年前）":
        return [m for m in movies if m.get("year", 2024) < 2000]
    if era == "近10年":
        return [m for m in movies if m.get("year", 0) >= 2015]
    if era == "近3年新作":
        return [m for m in movies if m.get("year", 0) >= 2023]
    return movies[:]


def filter_by_rating(movies: List[Dict], rating_str: str) -> List[Dict]:
    """按豆瓣评分过滤"""
    threshold = 0.0
    if rating_str == "7.0分+":
        threshold = 7.0
    elif rating_str == "8.0分+":
        threshold = 8.0
    elif rating_str == "8.5分+（只看好片）":
        threshold = 8.5
    else:
        return movies[:]
    return [m for m in movies if m.get("rating", 0) >= threshold]


def exclude_watched(movies: List[Dict], watched_titles: List[str]) -> List[Dict]:
    """排除已看过的电影"""
    watched_set = set(t.lower().strip() for t in watched_titles)
    result = []
    for m in movies:
        title = m.get("title", "").lower().strip()
        if title not in watched_set:
            result.append(m)
    return result


def get_random_sample(movies: List[Dict], n: int) -> List[Dict]:
    """随机抽取"""
    if len(movies) <= n:
        return movies[:]
    return random.sample(movies, n)
