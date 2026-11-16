"""Find and download Creative Commons footage from Wikimedia Commons.

Only files whose licence is CC0, Public Domain, CC BY or CC BY-SA are accepted.
Every downloaded file is recorded with title, author, licence and source URL so
attribution can be generated automatically.
"""
from __future__ import annotations

import html
import json
import re
import time
from pathlib import Path

import requests

API = "https://commons.wikimedia.org/w/api.php"
UA = "ThrottleAndTrackPipeline/0.1 (educational video production; Wikimedia Commons API client)"
MAX_BYTES = 80 * 1024 * 1024

ALLOWED = re.compile(r"^(cc0|cc[- ]?zero|public domain|pd\b|pd-|cc[- ]by(-sa)?[- ]?\d)", re.I)
BLOCKED = re.compile(r"\b(nc|nd|non-?commercial|no-?deriv|fair use)\b", re.I)

VIDEO_MIME = ("video/webm", "video/ogg", "video/mp4", "application/ogg")
IMAGE_MIME = ("image/jpeg", "image/png", "image/webp")

_session = requests.Session()
_session.headers["User-Agent"] = UA


def _strip_html(s: str) -> str:
    return html.unescape(re.sub(r"<[^>]+>", "", s or "")).strip()


def _short_author(a: str) -> str:
    a = re.split(r"\s+[—–-]\s+|\n", a.strip())[0].strip()
    return a if len(a) <= 80 else a[:77].rsplit(" ", 1)[0] + "…"


def licence_ok(short_name: str) -> bool:
    name = (short_name or "").strip()
    return bool(name) and bool(ALLOWED.search(name)) and not BLOCKED.search(name)


def _api(params: dict) -> dict:
    params = {"format": "json", "formatversion": 2, **params}
    for attempt in range(8):
        r = _session.get(API, params=params, timeout=30)
        if r.status_code == 429:
            wait = float(r.headers.get("Retry-After") or min(60, 3 * 2 ** attempt))
            print(f"  … Wikimedia rate limit, waiting {wait:.0f}s")
            time.sleep(wait)
            continue
        r.raise_for_status()
        return r.json()
    raise RuntimeError("Wikimedia API rate-limited repeatedly")


TRANSCODE_PREF = ("1080p.vp9.webm", "720p.vp9.webm", "1080p.webm", "720p.webm", "480p.vp9.webm", "480p.webm")


def _best_transcode(derivs: list[dict]) -> str | None:
    by_key = {d.get("transcodekey"): d["src"] for d in derivs if d.get("src")}
    for key in TRANSCODE_PREF:
        if key in by_key:
            return by_key[key]
    return None


_search_cache: dict = {}
_search_cache_path: Path | None = None


def search(query: str, kind: str = "video", limit: int = 15) -> list[dict]:
    """Return licence-checked candidates for a query, best first (cached per episode)."""
    key = f"{kind}:{query}"
    if key not in _search_cache:
        _search_cache[key] = _search(query, kind, limit)
        if _search_cache_path:
            _search_cache_path.write_text(json.dumps(_search_cache, indent=1))
    return [dict(c) for c in _search_cache[key] if relevant(c["title"], query)]


def relevant(title: str, query: str) -> bool:
    """Search hits often match only the description; require a query word in the file title."""
    words = [w.lower() for w in re.findall(r"[A-Za-z0-9]+", query) if len(w) >= 3]
    t = title.lower()
    return not words or any(w in t or w.rstrip("s") in t for w in words)


