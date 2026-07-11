#!/usr/bin/env python3
"""Generate activation codes for lit-visual (小说影像化)."""
import json, secrets, sys
from pathlib import Path

COUNT = int(sys.argv[1]) if len(sys.argv) > 1 else 50
OUT = Path(__file__).parent / "codes.json"

existing = {}
if OUT.exists():
    existing = json.loads(OUT.read_text())

new_codes = {}
for _ in range(COUNT):
    raw = secrets.token_hex(6).upper()
    code = f"{raw[:4]}-{raw[4:8]}-{raw[8:12]}"
    new_codes[code] = {"used": False, "created": ""}

all_codes = {**existing, **new_codes}
OUT.write_text(json.dumps(all_codes, ensure_ascii=False, indent=2))
print(f"Generated {len(new_codes)} new codes. Total: {len(all_codes)}. Saved to {OUT}")

print("\n--- Copy below for distribution ---")
for code in sorted(new_codes.keys()):
    print(code)
