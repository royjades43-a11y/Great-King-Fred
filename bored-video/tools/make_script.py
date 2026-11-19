"""Writes script/script.json for video 15 from timing/words.json (one beat per spoken sentence)
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
# Video 15 · performance direction (STYLE.md, from video 13)
# The HOST talks to the viewer (mouth on every word) and performs the line with its posture.
# Story figures act out the studies. Every chapter happens somewhere. Calm and warm, nothing dramatic:
# the shock study is told with a raised eyebrow, no flashes. Running image: the kettle.
# ---------------------------------------------------------------------------------------------
HX = 400
def BG(id, name, at, out=None):
    return I(id, name, 960, 560, 1920, "blur", at, out, color="muted", opacity=0.42, z=1)
def HOST(id, at, out, poses, mouths, talk=False, x=HX, **k):
    return ST(id, x, GY, "none" if at == "b00:you're" else "left", at, poses, mouths, out=out, talk=talk, **k)
def TAG(id, txt, x, y, at, out, size=38, color="muted"):
    return T(id, txt, x, y, size, "bottom", at, out, color=color)
def CLOUD(id, at, out, inner=None, at2=None, size=66):
    els = [I(id, "thought", 660, 330, 160, "pop", at, out)]
    if inner: els.append(I(id + "i", inner, 662, 322, size, "pop", at2 or at, out))
    return els

# 1 · the kettle, the promise, then Wilson's plain room ----------------------------------------------------
scenes.append({"id": "hook", "beats": R(0, 26), "elements": [
    BG("bg", "bgKitchen", "b00:you're", "b09:let's"),
    BG("bg2", "bgLab", "b09:let's", "b27"),
    HOST("h", "b00:you're", "b27",
         [["idle", "b00:kettle"], ["chin", "b01:two"], ["search", "b02:hand"], ["shrug", "b03:weren't"], ["embarrassed", "b04:stand"],
          ["happy", "b05:if"], ["present", "b06:so"], ["count", "b07:you'll"], ["present", "b08:by"], ["presentL", "b09:let's"],
          ["explain", "b10:in"], ["explainR", "b11:sit"], ["count", "b12:no"], ["count", "b13:no"], ["count", "b14:nothing"],
          ["chin", "b15:just"], ["explain", "b16:asked"], ["happy", "b17:relaxing"], ["shrug", "b18:most"], ["explain", "b19:many"],
          ["presentL", "b20:researchers"], ["present", "b21:ages"], ["shrug", "b22:same"], ["explainR", "b23:home"], ["embarrassed", "b24:cheated"],
          ["handsHips", "b25:checked"], ["lean", "b26:have"]],
         [["neutral", "b00:you're"], ["neutral", "b01:two"], ["o", "b02:hand"], ["smile", "b03:weren't"], ["grin", "b04:stand"],
          ["smile", "b05:if"], ["smile", "b09:let's"], ["grin", "b17:relaxing"], ["neutral", "b18:most"], ["smile", "b20:researchers"],
          ["grin", "b24:cheated"], ["smile", "b26:have"]],
         move=[[700, GY, "b00:kettle", 0.1], [HX, GY, "b05:if", 1.2]]),
    I("kt", "kettle", 1000, 610, 190, "pop", "b00:kettle", "b05"),
    TOP("t0", "waiting for the *kettle*", "b00:waiting", "b01"),
    I("sw", "stopwatch", 1300, 520, 150, "pop", "b01:two", "b03"),
    T("swt", "2:00", 1300, 700, 60, "bottom", "b01:minutes", "b02:thirty", weight=800),
    TOP("t1", "about two *minutes*", "b01:two", "b02"),
    I("ph", "phone", 900, 470, 130, "pop", "b02:reaching", "b05", sway=6, period=0.5),
    T("s30", "0:30", 1300, 700, 60, "slam", "b02:thirty", "b03", color="accent", weight=800),
    TOP("t2", "…your hand reaches for your *phone*", "b02:hand", "b03"),
    TOP("t3", "no message… just *nothing* to do", "b03:weren't", "b05"),
    TOP("t4", "you're not *alone*", "b05:sounds", "b06"),
    # the promise
    I("p1", "thought", 1060, 560, 200, "pop", "b06:thoughts", "b09"),
    TAG("p1t", "your thoughts", 1060, 760, "b06:thoughts", "b09"),
    I("p2", "bolt", 1390, 560, 180, "pop", "b07:electric", "b09", color="accent"),
    TAG("p2t", "the shock", 1390, 760, "b07:electric", "b09"),
    I("p3", "bulb", 1700, 560, 180, "pop", "b08:boredom", "b09"),
    TAG("p3t", "good boredom", 1700, 760, "b08:boredom", "b09"),
    TOP("t5", "in this video", "b06:so", "b09", color="muted"),
    # the plain room
    CARD("c1", "2014 · WILSON ET AL.", "Just sit, and think", "psychologists", 1350, 220, "b10:twenty", "b11"),
    ST("sit", 1350, 760, "bottom", "b11:sit", [["idle", "b11:sit"], ["headDown", "b18:most"], ["chin", "b19:hard"]],
       [["neutral", "b11:sit"], ["tight", "b18:most"], ["frown", "b19:concentrate"]], out="b23", scale=0.85, sit=True),
    I("rc", "clock", 1600, 330, 110, "pop", "b11:minutes", "b23", sway=4, period=1.0),
    T("rct", "6–15 min", 1600, 440, 40, "bottom", "b11:fifteen", "b15:thoughts", weight=800, color="muted"),
    TOP("t6", "alone in a plain *room*", "b11:alone", "b12"),
    I("x1", "phone", 1080, 420, 90, "pop", "b12:phone", "b16"),
    K("x1k", 1080, 420, 120, "b12:phone", "b16"),
    I("x2", "book", 1080, 540, 90, "pop", "b13:book", "b16"),
    K("x2k", 1080, 540, 120, "b13:book", "b16"),
    I("x3", "pen", 1080, 660, 90, "pop", "b14:write", "b16"),
    K("x3k", 1080, 660, 120, "b14:write", "b16"),
    TOP("t7", "no phone, no book, *nothing*", "b12:no", "b15"),
    I("st", "thought", 1450, 470, 150, "pop", "b15:thoughts", "b23"),
    TOP("t8", "just their *thoughts*", "b15:just", "b16"),
    TOP("t9", "stay seated, stay *awake*", "b16:seat", "b17"),
    TOP("t10", "relaxing… *right*?", "b17:relaxing", "b18"),
    TOP("t11", "not very *enjoyable*", "b18:enjoyable", "b19"),
    TOP("t12", "minds kept *wandering*", "b19:wandering", "b20"),
    I("pp", "people", 1700, 760, 180, "pop", "b21:ages", "b23"),
    TOP("t13", "students… then *all ages*", "b20:college", "b22"),
    TOP("t14", "much the *same*", "b22:same", "b23"),
    I("hs", "house", 1350, 560, 260, "pop", "b23:home", "b26"),
    TOP("t15", "at home, nobody *watching*", "b23:home", "b24"),
    T("ch", "1 in 3 cheated", 1350, 790, 52, "slam", "b24:third", "b26", color="accent", weight=800),
    I("hp", "phone", 1600, 520, 100, "pop", "b25:phones", "b26"),
    I("hm", "wave", 1100, 520, 100, "pop", "b25:music", "b26"),
    TOP("t16", "they checked their *phones*", "b25:checked", "b26"),
    TOP("t17", "could *you* just sit?", "b26:have", None),
]})

# 2 · the plain room: the button ----------------------------------------------------------------------------
scenes.append({"id": "shock", "beats": R(27, 42), "elements": [
    BG("bg", "bgLab", "b27:here's", "b43"),
    HOST("h", "b27:here's", "b43",
         [["lean", "b27:strange"], ["present", "b28:another"], ["embarrassed", "b29:unpleasant"], ["explain", "b30:almost"],
          ["presentL", "b31:then"], ["point", "b32:pressing"], ["shrug", "b33:nobody"], ["chin", "b34:sit"], ["count", "b35:two"],
          ["count", "b36:women"], ["chin", "b37:researchers"], ["tiltL", "b38:one"], ["holdHead", "b39:roughly"], ["shrug", "b40:these"],
          ["chin", "b41:why"], ["explain", "b42:maybe"]],
         [["smile", "b27:here's"], ["tight", "b29:unpleasant"], ["neutral", "b30:almost"], ["smile", "b33:nobody"], ["o", "b38:ninety"],
          ["grin", "b39:roughly"], ["neutral", "b41:why"], ["smile", "b42:maybe"]]),
    TOP("t0", "here's where it gets *strange*", "b27:here's", "b28"),
    CARD("c1", "2014 · WILSON ET AL.", "A mild shock, then 15 minutes alone", "the same study", 1350, 220, "b28:another", "b29"),
    ST("p", 1250, 760, "bottom", "b28:gave", [["idle", "b28:gave"], ["holdHead", "b29:zap"], ["give", "b30:pay"], ["idle", "b31:left"],
                                             ["chin", "b33:nobody"], ["point", "b35:pressed"], ["idle", "b36:women"], ["point", "b38:shocked"]],
       [["neutral", "b28:gave"], ["o", "b29:zap"], ["frown", "b30:pay"], ["neutral", "b31:left"], ["tight", "b35:pressed"], ["o", "b38:shocked"]],
       out="b41", scale=0.85, sit=True),
    I("z1", "bolt", 1360, 470, 100, "pop", "b29:zap", "b30", color="accent"),
    TOP("t1", "like a strong static *zap*", "b29:static", "b30"),
    BUB("pay", "I'd pay to avoid that.", 1100, 340, 170, "b30:pay", "b31", fontSize=28),
    I("bt", "button", 1500, 690, 130, "pop", "b31:button", "b41"),
    I("ck", "clock", 1650, 340, 110, "pop", "b31:fifteen", "b41", sway=4, period=1.0),
    TOP("t2", "15 minutes, alone, with a *button*", "b31:left", "b32"),
    TOP("t3", "press it: the same *shock*", "b32:pressing", "b33"),
    TOP("t4", "nobody *had* to press it", "b33:nobody", "b35"),
    T("m1", "men: 2 in 3", 1500, 470, 56, "slam", "b35:two", "b37", color="accent", weight=800),
    T("w1", "women: 1 in 4", 1500, 550, 56, "slam", "b36:women", "b37", weight=800),
    TOP("t5", "pressed it at least *once*", "b35:pressed", "b36"),
    TOP("t6", "drawn to new *sensations*?", "b37:sensations", "b38"),
    T("n190", "190", 1500, 470, 150, "slam", "b38:ninety", "b41", color="accent", weight=800),
    I("z2", "bolt", 1360, 470, 100, "pop", "b38:shocked", "b41", color="accent", pulse=1.06, beat=0.3),
    TOP("t7", "one man: *190* times", "b38:one", "b39"),
    T("e5", "≈ one every 5 seconds", 1500, 580, 40, "bottom", "b39:roughly", "b41", weight=800),
    TOP("t8", "they'd said they'd *pay* to avoid it", "b40:these", "b41"),
    *CLOUD("q", "b41:why", "b42", "question", size=60),
    TOP("t9", "pain over your own *thoughts*?", "b41:pain", "b42"),
    I("zz", "bolt", 1250, 540, 160, "pop", "b42:zap", None, color="accent"),
    T("gt", ">", 1400, 540, 90, "pop", "b42:better", None, weight=800),
    I("nn", "thought", 1560, 540, 160, "pop", "b42:nothing", None),
    TOP("t10", "a zap beats *nothing*?", "b42:maybe", None),
]})

# 3 · the study: boredom is a signal ---------------------------------------------------------------------------
scenes.append({"id": "signal", "beats": R(43, 61), "elements": [
    BG("bg", "bgStudy", "b43:to", "b62"),
    HOST("h", "b43:to", "b62",
         [["explain", "b43:understand"], ["present", "b44:in"], ["happy", "b45:yes"], ["count", "b46:two"], ["count", "b47:first"],
          ["shrug", "b48:easy"], ["count", "b49:second"], ["explain", "b50:think"], ["presentL", "b51:hunger"], ["present", "b52:boredom"],
          ["explainR", "b53:saying"], ["happy", "b54:let's"], ["explain", "b55:and"], ["chin", "b56:problem"], ["present", "b57:today"],
          ["shrug", "b58:don't"], ["embarrassed", "b59:unlock"], ["explainR", "b60:signal"], ["lean", "b61:how"]],
         [["smile", "b43:to"], ["grin", "b45:yes"], ["smile", "b46:two"], ["neutral", "b48:easy"], ["smile", "b50:think"], ["grin", "b54:let's"],
          ["neutral", "b56:problem"], ["grin", "b59:unlock"], ["neutral", "b60:signal"], ["smile", "b61:how"]]),
    TOP("t0", "what *is* boredom?", "b43:understand", "b44"),
    CARD("c1", "2018 · WESTGATE & WILSON", "Two roots of boredom", "psychologists", 1350, 220, "b44:twenty", "b45"),
    TOP("t1", "yes, the *same* Timothy Wilson", "b45:yes", "b46"),
    TOP("t2", "two main *reasons*", "b46:two", "b47"),
    I("a1", "knob", 1150, 560, 200, "pop", "b47:attention", "b50"),
    TAG("a1t", "attention", 1150, 760, "b47:attention", "b50"),
    TAG("a1e", "too easy", 1000, 420, "b48:easy", "b50", color="accent"),
    TAG("a1h", "too hard", 1300, 420, "b48:hard", "b50", color="accent"),
    TOP("t3", "1: your attention can't get a *grip*", "b47:first", "b49", size=58),
    I("a2", "heart", 1600, 560, 180, "pop", "b49:meaningful", "b50", color="accent"),
    TAG("a2t", "meaningful?", 1600, 760, "b49:meaningful", "b50"),
    TOP("t4", "2: it doesn't feel *meaningful*", "b49:second", "b50"),
    TOP("t5", "think of it like *hunger*", "b50:hunger", "b51"),
    I("hg", "plate", 1150, 560, 200, "pop", "b51:hunger", "b56"),
    T("hgt", "hunger → food", 1150, 760, 46, "bottom", "b51:food", "b56", weight=800),
    I("bd", "thought", 1600, 560, 200, "pop", "b52:boredom", "b56"),
    T("bdt", "boredom → change", 1600, 760, 46, "bottom", "b52:change", "b56", weight=800, color="accent"),
    BUB("try", "Let's try something else.", 1600, 340, 200, "b53:saying", "b55", fontSize=28),
    TOP("t6", "meant to feel a little *uncomfortable*", "b55:uncomfortable", "b56", size=58),
    TOP("t7", "here's the *problem*", "b56:problem", "b57"),
    I("p2", "phone", 1350, 560, 220, "pop", "b57:disappear", "b61"),
    T("p2s", "2 seconds", 1350, 790, 50, "slam", "b57:two", "b59", color="accent", weight=800),
    TOP("t8", "gone in about two *seconds*", "b57:disappear", "b58"),
    TOP("t9", "you just *unlock* your phone", "b59:unlock", "b60"),
    I("lp", "loop", 1650, 560, 180, "pop", "b60:over", "b62", color="accent"),
    TOP("t10", "signal on… switch it *off*", "b60:signal", "b61"),
    TOP("t11", "without even *deciding* to?", "b61:how", None),
]})

# 4 · the bedroom: the phantom buzz and the phone on the desk ---------------------------------------------------
scenes.append({"id": "phone", "beats": R(62, 78), "elements": [
    BG("bg", "bgBedroom", "b62:your", "b79"),
    HOST("h", "b62:your", "b79",
         [["explain", "b62:noticed"], ["present", "b63:in"], ["chin", "b64:have"], ["proud", "b65:eighty-nine"], ["shrug", "b66:most"],
          ["explain", "b68:brain"], ["embarrassed", "b69:patted"], ["present", "b70:in"], ["explain", "b71:tests"], ["count", "b72:some"],
          ["count", "b73:others"], ["happy", "b74:did"], ["explainR", "b75:quiet"], ["handsHips", "b76:fair"], ["explain", "b77:careful"],
          ["present", "b78:having"]],
         [["smile", "b62:your"], ["neutral", "b64:have"], ["grin", "b65:eighty-nine"], ["smile", "b66:most"], ["grin", "b69:patted"],
          ["smile", "b70:in"], ["neutral", "b76:fair"], ["smile", "b77:careful"]]),
    TOP("t0", "your brain has *noticed*", "b62:noticed", "b63"),
    CARD("c1", "2012 · DROUIN ET AL.", "Phantom vibrations", "psychologists", 1350, 220, "b63:twenty", "b64"),
    ST("pb", 1350, GY, "bottom", "b64:have", [["search", "b64:vibrate"], ["shrug", "b64:hadn't"], ["happy", "b66:most"]],
       [["o", "b64:vibrate"], ["neutral", "b64:hadn't"], ["smile", "b66:most"]], out="b70", flip=True),
    T("bz", "bzz?", 1160, 470, 56, "pop", "b64:vibrate", "b66", color="accent", weight=800),
    TOP("t1", "felt a buzz that *wasn't* there?", "b64:have", "b65"),
    T("p89", "89%", 1650, 480, 130, "slam", "b65:eighty-nine", "b70", color="accent", weight=800),
    TAG("p89t", "said yes", 1650, 590, "b65:yes", "b70"),
    TOP("t2", "most weren't *bothered*", "b66:most", "b68"),
    TOP("t3", "it *invents* a buzz", "b68:invents", "b69"),
    TOP("t4", "now you know *why*", "b69:now", "b70:seventeen"),
    CARD("c2", "2017 · WARD ET AL.", "Brain drain", "memory and focus tests", 1350, 220, "b70:twenty", "b71"),
    I("bn", "brain", 1350, 560, 220, "pop", "b71:memory", "b72"),
    TOP("t5", "tests of memory and *focus*", "b71:tests", "b72"),
    I("d1", "table", 1150, 740, 260, "pop", "b72:some", "b76"),
    I("d1d", "doorway", 1150, 520, 160, "pop", "b72:another", "b76"),
    TAG("d1t", "phone in another room", 1150, 900, "b72:another", "b76", size=34),
    I("d2", "table", 1650, 740, 260, "pop", "b73:others", "b76"),
    I("d2p", "phone", 1650, 640, 90, "pop", "b73:desk", "b76"),
    TAG("d2t", "face down on the desk", 1650, 900, "b73:face", "b76", size=34),
    I("w1", "check", 1150, 380, 120, "pop", "b74:better", "b76", color="accent"),
    TOP("t6", "the other room did *better*", "b74:other", "b75"),
    TOP("t7", "even a quiet phone *pulls* at you", "b75:quiet", "b76"),
    CARD("c3", "TO BE FAIR", "Later studies vary", "not always this strong", 1350, 220, "b76:fair", "b77"),
    I("ph", "phone", 1350, 560, 200, "pop", "b78:phone", None),
    TOP("t8", "the careful *version*", "b77:careful", "b78"),
    TOP("t9", "close by = harder to *focus*", "b78:close", None),
]})

# 5 · the office: checking in batches, and "But it wasn't over yet." ---------------------------------------------
scenes.append({"id": "batch", "beats": R(79, 92), "elements": [
    BG("bg", "bgDesk", "b79:so", "b93"),
    HOST("h", "b79:so", "b93",
         [["chin", "b79:check"], ["present", "b80:in"], ["count", "b81:one"], ["count", "b82:three"], ["shrug", "b83:swapped"],
          ["proud", "b84:less"], ["explain", "b85:still"], ["happy", "b86:batches"], ["explainR", "b87:nobody"], ["explain", "b88:stopped"],
          ["lean", "b89:irony"], ["embarrassed", "b90:anxious"], ["shrug", "b91:opposite"], ["idle", "b92:but"]],
         [["neutral", "b79:so"], ["smile", "b80:in"], ["grin", "b84:less"], ["smile", "b85:still"], ["neutral", "b89:irony"], ["tight", "b90:anxious"],
          ["smile", "b91:opposite"], ["neutral", "b92:but"]]),
    TOP("t0", "what if you check *less*?", "b79:check", "b80"),
    CARD("c1", "2015 · KUSHLEV & DUNN", "Email, three times a day", "psychologists", 1350, 220, "b80:twenty", "b81"),
    I("e1", "letter", 1150, 560, 180, "pop", "b81:email", "b84"),
    TAG("e1t", "as often as you like", 1150, 760, "b81:often", "b84"),
    *[I(f"e1m{i}", "letter", 1050 + i * 50, 420 - (i % 2) * 30, 50, "pop", "b81:liked", "b84") for i in range(5)],
    I("e2", "letter", 1600, 560, 180, "pop", "b82:three", "b84"),
    TAG("e2t", "three times a day", 1600, 760, "b82:three", "b84", color="accent"),
    *[I(f"e2c{i}", "clock", 1500 + i * 100, 420, 60, "pop", "b82:three", "b84") for i in range(3)],
    TOP("t1", "then they *swapped*", "b83:swapped", "b84"),
    BAR("s1", 1150, 340, "check anytime", "muted", "b84:week", "b87"),
    BAR("s2", 1600, 200, "three times a day", "accent", "b84:fewer", "b87"),
    TOP("t2", "fewer checks, less *stress*", "b84:fewer", "b85"),
    TOP("t3", "same emails, in *batches*", "b85:still", "b87"),
    TOP("t4", "no more *interruptions*", "b87:nobody", "b89"),
    I("ib", "letter", 1350, 560, 200, "pop", "b87:nobody", "b89"),
    I("ibc", "check", 1480, 460, 100, "pop", "b88:stopped", "b89", color="accent"),
    TOP("t5", "here's the *irony*", "b89:here's", "b90:phones"),
    I("an", "phone", 1350, 560, 200, "pop", "b90:check", "b92"),
    I("anc", "cloud", 1350, 380, 160, "pop", "b91:opposite", "b92", color="muted"),
    TOP("t6", "we check to feel *less* anxious", "b90:phones", "b91"),
    TOP("t7", "…and it does the *opposite*", "b91:checking", "b92"),
    HERO("hero", "But it wasn't over yet.", "b92:but", None, size=90, y=300),
]})

# 6 · outdoors: the good side of boredom ---------------------------------------------------------------------------
scenes.append({"id": "good", "beats": R(93, 113), "elements": [
    BG("bg", "bgOutdoor", "b93:because", "b114"),
    HOST("h", "b93:because", "b114",
         [["explain", "b93:good"], ["present", "b94:in"], ["shrug", "b95:copied"], ["count", "b96:uses"], ["proud", "b97:bored"],
          ["chin", "b98:wander"], ["happy", "b99:new"], ["chin", "b100:think"], ["count", "b101:shower"], ["explain", "b102:those"],
          ["happy", "b103:calmer"], ["present", "b104:in"], ["count", "b105:no"], ["happy", "b106:afterwards"], ["explainR", "b107:strong"],
          ["lean", "b108:favourite"], ["present", "b109:in"], ["chin", "b110:guessed"], ["explain", "b111:did"], ["proud", "b112:enjoyed"],
          ["happy", "b113:hardest"]],
         [["smile", "b93:because"], ["neutral", "b95:copied"], ["grin", "b97:bored"], ["smile", "b98:wander"], ["grin", "b101:shower"],
          ["smile", "b102:those"], ["smile", "b103:calmer"], ["grin", "b108:favourite"], ["neutral", "b110:guessed"], ["grin", "b112:enjoyed"],
          ["smile", "b113:hardest"]]),
    TOP("t0", "boredom might be *good* for you", "b93:because", "b94"),
    CARD("c1", "2014 · MANN & CADMAN", "A very dull task, then a creative one", "psychologists", 1350, 220, "b94:twenty", "b95"),
    I("pb", "book", 1350, 560, 220, "pop", "b95:phone", "b96"),
    T("pbt", "copy the phone numbers…", 1350, 760, 44, "bottom", "b95:copied", "b96", color="muted", weight=M),
    TOP("t1", "15 minutes of copying *phone numbers*", "b95:fifteen", "b96", size=58),
    I("cu1", "pcup", 1250, 600, 150, "pop", "b96:plastic", "b98"),
    I("cu2", "pcup", 1420, 600, 150, "pop", "b96:cups", "b98"),
    TOP("t2", "uses for two plastic *cups*?", "b96:think", "b97"),
    *[I(f"id{i}", "bulb", 1150 + i * 140, 400 - (i % 2) * 40, 80, "pop", f"b97:{w}", "b98") for i, w in enumerate(["bored", "group", "more", "ideas"])],
    TOP("t3", "bored first → *more* ideas", "b97:bored", "b98"),
    I("wd", "thought", 1350, 520, 260, "pop", "b98:wander", "b100"),
    I("wdb", "bulb", 1360, 505, 110, "pop", "b99:new", "b100"),
    TOP("t4", "a wandering mind finds *ideas*", "b98:wander", "b100"),
    TOP("t5", "where do your best ideas *arrive*?", "b100:think", "b101"),
    I("i1", "shower", 1100, 580, 190, "pop", "b101:shower", "b103"),
    I("i2", "signpost", 1380, 580, 190, "pop", "b101:walk", "b103"),
    I("i3", "bed", 1660, 600, 200, "pop", "b101:asleep", "b103"),
    *[I(f"ib{i}", "bulb", x, 400, 70, "pop", w, "b103") for i, (x, w) in enumerate([(1100, "b101:shower"), (1380, "b101:walk"), (1660, "b101:asleep")])],
    TOP("t6", "when nothing asks for your *attention*", "b102:those", "b103", size=58),
    TOP("t7", "a *calmer* benefit, too", "b103:calmer", "b104"),
    CARD("c2", "2018 · NGUYEN, RYAN & DECI", "Fifteen minutes alone", "psychologists", 1350, 220, "b104:twenty", "b105"),
    ST("cm", 1450, 760, "bottom", "b105:no", [["idle", "b105:no"], ["happy", "b106:calmer"]], [["neutral", "b105:no"], ["smile", "b106:calmer"]],
       out="b108", scale=0.85, sit=True, flip=True),
    I("cmb", "bench", 1450, 800, 300, "pop", "b105:no", "b108"),
    TOP("t8", "no phone, no music, no *one*", "b105:no", "b106"),
    I("cw", "calm", 1450, 400, 140, "pop", "b106:calmer", "b108"),
    TOP("t9", "calmer and more *relaxed*", "b106:calmer", "b107"),
    TOP("t10", "strong feelings *settled*", "b107:strong", "b108"),
    TOP("t11", "my *favourite* part", "b108:favourite", "b109"),
    CARD("c3", "2022 · HATANO, MURAYAMA ET AL.", "20 minutes of just thinking", "psychologists", 1350, 220, "b109:twenty", "b110"),
    BAR("g1", 1200, 170, "what they guessed", "muted", "b110:guessed", None),
    TOP("t12", "how much would you *enjoy* it?", "b110:guessed", "b111"),
    BAR("g2", 1550, 330, "how it felt", "accent", "b112:enjoyed", None),
    TOP("t13", "then they actually *did* it", "b111:then", "b112"),
    TOP("t14", "more than they *expected*", "b112:enjoyed", "b113"),
    TOP("t15", "the hardest part: *starting*", "b113:hardest", None),
]})

# 7 · the living room: five rules ---------------------------------------------------------------------------------
scenes.append({"id": "rules", "beats": R(114, 138), "elements": [
    BG("bg", "bgLiving", "b114:so", "b139"),
    HOST("h", "b114:so", "b139",
         [["explain", "b114:how"], ["count", "b115:five"], ["count", "b116:rule"], ["happy", "b117:kettle"], ["explainR", "b118:next"],
          ["chin", "b119:notice"], ["happy", "b120:only"], ["count", "b121:rule"], ["present", "b122:focus"], ["shrug", "b123:not"],
          ["point", "b124:another"], ["count", "b125:rule"], ["explain", "b127:pick"], ["count", "b128:rule"], ["explainR", "b129:stuck"],
          ["presentL", "b130:walk"], ["present", "b131:dishes"], ["explain", "b132:fold"], ["happy", "b133:give"], ["proud", "b134:plenty"],
          ["count", "b135:rule"], ["chin", "b136:bored"], ["count", "b137:easy"], ["explain", "b138:change"]],
         [["smile", "b114:so"], ["grin", "b117:kettle"], ["smile", "b118:next"], ["neutral", "b123:not"], ["smile", "b124:another"],
          ["smile", "b127:pick"], ["grin", "b134:plenty"], ["neutral", "b136:bored"], ["smile", "b138:change"]]),
    TOP("t00", "how can you *use* this?", "b114:how", "b115"),
    TOP("t0", "five simple *rules*", "b115:five", "b116"),
    TOP("r1", "rule 1: let the *kettle* boil", "b116:rule", "b121"),
    I("kt", "kettle", 1300, 600, 220, "pop", "b117:kettle", "b121"),
    I("kp", "phone", 1600, 560, 110, "pop", "b118:pocket", "b121"),
    K("kpk", 1600, 560, 150, "b118:pocket", "b121"),
    I("kc", "thought", 1350, 380, 150, "pop", "b119:mind", "b121"),
    TAG("ktt", "just two minutes", 1350, 820, "b120:two", "b121"),
    TOP("r2", "rule 2: phone in *another room*", "b121:rule", "b125"),
    I("dw", "doorway", 1500, 600, 280, "pop", "b122:another", "b125"),
    I("dwp", "phone", 1560, 560, 90, "pop", "b122:phone", "b125"),
    I("tb", "table", 1150, 740, 240, "pop", "b123:desk", "b125"),
    T("tbx", "not here", 1150, 560, 44, "pop", "b123:not", "b125", color="accent", weight=800),
    TOP("r3", "rule 3: check in *batches*", "b125:rule", "b128"),
    I("bl", "letter", 1370, 560, 180, "pop", "b126:batches", "b127"),
    *[I(f"bc{i}", "clock", 1150 + i * 220, 560, 140, "pop", "b127:set", "b128") for i in range(3)],
    TAG("bct", "a few set times", 1370, 760, "b127:set", "b128"),
    TOP("r4", "rule 4: do something *boring*", "b128:rule", "b135"),
    I("stk", "question", 1400, 540, 180, "pop", "b129:stuck", "b130"),
    I("wk", "signpost", 1150, 580, 180, "pop", "b130:walk", "b134"),
    I("dsh", "sink", 1400, 600, 200, "pop", "b131:dishes", "b135"),
    I("ld", "shirt", 1650, 580, 170, "pop", "b132:laundry", "b134"),
    I("dbl", "bulb", 1400, 400, 110, "pop", "b134:ideas", "b135", pulse=1.08, beat=0.9),
    TOP("r5", "rule 5: ask what it's *telling* you", "b135:rule", "b139", size=58),
    I("q0", "thought", 1400, 520, 260, "pop", "b136:bored", "b137"),
    TAG("q1", "too easy?", 1100, 560, "b137:easy", "b139", size=44),
    TAG("q2", "too hard?", 1400, 560, "b137:hard", "b139", size=44),
    TAG("q3", "does it matter?", 1700, 560, "b137:matter", "b139", size=44, color="accent"),
    T("chg", "change that", 1400, 720, 56, "pop", "b138:change", "b139", weight=800),
]})

# 8 · the kitchen again: the twist and the ending ---------------------------------------------------------------------
scenes.append({"id": "end", "tail": 2.6, "beats": R(139, 158), "elements": [
    BG("bg", "bgKitchen", "b139:so", None),
    HOST("h", "b139:so", None,
         [["explain", "b139:twist"], ["shrug", "b140:weren't"], ["explain", "b141:most"], ["proud", "b142:skill"], ["chin", "b143:restless"],
          ["happy", "b144:settle"], ["explainR", "b145:scrolling"], ["present", "b146:room"], ["presentL", "b147:kettle"], ["happy", "b148:stay"],
          ["happy", "b149:like"], ["explain", "b150:challenge"], ["count", "b151:ten"], ["explainR", "b152:sit"], ["chin", "b153:notice"],
          ["lean", "b154:love"], ["chin", "b155:what's"], ["happy", "b156:let"], ["wave", "b157:which"]],
         [["smile", "b139:so"], ["neutral", "b140:weren't"], ["smile", "b141:most"], ["neutral", "b143:restless"], ["smile", "b144:settle"],
          ["smile", "b147:kettle"], ["grin", "b149:like"], ["smile", "b150:challenge"], ["smile", "b154:love"], ["grin", "b157:which"]],
         move=[[700, GY, "b147:kettle", 1.2]]),
    TOP("t0", "so here's the *twist*", "b139:twist", "b140"),
    I("bt", "button", 1350, 600, 200, "pop", "b140:button", "b141"),
    T("btt", "strange? broken?", 1350, 400, 56, "pop", "b140:strange", "b141", weight=800),
    K("btk", 1350, 400, 480, "b140:broken", "b141"),
    TOP("t1", "we were never *taught*", "b141:never", "b142"),
    TOP("t2", "it gets easier with *practice*", "b142:practice", "b143"),
    I("rs", "scribble", 1350, 560, 200, "pop", "b143:restless", "b144"),
    I("cl", "calm", 1350, 560, 200, "pop", "b144:settle", "b145"),
    TOP("t3", "restless… then it *settles*", "b143:first", "b145"),
    I("br", "brain", 1350, 560, 220, "pop", "b145:brain", "b147"),
    I("bb", "bulb", 1480, 420, 100, "pop", "b146:room", "b147"),
    TOP("t4", "room for your brain to *work*", "b146:finally", "b147"),
    I("kt", "kettle", 1000, 610, 190, "pop", "b147:kettle", "b150"),
    TOP("t5", "let it *boil*", "b147:boil", "b149"),
    I("kc", "thought", 1250, 400, 160, "pop", "b148:thoughts", "b150"),
    TOP("t6", "you might like where they *go*", "b149:like", "b150"),
    TOP("t7", "your *challenge* this week", "b150:challenge", "b151"),
    T("ch1", "10 minutes", 1350, 500, 96, "pop", "b151:ten", "b154", weight=800),
    TAG("ch2", "no phone · no music · no screen", 1350, 640, "b151:phone", "b154", size=40, color="accent"),
    TOP("t8", "sit or walk… let it *wander*", "b152:just", "b153"),
    TOP("t9", "notice how you *feel*", "b153:notice", "b154"),
    I("eq", "phone", 1350, 520, 200, "pop", "b155:reach", "b157"),
    T("eq2", "?", 1480, 400, 110, "pop", "b155:bored", "b157", color="accent", weight=800),
    TOP("t10", "what do *you* reach for?", "b155:what's", "b157"),
    I("end", "heart", 1350, 540, 200, "pop", "b157:habit", None, color="accent", pulse=1.08, beat=1.2),
    TOP("t11", "which habit *next*?", "b157:habit", hero=True, size=80),
    T("t12", "@darealwhy", 1350, 820, 44, "bottom", "b158:comments", weight=M, color="muted"),
]})

(ROOT / "script").mkdir(exist_ok=True)
(ROOT / "script/script.json").write_text(json.dumps({"title": "The Psychology of People Who Can't Stand Being Bored", "scenes": scenes}, indent=1, ensure_ascii=False))
print(sum(len(s["elements"]) for s in scenes), "elements,", len(S), "sentences")
