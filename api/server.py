#!/usr/bin/env python3
"""Lit-Visual API — 小说影像化：激活码验证 + 图片生成代理"""

import json
import os
import re
import base64
import hashlib
import hmac
import secrets
import time
import urllib.request as ur
import urllib.error as ue
from http.server import HTTPServer, BaseHTTPRequestHandler
from datetime import datetime
from pathlib import Path

# ── Config ──────────────────────────────────────────────
PORT = int(os.environ.get("PORT", "8888"))
PROJECT_DIR = Path(__file__).parent.resolve()
CODES_FILE = PROJECT_DIR / "codes.json"

IMAGE_API_BASE = "https://api.gptsapi.net/v1"
IMAGE_MODEL = "grok-imagine-image"
IMAGE_API_KEY = ""
IMAGE_API_BASE = os.environ.get("IMAGE_API_BASE", IMAGE_API_BASE).rstrip("/")
IMAGE_MODEL = os.environ.get("IMAGE_MODEL", IMAGE_MODEL)

def load_image_api_key():
    p = Path.home() / ".config" / "gptsapi" / "api_key"
    if p.exists():
        return p.read_text().strip()
    return (
        os.environ.get("GPTSAPI_API_KEY")
        or os.environ.get("OPENAI_API_KEY")
        or ""
    )

IMAGE_API_KEY = load_image_api_key()
PAYMENT_SECRET = os.environ.get("PAYMENT_SECRET", "")

# ── Prompt Templates (kept server-side) ──────────────────
STYLE_TEMPLATES = {
    "literary": "cinematic photography, literary adaptation, atmospheric scene, natural light, Leica M6, Kodak Portra 400, gentle grain, subtle color palette, evocative storytelling composition.",
    "ruin": "abandoned space, beauty in decay, wabi-sabi aesthetic, peeling paint, rust, overgrown nature reclaiming architecture, liminal atmosphere, medium format, Hasselblad, soft natural light falling through broken windows, dust particles suspended in light beams.",
    "portrait": "environmental portrait, soulful gaze, natural window light, dust motes dancing in light beams, cinematic color grading, photo documentary style, 35mm film texture, dignified presence, honest unposed moment.",
}

SAFETY_REPLACEMENTS = [
    (r"\babandoned\b", "quiet and empty"),
    (r"\bswimming pool\b", "still water basin"),
    (r"\bsoldier\b", "person in work clothes"),
    (r"\bnaked\b", "unclothed figure"),
]

# ── Free tier tracker (in-memory, resets on cold start) ──
FREE_LIMIT = 1
ip_usage = {}

def get_client_id(handler):
    ip = handler.headers.get("X-Forwarded-For", "").split(",")[0].strip()
    if not ip:
        ip = handler.client_address[0]
    ua = handler.headers.get("User-Agent", "")
    return hashlib.sha256(f"{ip}|{ua}".encode()).hexdigest()[:16]


