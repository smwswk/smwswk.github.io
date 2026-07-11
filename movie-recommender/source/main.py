#!/usr/bin/env python3
"""
电影推荐系统 - 主程序入口
"""

import sys
from pathlib import Path

from rich.console import Console
from rich.panel import Panel
from rich.table import Table
from rich.text import Text

# 确保模块可导入
sys.path.insert(0, str(Path(__file__).parent))

from survey import run_survey
from movie_db import load_movies
from recommender import recommend
from douban_scraper import get_user_watched_movies, analyze_user_genre_prefs


console = Console()


def print_welcome():
    """打印欢迎界面"""
    welcome_text = Text()
    welcome_text.append("🎬 ", style="bold yellow")
    welcome_text.append("电影推荐系统\n", style="bold cyan")
    welcome_text.append("基于你的观影场景、心情和偏好，为你推荐最适合的电影", style="dim")

    console.print(Panel(welcome_text, border_style="cyan", padding=(1, 2)))


def print_recommendations(movies):
    """用 rich 打印推荐结果"""
    if not movies:
        console.print("\n[red]抱歉，没有找到符合你条件的电影。试试放宽条件？[/red]")
        return

    console.print("\n")
    console.print(Panel("[bold green]为你推荐以下电影[/bold green]", border_style="green"))

    for i, m in enumerate(movies, 1):
        title = m.get("title", "未知")
        year = m.get("year", "")
        rating = m.get("rating", "")
        director = m.get("director", "")
        genres = ", ".join(m.get("genres", [])[:3])
        reason = m.get("_rec_reason", "")
        duration = m.get("duration", "")

        # 构建电影信息卡片
        table = Table(show_header=False, box=None, padding=(0, 1))
        table.add_column(style="bold", width=12)
        table.add_column()

        header = f"[bold yellow]{i}. {title}[/bold yellow]"
        if year:
            header += f" [dim]({year})[/dim]"
        if rating:
            header += f" [bold green]★ {rating}[/bold green]"

        console.print(f"\n{header}")

        if director:
            table.add_row("导演", director)
        if genres:
            table.add_row("类型", genres)
        if duration:
            table.add_row("时长", f"{duration} 分钟")

        console.print(table)

        if reason:
            console.print(f"  [dim italic]💡 {reason}[/dim italic]")

        # 分隔线
        if i < len(movies):
            console.print("─" * 50, style="dim")


def main():
    print_welcome()

    # 加载电影数据库
    try:
        all_movies = load_movies()
        console.print(f"[dim]已加载 {len(all_movies)} 部电影数据库[/dim]\n")
    except FileNotFoundError as e:
        console.print(f"[red]错误: {e}[/red]")
        console.print("[red]请确保 data/movies.json 电影数据库文件存在[/red]")
        return

    while True:
        # 运行问卷调查
        prefs = run_survey()

        # 豆瓣数据抓取
        watched_titles = []
        genre_weights = {}

        if prefs["use_douban"] and prefs["douban_id"] and prefs["douban_cookies"]:
            try:
                douban_data = get_user_watched_movies(
                    prefs["douban_id"], prefs["douban_cookies"]
                )
                watched_titles = [m["title"] for m in douban_data["watched"]]
                console.print(f"\n[dim]已抓取 {len(watched_titles)} 部已看电影[/dim]")

                # 分析类型偏好
                genre_weights = analyze_user_genre_prefs(
                    douban_data["watched"], all_movies
                )
                if genre_weights:
                    top_genres = sorted(genre_weights.items(), key=lambda x: x[1], reverse=True)[:3]
                    genre_str = ", ".join(f"{g}({w:.0%})" for g, w in top_genres)
                    console.print(f"[dim]分析你的观影偏好: {genre_str}[/dim]")
            except Exception as e:
                console.print(f"\n[yellow]豆瓣抓取失败: {e}，继续基于规则推荐[/yellow]")

        # 生成推荐
        with console.status("[bold green]正在为你挑选电影...[/bold green]"):
            recs = recommend(
                prefs, all_movies,
                watched_titles=watched_titles,
                genre_weights=genre_weights,
                top_n=8
            )

        print_recommendations(recs)

        # 后续交互
        console.print("\n")
        console.print("[dim]选项: [1] 再来一批推荐  [2] 重新填写偏好  [3] 退出[/dim]")
        choice = input("> ").strip()

        if choice == "3":
            console.print("\n[bold cyan]感谢使用，祝你观影愉快！🍿[/bold cyan]")
            break
        elif choice == "2":
            continue
        elif choice == "1":
            # 换一批：排除当前推荐，重新生成
            excluded = [m["title"] for m in recs]
            all_titles = watched_titles + excluded
            with console.status("[bold green]正在为你挑选更多电影...[/bold green]"):
                recs = recommend(
                    prefs, all_movies,
                    watched_titles=all_titles,
                    genre_weights=genre_weights,
                    top_n=8
                )
            print_recommendations(recs)
            console.print("\n[dim]按回车键继续...[/dim]")
            input()
        else:
            console.print("\n[bold cyan]感谢使用，祝你观影愉快！🍿[/bold cyan]")
            break


if __name__ == "__main__":
    main()
