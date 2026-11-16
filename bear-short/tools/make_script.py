"""Writes script/script.json for Short 06 (vertical) from timing/words.json (one beat per spoken sentence)
plus the hand-placed elements below. Cues are "bNN:word" = that word of sentence NN.
The voice reads script/direction.md, so cue words are spelled as spoken ("nineteen", "thirty-four")."""
import json, re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
W = json.loads((ROOT / "timing/words.json").read_text())["words"]
S, cur = [], []
for w in W:
    cur.append(w["text"])
    # a sentence ends at . ? ! unless the token is an initial like "U." or "S."
    if re.search(r'[.?!…]["”]?$', w["text"]) and not re.fullmatch(r"([A-Z]\.)+", w["text"]):
        S.append(" ".join(cur)); cur = []
if cur: S.append(" ".join(cur))
B = lambda i: {"id": f"b{i:02d}", "say": S[i]}
R = lambda a, b: [B(i) for i in range(a, b + 1)]
M = 600

def T(id, text, x, y, size, frm, at, out=None, **k):
    e = {"t": "text", "id": id, "text": text, "x": x, "y": y, "size": size, "from": frm, "at": at}
    if out: e["out"] = out
    e.update(k); return e
def I(id, name, x, y, size, frm, at, out=None, **k):
    e = {"t": "icon", "id": id, "name": name, "x": x, "y": y, "size": size, "from": frm, "at": at}
    if out: e["out"] = out
    e.update(k); return e
def K(id, x, y, w, at, out=None, **k):
    e = {"t": "strike", "id": id, "x": x, "y": y, "w": w, "at": at}
    if out: e["out"] = out
    e.update(k); return e
def ST(id, x, y, frm, at, poses, mouth, out=None, **k):
    e = {"t": "stick", "id": id, "x": x, "y": y, "from": frm, "at": at, "poses": poses, "mouth": mouth}
    if out: e["out"] = out
    e.update(k); return e
def CH(num, text, at, out, frm="left"):
    return {"t": "chapter", "id": "ch", "num": num, "text": text, "x": 960, "y": 540, "from": frm, "at": at, "out": out}
def CARD(id, kicker, text, sub, x, y, at, out=None, **k):
    e = {"t": "card", "id": id, "kicker": kicker, "text": text, "sub": sub, "x": x, "y": y, "from": "top", "at": at}
    if out: e["out"] = out
    e.update(k); return e
def BAR(id, x, h, label, color, at, out=None, y=860, w=170):
    e = {"t": "bar", "id": id, "x": x, "y": y, "w": w, "h": h, "color": color, "label": label, "from": "draw", "at": at}
    if out: e["out"] = out
    return e
def BUB(id, text, x, y, size, at, out=None, fontSize=70):
    e = {"t": "bubble", "id": id, "text": text, "x": x, "y": y, "size": size, "from": "pop", "at": at, "fontSize": fontSize}
    if out: e["out"] = out
    return e

def STAMP(id, text, x, y, size, at, out=None):
    e = {"t": "stamp", "id": id, "text": text, "x": x, "y": y, "size": size, "from": "slam", "at": at}
    if out: e["out"] = out
    return e
def SLOT(id, n, text, x, y, at, fill, out=None):
    e = {"t": "slot", "id": id, "n": n, "text": text, "x": x, "y": y, "from": "draw", "at": at, "fill": fill}
    if out: e["out"] = out
    return e

scenes = []
def couple(prefix, at, out, poses_a=None, poses_b=None, y=655, xa=820, xb=1100, scale=0.75):
    pa = poses_a or [["idle", at]]; pb = poses_b or [["idle", at]]
    return [ST(prefix + "a", xa, y, "bottom", at, pa, [["smile", at]], out=out, scale=scale, sit=True),
            ST(prefix + "b", xb, y, "bottom", at, pb, [["smile", at]], out=out, scale=scale, sit=True, flip=True, variant="bow"),
            I(prefix + "t", "table", 960, 720, 420, "bottom", at, out)]
def pair(prefix, at, out, pa, pb, xa=600, xb=1320, y=660, phones=True, ma=None, mb=None):
    """two standing friends, each looking at a phone"""
    els = [ST(prefix + "a", xa, y, "left", at, pa, ma or [["neutral", at]], out=out),
           ST(prefix + "b", xb, y, "right", at, pb, mb or [["neutral", at]], out=out, flip=True, variant="bow")]
    if phones:
        els += [I(prefix + "pa", "phone", xa + 190, 560, 150, "pop", at, out), I(prefix + "pb", "phone", xb - 190, 560, 150, "pop", at, out)]
    return els
