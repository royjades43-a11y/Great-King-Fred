"""Writes script/script.json for Short 05 (vertical) from timing/words.json (one beat per spoken sentence)
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
def TOPV(id, text, at, out=None, size=66, **k): return T(id, text, SX, TY, size, "top", at, out, **k)

SPOKEN = {"nineteen nineties": "1990s"}
def norm(w): return re.sub(r"[^a-z0-9'\\-]", "", w.lower())
caps = []
for si, s in enumerate(S):
    ws = s.split(); seen = {}; occ = []
    for w in ws:
        k = norm(w); seen[k] = seen.get(k, 0) + 1; occ.append(f"b{si:02d}:{k}" + (f"#{seen[k]}" if seen[k] > 1 else ""))
    j = 0
    while j < len(ws):
        step = 4 if " ".join(ws[j:j + 2]).lower().endswith("nineteen") else 3
        txt = " ".join(ws[j:j + step])
        for a, b in SPOKEN.items(): txt = txt.replace(a, b)
        caps.append([txt, occ[j]]); j += step
CAP = []
for i, (txt, cue) in enumerate(caps):
    out = caps[i + 1][1] if i + 1 < len(caps) else None
    CAP.append(T(f"cap{i}", txt, SX, CY, 58, "none", cue, out, weight=800, exit="cut", hold=out is None))

def WIGGLE(id, at, out, hold=False, x=SX):
    """a stick figure trying to tickle itself: hands at its sides, fingers wiggling (motion marks)"""
    k = {"hold": True} if hold else {}
    if at == "b00:try": k["startAtZero"] = True
    return [ST(id, x, GY, "none", at, [["armsCrossed", at]], [["neutral", at]], out=out, scale=1.15, sway=4, period=0.22, **k),
            T(id + "w1", "≈", x - 150, 900, 70, "none", at, out, color="accent", perWord=False, **k),
            T(id + "w2", "≈", x + 150, 900, 70, "none", at, out, color="accent", perWord=False, **k)]

scenes.append({"id": "short", "tail": 0.2, "beats": R(0, len(S) - 1), "elements": [
    # 0-4 · try it... nothing
    *WIGGLE("me", "b00:try", "b04"),
    T("t0", "try to *tickle* yourself", SX, TY, 66, "none", "b00:try", "b01", perWord=False, startAtZero=True),
    TOPV("t1", "right *now*", "b01:right", "b02"),
    TOPV("t2", "go *on*…", "b02:go", "b03"),
    BUB("nb", "…", 690, 560, 150, "b03:nothing", "b05", fontSize=60),
    TOPV("t3", "…!nothing!?", "b03:nothing", "b04"),
    ST("mq", SX, GY, "none", "b04:there's", [["armsCrossed", "b04:there's"]], [["neutral", "b04:there's"]], out="b05", scale=1.15),
    I("q", "question", SX, 560, 150, "pop", "b04:reason", "b05"),
    TOPV("t4", "there's a *reason*", "b04:there's", "b05"),
    # 5 · the tickle robot
    CARD("c1", "LATE 1990s · BLAKEMORE ET AL.", "They built a tickle robot", "Wolpert & Frith", SX, 470, "b05:late", "b05:built"),
    I("br0", "brain", SX, 860, 300, "pop", "b05:neuroscientist", "b05:built"),
    I("rb", "robot", SX, 860, 560, "pop", "b05:built", "b06"),
    TOPV("t5", "the *1990s*", "b05:late", "b05:built"),
    TOPV("t6", "a *tickle robot*", "b05:tickle", "b06"),
    # 6 · handle and palm
    ST("pp", 220, GY, "left", "b06:people", [["give", "b06:moved"], ["idle", "b07:when"], ["happy", "b10:suddenly"]],
       [["neutral", "b06:people"], ["neutral", "b07:barely"], ["smile", "b10:suddenly"]], out="b11", sway=0),
    I("lv", "lever", 380, 1080, 180, "pop", "b06:handle", "b11"),
    I("rb2", "robot", 740, 740, 380, "pop", "b06:robot", "b11"),
    I("hd", "hand", 780, 1060, 190, "pop", "b06:palm", "b11"),
    T("lk", "· · · · ·", 520, 820, 60, "pop", "b06:robot", "b11", color="muted"),
    TOPV("t7", "it strokes your *palm*", "b06:stroked", "b07"),
    # 7-10 · instant vs delay
    I("sw", "stopwatch", 360, 480, 150, "pop", "b07:instantly", "b11"),
    T("d0", "0.0 s", 560, 480, 70, "bottom", "b07:instantly", "b08:delay", weight=800, exit="cut"),
    BAR("m1", 580, 50, "tickle", "muted", "b07:barely", "b10:suddenly", y=1190, w=80),
    TOPV("t8", "instant = *barely* tickles", "b07:copied", "b08"),
    T("d1", "0.2 s", 560, 480, 70, "slam", "b08:delay", "b11", color="accent", weight=800),
    TOPV("t9", "a tiny *delay*", "b08:added", "b09"),
    TOPV("t10", "a *fifth* of a second", "b09:fifth", "b10"),
    BAR("m2", 580, 280, "tickle", "accent", "b10:suddenly", "b11", y=1190, w=80),
    T("ha", "ha ha!", 200, 640, 64, "slam", "b10:tickled", "b11", color="accent", weight=800),
    TOPV("t11", "suddenly… !tickly!", "b10:suddenly", "b11"),
    # 11-12 · the brain predicts, and turns it down
    I("br", "brain", SX, 760, 380, "pop", "b11:brain", "b13", pulse=1.05, beat=0.8),
    TOPV("t12", "your brain *predicts*", "b11:brain", "b12"),
    I("kn", "knob", 780, 1080, 200, "pop", "b12:turns", "b13", sway=30, period=1.6),
    T("dn", "feeling ↓", 360, 1100, 60, "bottom", "b12:down", "b13", color="accent", weight=800),
    TOPV("t13", "it turns the feeling *down*", "b12:turns", "b13"),
    # 13 · your own hand can't surprise you
    I("br2", "brain", 700, 700, 240, "pop", "b13:your", "b14"),
    I("ok", "check", 700, 500, 110, "pop", "b13:surprise", "b14"),
    I("hd2", "hand", 280, 900, 220, "pop", "b13:hand", "b14", move=[[420, 860, "b13:can't", 0.9]]),
    TOPV("t14", "it can't *surprise* you", "b13:can't", "b14"),
    # 14 · tickle - surprise = touch
    T("e1", "tickle", SX, 640, 110, "pop", "b14:tickle", "b15", weight=800),
    T("e2", "− surprise", SX, 790, 110, "pop", "b14:without", "b15", weight=800),
    K("ek", SX, 790, 520, "b14:surprise", "b15"),
    T("e3", "= touch", SX, 950, 110, "slam", "b14:touch", "b15", color="accent", weight=800),
    TOPV("t15", "no surprise = just a *touch*", "b14:without", "b15"),
    # 15 · bet you're trying again (matches the first frame for the loop)
    *WIGGLE("me9", "b15:bet", None, hold=True),
    TOPV("t16", "try it *again*…", "b15:bet", hold=True),
    *CAP,
]})

(ROOT / "script").mkdir(exist_ok=True)
(ROOT / "script/script.json").write_text(json.dumps({"title": "Why You Can't Tickle Yourself", "scenes": scenes}, indent=1, ensure_ascii=False))
print(sum(len(s["elements"]) for s in scenes), "elements,", len(S), "sentences,", len(CAP), "captions")
