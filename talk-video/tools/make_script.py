"""Writes script/script.json for video 13 from timing/words.json (one beat per spoken sentence)
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


# ---------------------------------------------------------------------------------------------
# Video 13 · performance direction
# The HOST is one stick figure who talks to the viewer: its mouth moves on every spoken word
# (talk=...), and its posture performs the line (explain, present, chin, ear, lean, count...).
# Story figures act out the studies around it. Each chapter lives in a soft line-drawn place.
# Calm and warm throughout: no shouting, no shaking, no drama.
# ---------------------------------------------------------------------------------------------
HX = 400            # the host's usual mark (left third)
def BG(id, name, at, out=None):
    return I(id, name, 960, 560, 1920, "blur", at, out, color="muted", opacity=0.42, z=1)
def HOST(id, at, out, poses, mouths, talk=False, x=HX, **k):
    return ST(id, x, GY, "none" if at == "b00:have" else "left", at, poses, mouths, out=out, talk=talk, **k)
def PCT(id, x, h, txt, at, out, y=860):
    return T(id, txt, x, y - h - 50, 52, "bottom", at, out, weight=M)
def TAG(id, txt, x, y, at, out, size=38, color="muted"):
    return T(id, txt, x, y, size, "bottom", at, out, color=color)

# 1 · the playroom: a four-year-old, then the promise, then Vygotsky -------------------------------
scenes.append({"id": "play", "beats": R(0, 24), "elements": [
    BG("bg", "bgPlayroom", "b00:have", "b25"),
    HOST("h", "b00:have", "b25",
         [["present", "b00:watched"], ["happy", "b04:nobody"], ["chin", "b06:if"], ["explainR", "b07:maybe"], ["lean", "b08:most"],
          ["explain", "b09:so"], ["count", "b10:you'll"], ["present", "b11:by"], ["presentL", "b12:let's"], ["handsHips", "b13:back"],
          ["shrug", "b14:most"], ["explain", "b15:vygotsky"], ["chin", "b17:his"], ["happy", "b18:imagine"], ["explain", "b19:when"],
          ["explainR", "b20:vygotsky"], ["ear", "b21:it"], ["idle", "b22:but"], ["explain", "b23:when"], ["lean", "b24:have"]],
         [["smile", "b00:have"], ["grin", "b05:we"], ["neutral", "b06:if"], ["smile", "b07:maybe"], ["smile", "b09:so"], ["smile", "b13:back"],
          ["smile", "b18:imagine"], ["smile", "b24:have"]]),
    # the child and the blocks
    ST("kid", 1180, 760, "bottom", "b00:four-year-old", [["give", "b02:this"], ["point", "b03:no"], ["happy", "b05:cute"]],
       [["smile", "b00:four-year-old"], ["grin", "b05:cute"]], out="b06", scale=0.62, sit=True, variant="bow"),
    I("bk1", "box", 1370, 840, 90, "pop", "b01:talk", "b06"),
    I("bk2", "box", 1370, 770, 80, "pop", "b02:here", "b06"),
    I("bk3", "box", 1460, 840, 90, "pop", "b03:not", "b06"),
    BUB("kq", "This one goes here!", 1270, 420, 170, "b02:this", "b04", fontSize=30),
    I("kh", "heart", 1180, 470, 90, "pop", "b05:cute", "b06", color="accent", pulse=1.12, beat=0.9),
    TOP("t0", "a four-year-old, *talking*", "b00:watched", "b02"),
    TOP("t1", "nobody thinks they're *crazy*", "b04:nobody", "b05"),
    TOP("t2", "we think it's *cute*", "b05:we", "b06"),
    # the adult in the kitchen
    ST("ad", 1300, GY, "right", "b06:grown", [["search", "b06:grown"], ["chin", "b06:kitchen"]], [["neutral", "b06:grown"]], out="b09",
       flip=True),
    T("mm", "…mumble mumble…", 1300, 330, 40, "bottom", "b06:same", "b07", color="muted"),
    I("hq", "question", 520, 300, 90, "pop", "b06:wonder", "b07"),
    TOP("t3", "…an *adult*, muttering alone?", "b06:grown", "b07"),
    TOP("t4", "maybe you've been that *adult*", "b07:maybe", "b09"),
    # the promise: three things you'll know by the end
    I("p1", "brain", 1060, 560, 200, "pop", "b09:brain", "b12"),
    BUB("p1b", "…", 1150, 410, 110, "b09:talks", "b12", fontSize=48),
    TAG("p1t", "why it talks", 1060, 760, "b09:brain", "b12"),
    I("p2", "mute", 1390, 560, 190, "pop", "b10:inner", "b12"),
    TAG("p2t", "no inner voice?", 1390, 760, "b10:inner", "b12"),
    I("p3", "nametag", 1700, 560, 180, "pop", "b11:word", "b12"),
    TAG("p3t", "one small word", 1700, 760, "b11:word", "b12"),
    TOP("t5", "in this video", "b09:so", "b12", color="muted"),
    # back to the child: Vygotsky
    ST("kid2", 1180, 760, "bottom", "b12:let's", [["give", "b12:four-year-old"], ["point", "b14:chatter"], ["give", "b17:tasks"], ["shrug", "b18:missing"], ["point", "b19:talked"]],
       [["smile", "b12:let's"], ["o", "b18:missing"], ["smile", "b19:when"]], out="b20", scale=0.62, sit=True, variant="bow"),
    I("kb1", "box", 1370, 840, 90, "pop", "b12:four-year-old", "b20"),
    I("kb2", "box", 1370, 770, 80, "pop", "b12:four-year-old", "b20"),
    CARD("c1", "1930s · LEV VYGOTSKY", "Watching children think out loud", "psychologist", 1250, 220, "b13:nineteen", "b14"),
    T("bb", "blah blah blah", 1250, 420, 44, "bottom", "b14:chatter", "b15", color="muted"),
    TOP("t6", "\"just *babbling*\"?", "b14:most", "b15"),
    I("bulb", "bulb", 1200, 470, 150, "pop", "b15:different", "b17", pulse=1.08, beat=0.8),
    TOP("t7", "thinking, *out loud*", "b16:thinking", "b17"),
    TOP("t8", "make it *harder*", "b17:harder", "b18"),
    I("pp", "paper", 1480, 840, 120, "pop", "b17:tasks", "b20"),
    I("pen", "pen", 1560, 760, 110, "pop", "b18:blue", "b18:missing", color="accent"),
    I("pq", "question", 1560, 700, 90, "pop", "b18:missing", "b20"),
    TOP("t9", "the *blue pencil* is missing", "b18:blue", "b19"),
    BUB("m1", "Where's blue?", 1080, 420, 140, "b19:talked", "b20", fontSize=28),
    BUB("m2", "Hmm…", 1330, 360, 120, "b19:themselves", "b20", fontSize=30),
    BUB("m3", "I'll use red!", 1580, 420, 140, "b19:more", "b20", fontSize=28),
    TOP("t10", "they talked even *more*", "b19:talked", "b20"),
    # the voice moves inside
    I("hc", "thought", 660, 330, 160, "pop", "b20:inside", "b24"),
    I("hcc", "chat", 662, 322, 66, "pop", "b21:quiet", "b24"),
    TOP("t11", "the voice moves *inside*", "b20:grow", "b21"),
    TOP("t12", "the quiet voice in your *head*", "b21:quiet", "b22"),
    TOP("t13", "under pressure… it comes *back*", "b23:pressure", "b24"),
    BUB("ok", "Okay, okay… focus.", 680, 330, 160, "b24:okay", None, fontSize=30),
]})

# 2 · the kitchen: the keys, and the 2012 search study ---------------------------------------------
GRID = [(1180, 360, "coffee"), (1360, 360, "book"), (1540, 360, "clock"), (1180, 540, "gift"), (1360, 540, "keys"),
        (1540, 540, "phone"), (1180, 720, "notebook"), (1360, 720, "money"), (1540, 720, "mic")]
scenes.append({"id": "keys", "beats": R(25, 43), "elements": [
    BG("bg", "bgKitchen", "b25:you've", "b44"),
    HOST("h", "b25:you've", "b44",
         [["search", "b25:lost"], ["chin", "b26:kitchen"], ["search", "b27:keys"], ["embarrassed", "b29:crazy"], ["shrug", "b30:most"],
          ["happy", "b31:that's"], ["explainR", "b32:and"], ["present", "b34:in"], ["explain", "b38:so"], ["chin", "b39:lupyan"],
          ["count", "b41:yellow"], ["chin", "b42:there"], ["explain", "b43:the"]],
         [["neutral", "b25:you've"], ["o", "b29:walks"], ["tight", "b29:crazy"], ["smile", "b30:most"], ["smile", "b32:and"], ["grin", "b38:sharper"],
          ["smile", "b39:lupyan"], ["neutral", "b42:there"]]),
    I("ky", "keys", 1640, 620, 80, "pop", "b25:keys", "b34", pulse=1.15, beat=1.4),
    BUB("kk", "Keys… keys…", 720, 360, 150, "b26:keys", "b29", fontSize=30),
    TOP("t0", "you've lost your *keys*", "b25:lost", "b26"),
    ST("nb", 1500, GY, "right", "b29:someone", [["idle", "b29:someone"], ["shrug", "b29:crazy"], ["happy", "b31:that's"]],
       [["o", "b29:walks"], ["smile", "b31:that's"]], out="b32", flip=True, variant="bow", move=[[1250, GY, "b29:walks", 1.2]]),
    TOP("t1", "…and someone walks *in*", "b29:someone", "b30"),
    TOP("t2", "we all *do* this", "b30:most", "b31"),
    ST("ghost", 660, 760, "pop", "b31:inner", [["wave", "b31:four-year-old"]], [["grin", "b31:inner"]], out="b33", scale=0.5, opacity=0.6),
    TOP("t3", "your inner *four-year-old*", "b31:inner", "b32"),
    BUB("kk2", "Keys!", 640, 360, 130, "b33:saying", "b34", fontSize=40),
    TOP("t4", "saying it might *help*", "b33:saying", "b34"),
    CARD("c1", "2012 · LUPYAN & SWINGLEY", "Find it in a crowd of pictures", "psychologists", 1360, 220, "b34:twenty", "b35"),
    *[I(f"g{i}", n, x, y, 110, "pop", "b35:objects", "b39") for i, (x, y, n) in enumerate(GRID)],
    BUB("say", "Keys…", 660, 360, 130, "b36:some", "b38", fontSize=36),
    I("ring", "circles", 1360, 540, 200, "pop", "b37:faster", "b39", color="accent"),
    I("sw", "stopwatch", 1760, 540, 130, "pop", "b37:faster", "b39"),
    TOP("t5", "say the name… find it *faster*", "b36:name", "b38"),
    TOP("t6", "silly… but *sharper*", "b38:silly", "b39"),
    I("ban", "banana", 1360, 520, 280, "pop", "b39:banana", "b42", sway=6, period=2.4),
    I("bbr", "brain", 1080, 520, 180, "pop", "b40:brain", "b42"),
    TAG("b1", "yellow", 1130, 760, "b41:yellow", "b42", color="accent"),
    TAG("b2", "curved", 1350, 760, "b41:curved", "b42", color="accent"),
    TAG("b3", "easy to spot", 1620, 760, "b41:easy", "b42", color="accent"),
    TOP("t7", "say *banana*…", "b39:banana", "b41"),
    TOP("t8", "yellow, curved, easy to *spot*", "b41:yellow", "b42"),
    I("cq", "question", 1360, 520, 220, "pop", "b42:catch", "b44"),
    TOP("t9", "the catch: know what it *looks* like", "b43:word", None, size=58),
]})

# 3 · the study: Hurlburt's beeper ----------------------------------------------------------------
scenes.append({"id": "beeper", "beats": R(44, 58), "elements": [
    BG("bg", "bgStudy", "b44:so", "b59"),
    HOST("h", "b44:so", "b59",
         [["chin", "b44:often"], ["present", "b45:psychologist"], ["explain", "b47:every"], ["shrug", "b48:if"], ["handsHips", "b49:it"],
          ["present", "b50:in"], ["explain", "b51:rest"], ["happy", "b52:funny"], ["shrug", "b54:so"], ["present", "b55:and"],
          ["lean", "b58:what"]],
         [["smile", "b44:so"], ["smile", "b48:if"], ["grin", "b52:funny"], ["smile", "b54:so"], ["neutral", "b58:what"]]),
    I("hb", "thought", 660, 330, 160, "pop", "b44:inner", "b46"),
    I("hbq", "question", 662, 322, 60, "pop", "b44:talk", "b46"),
    TOP("t0", "how often does it *talk*?", "b44:often", "b45"),
    CARD("c1", "1970s · RUSSELL HURLBURT", "A beeper, at random moments", "decades of sampling", 1350, 220, "b45:russell", "b46:beeper"),
    ST("hp", 1350, GY, "bottom", "b46:gave", [["give", "b46:beeper"], ["give", "b47:write"]], [["neutral", "b46:gave"], ["o", "b46:random"]],
       out="b48", flip=True),
    I("pg", "pager", 1580, 460, 150, "pop", "b46:beeper", "b48", sway=12, period=0.4),
    T("bp1", "beep!", 1690, 360, 54, "slam", "b46:random", "b47", color="accent", weight=800),
    T("bp2", "beep!", 1690, 360, 54, "slam", "b47:beeped", "b48", color="accent", weight=800),
    I("nbk", "notebook", 1120, 600, 130, "pop", "b47:write", "b48"),
    TOP("t1", "beep… what's on your *mind*?", "b46:beeper", "b48"),
    TOP("t2", "you'd guess: *all day*", "b48:guess", "b49"),
    TOP("t3", "…a lot *less*", "b49:speaks", "b50"),
    BAR("k1", 1150, 150, "words", "accent", "b50:inner", "b52"),
    PCT("p1", 1150, 150, "< 1/3", "b50:third", "b52"),
    BAR("k2", 1450, 320, "pictures & feelings", "muted", "b51:rest", "b52"),
    I("pf", "frame", 1450, 420, 100, "pop", "b51:pictures", "b52"),
    TOP("t4", "inner speech: under a *third*", "b50:in", "b51"),
    TOP("t5", "pictures… *feelings*…", "b51:pictures", "b52"),
    BAR("q1", 1150, 380, "questionnaire", "muted", "b53:questionnaires", "b55"),
    BAR("q2", 1450, 130, "beeper", "accent", "b53:beeper", "b55"),
    T("q3", "2–4×", 1300, 380, 70, "slam", "b53:two", "b55", color="accent", weight=800),
    TOP("t6", "here's the *funny* part", "b52:funny", "b53"),
    TOP("t7", "we don't know our own *heads*", "b54:not", "b55"),
    ST("r1", 1150, GY, "bottom", "b55:differences", [["happy", "b56:some"]], [["open", "b56:some"]], out="b58"),
    I("r1b", "chat", 1260, 380, 110, "pop", "b56:constantly", "b58"),
    I("r1c", "chat", 1060, 360, 90, "pop", "b56:constantly", "b58"),
    ST("r2", 1550, GY, "bottom", "b55:differences", [["idle", "b57:others"]], [["neutral", "b55:differences"]], out="b58", flip=True),
    I("r2b", "thought", 1650, 370, 140, "pop", "b57:hardly", "b58"),
    TOP("t8", "the differences: *huge*", "b55:differences", "b56"),
    TOP("t9", "some, *constantly*… some, hardly *ever*", "b56:some", "b58"),
    I("emp", "thought", 1350, 480, 300, "pop", "b58:never", None),
    TOP("t10", "what if it's *never* there?", "b58:what", None),
]})

# 4 · the quiet mind: anendophasia -------------------------------------------------------------------
scenes.append({"id": "quiet", "beats": R(59, 79), "elements": [
    BG("bg", "bgDesk", "b59:in", "b80"),
    HOST("h", "b59:in", "b80",
         [["present", "b59:twenty"], ["happy", "b60:yes"], ["explain", "b61:they"], ["present", "b62:anendophasia"], ["explain", "b64:in"],
          ["happy", "b66:and"], ["chin", "b67:nedergaard"], ["present", "b68:so"], ["explain", "b72:on"], ["explainR", "b73:but"],
          ["chin", "b74:how"], ["shrug", "b75:honestly"], ["lean", "b76:so"], ["ear", "b77:when"], ["explain", "b78:if"], ["happy", "b79:your"]],
         [["smile", "b59:in"], ["grin", "b60:yes"], ["smile", "b61:they"], ["grin", "b66:and"], ["smile", "b67:nedergaard"],
          ["neutral", "b74:how"], ["smile", "b75:honestly"], ["smile", "b76:so"], ["smile", "b78:if"]],
         move=[[560, GY, "b76:so", 1.2]]),
    CARD("c1", "2024 · NEDERGAARD & LUPYAN", "Life without an inner voice", "psychologists", 1350, 220, "b59:twenty", "b60:yes"),
    I("ky", "keys", 1350, 560, 120, "pop", "b60:keys", "b61"),
    TOP("t0", "the same *Gary Lupyan*", "b60:same", "b61"),
    T("an", "Anendophasia", 1350, 500, 120, "slam", "b62:anendophasia", "b64", weight=800),
    T("anp", "an-en-doh-FAY-zha", 1350, 610, 46, "bottom", "b62:anendophasia", "b64", color="muted"),
    I("mt", "mute", 1350, 760, 130, "pop", "b63:without", "b64"),
    TOP("t1", "living *without* an inner voice", "b63:simply", "b64"),
    I("ph", "phone", 1350, 560, 220, "pop", "b64:twenty", "b67", sway=6, period=0.6),
    I("pheart", "heart", 1470, 420, 70, "pop", "b64:viral", "b67", color="accent"),
    T("vir", "viral", 1350, 760, 50, "slam", "b64:viral", "b67", color="accent", weight=800),
    ST("s1", 1000, GY, "left", "b65:thousands", [["holdHead", "b65:stunned"]], [["o", "b65:stunned"]], out="b67", scale=0.8),
    ST("s2", 1700, GY, "right", "b66:and", [["holdHead", "b66:stunned"]], [["o", "b66:stunned"]], out="b67", scale=0.8, flip=True, variant="bow"),
    TOP("t2", "not everyone has an *inner monologue*", "b65:thousands", "b66", size=58),
    TOP("t3", "…and some were stunned anyone *does*", "b66:plenty", "b67", size=58),
    TOP("t4", "does it change how you *think*?", "b67:whether", "b68"),
    *[ST(f"lq{i}", x, GY, "bottom", "b68:compared", [["idle", "b68:compared"]], [["neutral", "b68:compared"]], out="b69", scale=0.6)
      for i, x in enumerate([1000, 1130])],
    I("lqt", "thought", 1080, 420, 140, "pop", "b68:little", "b69"),
    *[ST(f"lo{i}", x, GY, "bottom", "b68:compared", [["happy", "b68:lot"]], [["open", "b68:lot"]], out="b69", scale=0.6)
      for i, x in enumerate([1580, 1710])],
    I("lot", "chat", 1650, 420, 140, "pop", "b68:lot", "b69"),
    TAG("lql", "little inner speech", 1060, 780, "b68:little", "b69"),
    TAG("lol", "a lot", 1650, 780, "b68:lot", "b69"),
    I("sock", "sock", 1200, 540, 200, "pop", "b69:pictures", "b71"),
    I("clk", "clock", 1500, 540, 200, "pop", "b69:pictures", "b71"),
    T("rh", "rhyme?", 1350, 760, 56, "bottom", "b69:rhymed", "b71", color="accent", weight=800),
    TOP("t5", "a *sock* and a *clock*", "b70:sock", "b71"),
    I("lst", "paper", 1350, 540, 260, "pop", "b71:list", "b72"),
    TOP("t6", "remember a short *list*", "b71:remember", "b72"),
    BAR("w1", 1150, 220, "quiet mind", "muted", "b72:worse", "b74"),
    BAR("w2", 1450, 340, "inner voice", "accent", "b72:worse", "b74"),
    TOP("t7", "on those two: *worse*", "b72:on", "b73"),
    TOP("t8", "everything else: *just as well*", "b73:but", "b74"),
    I("qm", "question", 1350, 520, 220, "pop", "b74:how", "b76"),
    TOP("t9", "how common? nobody knows *yet*", "b74:how", "b76"),
    BUB("msg", "Hey! Free later?", 1350, 480, 220, "b77:message", "b78", fontSize=36),
    TOP("t10", "do you hear it in a *voice*?", "b77:when", "b78"),
    I("wh", "heart", 1350, 520, 160, "pop", "b78:nothing", None, color="accent", pulse=1.08, beat=1.0),
    TOP("t11", "nothing *wrong* with you", "b78:if", None),
]})

# 5 · the court: athletes and self-talk --------------------------------------------------------------
scenes.append({"id": "sport", "beats": R(80, 95), "elements": [
    BG("bg", "bgCourt", "b80:athletes", "b95"),
    HOST("h", "b80:athletes", "b96",
         [["presentL", "b80:athletes"], ["present", "b81:tennis"], ["present", "b83:in"], ["chin", "b84:does"], ["proud", "b85:answer"],
          ["explain", "b86:effect"], ["count", "b87:two"], ["explainR", "b89:second"], ["explain", "b90:short"], ["happy", "b92:here's"],
          ["embarrassed", "b94:most"], ["lean", "b95:but"]],
         [["smile", "b80:athletes"], ["neutral", "b84:does"], ["smile", "b85:answer"], ["grin", "b92:here's"], ["tight", "b94:embarrassed"],
          ["neutral", "b95:but"]],
         ),
    ST("tp", 1450, GY, "right", "b81:tennis", [["give", "b81:tennis"]], [["tight", "b81:tennis"]], out="b83", flip=True),
    I("rk", "racket", 1300, 520, 160, "pop", "b81:tennis", "b83"),
    BUB("cm", "Come on…", 1540, 380, 130, "b81:mutter", "b82", fontSize=32),
    ST("rn", 1100, GY, "left", "b82:runners", [["strain", "b82:runners"]], [["tight", "b82:runners"]], out="b83",
       move=[[1700, GY, "b82:runners", 3.4]]),
    BUB("kg", "Keep going.", 1350, 380, 140, "b82:keep", "b83", fontSize=32),
    TOP("t0", "athletes knew it *first*", "b80:athletes", "b81"),
    CARD("c1", "2011 · HATZIGEORGIADIS ET AL.", "32 studies on self-talk", "sport psychology", 1350, 220, "b83:twenty", "b84"),
    *[I(f"pa{i}", "paper", 1200 + i * 60, 600 - i * 20, 180, "pop", "b83:thirty-two", "b85") for i in range(3)],
    TOP("t1", "does it actually *work*?", "b84:does", "b85"),
    I("yes", "check", 1350, 540, 220, "pop", "b85:yes", "b87"),
    TOP("t2", "yes: moderate, but *real*", "b85:answer", "b87"),
    I("fl", "flag", 1200, 560, 260, "pop", "b88:precision", "b90"),
    TOP("t3", "1 · *precise* skills", "b88:first", "b89"),
    T("nw", "NEW", 1550, 560, 90, "slam", "b89:new", "b90", color="accent", weight=800),
    TOP("t4", "2 · *new* tasks", "b89:second", "b90"),
    BUB("e1", "Eyes on the ball.", 1200, 480, 170, "b91:eyes", "b92", fontSize=30),
    BUB("e2", "Elbow up.", 1560, 480, 150, "b91:elbow", "b92", fontSize=32),
    TOP("t5", "short cues about *technique*", "b90:short", "b92"),
    I("tv", "tv", 1350, 560, 260, "pop", "b93:millions", "b95"),
    I("crowd", "people", 1350, 780, 220, "pop", "b93:millions", "b95"),
    TOP("t6", "in front of *millions*", "b93:best", "b94"),
    TOP("t7", "…and we're embarrassed in the *kitchen*", "b94:most", "b95", size=58),
    HERO("t8", "But it wasn't over yet.", "b95:but", None, size=90, y=300),
]})

# 6 · the stage: the one word ---------------------------------------------------------------------------
scenes.append({"id": "word", "beats": R(96, 118), "elements": [
    BG("bg", "bgStage", "b96:because", "b119"),
    HOST("h", "b96:because", "b119",
         [["explain", "b96:because"], ["count", "b97:one"], ["present", "b98:word"], ["presentL", "b99:in"], ["happy", "b104:you"],
          ["present", "b105:in"], ["happy", "b107:lot"], ["chin", "b108:psychologists"], ["present", "b109:three"], ["explain", "b111:when"],
          ["handsHips", "b112:and"], ["present", "b113:same"], ["chin", "b115:so"], ["explain", "b116:when"], ["explainR", "b117:you"],
          ["lean", "b118:and"]],
         [["smile", "b96:because"], ["neutral", "b98:word"], ["smile", "b99:in"], ["grin", "b107:laughed"], ["smile", "b108:psychologists"],
          ["smile", "b113:same"], ["neutral", "b115:so"], ["smile", "b117:you"]],
         x=360),
    T("bigI", "\"I\"", 1350, 520, 260, "slam", "b98:word", "b99", weight=800),
    TOP("t0", "one tiny *word*", "b97:one", "b99"),
    CARD("c1", "2014 · KROSS ET AL.", "5 minutes to prepare a speech", "psychologists", 1350, 220, "b99:twenty", "b100"),
    I("mc", "mic", 1350, 600, 200, "pop", "b99:speech", "b100"),
    ST("sa", 1100, GY, "left", "b100:some", [["sorry", "b100:talked"]], [["tight", "b100:talked"], ["frown", "b102:people"]], out="b104", scale=0.9),
    BUB("sab", "I can't…", 1180, 380, 130, "b100:using", "b104", fontSize=32),
    ST("sb", 1650, GY, "right", "b101:others", [["proud", "b101:sam"]], [["smile", "b101:others"], ["grin", "b102:less"]], out="b104", scale=0.9, flip=True,
       variant="bow"),
    BUB("sbb", "Sam, you can do this.", 1580, 380, 170, "b101:sam", "b104", fontSize=28),
    TOP("t1", "\"I\" … or your own *name*", "b100:some", "b102"),
    I("j1", "check", 1650, 250, 80, "pop", "b103:judges", "b104"),
    TOP("t2", "less anxious · rated *better*", "b102:less", "b104"),
    CARD("c2", "2010 · LEBRON JAMES", "“What's best for LeBron James”", "on a career decision", 1350, 470, "b105:twenty", "b108"),
    T("ha", "ha ha", 1350, 700, 60, "pop", "b107:laughed", "b108", color="muted", weight=800),
    TOP("t3", "people *laughed*", "b107:lot", "b108"),
    TOP("t4", "psychologists *recognized* it", "b108:psychologists", "b109"),
    CARD("c3", "2017 · MOSER, KROSS ET AL.", "Inside the brain", "upsetting pictures", 1350, 220, "b109:three", "b110"),
    I("br", "brain", 1350, 560, 280, "pop", "b109:brain", "b113"),
    I("sw", "stopwatch", 1650, 520, 130, "pop", "b111:second", "b113"),
    T("sw1", "≈ 1 s", 1650, 660, 50, "bottom", "b111:second", "b113", weight=800),
    TOP("t5", "with your name: calm within a *second*", "b111:when", "b112", size=58),
    TOP("t6", "no extra *effort*", "b112:effort", "b113"),
    BUB("y1", "You can do it.", 1150, 460, 170, "b113:you", "b115", fontSize=32),
    BUB("y2", "I can do it.", 1600, 460, 160, "b114:i", "b115", fontSize=32),
    BAR("yb1", 1150, 300, "\"you\"", "accent", "b114:solved", "b115", y=900),
    BAR("yb2", 1600, 200, "\"I\"", "muted", "b114:solved", "b115", y=900),
    TOP("t7", "\"you\" solved *more* puzzles", "b114:solved", "b115"),
    TOP("t8", "why would one word *matter*?", "b115:why", "b116"),
    ST("co", 1250, GY, "left", "b116:when", [["explainR", "b117:coaching"]], [["smile", "b116:when"]], out="b119"),
    ST("fr", 1600, GY, "right", "b116:when", [["headDown", "b116:when"], ["happy", "b117:friend"]], [["frown", "b116:when"], ["smile", "b117:friend"]],
       out="b119", flip=True, variant="bow"),
    TOP("t9", "a step *back*", "b116:step", "b117"),
    TOP("t10", "coach yourself like a *friend*", "b117:coaching", "b118"),
    I("kh", "heart", 1430, 380, 110, "pop", "b118:kinder", None, color="accent", pulse=1.1, beat=0.9),
    TOP("t11", "kinder to friends than *ourselves*", "b118:kinder", None),
]})

# 7 · five rules (host-led, plain stage) ----------------------------------------------------------------
scenes.append({"id": "rules", "beats": R(119, 144), "elements": [
    BG("bg", "bgStudy", "b119:so", "b145"),
    HOST("h", "b119:so", "b145",
         [["explain", "b119:so"], ["count", "b121:rule"], ["search", "b122:looking"], ["explain", "b126:it"], ["count", "b127:rule"],
          ["explainR", "b128:when"], ["happy", "b130:it"], ["count", "b131:rule"], ["explain", "b133:two"], ["handsHips", "b134:practice"],
          ["count", "b135:rule"], ["chin", "b137:would"], ["explainR", "b138:then"], ["ear", "b139:listening"], ["count", "b140:rule"],
          ["chin", "b141:curious"], ["ear", "b142:does"], ["happy", "b144:and"]],
         [["smile", "b119:so"], ["neutral", "b137:would"], ["smile", "b138:then"], ["smile", "b144:and"]]),
    TOP("t0", "five simple *rules*", "b119:so", "b121"),
    TOP("r1", "rule 1: say it *out loud*", "b121:rule", "b127"),
    I("k1", "keys", 1150, 540, 160, "pop", "b123:keys", "b127"),
    I("k2", "phone", 1400, 540, 160, "pop", "b124:phone", "b127"),
    I("k3", "money", 1650, 540, 160, "pop", "b125:wallet", "b127"),
    TAG("k4", "know what it looks like", 1400, 760, "b126:works", "b127"),
    TOP("r2", "rule 2: \"I\" → your *name*", "b127:rule", "b131"),
    T("i1", "I", 1150, 540, 140, "pop", "b128:i", "b131", weight=800),
    T("i2", "→", 1350, 540, 100, "pop", "b128:name", "b131", color="muted"),
    I("i3", "nametag", 1600, 540, 260, "pop", "b128:name", "b131"),
    T("i4", "you", 1600, 760, 60, "pop", "b129:you", "b131", color="accent", weight=800),
    TOP("r3", "rule 3: keep it *short*", "b131:rule", "b135"),
    BUB("c1", "Slow down.", 1200, 480, 150, "b133:slow", "b135", fontSize=34),
    BUB("c2", "Breathe out.", 1600, 480, 150, "b133:breathe", "b135", fontSize=34),
    TAG("c3", "practice them when calm", 1400, 760, "b134:practice", "b135"),
    TOP("r4", "rule 4: a *coach*, not a critic", "b135:rule", "b140"),
    ST("fd", 1400, GY, "right", "b137:would", [["sorry", "b137:dropping"], ["happy", "b138:then"]], [["o", "b137:dropping"], ["smile", "b138:then"]],
       out="b140", flip=True, variant="bow"),
    I("gl", "coffee", 1620, 820, 110, "pop", "b137:glass", "b138"),
    I("gh", "heart", 1400, 380, 90, "pop", "b139:listening", "b140", color="accent"),
    TOP("r5", "rule 5: get *curious*", "b140:rule", "b145"),
    I("cur", "thought", 1350, 480, 320, "pop", "b141:inner", "b145"),
    I("cur2", "chat", 1350, 470, 120, "pop", "b142:sentences", "b144"),
    T("cur3", "me?", 1460, 420, 50, "pop", "b143:sound", "b144", color="accent", weight=800),
    TAG("cur4", "quiet is fine, too", 1350, 760, "b144:quiet", "b145"),
]})

# 8 · the twist and the ending: back in the playroom -------------------------------------------------
scenes.append({"id": "end", "tail": 2.6, "beats": R(145, 165), "elements": [
    BG("bg", "bgPlayroom", "b145:so", None),
    HOST("h", "b145:so", None,
         [["explain", "b145:twist"], ["shrug", "b146:most"], ["proud", "b147:research"], ["explain", "b148:self-talk"], ["presentL", "b149:you"],
          ["ear", "b150:whisper"], ["chin", "b151:so"], ["explainR", "b152:what"], ["happy", "b153:and"], ["search", "b154:keys"],
          ["happy", "b155:your"], ["explain", "b156:here's"], ["proud", "b157:name"], ["explainR", "b159:then"], ["ear", "b160:and"],
          ["lean", "b162:or"], ["wave", "b164:which"]],
         [["smile", "b145:so"], ["grin", "b147:research"], ["smile", "b148:self-talk"], ["smile", "b151:so"], ["grin", "b155:your"],
          ["smile", "b156:here's"], ["grin", "b164:which"]]),
    TOP("t0", "here's the *twist*", "b145:twist", "b146"),
    T("sg", "talking to yourself = crazy", 1350, 520, 64, "pop", "b146:grew", "b148", weight=800),
    K("sgk", 1350, 520, 900, "b147:research", "b148"),
    TOP("t1", "the research says *the opposite*", "b147:research", "b148"),
    ST("kid", 1250, 760, "bottom", "b149:you", [["give", "b149:chatting"], ["happy", "b150:somewhere"]], [["grin", "b149:you"]], out="b151", scale=0.62,
       sit=True, variant="bow"),
    I("bk1", "box", 1440, 840, 90, "pop", "b149:blocks", "b151"),
    I("bk2", "box", 1440, 770, 80, "pop", "b149:blocks", "b151"),
    TOP("t2", "you started at *four*", "b149:you", "b150"),
    TOP("t3", "then we learned to *whisper*", "b150:somewhere", "b151"),
    I("q", "thought", 1350, 480, 300, "pop", "b151:question", "b154"),
    I("qc", "chat", 1350, 470, 110, "pop", "b152:saying", "b154"),
    TOP("t4", "what are you *saying*?", "b152:what", "b153"),
    TOP("t5", "a quiet mind: your *own* way", "b153:quiet", "b154"),
    I("ky", "keys", 1350, 560, 150, "pop", "b154:keys", "b156", pulse=1.1, beat=0.9),
    BUB("kb", "Keys, keys, keys…", 760, 360, 160, "b154:keys", "b155", fontSize=30),
    TOP("t6", "go easy on *yourself*", "b154:easy", "b156"),
    TOP("t7", "your *challenge* this week", "b156:challenge", "b157"),
    I("nt", "nametag", 1350, 540, 260, "pop", "b157:nervous", "b160"),
    TOP("t8", "nervous? use your *name*", "b157:next", "b159"),
    TOP("t9", "then notice what *happens*", "b159:notice", "b160"),
    I("eq", "thought", 1350, 500, 300, "pop", "b161:inner", "b164"),
    T("eq2", "?", 1350, 480, 120, "pop", "b162:quiet", "b164", color="accent", weight=800),
    TOP("t10", "inner voice… or *quiet*?", "b161:do", "b164"),
    I("end", "heart", 1350, 540, 200, "pop", "b164:habit", None, color="accent", pulse=1.08, beat=1.2),
    TOP("t11", "which habit *next*?", "b164:habit", hero=True, size=80),
    T("t12", "@darealwhy", 1350, 820, 44, "bottom", "b165:comments", weight=M, color="muted"),
]})

(ROOT / "script").mkdir(exist_ok=True)
(ROOT / "script/script.json").write_text(json.dumps({"title": "The Psychology of People Who Talk to Themselves", "scenes": scenes}, indent=1, ensure_ascii=False))
print(sum(len(s["elements"]) for s in scenes), "elements,", len(S), "sentences")
