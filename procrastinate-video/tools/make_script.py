"""Writes script/script.json for video 14 from timing/words.json (one beat per spoken sentence)
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
# Video 14 · performance direction (STYLE.md, from video 13)
# The HOST talks to the viewer (mouth on every word) and performs the line with its posture.
# Story figures act out the studies. Every chapter happens somewhere. Calm and warm, nothing dramatic.
# Running image: the junk drawer (hook -> "think back to the start" -> ending).
# ---------------------------------------------------------------------------------------------
HX = 400
def BG(id, name, at, out=None):
    return I(id, name, 960, 560, 1920, "blur", at, out, color="muted", opacity=0.42, z=1)
def HOST(id, at, out, poses, mouths, talk=False, x=HX, **k):
    return ST(id, x, GY, "none" if at == "b00:you" else "left", at, poses, mouths, out=out, talk=talk, **k)
def TAG(id, txt, x, y, at, out, size=38, color="muted"):
    return T(id, txt, x, y, size, "bottom", at, out, color=color)
def CLOUD(id, at, out, inner=None, at2=None, size=66):
    els = [I(id, "thought", 660, 330, 160, "pop", at, out)]
    if inner: els.append(I(id + "i", inner, 662, 322, size, "pop", at2 or at, out))
    return els

# 1 · the kitchen: the task you sit down to do, the junk drawer, the promise, Steel, feelings ----------------
scenes.append({"id": "hook", "beats": R(0, 27), "elements": [
    BG("bg", "bgKitchen", "b00:you", "b28"),
    HOST("h", "b00:you", "b28",
         [["chin", "b00:finally"], ["headDown", "b01:hour"], ["shrug", "b02:instead"], ["explainR", "b03:kitchen"], ["present", "b04:junk"],
          ["embarrassed", "b05:somehow"], ["happy", "b06:if"], ["lean", "b07:and"], ["embarrassed", "b08:i"], ["present", "b09:so"],
          ["count", "b10:you'll"], ["present", "b11:by"], ["presentL", "b12:let's"], ["explain", "b13:in"], ["count", "b14:one"],
          ["explainR", "b15:among"], ["chin", "b16:so"], ["shrug", "b17:most"], ["present", "b18:psychologists"], ["explain", "b19:their"],
          ["count", "b20:boring"], ["count", "b21:confusing"], ["sorry", "b22:worried"], ["happy", "b23:whatever"], ["shrug", "b24:little"],
          ["ear", "b25:brain"], ["explain", "b26:next"], ["lean", "b27:have"]],
         [["neutral", "b00:you"], ["tight", "b01:still"], ["smile", "b03:kitchen"], ["grin", "b05:octopuses"], ["smile", "b06:if"],
          ["grin", "b08:won't"], ["smile", "b09:so"], ["neutral", "b16:so"], ["smile", "b18:psychologists"], ["neutral", "b20:boring"],
          ["frown", "b22:worried"], ["smile", "b23:whatever"], ["neutral", "b24:little"], ["smile", "b26:next"], ["neutral", "b27:have"]],
         move=[[1080, GY, "b02:easier", 1.4], [HX, GY, "b06:if", 1.2]]),
    # the task, waiting on the table
    I("tb", "table", 760, 760, 300, "bottom", "b00:sit", "b02"),
    I("lp", "laptop", 760, 610, 150, "pop", "b00:thing", "b02"),
    TOP("t0", "the thing you've *put off*", "b00:you", "b01"),
    I("ck", "clock", 1350, 520, 220, "pop", "b01:hour", "b02", sway=8, period=1.6),
    TOP("t1", "an hour later… still not *started*", "b01:hour", "b02"),
    TOP("t2", "the *easier* jobs", "b02:easier", "b03"),
    I("pl", "plate", 1450, 600, 160, "pop", "b03:kitchen", "b06"),
    I("gl", "glow", 1450, 470, 120, "pop", "b03:clean", "b06", color="accent"),
    TOP("t3", "the kitchen: *clean*", "b03:kitchen", "b04"),
    I("dr", "drawer", 1700, 640, 200, "pop", "b04:junk", "b06"),
    TOP("t4", "the junk drawer: *organized*", "b04:junk", "b05"),
    I("ph", "phone", 1280, 470, 260, "pop", "b05:watching", "b06"),
    I("oc", "octopus", 1280, 470, 150, "pop", "b05:octopuses", "b06"),
    TOP("t5", "…how octopuses *sleep*", "b05:video", "b06"),
    TOP("t6", "very good *company*", "b06:familiar", "b07"),
    I("lp2", "laptop", 1350, 560, 200, "pop", "b07:watching", "b09"),
    T("sh", "shh…", 1350, 400, 60, "pop", "b08:won't", "b09", color="muted", weight=800),
    TOP("t7", "I won't *tell*", "b08:i", "b09"),
    # the promise
    I("p1", "brain", 1060, 560, 200, "pop", "b09:brain", "b12"),
    I("p1c", "clock", 1140, 460, 80, "pop", "b09:off", "b12"),
    TAG("p1t", "why we delay", 1060, 760, "b09:brain", "b12"),
    I("p2", "oldme", 1390, 560, 190, "pop", "b10:future", "b12"),
    TAG("p2t", "future you?", 1390, 760, "b10:future", "b12"),
    I("p3", "heart", 1700, 560, 170, "pop", "b11:habit", "b12", color="accent"),
    TAG("p3t", "one small habit", 1700, 760, "b11:habit", "b12"),
    TOP("t8", "in this video", "b09:so", "b12", color="muted"),
    # how common it is
    CARD("c1", "2007 · PIERS STEEL", "Hundreds of studies on putting things off", "a meta-analysis", 1350, 220, "b13:two", "b14"),
    *[ST(f"a{i}", 1030 + i * 160, GY, "bottom", "b14:estimated", [["idle", "b14:estimated"]] + ([["headDown", "b14:chronically"]] if i == 2 else []),
         [["neutral", "b14:estimated"]], out="b16", scale=0.62, **({"variant": "bow"} if i % 2 else {})) for i in range(5)],
    I("ring", "circles", 1350, 560, 260, "pop", "b14:chronically", "b15", color="accent"),
    TOP("t9", "up to *1 in 5* adults", "b14:one", "b15"),
    TOP("t10", "college students: *most*", "b15:college", "b16"),
    *CLOUD("q", "b16:why", "b17", "question", size=60),
    TOP("t11", "even when we know *better*", "b16:why", "b17"),
    T("lz", "lazy?", 1150, 520, 90, "pop", "b17:laziness", "b18", weight=800),
    I("tm", "clock", 1560, 520, 180, "pop", "b17:time", "b18"),
    K("lzk", 1150, 520, 320, "b18:differently", "b19"),
    CARD("c2", "2013 · SIROIS & PYCHYL", "Putting things off to feel better now", "psychologists", 1350, 220, "b18:psychologists", "b19"),
    # the task and the feeling
    I("tk", "paper", 1350, 600, 260, "pop", "b19:task", "b28"),
    I("fc", "cloud", 1350, 380, 280, "pop", "b19:feel", "b23:away", color="muted"),
    TOP("t12", "how a task makes you *feel*", "b19:feel", "b20"),
    TAG("f1", "boring", 1080, 520, "b20:boring", "b23:away", size=44),
    TAG("f2", "confusing", 1620, 520, "b21:confusing", "b23:away", size=44),
    TAG("f3", "what if I'm bad at it?", 1350, 820, "b22:worried", "b23:away", size=40, color="accent"),
    I("br", "breath", 1600, 380, 120, "pop", "b23:away", "b25"),
    TOP("t13", "the feeling goes *away*", "b23:whatever", "b24"),
    I("fc2", "cloud", 1350, 380, 120, "pop", "b24:little", "b28", color="muted"),
    TOP("t14", "for a *little* while", "b24:little", "b25"),
    I("lo", "loop", 1650, 600, 200, "pop", "b25:relief", "b27", color="accent"),
    TOP("t15", "your brain remembers the *relief*", "b25:brain", "b26"),
    TOP("t16", "next time: even *faster*", "b26:next", "b27"),
    I("hh", "heart", 1350, 600, 110, "pop", "b27:care", "b28", color="accent", pulse=1.1, beat=0.9),
    TOP("t17", "we avoid what we *care* about", "b27:avoid", "b28"),
]})

# 2 · the campus: Tice & Baumeister's semester ------------------------------------------------------------
SX = [1100, 1380, 1660]
scenes.append({"id": "semester", "beats": R(28, 42), "elements": [
    BG("bg", "bgCampus", "b28:here's", "b43"),
    HOST("h", "b28:here's", "b43",
         [["lean", "b28:interesting"], ["present", "b29:in"], ["explain", "b30:measured"], ["presentL", "b31:early"], ["happy", "b34:relaxed"],
          ["chin", "b35:then"], ["explainR", "b36:by"], ["shrug", "b37:grades"], ["count", "b38:added"], ["explain", "b39:so"],
          ["handsHips", "b40:borrowed"], ["happy", "b41:you've"], ["lean", "b42:calm"]],
         [["smile", "b28:here's"], ["smile", "b31:early"], ["neutral", "b35:then"], ["frown", "b36:sick"], ["neutral", "b38:added"],
          ["smile", "b39:so"], ["grin", "b41:you've"], ["smile", "b42:calm"]]),
    TOP("t0", "it gets *interesting*", "b28:here's", "b29"),
    CARD("c1", "1997 · TICE & BAUMEISTER", "A whole semester of students", "psychologists", 1350, 220, "b29:nineteen", "b30"),
    ST("s0", SX[0], GY, "bottom", "b29:class", [["headDown", "b30:measured"], ["strain", "b34:working"], ["idle", "b36:by"]],
       [["neutral", "b29:class"], ["tight", "b34:working"], ["smile", "b37:and"]], out="b38", scale=0.8),
    ST("s1", SX[1], GY, "bottom", "b29:class", [["idle", "b30:measured"], ["lean", "b31:winners"], ["happy", "b32:less"],
                                                 ["holdHead", "b35:arrived"], ["sorry", "b36:sick"]],
       [["smile", "b29:class"], ["grin", "b31:winners"], ["o", "b35:arrived"], ["frown", "b36:sick"]], out="b38", scale=0.8, variant="bow"),
    ST("s2", SX[2], GY, "bottom", "b29:class", [["headDown", "b30:measured"], ["strain", "b34:working"], ["idle", "b36:by"]],
       [["neutral", "b29:class"], ["tight", "b34:working"], ["smile", "b37:and"]], out="b38", scale=0.8, flip=True),
    I("bk0", "book", SX[0], 470, 90, "pop", "b34:working", "b36"),
    I("bk2", "book", SX[2], 470, 90, "pop", "b34:working", "b36"),
    TOP("t1", "who procrastinated… *stress* and *health*", "b30:measured", "b31"),
    TOP("t2", "early on: they looked like *winners*", "b31:early", "b32"),
    TAG("g1", "less stressed", SX[1], 380, "b32:less", "b34", size=44, color="accent"),
    TAG("g2", "less illness", SX[1], 310, "b33:fewer", "b34", size=44, color="accent"),
    TOP("t3", "the *relaxed* ones", "b34:relaxed", "b35"),
    STAMP("dl", "DEADLINE", 1380, 360, 90, "b35:deadlines", "b36"),
    I("th", "thermo", SX[1] + 140, 470, 130, "pop", "b36:sick", "b38"),
    TOP("t4", "the end of the semester", "b36:end", "b37"),
    I("gp", "paper", SX[1] - 150, 470, 120, "pop", "b37:grades", "b38"),
    T("gc", "C", SX[1] - 150, 470, 70, "slam", "b37:lower", "b38", color="accent", weight=800),
    TOP("t5", "lower *grades*", "b37:grades", "b38"),
    BAR("x1", 1150, 360, "put it off", "accent", "b38:procrastinators", "b39"),
    BAR("x2", 1550, 230, "everyone else", "muted", "b38:procrastinators", "b39"),
    TOP("t6", "all added up: *more* stress and illness", "b38:added", "b39", size=58),
    TOP("t7", "the relief was *real*…", "b39:relief", "b40"),
    I("my", "money", 1350, 560, 200, "pop", "b40:borrowed", "b41"),
    T("in", "+ interest", 1350, 760, 56, "bottom", "b40:interest", "b41", color="accent", weight=800),
    TOP("t8", "…just *borrowed*", "b40:borrowed", "b41"),
    TOP("t9", "you've probably *felt* this", "b41:you've", "b42"),
    I("cw", "sun", 1150, 520, 170, "pop", "b42:calm", None),
    TAG("cwt", "the calm week", 1150, 740, "b42:calm", None),
    I("ln", "moon", 1580, 520, 170, "pop", "b42:long", None),
    I("lc", "coffee", 1680, 640, 90, "pop", "b42:night", None),
    TAG("lnt", "the very long night", 1580, 740, "b42:long", None),
]})

# 3 · the study: future you is a stranger, and gets the ketchup ------------------------------------------
scenes.append({"id": "future", "beats": R(43, 66), "elements": [
    BG("bg", "bgStudy", "b43:so", "b67"),
    HOST("h", "b43:so", "b67",
         [["chin", "b43:why"], ["explain", "b44:part"], ["present", "b45:in"], ["count", "b46:sometimes"], ["count", "b47:sometimes"],
          ["count", "b48:and"], ["happy", "b49:famous"], ["explainR", "b50:for"], ["shrug", "b51:other"], ["explain", "b52:changes"],
          ["present", "b53:a"], ["sorry", "b54:ketchup"], ["embarrassed", "b55:picture"], ["explain", "b56:people"], ["presentL", "b57:when"],
          ["present", "b58:future"], ["shrug", "b59:stranger"], ["handsHips", "b60:that's"], ["happy", "b61:present"], ["explainR", "b62:future"],
          ["present", "b63:later"], ["explain", "b64:showed"], ["proud", "b65:twice"], ["happy", "b66:when"]],
         [["neutral", "b43:so"], ["smile", "b44:part"], ["smile", "b49:famous"], ["neutral", "b50:for"], ["smile", "b52:changes"],
          ["frown", "b54:ketchup"], ["tight", "b55:taste"], ["smile", "b56:people"], ["grin", "b61:break"], ["grin", "b62:ketchup"],
          ["smile", "b63:later"], ["grin", "b65:twice"], ["smile", "b66:when"]]),
    I("mn", "moon", 1350, 520, 160, "pop", "b43:night", "b44"),
    TOP("t0", "why doesn't the long night *stop* us?", "b43:why", "b44", size=58),
    *CLOUD("fy", "b44:future", "b45", "oldme", size=80),
    TOP("t1", "how your brain sees *future you*", "b44:future", "b45"),
    CARD("c1", "2009 · HERSHFIELD ET AL.", "Brain scans: you, future you, strangers", "psychologists", 1350, 220, "b45:two", "b46"),
    I("bs", "brain", 1350, 580, 260, "pop", "b45:scanned", "b46"),
    I("n1", "thought", 1060, 520, 200, "pop", "b46:themselves", "b51"),
    T("n1t", "me", 1062, 510, 52, "pop", "b46:right", "b51", weight=800),
    TAG("n1l", "you, now", 1060, 740, "b46:right", "b51"),
    I("n2", "oldme", 1350, 520, 170, "pop", "b47:ten", "b51"),
    TAG("n2l", "you, in 10 years", 1350, 740, "b47:ten", "b51"),
    I("n3", "star", 1640, 520, 160, "pop", "b48:strangers", "b51"),
    TAG("n3l", "a stranger", 1640, 740, "b48:strangers", "b51"),
    TOP("t2", "the strangers: *famous actors*", "b49:famous", "b50"),
    T("eq", "≈", 1495, 520, 110, "slam", "b50:much", "b51", color="accent", weight=800),
    TOP("t3", "future you ≈ a *stranger*", "b50:future", "b51"),
    TOP("t4", "future you feels like *somebody else*", "b51:other", "b52"),
    I("se", "oldme", 1350, 560, 200, "pop", "b51:somebody", "b52"),
    I("seq", "question", 1500, 420, 80, "pop", "b51:else", "b52"),
    TOP("t5", "…and that changes how you *treat* them", "b52:changes", "b53", size=58),
    CARD("c2", "2008 · PRONIN ET AL.", "A disgusting drink, for science", "psychologists", 1350, 220, "b53:year", "b54"),
    I("dcup", "cup", 1350, 600, 200, "pop", "b53:tested", "b54"),
    I("kp", "ketchup", 1150, 560, 200, "pop", "b54:ketchup", "b56"),
    T("pl", "+", 1350, 560, 90, "pop", "b54:soy", "b56", weight=800),
    I("sy", "soy", 1550, 560, 200, "pop", "b54:soy", "b56"),
    TOP("t6", "ketchup + soy *sauce*", "b54:ketchup", "b55"),
    TOP("t7", "picture the *taste*", "b55:picture", "b56"),
    I("cq", "cup", 1350, 560, 180, "pop", "b56:decide", "b57"),
    T("cqq", "how much?", 1350, 760, 50, "bottom", "b56:much", "b57", color="muted", weight=800),
    ST("pn", 1120, GY, "bottom", "b57:when", [["give", "b57:small"]], [["tight", "b57:small"]], out="b60", scale=0.8),
    I("cs", "cup", 1250, 590, 70, "pop", "b57:small", "b63"),
    TAG("csl", "you, now", 1120, 360, "b57:when", "b60"),
    I("fo", "oldme", 1650, 520, 170, "pop", "b58:future", "b63"),
    I("cb", "cup", 1650, 760, 220, "pop", "b58:lot", "b63"),
    TAG("cbl", "future you", 1650, 340, "b58:future", "b60"),
    I("sst", "star", 1800, 400, 70, "pop", "b59:stranger", "b60"),
    TOP("t8", "about what they'd give a *stranger*", "b59:about", "b60"),
    TOP("t9", "procrastination, in *one cup*", "b60:that's", "b61"),
    I("cc", "couch", 1150, 640, 220, "pop", "b61:present", "b63"),
    TOP("t10", "present you gets the *break*", "b61:present", "b62:gets"),
    TOP("t11", "future you gets the *ketchup*", "b62:future", "b63"),
    TOP("t11b", "something more *hopeful*", "b63:later", "b64"),
    I("mr", "mirror", 1300, 540, 300, "pop", "b64:showed", "b66"),
    I("mro", "oldme", 1300, 520, 140, "pop", "b64:faces", "b66"),
    TOP("t12", "meet your *older* self", "b64:pictures", "b65"),
    I("jr", "jar", 1650, 560, 200, "pop", "b65:save", "b66"),
    T("x2", "×2", 1650, 360, 90, "slam", "b65:twice", "b66", color="accent", weight=800),
    TOP("t13", "they saved more than *twice* as much", "b65:twice", "b66", size=58),
    I("hf", "oldme", 1350, 540, 200, "pop", "b66:future", None),
    I("hh", "heart", 1480, 420, 90, "pop", "b66:looking", None, color="accent", pulse=1.1, beat=0.9),
    TOP("t14", "when future you feels *real*", "b66:real", None),
]})

# 4 · the bedroom: "I'll start on Monday" and the fresh start effect -------------------------------------
scenes.append({"id": "monday", "beats": R(67, 83), "elements": [
    BG("bg", "bgBedroom", "b67:now", "b84"),
    HOST("h", "b67:now", "b84",
         [["lean", "b67:ask"], ["embarrassed", "b68:monday"], ["happy", "b69:alone"], ["present", "b70:psychologists"], ["presentL", "b71:in"],
          ["explain", "b72:searches"], ["count", "b72:month"], ["explainR", "b73:visits"], ["present", "b74:fresh"], ["chin", "b75:maybe"],
          ["explain", "b76:new"], ["shrug", "b77:old"], ["proud", "b78:new"], ["lean", "b79:irony"], ["explainR", "b80:same"],
          ["present", "b81:monday"], ["shrug", "b82:wait"], ["explain", "b83:difference"]],
         [["smile", "b67:now"], ["grin", "b68:monday"], ["smile", "b69:alone"], ["smile", "b71:in"], ["neutral", "b75:maybe"],
          ["smile", "b76:new"], ["grin", "b78:new"], ["neutral", "b79:irony"], ["smile", "b81:monday"], ["neutral", "b82:wait"],
          ["smile", "b83:difference"]]),
    TOP("t0", "let me ask you *something*", "b67:now", "b68:monday"),
    BUB("mb", "I'll start on Monday.", 760, 340, 180, "b68:start", "b69", fontSize=30),
    I("cal", "calendar", 1350, 540, 260, "pop", "b68:monday", "b71"),
    T("mon", "MONDAY", 1350, 740, 60, "slam", "b68:monday", "b71", color="accent", weight=800),
    TOP("t1", "you're not *alone*", "b69:alone", "b70"),
    TOP("t2", "psychologists *measured* it", "b70:measured", "b71"),
    CARD("c1", "2014 · DAI, MILKMAN & RIIS", "Google searches for \"diet\"", "researchers", 1350, 220, "b71:twenty", "b72"),
    BUB("sr", "diet", 1350, 520, 160, "b71:diet", "b72", fontSize=44),
    BAR("w1", 1080, 300, "new week", "accent", "b72:week", "b74"),
    BAR("w2", 1350, 330, "new month", "accent", "b72:month", "b74"),
    BAR("w3", 1620, 380, "new year", "accent", "b72:year", "b74"),
    TOP("t3", "searches *jump* on fresh starts", "b72:searches", "b73"),
    I("db", "dumbbell", 1800, 420, 120, "pop", "b73:gym", "b74"),
    TOP("t4", "gym visits, *too*", "b73:gym", "b74"),
    TOP("t5", "the fresh start *effect*", "b74:fresh", "b75"),
    I("nt", "checklist", 1350, 560, 240, "pop", "b75:list", "b76"),
    T("ntt", "Monday:", 1350, 360, 52, "pop", "b75:monday", "b76", weight=800),
    TOP("t6", "a plan that starts on *Monday*", "b75:plan", "b76"),
    I("pg", "paper", 1350, 540, 240, "pop", "b76:page", "b79"),
    TOP("t7", "a new week: a clean *page*", "b76:new", "b77"),
    I("ms", "scribble", 1100, 540, 160, "pop", "b77:mess", "b79"),
    TAG("msl", "old you", 1100, 740, "b77:old", "b79"),
    I("nk", "check", 1600, 540, 150, "pop", "b78:fix", "b79", color="accent"),
    TAG("nkl", "new you", 1600, 740, "b78:new", "b79"),
    TOP("t8", "here's the *irony*", "b79:here's", "b80:feeling"),
    I("cal2", "calendar", 1350, 540, 260, "pop", "b80:push", "b83"),
    T("mon2", "MONDAY", 1350, 740, 60, "pop", "b80:push", "b83", color="accent", weight=800),
    TOP("t9", "that's how we *push it back*", "b80:feeling", "b81", size=58),
    I("sl", "flag", 1650, 560, 180, "pop", "b81:starting", "b83"),
    TOP("t10", "a starting line…", "b81:starting", "b82"),
    I("wt", "hourglass", 1050, 560, 160, "pop", "b82:wait", "b83"),
    TOP("t11", "…or where things go to *wait*", "b82:wait", "b83"),
    TOP("t12", "what you do when Monday *comes*", "b83:difference", None),
]})

# 5 · the office: deadlines, and "But it wasn't over yet." -------------------------------------------------
PX = [1080, 1380, 1680]
scenes.append({"id": "deadline", "beats": R(84, 99), "elements": [
    BG("bg", "bgDesk", "b84:so", "b100"),
    HOST("h", "b84:so", "b100",
         [["chin", "b84:deadlines"], ["shrug", "b85:help"], ["present", "b86:in"], ["count", "b87:some"], ["count", "b88:others"],
          ["count", "b89:third"], ["proud", "b90:weekly"], ["happy", "b91:earned"], ["shrug", "b92:worst"], ["chin", "b93:chose"],
          ["explainR", "b94:middle"], ["explain", "b95:most"], ["embarrassed", "b96:tight"], ["happy", "b97:we"], ["shrug", "b98:just"],
          ["idle", "b99:but"]],
         [["neutral", "b84:so"], ["smile", "b86:in"], ["grin", "b91:earned"], ["neutral", "b92:worst"], ["smile", "b94:middle"],
          ["tight", "b96:tight"], ["smile", "b97:we"], ["neutral", "b99:but"]]),
    TOP("t0", "do deadlines *help*?", "b84:deadlines", "b86"),
    CARD("c1", "2002 · ARIELY & WERTENBROCH", "Paid to find typos", "proofreaders", 1350, 220, "b86:two", "b87"),
    I("pp", "paper", 1300, 560, 200, "pop", "b86:proofread", "b87"),
    I("pn", "pen", 1430, 520, 120, "pop", "b86:proofread", "b87", color="accent"),
    ST("r0", PX[0], GY, "bottom", "b87:some", [["idle", "b87:some"], ["shrug", "b92:worst"]], [["neutral", "b87:some"]], out="b90", scale=0.78),
    I("r0f", "flag", PX[0] + 110, 560, 110, "pop", "b87:end", "b90"),
    TAG("r0l", "one, at the end", PX[0], 950, "b87:end", "b90", size=32),
    ST("r1", PX[1], GY, "bottom", "b88:others", [["give", "b88:hand"]], [["smile", "b88:others"]], out="b90", scale=0.78, variant="bow"),
    *[I(f"r1f{i}", "flag", PX[1] - 60 + i * 60, 450, 70, "pop", "b88:every", "b90") for i in range(3)],
    TAG("r1l", "every week", PX[1], 950, "b88:week", "b90", size=32),
    ST("r2", PX[2], GY, "bottom", "b89:third", [["chin", "b89:choose"]], [["neutral", "b89:third"]], out="b90", scale=0.78, flip=True),
    I("r2f", "flag", PX[2] - 110, 560, 110, "pop", "b89:choose", "b90"),
    I("r2q", "question", PX[2] - 110, 440, 70, "pop", "b89:own", "b90"),
    TAG("r2l", "choose your own", PX[2], 950, "b89:own", "b90", size=32),
    TOP("t1", "one at the *end*", "b87:end", "b88"),
    TOP("t2", "one *every week*", "b88:every", "b89"),
    TOP("t3", "choose your *own*", "b89:choose", "b90"),
    BAR("e1", PX[1], 380, "weekly", "accent", "b90:weekly", None),
    T("e1t", "most typos found", PX[1], 380, 34, "bottom", "b90:errors", "b92", color="accent", weight=M),
    TOP("t4", "weekly: most errors, least *late*", "b90:weekly", "b92"),
    BAR("e0", PX[0], 130, "one at the end", "muted", "b92:one", None),
    TOP("t5", "one big deadline: the *worst*", "b92:one", "b93"),
    BAR("e2", PX[2], 240, "chose their own", "muted", "b94:landed", None),
    TOP("t6", "chose their own… the *middle*", "b93:chose", "b95"),
    TOP("t7", "they knew they *needed* deadlines", "b95:knew", "b96"),
    TOP("t8", "…just not *tight* enough", "b96:tight", "b97"),
    TOP("t9", "we know ourselves… a *little*", "b97:know", "b99"),
    HERO("hero", "But it wasn't over yet.", "b99:but", None, size=90, y=300),
]})

# 6 · the exam hall: forgiving yourself -------------------------------------------------------------------
scenes.append({"id": "habit", "beats": R(100, 119), "elements": [
    BG("bg", "bgExam", "b100:because", "b120"),
    HOST("h", "b100:because", "b120",
         [["explain", "b100:useful"], ["present", "b101:in"], ["explainR", "b102:before"], ["chin", "b103:afterwards"], ["explain", "b104:then"],
          ["proud", "b105:students"], ["sorry", "b106:students"], ["shrug", "b107:notice"], ["shrug", "b108:nobody"], ["happy", "b109:kindness"],
          ["chin", "b110:so"], ["present", "b111:think"], ["explain", "b112:putting"], ["holdHead", "b113:guilt"], ["explainR", "b114:harder"],
          ["happy", "b115:forgiving"], ["proud", "b116:suddenly"], ["lean", "b117:would"], ["shrug", "b118:probably"], ["happy", "b119:you'd"]],
         [["smile", "b100:because"], ["smile", "b105:students"], ["frown", "b106:beating"], ["smile", "b107:notice"], ["grin", "b109:kindness"],
          ["neutral", "b110:so"], ["smile", "b111:think"], ["neutral", "b113:guilt"], ["smile", "b115:forgiving"], ["grin", "b116:suddenly"],
          ["smile", "b117:would"], ["grin", "b118:probably"], ["smile", "b119:you'd"]]),
    I("kd", "heart", 1350, 540, 160, "pop", "b100:kindest", "b101", color="accent", pulse=1.08, beat=1.0),
    TOP("t0", "the most useful… and the *kindest*", "b100:useful", "b101"),
    CARD("c1", "2010 · WOHL, PYCHYL & BENNETT", "First-year students, two exams", "psychologists", 1350, 220, "b101:twenty", "b102"),
    ST("sa", 1120, GY, "bottom", "b102:before", [["headDown", "b102:put"], ["happy", "b103:forgiven"], ["proud", "b105:less"]],
       [["neutral", "b102:before"], ["smile", "b103:forgiven"], ["grin", "b105:less"]], out="b107", scale=0.8),
    ST("sb", 1620, GY, "bottom", "b102:before", [["headDown", "b102:put"], ["holdHead", "b103:forgiven"], ["sorry", "b106:beating"]],
       [["neutral", "b102:before"], ["frown", "b103:forgiven"], ["tight", "b106:beating"]], out="b107", scale=0.8, flip=True, variant="bow"),
    I("pa", "phone", 1230, 600, 80, "pop", "b102:put", "b103"),
    I("pb", "phone", 1510, 600, 80, "pop", "b102:put", "b103"),
    TOP("t1", "exam *one*: they put off studying", "b102:before", "b103"),
    BUB("fa", "It's okay. Next time.", 1120, 380, 170, "b103:forgiven", "b105", fontSize=28),
    I("rc", "rain", 1620, 380, 150, "pop", "b103:forgiven", "b107", color="muted"),
    TOP("t2", "did they *forgive* themselves?", "b103:asked", "b104"),
    TOP("t3", "then… exam *two*", "b104:second", "b105"),
    TAG("la", "put it off less", 1120, 950, "b105:less", "b107", color="accent"),
    TOP("t4", "forgave themselves → *less* putting off", "b105:forgiven", "b106", size=58),
    TAG("lb", "put it off more", 1620, 950, "b106:students", "b107:harder"),
    TOP("t5", "beating themselves up → *more*", "b106:beating", "b107"),
    T("th", "try harder!", 1150, 520, 64, "pop", "b107:harder", "b109", weight=800),
    K("thk", 1150, 520, 400, "b107:harder", "b109"),
    I("pl", "notebook", 1620, 520, 170, "pop", "b108:planner", "b109"),
    K("plk", 1620, 520, 220, "b108:planner", "b109"),
    I("kh", "heart", 1350, 540, 200, "pop", "b109:kindness", "b110", color="accent", pulse=1.1, beat=0.9),
    TOP("t6", "a little *kindness*", "b109:kindness", "b110"),
    *CLOUD("w", "b110:why", "b111", "question", size=60),
    TOP("t7", "why would kindness *help*?", "b110:why", "b111"),
    I("dr", "drawer", 1350, 560, 220, "pop", "b111:start", "b112"),
    TOP("t8", "think back to the *start*", "b111:think", "b112"),
    I("tk", "paper", 1250, 600, 200, "pop", "b112:putting", "b117"),
    I("bf", "cloud", 1250, 380, 160, "pop", "b112:feeling", "b115:forgiving", color="muted"),
    I("gu", "rain", 1520, 360, 200, "pop", "b113:guilt", "b115:forgiving", color="muted"),
    TAG("gul", "guilt", 1520, 520, "b113:guilt", "b115:forgiving"),
    TOP("t9", "guilt is a bad feeling *too*", "b113:guilt", "b114"),
    TOP("t10", "harder on yourself → more to *escape*", "b114:harder", "b115", size=58),
    I("wt", "box", 1250, 420, 150, "pop", "b115:weight", "b116"),
    TOP("t11", "forgiving yourself takes the *weight* off", "b115:forgiving", "b116", size=58),
    I("lt", "check", 1500, 560, 130, "pop", "b116:starting", "b117", color="accent"),
    TOP("t12", "starting feels *lighter*", "b116:suddenly", "b117"),
    ST("fr", 1450, GY, "right", "b117:friend", [["headDown", "b117:failure"], ["happy", "b119:let"]], [["frown", "b117:failure"], ["smile", "b119:let"]],
       out="b120", flip=True, variant="bow"),
    I("fp", "paper", 1640, 640, 100, "pop", "b117:assignment", "b119"),
    TOP("t13", "would you call a friend a *failure*?", "b117:would", "b118"),
    BUB("lg", "Let it go. Start again.", 760, 340, 170, "b119:let", "b120", fontSize=28),
]})

# 7 · the living room: five rules ---------------------------------------------------------------------------
scenes.append({"id": "rules", "beats": R(120, 145), "elements": [
    BG("bg", "bgLiving", "b120:so", "b146"),
    HOST("h", "b120:so", "b146",
         [["explain", "b120:how"], ["count", "b121:five"], ["count", "b122:rule"], ["chin", "b124:ask"], ["explainR", "b126:once"],
          ["count", "b127:rule"], ["present", "b129:not"], ["happy", "b130:just"], ["count", "b131:rule"], ["explain", "b133:if"],
          ["present", "b134:psychologists"], ["proud", "b135:average"], ["explainR", "b136:works"], ["count", "b137:rule"], ["give", "b138:tell"],
          ["shrug", "b139:hide"], ["count", "b140:rule"], ["happy", "b141:forgive"], ["explain", "b143:only"], ["happy", "b144:patient"],
          ["explainR", "b145:habit"]],
         [["smile", "b120:so"], ["neutral", "b124:ask"], ["smile", "b126:once"], ["smile", "b129:not"], ["grin", "b130:just"],
          ["smile", "b133:if"], ["grin", "b135:average"], ["smile", "b136:works"], ["neutral", "b139:hide"], ["smile", "b141:forgive"],
          ["smile", "b144:patient"]]),
    TOP("t0", "five simple *rules*", "b121:five", "b122"),
    TOP("r1", "rule 1: name the *feeling*", "b122:rule", "b127"),
    I("fq", "thought", 1350, 480, 360, "pop", "b124:ask", "b127"),
    T("fqq", "?", 1350, 470, 110, "pop", "b124:feel", "b125", color="accent", weight=800),
    TAG("fb1", "bored?", 1050, 520, "b125:bored", "b127", size=40),
    TAG("fb2", "confused?", 1660, 520, "b125:confused", "b127", size=40),
    TAG("fb3", "scared?", 1350, 730, "b125:scared", "b127", size=40, color="accent"),
    TAG("fb4", "it loses its grip", 1350, 820, "b126:once", "b127"),
    TOP("r2", "rule 2: make the first step *tiny*", "b127:rule", "b131"),
    I("lt", "laptop", 1350, 600, 220, "pop", "b128:first", "b131"),
    T("wr", "write the report", 1350, 400, 60, "pop", "b129:write", "b130", weight=800),
    K("wrk", 1350, 400, 520, "b129:not", "b130"),
    T("od", "open the document", 1350, 400, 60, "pop", "b130:open", "b131", color="accent", weight=800),
    TOP("r3", "rule 3: *if*… then…", "b131:rule", "b134"),
    TOP("r3b", "plan it as *if… then*", "b135:average", "b137"),
    BUB("it", "If it's 9:00, then I open the document.", 1350, 500, 260, "b133:if", "b134", fontSize=28),
    CARD("c1", "2006 · GOLLWITZER & SHEERAN", "94 tests of if-then plans", "psychologists", 1350, 220, "b134:psychologists", "b135"),
    I("ok", "check", 1350, 540, 220, "pop", "b135:follow", "b137", color="accent"),
    TAG("okl", "more likely to follow through", 1350, 760, "b135:follow", "b137"),
    TAG("dec", "decided before the moment arrives", 1350, 830, "b136:decision", "b137", color="accent"),
    TOP("r4", "rule 4: small deadlines, *shared*", "b137:rule", "b140"),
    *[I(f"fl{i}", "flag", 1100 + i * 110, 560, 100, "pop", "b138:small", "b140") for i in range(3)],
    ST("pal", 1650, GY, "right", "b138:tell", [["happy", "b138:tell"]], [["smile", "b138:tell"]], out="b140", flip=True, variant="bow"),
    I("tu", "thumbsUp", 1650, 380, 110, "pop", "b138:someone", "b140"),
    I("big", "flag", 1300, 560, 200, "pop", "b139:big", "b140"),
    TAG("hid", "where things go to hide", 1300, 760, "b139:hide", "b140"),
    TOP("r5", "rule 5: forgive *yesterday*", "b140:rule", "b144"),
    I("yc", "calendar", 1350, 540, 260, "pop", "b141:yesterday", "b144"),
    T("yt", "yesterday", 1350, 760, 50, "pop", "b141:yesterday", "b144", weight=800),
    K("ytk", 1350, 760, 300, "b142:change", "b144"),
    I("nx", "flag", 1650, 560, 160, "pop", "b143:next", "b144", color="accent"),
    TOP("t6", "be *patient* with yourself", "b144:patient", None),
    I("hg", "hourglass", 1350, 540, 200, "pop", "b145:habit", None),
    TAG("hgl", "years to build, a while to change", 1350, 760, "b145:years", None),
]})

# 8 · the kitchen again: the twist and the ending ----------------------------------------------------------
scenes.append({"id": "end", "tail": 2.6, "beats": R(146, 167), "elements": [
    BG("bg", "bgKitchen", "b146:so", None),
    HOST("h", "b146:so", None,
         [["explain", "b146:twist"], ["shrug", "b147:most"], ["proud", "b148:opposite"], ["explain", "b149:avoid"], ["present", "b150:brain"],
          ["happy", "b151:little"], ["presentL", "b152:junk"], ["count", "b153:notice"], ["count", "b154:forgive"], ["count", "b155:tiny"],
          ["happy", "b156:future"], ["embarrassed", "b157:least"], ["explain", "b158:challenge"], ["count", "b159:pick"], ["explainR", "b160:write"],
          ["proud", "b161:today"], ["lean", "b162:love"], ["chin", "b163:what's"], ["happy", "b164:let"], ["happy", "b165:promise"],
          ["wave", "b166:which"]],
         [["smile", "b146:so"], ["neutral", "b147:most"], ["smile", "b148:opposite"], ["smile", "b150:brain"], ["grin", "b151:little"],
          ["smile", "b152:junk"], ["grin", "b157:least"], ["smile", "b158:challenge"], ["grin", "b165:promise"], ["grin", "b166:which"]]),
    TOP("t0", "so here's the *twist*", "b146:twist", "b147"),
    T("sg", "procrastinators don't care", 1350, 520, 60, "pop", "b147:procrastinate", "b149", weight=800),
    K("sgk", 1350, 520, 860, "b148:opposite", "b149"),
    TOP("t1", "very often… the *opposite*", "b148:opposite", "b149"),
    I("ch", "heart", 1350, 540, 180, "pop", "b149:matter", "b150", color="accent", pulse=1.08, beat=1.0),
    TOP("t2", "we avoid what *matters*", "b149:avoid", "b150"),
    I("bm", "brain", 1250, 540, 200, "pop", "b150:brain", "b152"),
    I("bs", "shield", 1480, 540, 160, "pop", "b150:protect", "b152", color="accent"),
    TOP("t3", "protecting your *mood*", "b150:protect", "b151"),
    TOP("t4", "a little too *good* at it", "b151:it's", "b152"),
    I("dr", "drawer", 1450, 620, 220, "pop", "b152:junk", "b153"),
    TOP("t5", "go easy on *yourself*", "b152:easy", "b153"),
    TAG("s1", "notice the feeling", 1350, 420, "b153:notice", "b156", size=44),
    TAG("s2", "forgive the delay", 1350, 520, "b154:forgive", "b156", size=44),
    TAG("s3", "take one tiny step", 1350, 620, "b155:tiny", "b156", size=44, color="accent"),
    I("om", "oldme", 1350, 520, 200, "pop", "b156:future", "b157"),
    I("oh", "heart", 1480, 400, 90, "pop", "b156:grateful", "b157", color="accent", pulse=1.1, beat=0.9),
    TOP("t6", "future you: very *grateful*", "b156:grateful", "b157"),
    I("pl", "plate", 1350, 600, 170, "pop", "b157:kitchen", "b158"),
    I("gl", "glow", 1350, 470, 120, "pop", "b157:cleaned", "b158", color="accent"),
    TOP("t7", "at least the kitchen got *cleaned*", "b157:least", "b158"),
    TOP("t8", "your *challenge* this week", "b158:challenge", "b159"),
    I("nt", "pen", 1640, 560, 160, "pop", "b159:pick", "b162", color="accent"),
    T("nt1", "Step 1:", 1250, 520, 96, "pop", "b160:first", "b162", weight=800),
    TAG("nt2", "as small as you can make it", 1300, 660, "b160:small", "b162", size=40, color="accent"),
    TOP("t9", "pick one thing you've put off", "b159:pick", "b160"),
    TOP("t10", "write the very first *step*", "b160:write", "b161"),
    TOP("t11", "do just that step, *today*", "b161:today", "b162"),
    I("eq", "thought", 1350, 500, 300, "pop", "b163:what's", "b166"),
    T("eq2", "?", 1350, 480, 120, "pop", "b163:longest", "b166", color="accent", weight=800),
    TOP("t12", "what have you put off the *longest*?", "b163:what's", "b166", size=58),
    T("nj", "no judging", 1350, 760, 44, "bottom", "b165:judge", "b166", color="muted", weight=M),
    I("end", "heart", 1350, 540, 200, "pop", "b166:habit", None, color="accent", pulse=1.08, beat=1.2),
    TOP("t13", "which habit *next*?", "b166:habit", hero=True, size=80),
    T("t14", "@darealwhy", 1350, 820, 44, "bottom", "b167:comments", weight=M, color="muted"),
]})

(ROOT / "script").mkdir(exist_ok=True)
(ROOT / "script/script.json").write_text(json.dumps({"title": "The Psychology of People Who Procrastinate", "scenes": scenes}, indent=1, ensure_ascii=False))
print(sum(len(s["elements"]) for s in scenes), "elements,", len(S), "sentences")
