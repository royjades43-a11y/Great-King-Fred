"""Writes script/script.json for Short 04 (vertical) from timing/words.json (one beat per spoken sentence)
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


GY = 980      # stick ground line on the vertical canvas
SX = 480      # stage centre (kept left of the Shorts buttons at x > 924)
TY = 260      # top phrase
CY = 1322     # captions, above the channel/title overlay (y > 1363)
def TOPV(id, text, at, out=None, size=66, **k): return T(id, text, SX, TY, size, "top", at, out, **k)

# captions: chunks of up to 3 words inside each sentence, cued to their first word
SPOKEN = {"twenty eleven": "2011"}
def norm(w): return re.sub(r"[^a-z0-9'\\-]", "", w.lower())
caps, n = [], 0
for si, s in enumerate(S):
    ws = s.split(); seen = {}
    occ = []
    for w in ws:
        k = norm(w); seen[k] = seen.get(k, 0) + 1; occ.append(f"b{si:02d}:{k}" + (f"#{seen[k]}" if seen[k] > 1 else ""))
    for j in range(0, len(ws), 3):
        txt = " ".join(ws[j:j + 3])
        for a, b in SPOKEN.items(): txt = txt.replace(a, b)
        caps.append([txt, occ[j]])
CAP = []
for i, (txt, cue) in enumerate(caps):
    out = caps[i + 1][1] if i + 1 < len(caps) else None
    CAP.append(T(f"cap{i}", txt, SX, CY, 58, "none", cue, out, weight=800, exit="cut", hold=out is None))

scenes.append({"id": "short", "tail": 0.2, "beats": R(0, len(S) - 1), "elements": [
    # 0-1 · you walk in... and forget why (the loop frame)
    I("dr0", "doorway", 640, 916, 760, "none", "b00:you", "b02"),
    ST("me", 200, GY, "none", "b00:you", [["idle", "b00:you"], ["shrug", "b01:forget"]], [["neutral", "b00:you"], ["o", "b01:forget"]], out="b02",
       scale=1.15, move=[[600, GY, "b00:walk", 1.0]]),
    I("q0", "question", 600, 560, 150, "pop", "b01:forget", "b02"),
    T("t0", "you walk *in*…", SX, TY, 66, "none", "b00:you", "b01", perWord=False, startAtZero=True),
    TOPV("t1", "…and forget !why!", "b01:and", "b02"),
    # 2 · blame the door
    I("dr1", "doorway", SX, 840, 620, "pop", "b02:blame", "b03"),
    I("ar", "arrowDown", SX, 430, 150, "pop", "b02:blame", "b03", color="accent"),
    STAMP("gu", "GUILTY", SX, 1110, 64, "b02:door", "b03"),
    TOPV("t2", "blame the *door*", "b02:blame", "b03"),
    # 3 · the 2011 experiment
    CARD("c1", "2011 · THE DOORWAY STUDY", "Carry it, table to table", "Radvansky et al.", SX, 470, "b03:twenty", "b03:people"),
    I("tb1", "table", 230, 1050, 300, "pop", "b03:twenty", "b04"),
    I("tb2", "table", 730, 1050, 300, "pop", "b03:twenty", "b04"),
    I("bx0", "box", 230, 920, 110, "pop", "b03:objects", "b04", move=[[730, 920, "b03:table#2", 1.0]]),
    ST("cr", 230, GY, "left", "b03:people", [["give", "b03:carry"]], [["neutral", "b03:people"]], out="b04", scale=0.9,
       move=[[650, GY, "b03:table#2", 1.0]]),
    TOPV("t3", "the *2011* experiment", "b03:twenty", "b03:had"),
    TOPV("t4", "carry it table to *table*", "b03:had", "b04"),
    # 4 · through a doorway
    I("dr2", "doorway", SX, 942, 700, "pop", "b04:some", "b05"),
    ST("w1", 140, GY, "left", "b04:some", [["give", "b04:some"]], [["neutral", "b04:some"]], out="b05", scale=0.9, move=[[800, GY, "b04:through", 1.4]]),
    I("bx1", "box", 230, 900, 100, "pop", "b04:some", "b05", move=[[890, 900, "b04:through", 1.4]]),
    TOPV("t5", "through a *door*", "b04:through", "b05"),
    # 5 · same distance, one room
    ST("w2", 140, GY, "left", "b05:others", [["give", "b05:others"]], [["neutral", "b05:others"]], out="b06", scale=0.9, move=[[800, GY, "b05:same", 1.8]]),
    I("bx2", "box", 230, 900, 100, "pop", "b05:others", "b06", move=[[890, 900, "b05:same", 1.8]]),
    T("dots", "· · · · · · · · · · · · · · · ·", SX, 1215, 80, "pop", "b05:distance", "b06", color="muted"),
    TOPV("t6", "or the *same distance*", "b05:same", "b06"),
    # 6 · the doorway group forgot more
    ST("ga", 270, GY, "bottom", "b06:the", [["shrug", "b06:forgot"]], [["o", "b06:forgot"]], out="b07", scale=0.9),
    ST("gb", 720, GY, "bottom", "b06:the", [["happy", "b06:forgot"]], [["smile", "b06:forgot"]], out="b07", scale=0.9, flip=True, variant="bow"),
    I("ta", "thought", 360, 560, 230, "pop", "b06:doorway", "b07"),
    I("tq", "question", 365, 545, 80, "pop", "b06:forgot", "b07"),
    I("tbb", "thought", 800, 560, 230, "pop", "b06:doorway", "b07"),
    I("tbx", "box", 805, 545, 80, "pop", "b06:doorway", "b07"),
    T("la", "doorway", 270, 1215, 46, "bottom", "b06:doorway", "b07", color="ink"),
    T("lb", "one room", 720, 1215, 46, "bottom", "b06:doorway", "b07", color="muted"),
    TOPV("t7", "doorway = forgot !more!", "b06:doorway", "b07"),
    # 7 · here's why
    I("br", "brain", SX, 800, 340, "pop", "b07:here's", "b08"),
    TOPV("t8", "here's *why*", "b07:here's", "b08"),
    # 8-10 · chapters and page breaks
    I("bk", "book", SX, 800, 440, "pop", "b08:brain", "b11:reason"),
    TOPV("t9", "your day, in *chapters*", "b08:stores", "b09"),
    I("pd", "doorway", SX, 780, 150, "pop", "b09:doorway", "b11:reason"),
    TOPV("t10", "a doorway = a !page break!", "b09:doorway", "b10"),
    T("ch", "chapter 2", SX, 1110, 52, "bottom", "b10:new", "b11:reason", color="accent"),
    TOPV("t11", "new room, new *chapter*", "b10:new", "b11"),
    # 11-12 · the reason stays behind
    I("lt", "thought", 300, 640, 300, "pop", "b11:reason", "b13"),
    I("lc", "coffee", 305, 625, 110, "pop", "b11:reason", "b13"),
    I("bk2", "book", 700, 880, 300, "pop", "b11:reason", "b13", move=[[760, 900, "b12:last", 0.8]]),
    TOPV("t12", "the reason you came *in*?", "b11:reason", "b12"),
    TOPV("t13", "it stayed in the *last one*", "b12:stayed", "b13"),
    # 13-14 · not failing, turning the page
    I("br2", "brain", SX, 800, 340, "pop", "b13:so", "b15"),
    I("bx", "cross", 690, 620, 130, "pop", "b13:failing", "b14"),
    TOPV("t14", "not your memory *failing*", "b13:not", "b14"),
    I("bk3", "book", 720, 1050, 170, "pop", "b14:turning", "b15", sway=10, period=0.6),
    TOPV("t15", "your brain turning the *page*", "b14:brain", "b15"),
    # 15 · be kind, and walk back in (matches the first frame for the loop)
    I("dr9", "doorway", 640, 916, 760, "pop", "b15:next", None, hold=True),
    ST("me9", 200, GY, "none", "b15:be", [["happy", "b15:kind"], ["idle", "b15:walk"]], [["smile", "b15:kind"], ["neutral", "b15:walk"]], scale=1.15, hold=True),
    I("hk", "heart", 360, 600, 120, "pop", "b15:kind", "b15:next", color="accent", pulse=1.12, beat=0.9),
    TOPV("t16", "be *kind* to yourself", "b15:be", "b15:next"),
    TOPV("t17", "next time you walk *in*…", "b15:next", hold=True),
    *CAP,
]})

(ROOT / "script").mkdir(exist_ok=True)
(ROOT / "script/script.json").write_text(json.dumps({"title": "Blame the Door", "scenes": scenes}, indent=1, ensure_ascii=False))
print(sum(len(s["elements"]) for s in scenes), "elements,", len(S), "sentences,", len(CAP), "captions")
