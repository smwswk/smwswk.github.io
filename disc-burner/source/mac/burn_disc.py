#!/usr/bin/env python3
from pathlib import Path
import os
import subprocess
import time


ROOT = Path(__file__).resolve().parent
SOURCE_FOLDER = ROOT / "需要刻录的文件"
ISO_PATH = ROOT / "mydisc.iso"
VOLUME_NAME = os.environ.get("DISC_VOLUME_NAME", "DATA_DISC")


def run(command, **kwargs):
    return subprocess.run(command, check=True, text=True, **kwargs)


def get_disc_type():
    try:
        result = subprocess.run(["drutil", "status"], capture_output=True, text=True)
    except OSError as exc:
        print(f"无法运行 drutil: {exc}")
        return None

    output = result.stdout
    print(f"光盘状态: {output.strip()}")
    if "Type: CD-R" in output or "Type: CD-RW" in output:
        return "CD"
    if "Type: DVD-R" in output or "Type: DVD-RW" in output or "Type: DVD+R" in output:
        return "DVD"
    return None


def wait_for_disc():
    print("等待空白光盘插入...")
    while True:
        disc_type = get_disc_type()
        if disc_type:
            print(f"检测到 {disc_type} 光盘，准备刻录。")
            return disc_type
        time.sleep(2)


def create_iso(disc_type):
    if not SOURCE_FOLDER.exists():
        raise SystemExit(f"找不到待刻录目录: {SOURCE_FOLDER}")

    print(f"正在创建 {disc_type} ISO 镜像...")
    if ISO_PATH.exists():
        ISO_PATH.unlink()

    command = [
        "hdiutil",
        "makehybrid",
        "-o",
        str(ISO_PATH),
        str(SOURCE_FOLDER),
        "-iso",
        "-joliet",
        "-default-volume-name",
        VOLUME_NAME,
    ]
    if disc_type != "CD":
        command.insert(-2, "-udf")

    run(command)
    print(f"ISO 镜像创建成功: {ISO_PATH}")


def burn_disc():
    print("开始刻录...")
    result = subprocess.run(
        ["drutil", "burn", "-appendable", "-noverify", str(ISO_PATH)],
        capture_output=True,
        text=True,
    )
    if result.stdout:
        print(result.stdout)
    if result.returncode != 0:
        print(result.stderr)
        raise SystemExit(result.returncode)
    print("刻录完成。")


def eject_disc():
    subprocess.run(["drutil", "eject"], check=False)


def ask_total():
    while True:
        answer = input("请输入要刻录的光盘张数（直接回车默认 1 张）: ").strip()
        if not answer:
            return 1
        try:
            total = int(answer)
        except ValueError:
            print("请输入有效数字。")
            continue
        if total > 0:
            return total
        print("请输入大于 0 的数字。")


def main():
    total = ask_total()
    print(f"\n===== 将刻录 {total} 张光盘 =====\n")

    burned = 0
    disc_type = None
    for index in range(1, total + 1):
        print(f"【第 {index}/{total} 张】")
        if index == 1:
            disc_type = wait_for_disc()
            create_iso(disc_type)
        else:
            print(f"请插入第 {index} 张空白光盘。")
            wait_for_disc()

        burn_disc()
        eject_disc()
        burned += 1
        print(f"第 {index} 张刻录完成，已弹出。\n")

        if index < total:
            answer = input(f"还有 {total - index} 张未刻，按回车继续，输入 q 退出: ").strip().lower()
            if answer == "q":
                print(f"提前退出，已刻录 {burned} 张。")
                return

    print(f"===== 共刻录 {burned} 张，全部完成 =====")


if __name__ == "__main__":
    main()
