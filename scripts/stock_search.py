#!/usr/bin/env python3
"""Search Pexels and Pixabay for representative B-roll (needs PEXELS_API_KEY and/or PIXABAY_API_KEY).

  python3 scripts/stock_search.py "container ship night" [--photos] [--n 10]
      prints candidates: source, id, size, duration, preview image URL, page URL, download URL
  python3 scripts/stock_search.py --get <download-url> --out episodes/<slug>/raw/stock/<name>.mp4

Then ingest with scripts/ingest_media.py using --license "Pexels License" (https://www.pexels.com/license/)
or "Pixabay Content License" (https://pixabay.com/service/license-summary/), --author <creator>,
--source-url <page URL>. Look at the preview before downloading; never label stock as the subject.
"""
import argparse
import json
import os
import sys
import urllib.parse
import urllib.request

UA = {"User-Agent": "EngineeringFailureStudio/1.0"}


def get(url, headers=None):
    req = urllib.request.Request(url, headers={**UA, **(headers or {})})
    with urllib.request.urlopen(req, timeout=40) as r:
        return json.load(r)


def pexels(q, n, photos):
    key = os.environ.get("PEXELS_API_KEY")
    if not key:
        return []
    if photos:
        d = get(f"https://api.pexels.com/v1/search?query={urllib.parse.quote(q)}&per_page={n}&orientation=landscape", {"Authorization": key})
        return [dict(src="pexels", id=p["id"], w=p["width"], h=p["height"], dur="", by=p["photographer"], preview=p["src"]["medium"], page=p["url"], dl=p["src"]["original"]) for p in d.get("photos", [])]
    d = get(f"https://api.pexels.com/videos/search?query={urllib.parse.quote(q)}&per_page={n}&orientation=landscape", {"Authorization": key})
    out = []
    for v in d.get("videos", []):
        files = sorted([f for f in v["video_files"] if f.get("width") and f["width"] <= 2560], key=lambda f: f["width"], reverse=True)
        if files:
            out.append(dict(src="pexels", id=v["id"], w=files[0]["width"], h=files[0]["height"], dur=v["duration"], by=v["user"]["name"], preview=v["image"], page=v["url"], dl=files[0]["link"]))
    return out


def pixabay(q, n, photos):
    key = os.environ.get("PIXABAY_API_KEY")
    if not key:
        return []
    base = "https://pixabay.com/api/" if photos else "https://pixabay.com/api/videos/"
    d = get(f"{base}?key={key}&q={urllib.parse.quote(q)}&per_page={max(3, n)}&safesearch=true")
    out = []
    for h in d.get("hits", []):
        if photos:
            out.append(dict(src="pixabay", id=h["id"], w=h["imageWidth"], h=h["imageHeight"], dur="", by=h["user"], preview=h["webformatURL"], page=h["pageURL"], dl=h.get("largeImageURL")))
        else:
            vids = h["videos"]
            # prefer ~1080p (we render at 1080p); skip portrait clips
            v = next((vids[k] for k in ("medium", "large", "small") if vids.get(k, {}).get("url") and vids[k]["width"] >= 1280), None)
            if v and v["width"] > v["height"]:
                out.append(dict(src="pixabay", id=h["id"], w=v["width"], h=v["height"], dur=h["duration"], by=h["user"], preview=v.get("thumbnail", ""), page=h["pageURL"], dl=v["url"]))
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("query", nargs="?")
    ap.add_argument("--photos", action="store_true")
    ap.add_argument("--n", type=int, default=10)
    ap.add_argument("--get")
    ap.add_argument("--out")
    a = ap.parse_args()
    if a.get:
        os.makedirs(os.path.dirname(a.out), exist_ok=True)
        req = urllib.request.Request(a.get, headers=UA)
        with urllib.request.urlopen(req, timeout=300) as r, open(a.out, "wb") as f:
            f.write(r.read())
        print(f"saved {a.out} ({os.path.getsize(a.out) // 1024} KB)")
        return
    if not (os.environ.get("PEXELS_API_KEY") or os.environ.get("PIXABAY_API_KEY")):
        sys.exit("No PEXELS_API_KEY or PIXABAY_API_KEY in the environment.")
    for src in (pexels, pixabay):
        try:
            for r in src(a.query, a.n, a.photos):
                print(f"{r['src']:7} {r['id']:>10} {r['w']}x{r['h']} {str(r['dur']) + 's' if r['dur'] != '' else '':>5}  by {r['by']}\n        preview {r['preview']}\n        page    {r['page']}\n        dl      {r['dl']}")
        except Exception as e:
            print(f"{src.__name__}: {e}", file=sys.stderr)


if __name__ == "__main__":
    main()