# One text zone only: short phrases near the top (y 170). The stage below is for stickmen and drawings.
TY = 170
def TOP(id, text, at, out=None, size=64, frm="top", **k): return T(id, text, 960, TY, size, frm, at, out, **k)
def HERO(id, text, at, out=None, size=110, y=480, **k): return T(id, text, 960, y, size, "slam", at, out, hero=True, **k)
GY = 690  # where stickmen stand


GY = 980; SX = 480; TY = 260; CY = 1322
BX, BY = 620, 600          # the big thought bubble
def TOPV(id, text, at, out=None, size=66, **k): return T(id, text, SX, TY, size, "top", at, out, **k)

SPOKEN = {"nineteen eighty-seven": "1987"}
def norm(w): return re.sub(r"[^a-z0-9'\\-]", "", w.lower())
caps = []
for si, s in enumerate(S):
    ws = s.split(); seen = {}; occ = []
    for w in ws:
        k = norm(w); seen[k] = seen.get(k, 0) + 1; occ.append(f"b{si:02d}:{k}" + (f"#{seen[k]}" if seen[k] > 1 else ""))
    j = 0
    while j < len(ws):
        step = 4 if ws[j:j + 3] and ws[min(j + 2, len(ws) - 1)].lower() == "nineteen" else 3
        txt = " ".join(ws[j:j + step])
        for a, b in SPOKEN.items(): txt = txt.replace(a, b)
        caps.append([txt, occ[j]]); j += step
CAP = []
for i, (txt, cue) in enumerate(caps):
    out = caps[i + 1][1] if i + 1 < len(caps) else None
    CAP.append(T(f"cap{i}", txt, SX, CY, 58, "none", cue, out, weight=800, exit="cut", hold=out is None))

def THINKER(p, at, out, poses=None, mouths=None, hold=False, zero=False):
    k = {"hold": True} if hold else {}
    if zero: k["startAtZero"] = True
    return [ST(p, 280, GY, "none", at, poses or [["idle", at]], mouths or [["neutral", at]], out=out, scale=1.1, **k),
            I(p + "tb", "thought", BX, BY, 440, "none" if zero or hold else "pop", at, out, **k)]

