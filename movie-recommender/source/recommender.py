#!/usr/bin/env python3
"""
基于规则的推荐引擎
"""

from typing import Dict, List, Optional


# 心情 -> 适合的风格标签映射
MOOD_TAGS = {
    "轻松愉快，想放松一下": ["轻松", "喜剧", "温馨", "治愈", "浪漫"],
    "烧脑推理，想动脑子": ["悬疑", "烧脑", "复杂", "推理", "科幻"],
    "感人至深，想哭一场": ["感人", "催泪", "温情", "悲剧", "家庭"],
    "紧张刺激，肾上腺素飙升": ["惊悚", "动作", "犯罪", "紧张", "战争"],
    "温暖治愈，抚慰心灵": ["治愈", "温暖", "动画", "文艺", "日常"],
    "捧腹大笑，想要开心": ["喜剧", "幽默", "轻松", "搞笑"],
    "深度思考，有收获感": ["深刻", "社会", "哲学", "文艺", "剧情"],
    "视觉震撼，大场面": ["史诗", "科幻", "动作", "奇幻", "视觉"],
}

# 观影对象 -> 适合标签映射
COMPANION_TAGS = {
    "独自一人": ["个人", "文艺", "深刻", "实验", "独立"],
    "伴侣/约会": ["浪漫", "爱情", "温馨", "轻松", "甜蜜"],
    "家人": ["家庭", "温情", "励志", "经典", "老少咸宜"],
    "朋友聚会": ["欢乐", "喜剧", "动作", "爽片", "热闹"],
    "带孩子": ["动画", "家庭", "童话", "老少咸宜", "正能量"],
}

# 设备 -> 适合标签映射
DEVICE_TAGS = {
    "电影院": ["视觉", "史诗", "动作", "科幻", "大场面"],
    "电视/投影": ["家庭", "经典", "剧情", "系列"],
    "电脑": ["文艺", "独立", "纪录片", "剧情"],
    "手机/平板": ["轻松", "短片", "动画", "喜剧"],
}

# 时间 -> 适合标签映射
TIME_TAGS = {
    "白天": ["轻松", "动画", "喜剧", "家庭", "纪录片"],
    "傍晚": ["剧情", "爱情", "文艺", "温馨"],
    "深夜": ["悬疑", "惊悚", "恐怖", "烧脑", "文艺"],
}

# 注意力 -> 适合标签映射
ATTENTION_TAGS = {
    "全神贯注，不想被打扰": ["烧脑", "悬疑", "复杂", "深刻", "剧情"],
    "可以边做别的事边看": ["轻松", "喜剧", "纪录片", "重复观看"],
    "无所谓": [],
}


def score_movie(movie: Dict, prefs: Dict,
                genre_weights: Optional[Dict[str, float]] = None) -> float:
    """
    为单部电影计算与偏好的匹配度得分
    心情和类型偏好是核心权重，评分加成仅作为微调
    """
    score = 0.0
    tags = set(movie.get("tags", []))
    genres = set(movie.get("genres", []))

    # --- 核心匹配：心情 (权重 5) ---
    mood_tags = set(MOOD_TAGS.get(prefs["mood"], []))
    mood_match = len(tags & mood_tags) + len(genres & mood_tags)
    if mood_match == 0:
        # 完全没有心情匹配：大幅降分，确保不会靠高分/经典硬挤进来
        score -= 8.0
    else:
        score += mood_match * 5.0

    # --- 核心匹配：类型偏好 (权重 3) ---
    user_genres = set(prefs.get("genre_prefs", []))
    genre_mapping = {
        "悬疑/惊悚": ["悬疑", "惊悚"],
        "文艺/独立": ["文艺", "独立"],
    }
    expanded_user_genres = set()
    for g in user_genres:
        if g in genre_mapping:
            expanded_user_genres.update(genre_mapping[g])
        else:
            expanded_user_genres.add(g)

    genre_match = len(genres & expanded_user_genres)
    score += genre_match * 3.0

    # --- 次要匹配 ---

    # 观影对象 (权重 2)
    comp_tags = set(COMPANION_TAGS.get(prefs["companion"], []))
    comp_match = len(tags & comp_tags) + len(genres & comp_tags)
    score += comp_match * 2.0

    # 设备 (权重 1.5)
    device_tags = set(DEVICE_TAGS.get(prefs["device"], []))
    device_match = len(tags & device_tags) + len(genres & device_tags)
    score += device_match * 1.5

    # 时间 (权重 1.5)
    time_tags = set(TIME_TAGS.get(prefs["time_of_day"], []))
    time_match = len(tags & time_tags) + len(genres & time_tags)
    score += time_match * 1.5

    # 注意力 (权重 1)
    att_tags = set(ATTENTION_TAGS.get(prefs["attention"], []))
    if att_tags:
        att_match = len(tags & att_tags) + len(genres & att_tags)
        score += att_match * 1.0

    # 豆瓣历史偏好加权
    if genre_weights:
        for g in genres:
            if g in genre_weights:
                score += genre_weights[g] * 2.0

    # 豆瓣评分加成（微调）
    rating = movie.get("rating", 7.0)
    if rating >= 9.0:
        score += 0.5
    elif rating >= 8.5:
        score += 0.3
    elif rating >= 8.0:
        score += 0.1

    # 经典影片微调
    if "经典" in tags:
        score += 0.1

    return score