def _search(query: str, kind: str, limit: int) -> list[dict]:
    filetype = "filetype:video" if kind == "video" else "filetype:bitmap"
    data = _api({
        "action": "query", "generator": "search", "gsrnamespace": 6,
        "gsrsearch": f"{query} {filetype}", "gsrlimit": limit,
        "prop": "videoinfo", "viprop": "url|size|mime|extmetadata|derivatives",
        "viurlwidth": 1920,
    })
    out = []
    for page in sorted(data.get("query", {}).get("pages", []), key=lambda p: p.get("index", 0)):
        info = (page.get("videoinfo") or page.get("imageinfo") or [{}])[0]
        meta = info.get("extmetadata", {})
        lic = meta.get("LicenseShortName", {}).get("value", "")
        mime = info.get("mime", "")
        if not licence_ok(lic):
            continue
        if kind == "video" and mime not in VIDEO_MIME:
            continue
        if kind == "image" and mime not in IMAGE_MIME:
            continue
        if kind == "video" and info.get("duration", 0) < 3:
            continue
        if kind == "image" and min(info.get("width", 0), info.get("height", 0)) < 600:
            continue
        # Wikimedia asks bulk clients to use thumbnails / transcodes, not originals
        if kind == "image":
            url = (info.get("thumburl") or info["url"]).replace(
                "://thumb.wikimedia.org/", "://upload.wikimedia.org/")
        else:
            url = _best_transcode(info.get("derivatives", [])) or info["url"]
            if url == info["url"] and info.get("size", 0) > MAX_BYTES:
                continue
        out.append({
            "title": page["title"].removeprefix("File:"),
            "kind": kind,
            "url": url.split("?")[0],
            "page": info.get("descriptionurl"),
            "author": _short_author(_strip_html(meta.get("Artist", {}).get("value", "")) or "Unknown"),
            "licence": lic,
            "licence_url": meta.get("LicenseUrl", {}).get("value", ""),
            "duration": info.get("duration"),
        })
    return out


def download(item: dict, dest_dir: Path) -> Path:
    dest_dir.mkdir(parents=True, exist_ok=True)
    safe = re.sub(r"[^A-Za-z0-9._-]+", "_", item["title"])[:120]
    if item["kind"] == "image" and not Path(safe).suffix.lower() in (".jpg", ".jpeg", ".png", ".webp"):
        safe += Path(item["url"]).suffix
    path = dest_dir / safe
    if path.exists() and path.stat().st_size > 0:
        return path
    tmp = path.with_suffix(path.suffix + ".part")
    for attempt in range(4):
        with _session.get(item["url"], stream=True, timeout=120) as r:
            if r.status_code == 429 and attempt < 3:
                time.sleep(3 * 2 ** attempt)
                continue
            r.raise_for_status()
            with open(tmp, "wb") as f:
                for chunk in r.iter_content(1 << 16):
                    f.write(chunk)
        tmp.rename(path)
        return path
    raise RuntimeError("unreachable")


def fetch_for_segments(segments: list[dict], work: Path) -> list[dict]:
    """Pick one asset per segment, avoiding re-use where possible. Cached in work/footage.json."""
    cache = work / "footage.json"
    if cache.exists():
        picks = json.loads(cache.read_text())
        if len(picks) == len(segments) and all(Path(p["path"]).exists() for p in picks):
            return picks
    global _search_cache_path
    _search_cache_path = work / "search_cache.json"
    if _search_cache_path.exists():
        _search_cache.update(json.loads(_search_cache_path.read_text()))
    used: set[str] = set()
    picks = []
    for i, seg in enumerate(segments):
        spec = seg.get("footage", {})
        query, kind = spec.get("query", "train"), spec.get("type", "video")
        other = "image" if kind == "video" else "video"
        cands = search(query, kind) or search(query, other)
        if not cands:  # broaden: drop the last word until something hits
            words = query.split()
            while len(words) > 1 and not cands:
                words = words[:-1]
                cands = search(" ".join(words), kind) or search(" ".join(words), other)
        if not cands:
            raise RuntimeError(f"No CC footage found for segment {i}: {query!r}")
        fresh = [c for c in cands if c["url"] not in used] or cands
        choice = None
        for c in fresh[:4]:
            try:
                c["path"] = str(download(c, work / "assets"))
                choice = c
                break
            except (requests.RequestException, RuntimeError) as e:
                print(f"  ! download failed for {c['title']}: {e}")
        if not choice:
            raise RuntimeError(f"Could not download footage for segment {i}")
        used.add(choice["url"])
        picks.append(choice)
        print(f"  [{i:02d}] {choice['kind']:5s} {choice['title'][:60]}  ({choice['licence']})")
        time.sleep(1.5)  # be polite to the API
    cache.write_text(json.dumps(picks, indent=2))
    return picks
