#!/usr/bin/env python3
"""
交互式问卷调查模块
收集用户观影偏好的多维度信息
"""

from typing import Dict, List, Optional


def ask_choice(question: str, options: List[str], multi: bool = False) -> Optional[str] | List[str]:
    """单选或多选问题"""
    print(f"\n{question}")
    for i, opt in enumerate(options, 1):
        print(f"  [{i}] {opt}")
    if multi:
        print("  输入多个编号，用空格分隔（如：1 3 5），或直接回车全选")
    else:
        print(f"  输入编号 1-{len(options)}")

    while True:
        answer = input("> ").strip()
        if not answer:
            if multi:
                return options[:]
            print("请选择一个选项")
            continue

        try:
            indices = [int(x.strip()) for x in answer.split()]
            if not all(1 <= idx <= len(options) for idx in indices):
                print(f"请输入 1-{len(options)} 之间的编号")
                continue
            if multi:
                return [options[idx - 1] for idx in indices]
            return options[indices[0] - 1]
        except ValueError:
            print("请输入数字编号")


def ask_yes_no(question: str) -> bool:
    """是/否问题"""
    print(f"\n{question} (y/n)")
    while True:
        answer = input("> ").strip().lower()
        if answer in ("y", "yes", "是"):
            return True
        if answer in ("n", "no", "否"):
            return False
        print("请输入 y 或 n")


def run_survey() -> Dict:
    """
    运行完整问卷调查，返回用户偏好字典
    """
    print("=" * 50)
    print("       电影推荐系统 - 观影偏好调查")
    print("=" * 50)

    # --- 1. 观影场景 ---
    time_of_day = ask_choice(
        "你打算什么时候看电影？",
        ["白天", "傍晚", "深夜"]
    )

    device = ask_choice(
        "你打算用什么设备观看？",
        ["电影院", "电视/投影", "电脑", "手机/平板"]
    )

    attention = ask_choice(
        "你的注意力状态是？",
        ["全神贯注，不想被打扰", "可以边做别的事边看", "无所谓"]
    )

    # --- 2. 观影对象 ---
    companion = ask_choice(
        "你和谁一起看？",
        ["独自一人", "伴侣/约会", "家人", "朋友聚会", "带孩子"]
    )

    # --- 3. 心情状态 ---
    mood = ask_choice(
        "你现在想看什么样的电影？",
        [
            "轻松愉快，想放松一下",
            "烧脑推理，想动脑子",
            "感人至深，想哭一场",
            "紧张刺激，肾上腺素飙升",
            "温暖治愈，抚慰心灵",
            "捧腹大笑，想要开心",
            "深度思考，有收获感",
            "视觉震撼，大场面",
        ]
    )

    # --- 4. 类型偏好 ---
    genre_prefs = ask_choice(
        "你对以下类型有偏好吗？（多选）",
        [
            "剧情", "喜剧", "动作", "科幻", "悬疑/惊悚",
            "爱情", "恐怖", "动画", "纪录片", "犯罪",
            "战争", "传记", "音乐", "奇幻", "文艺/独立",
        ],
        multi=True
    )

    # --- 5. 时长限制 ---
    duration_limit = ask_choice(
        "你对电影时长有要求吗？",
        ["无所谓", "90分钟以内（短片）", "120分钟以内", "超长也OK，越精彩越好"]
    )

    # --- 6. 年代偏好 ---
    era_pref = ask_choice(
        "你对电影的年代有偏好吗？",
        ["无所谓", "经典老片（2000年前）", "近10年", "近3年新作"]
    )

    # --- 7. 豆瓣评分 ---
    min_rating = ask_choice(
        "豆瓣评分最低接受多少？",
        ["无所谓", "7.0分+", "8.0分+", "8.5分+（只看好片）"]
    )

    # --- 8. 是否需要豆瓣抓取 ---
    use_douban = ask_yes_no("是否需要抓取你的豆瓣已看记录，排除已看过的电影？")

    douban_id = None
    douban_cookies = None
    if use_douban:
        print("\n请输入你的豆瓣用户ID（在个人主页URL里，如 https://movie.douban.com/people/xxxxxx/ 中的 xxxxxx）：")
        douban_id = input("> ").strip()
        print("\n隐私提示：Cookie 只在本机请求豆瓣页面，不会上传给作者服务器；不放心可以直接回车跳过。")
        print("\n请输入你的豆瓣 cookies（从浏览器开发者工具 Network 中复制）：")
        douban_cookies = input("> ").strip()

    result = {
        "time_of_day": time_of_day,
        "device": device,
        "attention": attention,
        "companion": companion,
        "mood": mood,
        "genre_prefs": genre_prefs if isinstance(genre_prefs, list) else [genre_prefs],
        "duration_limit": duration_limit,
        "era_pref": era_pref,
        "min_rating": min_rating,
        "use_douban": use_douban,
        "douban_id": douban_id,
        "douban_cookies": douban_cookies,
    }

    print("\n" + "=" * 50)
    print("偏好收集完成！正在为你生成推荐...")
    print("=" * 50)

    return result