def recommend(prefs: Dict, movies: List[Dict],
              watched_titles: Optional[List[str]] = None,
              genre_weights: Optional[Dict[str, float]] = None,
              top_n: int = 8) -> List[Dict]:
    """
    主推荐函数
    """
    from movie_db import (
        filter_by_duration, filter_by_era, filter_by_rating, exclude_watched
    )

    # 基础硬过滤
    candidates = filter_by_duration(movies, prefs["duration_limit"])
    candidates = filter_by_era(candidates, prefs["era_pref"])
    candidates = filter_by_rating(candidates, prefs["min_rating"])

    # 排除已看
    if watched_titles:
        candidates = exclude_watched(candidates, watched_titles)

    if not candidates:
        return []

    # 计算每部电影得分
    scored = []
    for m in candidates:
        s = score_movie(m, prefs, genre_weights)
        scored.append((s, m))

    # 按得分排序
    scored.sort(key=lambda x: x[0], reverse=True)

    # 过滤掉明显不匹配的（分数过低）
    scored = [(s, m) for s, m in scored if s > -4.0]
    if not scored:
        return []

    # 多样性保证：在高分影片中优先选不同类型
    selected = []
    used_genres = set()

    # 第一轮：优先选不同类型的高分影片（只考虑前 60% 候选）
    cutoff = max(top_n * 3, 20)
    top_pool = scored[:cutoff]

    for s, m in top_pool:
        if len(selected) >= top_n:
            break
        mg = set(m.get("genres", []))
        overlap = len(mg & used_genres)
        if overlap == 0 or len(selected) < top_n // 2:
            selected.append((s, m))
            used_genres.update(mg)

    # 补充到 top_n（从全部高分候选中）
    for s, m in scored:
        if len(selected) >= top_n:
            break
        if m not in [x[1] for x in selected]:
            selected.append((s, m))

    # 生成推荐理由
    for s, m in selected:
        m["_rec_reason"] = generate_reason(m, prefs)
        m["_match_score"] = s

    return [m for _, m in selected]


def generate_reason(movie: Dict, prefs: Dict) -> str:
    """为推荐的电影生成一句话推荐理由"""
    reasons = []

    # 基于心情的理由
    mood = prefs["mood"]
    if "轻松" in mood or "开心" in mood:
        if "喜剧" in movie.get("genres", []):
            reasons.append("喜剧元素让你开怀大笑")
    elif "烧脑" in mood:
        if "悬疑" in movie.get("genres", []) or "科幻" in movie.get("genres", []):
            reasons.append("悬疑/科幻设定引人深思")
    elif "感动" in mood:
        if "家庭" in movie.get("tags", []) or "感人" in movie.get("tags", []):
            reasons.append("温情故事触动人心")
    elif "刺激" in mood:
        if "动作" in movie.get("genres", []) or "惊悚" in movie.get("genres", []):
            reasons.append("紧张刺激的节奏让你屏息")

    # 基于观影对象
    comp = prefs["companion"]
    if comp == "伴侣/约会" and "爱情" in movie.get("genres", []):
        reasons.append("浪漫氛围适合二人世界")
    elif comp == "带孩子" and "动画" in movie.get("genres", []):
        reasons.append("动画风格老少皆宜")
    elif comp == "朋友聚会":
        reasons.append("话题性强，适合讨论")

    # 基于评分
    rating = movie.get("rating", 0)
    if rating >= 9.0:
        reasons.append(f"豆瓣评分 {rating}，公认的 masterpieces")
    elif rating >= 8.5:
        reasons.append(f"豆瓣评分 {rating}，口碑极佳")

    # 基于设备
    device = prefs["device"]
    if device == "电影院" and ("视觉" in movie.get("tags", []) or "史诗" in movie.get("tags", [])):
        reasons.append("大银幕效果震撼")

    if not reasons:
        genres = ", ".join(movie.get("genres", [])[:2])
        reasons.append(f"{genres}类型精品，值得一看")

    return "；".join(reasons[:2])