scenes.append({"id": "short", "tail": 0.2, "beats": R(0, len(S) - 1), "elements": [
    # 0-2 · don't... too late
    *THINKER("me", "b00:don't", "b03", [["idle", "b00:don't"], ["shrug", "b02:too"]], [["neutral", "b00:don't"], ["o", "b02:too"]], zero=True),
    T("t0", "don't think of a *white bear*", SX, TY, 66, "none", "b00:don't", "b01", perWord=False, startAtZero=True),
    I("no", "nosign", 820, 980, 170, "slam", "b01:don't", "b03"),
    TOPV("t1", "!don't.!", "b01:don't", "b02", size=90),
    I("b0", "bear", BX + 6, BY - 12, 190, "pop", "b02:late", "b03"),
    TOPV("t2", "too *late*?", "b02:too", "b03"),
    # 3 · 1987
    CARD("c1", "1987 · WEGNER ET AL.", "The white bear experiment", "Schneider, Carter & White", SX, 470, "b03:nineteen", "b04"),
    I("bb", "bear", SX, 880, 320, "pop", "b03:psychologist", "b04"),
    TOPV("t3", "the *1987* experiment", "b03:nineteen", "b04"),
    # 4 · five minutes, out loud
    ST("tk", 280, GY, "none", "b04:they", [["give", "b04:talked"]], [["o", "b04:talked"]], out="b05", scale=1.1),
    I("ch", "chat", 520, 640, 150, "pop", "b04:talked", "b05"),
    I("sw", "stopwatch", 780, 760, 170, "pop", "b04:five", "b05"),
    T("sw5", "5:00", 780, 900, 58, "bottom", "b04:five", "b05", weight=800),
    TOPV("t4", "talk for *5 minutes*", "b04:talked", "b05"),
    # 5-6 · one rule
    I("rb", "bear", SX, 840, 300, "pop", "b05:one", "b07"),
    I("rx", "nosign", SX, 840, 400, "slam", "b06:don't", "b07"),
    TOPV("t5", "one *rule*", "b05:one", "b06"),
    TOPV("t6", "rule: !no bear!", "b06:don't", "b07"),
    # 7-10 · ring the bell: ding ding ding
    *THINKER("rg", "b07:every", "b12", [["give", "b07:rang"]], [["neutral", "b07:every"], ["o", "b08:ding"]]),
    I("bl", "bell", 780, 1060, 170, "pop", "b07:bell", "b12", sway=14, period=0.3),
    TOPV("t7", "ring the *bell*", "b07:every", "b08"),
    I("m1", "bear", BX - 70, BY - 10, 110, "pop", "b08:ding", "b12"),
    I("m2", "bear", BX + 30, BY - 50, 110, "pop", "b09:ding", "b12"),
    I("m3", "bear", BX + 110, BY - 5, 110, "pop", "b10:ding", "b12"),
    T("d1", "ding!", 780, 880, 64, "slam", "b08:ding", "b09:ding", color="accent", weight=800, exit="cut"),
    T("d2", "ding! ×2", 780, 880, 64, "slam", "b09:ding", "b10:ding", color="accent", weight=800, exit="cut"),
    T("d3", "ding! ×3", 780, 880, 64, "slam", "b10:ding", "b11", color="accent", weight=800),
    TOPV("t8", "*ding!*", "b08:ding", "b11", size=90),
    # 11 · it came back more
    I("m4", "bear", BX - 30, BY + 50, 110, "pop", "b11:came", "b12"),
    I("m5", "bear", BX + 70, BY + 60, 110, "pop", "b11:more", "b12"),
    TOPV("t9", "it came back *more*", "b11:bear", "b12"),
    # 12 · fighting it keeps it alive
    ST("fg", 260, GY, "none", "b12:fighting", [["strain", "b12:fighting"]], [["tight", "b12:fighting"]], out="b15", scale=1.1),
    I("bg", "thought", BX, BY - 20, 560, "pop", "b12:fighting", "b15"),
    I("g1", "bear", BX - 60, BY - 40, 150, "pop", "b12:fighting", "b13"),
    I("g2", "bear", BX + 70, BY - 20, 150, "pop", "b12:alive", "b13"),
    TOPV("t10", "fighting it keeps it *alive*", "b12:fighting", "b13"),
    # 13-14 · an ex, an awkward thing
    I("ex", "broken", BX + 6, BY - 30, 200, "pop", "b13:ex", "b14"),
    TOPV("t11", "same with an *ex*…", "b13:same", "b14"),
    I("aw", "chat", BX - 30, BY - 30, 170, "pop", "b14:awkward", "b15"),
    T("aw2", "?!", BX + 90, BY - 60, 80, "slam", "b14:awkward", "b15", color="accent", weight=800),
    TOPV("t12", "…or that *awkward* thing", "b14:or", "b15"),
    # 15 · one trick
    I("bu", "bulb", SX, 820, 300, "pop", "b15:trick", "b16", pulse=1.08, beat=0.7),
    TOPV("t13", "one *trick*", "b15:one", "b16"),
    # 16-18 · a red car, on purpose
    *THINKER("pk", "b16:pick", "b19", [["point", "b16:pick"], ["happy", "b18:picture"]], [["neutral", "b16:pick"], ["smile", "b17:red"]]),
    TOPV("t14", "pick a thought on *purpose*", "b16:pick", "b17"),
    I("car", "car", BX + 6, BY - 20, 200, "pop", "b17:red", "b19", color="accent"),
    TOPV("t15", "a *red car*", "b17:red", "b18"),
    TOPV("t16", "picture a *red car*", "b18:picture", "b19"),
    # 19 · don't think of a white bear (matches the first frame for the loop)
    *THINKER("me9", "b19:and", None, hold=True),
    TOPV("t17", "don't think of a *white bear*…", "b19:don't", hold=True),
    *CAP,
]})

(ROOT / "script").mkdir(exist_ok=True)
(ROOT / "script/script.json").write_text(json.dumps({"title": "Don't Think of a White Bear", "scenes": scenes}, indent=1, ensure_ascii=False))
print(sum(len(s["elements"]) for s in scenes), "elements,", len(S), "sentences,", len(CAP), "captions")