class LitVisualAPI(BaseHTTPRequestHandler):

    def do_OPTIONS(self):
        self.send_response(204)
        self._cors_headers()
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, X-License-Key")
        self.end_headers()

    def do_POST(self):
        if self.path == "/api/generate-image":
            self._handle_generate()
        elif self.path == "/api/activate":
            self._handle_activate()
        else:
            self.send_error(404)

    def do_GET(self):
        if self.path == "/api/health":
            self._json({
                "ok": True,
                "configured": bool(IMAGE_API_KEY),
                "image_api_base": IMAGE_API_BASE,
                "image_model": IMAGE_MODEL,
            })
        else:
            self.send_error(404)

    # ── Generate Image ──────────────────────────────────

    def _handle_generate(self):
        try:
            body = self._read_body()
            prompt = body.get("prompt", "").strip()
            style = body.get("style", "literary")
            token = body.get("token", "")

            if not prompt:
                self._json({"error": "Please provide a description"}, 400)
                return

            if style not in STYLE_TEMPLATES:
                self._json({"error": f"Unknown style. Use: {', '.join(STYLE_TEMPLATES.keys())}"}, 400)
                return

            # Check license
            has_token = self._verify_token(token)
            if not has_token:
                cid = get_client_id(self)
                used = ip_usage.get(cid, 0)
                if used >= FREE_LIMIT:
                    self._json({
                        "success": False,
                        "error": "payment_required",
                        "message": "Free trial used. Pay ¥9.9 for permanent access.",
                    })
                    return

            if not IMAGE_API_KEY:
                self._json({"error": "Service not configured"}, 500)
                return

            # Build prompt
            full_prompt = self._build_prompt(style, prompt)
            print(f"[Generate] style={style}, prompt_len={len(prompt)}")

            # Call OpenAI-compatible image API
            image_url = self._call_image_api(full_prompt)
            if not image_url:
                self._json({"error": "Failed to generate image. Please try again."}, 500)
                return

            # Track free usage
            if not has_token:
                cid = get_client_id(self)
                ip_usage[cid] = ip_usage.get(cid, 0) + 1
                # Prune if too large
                if len(ip_usage) > 5000:
                    keys = list(ip_usage.keys())[2500:]
                    for k in list(ip_usage.keys()):
                        if k not in keys:
                            del ip_usage[k]

            print(f"[Generate] Done. free_used={not has_token}")
            self._json({
                "success": True,
                "image_url": image_url,
                "free_used": not has_token,
            })

        except Exception as e:
            import traceback
            traceback.print_exc()
            self._json({"error": f"Generation failed: {str(e)}"}, 500)

    def _build_prompt(self, style, user_text):
        template = STYLE_TEMPLATES.get(style, STYLE_TEMPLATES["literary"])
        combined = f"{template} {user_text}"
        for pattern, replacement in SAFETY_REPLACEMENTS:
            combined = re.sub(pattern, replacement, combined, flags=re.IGNORECASE)
        return combined.strip()

    def _call_image_api(self, prompt):
        payload = json.dumps({
            "model": IMAGE_MODEL,
            "prompt": prompt,
            "n": 1,
            "size": "1024x1024",
        }).encode("utf-8")

        req = ur.Request(
            f"{IMAGE_API_BASE}/images/generations",
            data=payload,
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {IMAGE_API_KEY}",
                "User-Agent": "OpenAI/Python 1.0",
            },
        )
        try:
            with ur.urlopen(req, timeout=180) as r:
                resp = json.loads(r.read())
            if resp.get("error"):
                print(f"[image-api] Error: {resp['error']}")
                return None
            data = resp.get("data") or []
            img = data[0] if data else {}
            if img.get("url"):
                return img["url"]
            if img.get("b64_json"):
                b64 = img["b64_json"]
                return b64 if b64.startswith("data:") else f"data:image/png;base64,{b64}"
            for candidate in resp.get("candidates", []):
                content = candidate.get("content") or {}
                for part in content.get("parts", []):
                    inline = part.get("inlineData") or part.get("inline_data") or {}
                    b64 = inline.get("data")
                    if b64:
                        mime = inline.get("mimeType") or inline.get("mime_type") or "image/png"
                        return b64 if b64.startswith("data:") else f"data:{mime};base64,{b64}"
            print(f"[image-api] Unexpected response keys: {list(resp.keys())}")
            return None
        except ue.HTTPError as e:
            detail = e.read().decode("utf-8", errors="replace")
            print(f"[image-api] HTTP {e.code}: {detail[:500]}")
            return None
        except Exception as e:
            print(f"[image-api] Error: {e}")
            return None

    # ── Activate ────────────────────────────────────────

    def _handle_activate(self):
        try:
            body = self._read_body()
            code = body.get("code", "").strip()
            if not code:
                self._json({"valid": False, "error": "Please enter activation code"}, 400)
                return

            codes = self._load_codes()
            entry = codes.get(code)

            if not entry:
                self._json({"valid": False, "error": "Invalid activation code"}, 400)
                return

            if entry.get("used"):
                self._json({"valid": False, "error": "This code has already been used"}, 400)
                return

            # Mark as used
            entry["used"] = True
            entry["activated_at"] = datetime.now().isoformat()
            CODES_FILE.write_text(json.dumps(codes, ensure_ascii=False, indent=2))

            # Sign token
            token = self._sign_token(code)
            print(f"[Activate] Code {code[:8]}... activated")
            self._json({"valid": True, "token": token})

        except Exception as e:
            import traceback
            traceback.print_exc()
            self._json({"valid": False, "error": str(e)}, 500)

    # ── Token helpers ───────────────────────────────────

    def _verify_token(self, token):
        if not token:
            return False
        try:
            payload_b64, sig = token.split(".")
            expected = hmac.new(
                PAYMENT_SECRET.encode(),
                payload_b64.encode(),
                "sha256"
            ).hexdigest()
            if not hmac.compare_digest(sig, expected):
                return False
            payload = json.loads(base64.urlsafe_b64decode(payload_b64 + "==="))
            return payload.get("permanent") is True
        except Exception:
            return False

    def _sign_token(self, code):
        code_hash = hashlib.sha256(code.encode()).hexdigest()[:12]
        payload = json.dumps({
            "ch": code_hash,
            "iat": int(time.time()),
            "permanent": True,
        })
        payload_b64 = (
            base64.urlsafe_b64encode(payload.encode())
            .decode().rstrip("=")
        )
        sig = hmac.new(
            PAYMENT_SECRET.encode(),
            payload_b64.encode(),
            "sha256"
        ).hexdigest()
        return f"{payload_b64}.{sig}"

    # ── Helpers ─────────────────────────────────────────

    def _load_codes(self):
        if CODES_FILE.exists():
            return json.loads(CODES_FILE.read_text())
        return {}

    def _read_body(self):
        length = int(self.headers.get("Content-Length", 0))
        return json.loads(self.rfile.read(length))

    def _json(self, data, status=200):
        body = json.dumps(data, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self._cors_headers()
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.end_headers()
        self.wfile.write(body)

    def _cors_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")

    def log_message(self, format, *args):
        print(f"[{datetime.now().strftime('%H:%M:%S')}] {args[0]}")


if __name__ == "__main__":
    if not IMAGE_API_KEY:
        print("WARNING: GPTSAPI_API_KEY not set.")
        print("  Create ~/.config/gptsapi/api_key or set GPTSAPI_API_KEY env var")
    print(f"Image API: {IMAGE_API_BASE} / {IMAGE_MODEL}")
    print(f"Lit-Visual API :{PORT}")
    server = HTTPServer(("0.0.0.0", PORT), LitVisualAPI)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopped")
