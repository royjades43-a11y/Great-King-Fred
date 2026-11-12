"""Writes script/script.json for video 10 from timing/words.json (one beat per spoken sentence)
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

def BED(p, at, out, poses=None, mouths=None, x=960):
    """the late-night bed: bed, a sitting stick, a glowing phone, a moon in the window"""
    return [I(p + "bed", "bed", x, 720, 560, "pop", at, out),
            ST(p + "me", x - 20, 630, "bottom", at, poses or [["give", at]], mouths or [["neutral", at]], out=out, scale=0.62, sit=True),
            I(p + "ph", "phone", x + 150, 545, 100, "pop", at, out),
            I(p + "gl", "glow", x + 150, 545, 150, "pop", at, out, pulse=1.08, beat=1.6),
            I(p + "mn", "moon", x + 520, 330, 120, "pop", at, out)]
FR = [690, 960, 1252]  # the three frames of a 900px film strip centred at 960
# 1 · hook ------------------------------------------------------------------------------
scenes.append({"id": "hook", "beats": R(0, 21), "elements": [
    *BED("a", "b00:late", "b09", [["idle", "b00:late"], ["give", "b01:scrolling"]], [["neutral", "b00:late"], ["o", "b06:three"], ["smile", "b07:type"]]),
    TOP("t0", "it's *late*", "b00:late", "b01"),
    TOP("t1", "scrolling…", "b01:scrolling", "b02", color="muted"),
    I("bell", "bell", 1220, 400, 110, "pop", "b02:there", "b04", color="accent", sway=12, period=0.35),
    TOP("t2", "and there it *is*", "b02:there", "b03"),
    TOP("t3", "their !name!", "b03:name", "b04"),
    TOP("t4", "you open the *chat*", "b04:open", "b05"),
    TOP("t5", "last *online*…", "b05:online", "b06"),
    TOP("t6", "*3 minutes* ago", "b06:three", "b07"),
    BUB("hs", "Hey, stranger.", 1300, 360, 340, "b07:type", "b09", fontSize=48),
    TOP("t7", "you know how this *ended*", "b08:know", "b09"),
    I("f1", "rain", 560, 560, 220, "pop", "b09:fights", "b10"),
    I("f2", "chair", 960, 560, 220, "pop", "b09:silence", "b10"),
    I("f3", "door", 1360, 560, 230, "pop", "b09:night", "b10"),
    BUB("dn", "I'm done.", 1360, 330, 260, "b09:finally", "b10", fontSize=46),
    TOP("t8", "the fights · the *silence*", "b09:fights", "b10"),
    ST("me2", 740, GY, "left", "b10:you", [["idle", "b10:you"], ["happy", "b11:home"]], [["neutral", "b10:you"], ["smile", "b11:home"]], out="b12"),
    I("hs2", "house", 1220, 560, 280, "pop", "b11:home", "b12"),
    I("hg", "glow", 1220, 590, 110, "pop", "b11:home", "b12", pulse=1.15, beat=1.0),
    TOP("t9", "but for *you*, it doesn't feel like going back", "b10:you", "b11", size=58),
    TOP("t10", "it feels like going !home!", "b11:feels", "b12"),
    ST("pa", 560, GY, "left", "b12:that", [["idle", "b12:alone"], ["happy", "b13:making"], ["headDown", "b14:again"]], [["smile", "b12:alone"]], out="b15",
       move=[[820, GY, "b13:making", 1.0], [560, GY, "b14:again", 1.0]]),
    ST("pb", 1360, GY, "right", "b12:that", [["idle", "b12:alone"], ["happy", "b13:making"], ["headDown", "b14:again"]], [["smile", "b12:alone"]], out="b15", flip=True, variant="bow",
       move=[[1100, GY, "b13:making", 1.0], [1360, GY, "b14:again", 1.0]]),
    I("lp", "loop", 960, 380, 150, "pop", "b14:again", "b15"),
    TOP("t11", "you're far from *alone*", "b12:alone", "b13"),
    TOP("t12", "break up · make *up*", "b13:breaking", "b14"),
    TOP("t13", "again… and *again*", "b14:again", "b15"),
    HERO("t14", "sound familiar?", "b15:sound", "b16", size=100),
    I("i1", "brain", 520, 560, 240, "pop", "b16:brains", "b19"),
    I("i2", "loop", 960, 560, 220, "pop", "b17:couples", "b19"),
    I("i3", "phone", 1400, 580, 210, "pop", "b18:checking", "b19"),
    I("i4", "eye", 1400, 400, 120, "pop", "b18:profile", "b19"),
    TOP("t15", "brains · couples · *profiles*", "b16:scanned", "b19"),
    I("mg", "heart", 960, 560, 230, "pop", "b19:ex", "b20", color="accent", pulse=1.12, beat=0.8),
    TOP("t16", "why your ex is so hard to *quit*", "b19:why", "b20"),
    I("q", "question", 960, 560, 260, "pop", "b20:question", "b21"),
    TOP("t17", "the !one question!", "b20:one", "b21"),
    I("br", "broken", 960, 580, 280, "pop", "b21:breakup", None, pulse=1.06, beat=1.2),
    TOP("t18", "what a breakup does to your *brain*", "b21:breakup"),
]})
# 2 · your brain on heartbreak --------------------------------------------------------------
scenes.append({"id": "brain", "beats": R(22, 46), "elements": [
    CARD("c1", "2011 · BRAIN SCANS", "40 people, recently dumped", "Kross et al.", 960, 220, "b22:recruited", "b24"),
    I("ppl", "people", 960, 600, 280, "pop", "b22:forty", "b24"),
    I("sc", "scanner", 760, 600, 380, "pop", "b24:scanner", "b25"),
    I("ph", "broken", 1260, 560, 200, "pop", "b24:photo", "b25"),
    TOP("t1", "a photo of their *ex*", "b24:photo", "b25"),
    ST("arm", 820, GY, "left", "b25:task", [["give", "b25:probe"], ["strain", "b26:painful"]], [["neutral", "b25:task"], ["o", "b26:painful"]], out="b27"),
    I("pr", "probe", 1180, 520, 220, "right", "b25:pressed", "b27"),
    TOP("t2", "a hot *probe*", "b25:probe", "b26"),
    TOP("t3", "painful, but *bearable*", "b26:painful", "b27"),
    I("b1", "brain", 640, 590, 300, "pop", "b27:compared", "b30"),
    I("b2", "brain", 1280, 590, 300, "pop", "b27:two", "b30"),
    T("l1", "ex", 640, 790, 46, "bottom", "b27:compared", "b30", color="muted"),
    T("l2", "heat", 1280, 790, 46, "bottom", "b27:two", "b30", color="muted"),
    I("g1", "glow", 690, 570, 90, "pop", "b28:same", "b30", pulse=1.2, beat=0.8),
    I("g2", "glow", 1330, 570, 90, "pop", "b28:both", "b30", pulse=1.2, beat=0.8),
    TOP("t4", "the *same* areas", "b28:same", "b29"),
    TOP("t5", "the *physical* feeling of pain", "b29:physical", "b30"),
    I("bh", "broken", 960, 570, 280, "pop", "b30:hurts", "b31", pulse=1.1, beat=0.9),
    TOP("t6", "more than a figure of *speech*", "b30:more", "b31"),
    CARD("c2", "2010 · BRAIN SCANS", "15 people, just dumped", "Fisher et al.", 960, 220, "b31:fisher", "b32"),
    I("fp", "broken", 960, 600, 220, "pop", "b31:earlier", "b32"),
    ST("lv", 860, GY, "bottom", "b32:still", [["headDown", "b32:love"]], [["frown", "b32:love"]], out="b34"),
    I("lh", "heart", 1120, 470, 130, "pop", "b32:intensely", "b34", color="accent", pulse=1.15, beat=0.7),
    TOP("t7", "still *intensely* in love", "b32:intensely", "b33"),
    TOP("t8", "the breakup: about *2 months* old", "b33:two", "b34"),
    I("rb", "brain", 960, 620, 340, "pop", "b34:photo", "b37"),
    I("rg", "glow", 1010, 640, 120, "pop", "b34:reward", "b37", pulse=1.25, beat=0.9),
    I("rc", "bolt", 1330, 460, 140, "pop", "b35:craving", "b37", color="accent"),
    TOP("t9", "the *reward* system lights up", "b34:reward", "b35"),
    TOP("t10", "craving · *addiction*", "b35:craving", "b36"),
    TOP("t11", "rejection ≈ a kind of *addiction*", "b36:rejection", "b37"),
    HERO("t12", "the irony", "b37:irony", "b38", size=110, y=TY),
    ST("ex", 1260, GY, "right", "b37:irony", [["idle", "b38:rejected"]], [["neutral", "b38:rejected"]], out="b42", flip=True, variant="bow", move=[[1700, GY, "b38:want", 2.0]]),
    ST("me", 700, GY, "left", "b37:irony", [["idle", "b37:irony"], ["point", "b38:want"], ["holdHead", "b41:pain"]], [["o", "b38:rejected"], ["frown", "b41:pain"]], out="b42"),
    I("mh", "heart", 940, 440, 110, "pop", "b39:more", "b42", color="accent", pulse=1.3, beat=0.55),
    TOP("t13", "rejected…", "b38:rejected", "b39", color="muted"),
    TOP("t14", "…wanted !more!", "b39:more", "b40"),
    TOP("t15", "frustration *attraction*", "b40:frustration", "b41"),
    TOP("t16", "the one thing your brain wants to *stop* it", "b41:person", "b42", size=56),
    *BED("n", "b42:wonder", "b43", [["give", "b42:reach"]], [["o", "b42:reach"]]),
    I("ck", "clock", 1240, 380, 130, "pop", "b42:reach", "b43"),
    TOP("t17", "*one* in the morning", "b42:one", "b43"),
    TOP("t18", "the good *news*", "b43:good", "b44"),
    I("gn", "sun", 960, 570, 240, "pop", "b43:good", "b44"),
    BAR("k1", 640, 330, "", "accent", "b44:longer", "b46", y=900, w=150),
    BAR("k2", 960, 200, "", "accent", "b44:weaker", "b46", y=900, w=150),
    BAR("k3", 1280, 90, "", "muted", "b44:attachment", "b46", y=900, w=150),
    I("cal", "calendar", 1560, 520, 180, "pop", "b44:longer", "b46"),
    TOP("t19", "time *weakens* the pull", "b44:longer", "b45"),
    TOP("t20", "the craving *fades*", "b45:fades", "b46"),
    I("hg", "hourglass", 960, 580, 260, "pop", "b46:schedule"),
    TOP("t21", "…just not on *your* schedule", "b46:schedule"),
]})
# 3 · the highlight reel -------------------------------------------------------------------
scenes.append({"id": "reel", "beats": R(47, 78), "elements": [
    TOP("t0", "the pain is *real*", "b47:pain", "b48"),
    I("bk", "broken", 960, 570, 240, "pop", "b47:pain", "b48"),
    TOP("t1", "so why go *back*?", "b48:why", "b49"),
    I("bq", "question", 960, 570, 240, "pop", "b48:why", "b49"),
    I("th", "thought", 960, 540, 380, "pop", "b49:memory", "b50"),
    TOP("t2", "your *memory*", "b49:memory", "b50"),
    I("gm", "heart", 700, 570, 220, "pop", "b50:than", "b52", color="accent"),
    I("bm", "rain", 1240, 570, 230, "pop", "b50:bad", "b50:good"),
    T("gl", "good", 700, 780, 44, "bottom", "b50:than", "b52", color="muted"),
    T("bl", "bad", 1240, 780, 44, "bottom", "b50:bad", "b50:good", color="muted"),
    TOP("t3", "bad memories fade *faster*", "b50:bad", "b51"),
    TOP("t4", "the fading affect *bias*", "b51:fading", "b52"),
    I("sn", "sun", 960, 570, 240, "pop", "b52:most", "b54"),
    TOP("t5", "most of the time: a *gift*", "b52:most", "b54"),
    TOP("t6", "after a breakup: a *trick*", "b54:breakup", "b55"),
    I("tk", "thought", 960, 540, 360, "pop", "b54:breakup", "b55"),
    I("fm", "film", 970, 560, 900, "draw", "b55:highlight", "b65"),
    TOP("t7", "the *highlight* reel", "b55:highlight", "b56"),
    I("r1", "car", FR[0], 560, 150, "pop", "b56:road", "b60"),
    I("r2", "people", FR[1], 560, 140, "pop", "b57:jokes", "b60"),
    I("r3", "heart", FR[2], 560, 120, "pop", "b58:name", "b60", color="accent"),
    TOP("t8", "the road trip · the jokes · your *name*", "b56:road", "b59", size=56),
    I("rf", "rain", FR[0], 400, 110, "pop", "b59:fight", "b60"),
    I("ss", "scissors", FR[0], 790, 150, "pop", "b59:same", "b60"),
    TOP("t9", "*not* the fight in the car", "b59:fight", "b60"),
    T("zz", "z z z", FR[0], 560, 56, "pop", "b61:snoring", "b65"),
    I("nt", "note", FR[1], 560, 130, "pop", "b62:playlist", "b65"),
    I("lh", "heart", FR[2], 560, 120, "pop", "b63:loved", "b65", color="accent", pulse=1.15),
    TOP("t10", "you miss the *complaints*", "b60:miss", "b61"),
    TOP("t11", "the snoring · the *terrible* playlist", "b61:snoring", "b63", size=56),
    TOP("t12", "why you *loved* them", "b63:loved", "b64"),
    TOP("t13", "…not why you *left*", "b64:left", "b65"),
    I("bn", "couch", 960, 700, 520, "pop", "b65:loneliness", "b70"),
    ST("lo", 840, 705, "bottom", "b65:loneliness", [["headDown", "b65:loneliness"]], [["frown", "b65:loneliness"]], out="b70", scale=0.7, sit=True),
    TOP("t14", "loneliness adds its *voice*", "b65:voice", "b66"),
    CARD("c1", "FEAR OF BEING SINGLE", "Longing for ex-partners", "Spielmann et al.", 960, 220, "b66:spielmann", "b67"),
    TOP("t15", "fear of being single → more *longing*", "b67:fear", "b68", size=58),
    TOP("t16", "more likely to try *again*", "b68:likely", "b69"),
    TOP("t17", "no matter who *ended* it", "b69:matter", "b70"),
    TOP("t18", "one more *pull*", "b70:pull", "b71"),
    I("mg", "loop", 960, 570, 220, "pop", "b70:pull", "b73"),
    CARD("c2", "ON-AGAIN, OFF-AGAIN", "René Dailey", "communication researcher", 960, 220, "b71:dailey", "b72"),
    TOP("t19", "the most common *reasons*", "b72:common", "b73"),
    I("lf", "heart", 760, 570, 200, "pop", "b73:lingering", "b75", color="accent", pulse=1.1),
    I("fa", "house", 1160, 570, 210, "pop", "b74:familiarity", "b75"),
    TOP("t20", "*lingering* feelings", "b73:lingering", "b74"),
    TOP("t21", "*familiarity*", "b74:familiarity", "b75"),
    I("mt", "mountain", 960, 570, 280, "pop", "b75:starting", "b76"),
    TOP("t22", "starting over is *hard*", "b75:starting", "b76"),
    ST("cy", 700, GY, "left", "b76:ex", [["idle", "b76:ex"], ["happy", "b76:coffee"]], [["smile", "b76:coffee"]], out="b77"),
    ST("cx", 1240, GY, "right", "b76:ex", [["give", "b76:knows"]], [["smile", "b76:ex"]], out="b77", flip=True, variant="bow"),
    I("cf", "coffee", 1060, 500, 130, "pop", "b76:knows", "b77", move=[[880, 500, "b76:coffee", 0.9]]),
    TOP("t23", "they know your *coffee order*", "b76:knows", "b77"),
    TOP("t24", "a question worth *asking*", "b77:question", "b78"),
    I("qq", "question", 960, 570, 220, "pop", "b77:question", "b78"),
    I("mh", "heart", 760, 570, 190, "pop", "b78:miss", None, color="accent"),
    I("me", "people", 1160, 570, 200, "pop", "b78:miss"),
    TOP("t25", "miss *them*… or being !known!?", "b78:miss"),
]})
# 4 · the checking -------------------------------------------------------------------------
scenes.append({"id": "checking", "beats": R(79, 92), "elements": [
    ST("me", 760, GY, "left", "b79:maybe", [["idle", "b79:maybe"], ["give", "b81:check"]], [["neutral", "b79:maybe"], ["smile", "b80:honest"], ["o", "b81:check"]], out="b82"),
    I("ph", "phone", 1000, 560, 160, "pop", "b81:check", "b82", sway=6, period=0.5),
    I("ey", "eye", 1220, 420, 130, "pop", "b81:profile", "b82"),
    TOP("t0", "maybe you haven't *texted*", "b79:texted", "b80"),
    TOP("t1", "but be *honest*", "b80:honest", "b81"),
    TOP("t2", "do you check their *profile*?", "b81:check", "b82"),
    CARD("c1", "2012 · 464 PEOPLE", "Exes on Facebook", "Tara Marshall", 960, 220, "b82:marshall", "b83"),
    I("fb", "phone", 960, 580, 220, "pop", "b82:surveyed", "b84"),
    TOP("t3", "more checking → *worse*", "b83:more", "b84"),
    BAR("d1", 600, 300, "distress ↑", "accent", "b84:distress", "b87", y=960, w=170),
    BAR("d2", 960, 300, "longing ↑", "accent", "b85:longing", "b87", y=960, w=170),
    BAR("d3", 1320, 90, "growth ↓", "muted", "b86:growth", "b87", y=960, w=170),
    TOP("t4", "more *distress*", "b84:distress", "b85"),
    TOP("t5", "more *longing*", "b85:longing", "b86"),
    TOP("t6", "less *growth*", "b86:growth", "b87"),
    ST("pa", 700, GY, "left", "b87:person", [["idle", "b87:person"], ["give", "b88:contact"]], [["smile", "b87:person"]], out="b89"),
    ST("pb", 1220, GY, "right", "b87:person", [["idle", "b87:person"]], [["smile", "b87:person"]], out="b89", flip=True, variant="bow"),
    I("ph2", "heart", 960, 440, 120, "pop", "b88:longing", "b89", color="accent", pulse=1.2, beat=0.6),
    TOP("t7", "in person: a *similar* link", "b87:person", "b88"),
    TOP("t8", "more contact, more *longing*", "b88:contact", "b89"),
    I("cq", "question", 960, 570, 220, "pop", "b89:correlations", "b91"),
    TOP("t9", "these were *correlations*", "b89:correlations", "b90"),
    TOP("t10", "strugglers may check *more*", "b90:struggling", "b91"),
    I("wd", "broken", 960, 580, 260, "pop", "b91:wound", "b92", pulse=1.08, beat=1.0),
    I("bd", "bandage", 960, 580, 200, "pop", "b91:heal", "b91:reopen"),
    I("wp", "phone", 1300, 520, 130, "pop", "b91:reopen", "b92", sway=6, period=0.5),
    TOP("t11", "a wound you *reopen*", "b91:wound", "b92"),
    I("fm", "film", 960, 570, 720, "draw", "b92:scroll"),
    I("fh", "heart", 960, 570, 110, "pop", "b92:clip", None, color="accent"),
    TOP("t12", "another clip for the *reel*", "b92:clip"),
]})
# 5 · what happens when people go back ---------------------------------------------------------
crowd = [ST(f"p{i}", 360 + i * 133, 720, "bottom", "b95:four", [["idle", "b95:four"]], [["smile" if i < 4 else "neutral", "b95:four"]], out="b97", scale=0.42,
            **({"variant": "bow"} if i % 2 else {})) for i in range(10)]
loops = [I(f"l{i}", "loop", 360 + i * 133, 470, 80, "pop", "b95:ten", "b97", color="accent") for i in range(4)]
scenes.append({"id": "back", "beats": R(93, 110), "elements": [
    TOP("t0", "what happens when people go *back*?", "b93:happens", "b94", size=58),
    I("lp", "loop", 960, 570, 220, "pop", "b93:happens", "b94"),
    CARD("c1", "2013 · 792 YOUNG ADULTS", "Relationship churning", "Halpern-Meekin et al.", 960, 220, "b94:team", "b95"),
    *crowd, *loops,
    TOP("t1", "more than *4 in 10*", "b95:four", "b96"),
    TOP("t2", "relationship *churning*", "b96:churning", "b97"),
    ST("fa", 760, GY, "left", "b97:friends", [["idle", "b97:friends"], ["happy", "b98:couple"]], [["smile", "b97:friends"]], out="b99"),
    ST("fb", 1160, GY, "right", "b97:friends", [["idle", "b97:friends"], ["happy", "b98:couple"]], [["smile", "b97:friends"]], out="b99", flip=True, variant="bow"),
    I("fl", "loop", 960, 400, 130, "pop", "b98:couple", "b99"),
    TOP("t3", "think of your own *friends*", "b97:friends", "b98"),
    TOP("t4", "you can name a couple like *that*", "b98:name", "b99"),
    I("rg", "rings", 960, 570, 240, "pop", "b99:dating", "b100"),
    TOP("t5", "not just *dating*", "b99:dating", "b100"),
    CARD("c2", "2014 · 1,000+ COUPLES", "Living together & married", "Vennum et al.", 960, 220, "b100:vennum", "b101"),
    I("vh", "house", 760, 600, 220, "pop", "b100:lived", "b101"),
    I("vr", "rings", 1160, 600, 220, "pop", "b100:couples", "b101"),
    BAR("v1", 760, 330, "together · 1 in 3", "accent", "b101:third", "b103", y=960, w=180),
    BAR("v2", 1160, 200, "married · 1 in 5", "muted", "b102:five", "b103", y=960, w=180),
    TOP("t6", "over *a third* living together", "b101:third", "b102"),
    TOP("t7", "about *1 in 5* married", "b102:five", "b103"),
    I("rr", "rings", 960, 570, 280, "pop", "b103:wedding", "b106"),
    TOP("t8", "cycled before the wedding: *less* satisfied", "b103:cycled", "b104", size=54),
    I("ab", "bolt", 1240, 420, 120, "pop", "b104:argued", "b106", color="accent"),
    TOP("t9", "more *arguments*", "b104:argued", "b105"),
    K("kr", 960, 570, 320, "b105:separation", "b106"),
    TOP("t10", "more trial *separations*", "b105:separation", "b106"),
    I("cl", "loop", 960, 570, 260, "pop", "b106:once", "b107", sway=20, period=0.8),
    TOP("t11", "once → more likely *again*", "b106:once", "b107"),
    CARD("c3", "2018 · ON-OFF CYCLING", "More psychological distress", "Monk et al.", 960, 220, "b107:monk", "b108"),
    I("ml", "loop", 760, 600, 200, "pop", "b107:study", "b108"),
    I("mb", "broken", 1160, 600, 200, "pop", "b107:distress", "b108"),
    ST("td", 860, GY, "bottom", "b108:pattern", [["headDown", "b108:pattern"], ["idle", "b109:home"]], [["frown", "b108:pattern"], ["smile", "b109:home"]], out="b110"),
    I("hh", "house", 1220, 560, 220, "pop", "b109:reunion", "b110"),
    TOP("t12", "it can wear you *down*", "b108:wear", "b109"),
    TOP("t13", "even when it feels like *home*", "b109:feels", "b110"),
    HERO("t14", "but it wasn't over yet", "b110:over", size=96),
]})
# 6 · when going back works ---------------------------------------------------------------------
scenes.append({"id": "works", "beats": R(111, 133), "elements": [
    TOP("t0", "not every couple ends up where they *started*", "b111:couple", "b112", size=54),
    I("st", "signpost", 960, 570, 260, "pop", "b111:couple", "b113"),
    TOP("t1", "on average: *lower* satisfaction", "b112:average", "b113"),
    ST("wa", 760, GY, "left", "b113:some", [["happy", "b113:well"]], [["smile", "b113:some"]], out="b114"),
    ST("wb", 1160, GY, "right", "b113:some", [["happy", "b113:well"]], [["smile", "b113:some"]], out="b114", flip=True, variant="bow"),
    I("wh", "heart", 960, 430, 110, "pop", "b113:well", "b114", color="accent", pulse=1.12),
    TOP("t2", "but some do *well*", "b113:some", "b114"),
    TOP("t3", "it comes down to *one* thing", "b114:one", "b115"),
    I("one", "puzzle", 960, 570, 240, "pop", "b114:difference", "b115"),
    HERO("t4", "did anything change?", "b115:changed", "b116", size=100),
    I("u1", "plane", 600, 560, 200, "pop", "b116:distance", "b117"),
    I("u2", "clock", 960, 560, 200, "pop", "b116:timing", "b117"),
    I("u3", "briefcase", 1320, 560, 200, "pop", "b116:job", "b117"),
    TOP("t5", "distance · timing · a *job*", "b116:distance", "b117"),
    ST("ga", 560, GY, "left", "b117:problem", [["idle", "b117:problem"], ["happy", "b117:sense"]], [["smile", "b117:problem"]], out="b118", move=[[820, GY, "b117:gone", 1.2]]),
    ST("gb", 1360, GY, "right", "b117:problem", [["idle", "b117:problem"], ["happy", "b117:sense"]], [["smile", "b117:problem"]], out="b118", flip=True, variant="bow", move=[[1100, GY, "b117:gone", 1.2]]),
    TOP("t6", "problem gone? it can make *sense*", "b117:problem", "b118"),
    TOP("t7", "*sliding* versus deciding", "b118:sliding", "b119"),
    I("sd", "signpost", 960, 570, 260, "pop", "b118:sliding", "b119"),
    ST("sl", 560, 600, "left", "b119:sliding", [["shrug", "b119:sliding"]], [["neutral", "b119:sliding"]], out="b120", move=[[880, GY, "b119:drifting", 2.4]]),
    I("sm", "moon", 1300, 380, 110, "pop", "b119:late", "b120"),
    I("sp", "phone", 1300, 600, 150, "pop", "b119:texted", "b120", sway=6, period=0.5),
    TOP("t8", "late · lonely · they texted *first*", "b119:late", "b120"),
    ST("de", 760, GY, "left", "b120:deciding", [["proud", "b120:deciding"]], [["smile", "b120:deciding"]], out="b123"),
    I("dp", "signpost", 1200, 580, 260, "pop", "b120:choosing", "b123"),
    I("de2", "eye", 760, 360, 100, "pop", "b120:eyes", "b121"),
    TOP("t9", "deciding: eyes *open*", "b120:deciding", "b121"),
    TOP("t10", "so be *honest*", "b121:honest", "b122"),
    TOP("t11", "deciding… or !sliding!?", "b122:deciding", "b123"),
    I("mh", "house", 760, 570, 260, "pop", "b123:steps", "b124"),
    I("mb", "box", 1700, 620, 180, "right", "b123:rush", "b124", move=[[1100, 620, "b123:rush", 0.5]]),
    TOP("t12", "rushing into big *steps*", "b123:rush", "b124"),
    TOP("t13", "the question I *promised*", "b124:promised", "b125"),
    HERO("t14", "what's different this time?", "b125:different", "b126", size=96),
    TOP("t15", "not how you *feel*", "b126:feel", "b127", color="muted"),
    TOP("t16", "what's !different!", "b127:different", "b128"),
    I("q2", "question", 960, 570, 240, "pop", "b126:feel", "b128"),
    I("tc", "thought", 960, 560, 400, "pop", "b128:missed", "b129"),
    I("tf", "film", 970, 530, 230, "pop", "b128:highlight", "b129"),
    TOP("t17", "“I missed them” = the *highlight reel*", "b128:missed", "b129", size=56),
    ST("sa", 760, GY, "left", "b129:name", [["idle", "b129:name"], ["happy", "b129:chance"]], [["smile", "b129:name"]], out="b130"),
    ST("sb", 1160, GY, "right", "b129:name", [["idle", "b129:name"], ["happy", "b129:chance"]], [["smile", "b129:name"]], out="b130", flip=True, variant="bow"),
    I("sk", "check", 960, 420, 120, "pop", "b129:see", "b130", color="accent"),
    TOP("t18", "you can both *see* it: a second chance", "b129:name", "b130", size=56),
    I("c1", "chat", 600, 570, 200, "pop", "b130:conversation", "b133"),
    I("c2", "calendar", 960, 570, 200, "pop", "b131:habits", "b133"),
    I("c3", "hourglass", 1320, 570, 200, "pop", "b132:apart", "b133"),
    TOP("t19", "a *hard* conversation", "b130:hard", "b131"),
    TOP("t20", "new habits, not new *promises*", "b131:habits", "b132"),
    TOP("t21", "time apart, actually *used*", "b132:time", "b133"),
    I("q3", "question", 960, 570, 240, "pop", "b133:know"),
    TOP("t22", "which one are *you* in?", "b133:know"),
]})
# 7 · five rules ----------------------------------------------------------------------------------
scenes.append({"id": "rules", "beats": R(134, 156), "elements": [
    TOP("r1", "rule 1 · ask the *question*", "b134:rule", "b136"),
    I("n1", "notebook", 760, 570, 260, "pop", "b135:write", "b137"),
    I("p1", "phone", 1200, 570, 200, "pop", "b134:question", "b137"),
    I("x1", "cross", 1200, 570, 150, "pop", "b136:send", "b137", color="accent"),
    TOP("r1b", "can't fill one line? don't *send*", "b136:fill", "b137"),
    TOP("r2", "rule 2 · watch the *whole* movie", "b137:rule", "b139"),
    I("fm", "film", 970, 560, 1000, "draw", "b137:rule", "b141"),
    I("f1", "heart", 670, 560, 120, "pop", "b137:whole", "b141", color="accent"),
    I("f2", "car", 970, 560, 140, "pop", "b137:whole", "b141"),
    I("f3", "rain", 1295, 560, 140, "pop", "b138:ended", "b141"),
    TOP("r2b", "the *real* reasons", "b139:real", "b140"),
    TOP("r2c", "read it when the reel *plays*", "b140:read", "b141"),
    TOP("r3", "rule 3 · mute, don't *monitor*", "b141:rule", "b142:block"),
    I("mu", "mute", 760, 570, 240, "pop", "b141:mute", "b146"),
    I("mp", "phone", 1200, 570, 200, "pop", "b141:mute", "b146"),
    TOP("r3b", "no need to *block*", "b142:block", "b143"),
    TOP("r3c", "just stop *checking*", "b143:stop", "b144"),
    I("ms", "sun", 1200, 380, 120, "pop", "b144:morning", "b146"),
    TOP("r3d", "not the first thing you *see*", "b144:first", "b145"),
    TOP("r3e", "every look reopens the *wound*", "b145:look", "b146"),
    TOP("r4", "rule 4 · ride out the *craving*", "b146:rule", "b147"),
    I("bs", "brain", 960, 570, 240, "pop", "b146:rule", "b149"),
    TOP("r4b", "the pull gets *weaker*", "b148:pull", "b149"),
    I("wv", "wave", 400, 570, 340, "left", "b149:waves", "b151", move=[[960, 570, "b149:waves", 1.0]]),
    TOP("r4c", "cravings come in *waves*", "b149:waves", "b150"),
    TOP("r4d", "most waves *pass*", "b150:pass", "b151"),
    I("sw", "stopwatch", 760, 570, 230, "pop", "b151:wait", "b153"),
    TOP("r4e", "wait *20 minutes*", "b151:twenty", "b152"),
    I("cp", "phone", 1010, 560, 100, "pop", "b152:call", "b153"),
    ST("cf", 1200, GY, "right", "b152:call", [["give", "b152:call"]], [["smile", "b152:friend"]], out="b153", flip=True),
    TOP("r4f", "call a *friend*", "b152:call", "b153"),
    TOP("r5", "rule 5 · fill the *space*", "b153:rule", "b154:friends"),
    I("bn", "couch", 960, 700, 520, "pop", "b153:space", "b155"),
    ST("s1", 840, 705, "bottom", "b153:space", [["idle", "b153:space"], ["happy", "b154:friends"]], [["neutral", "b153:space"], ["smile", "b154:friends"]], out="b155", scale=0.7, sit=True),
    ST("s2", 1080, 705, "bottom", "b154:friends", [["happy", "b154:friends"]], [["smile", "b154:friends"]], out="b155", scale=0.7, sit=True, flip=True, variant="bow"),
    I("pn", "note", 1420, 420, 120, "pop", "b154:plans", "b155", bob=8),
    TOP("r5b", "friends · plans · the *quiet* parts", "b154:friends", "b155"),
    CARD("c5", "2003 · GROWTH AFTER BREAKUPS", "Growth was common", "Tashiro & Frazier", 960, 220, "b155:tashiro", "b156"),
    ST("gr", 960, GY, "bottom", "b155:growth", [["happy", "b155:growth"], ["proud", "b156:confident"]], [["smile", "b155:growth"]]),
    TOP("r5c", "more *confident* · more independent", "b156:confident"),
]})
# 8 · the twist and the ending --------------------------------------------------------------------
scenes.append({"id": "end", "tail": 2.6, "beats": R(157, 178), "elements": [
    HERO("t0", "the twist", "b157:twist", "b158", size=110, y=TY),
    ST("me", 960, GY, "bottom", "b158:missing", [["headDown", "b158:missing"], ["happy", "b159:loved"], ["proud", "b162:loyal"], ["idle", "b165:wrong"]],
       [["neutral", "b158:missing"], ["smile", "b159:loved"], ["tight", "b165:stuck"]], out="b166"),
    I("ch", "heart", 960, 625, 70, "pop", "b159:loved", "b166", color="accent", pulse=1.2, beat=0.9),
    TOP("t1", "missing your ex ≠ going *back*", "b158:missing", "b159"),
    TOP("t2", "it means you *loved*", "b159:loved", "b160"),
    TOP("t3", "your brain is doing what brains *do*", "b160:brain", "b161", size=58),
    TOP("t4", "usually aren't *weak*", "b161:usually", "b162"),
    TOP("t5", "!loyal!", "b162:loyal", "b163", size=80),
    I("sh", "shield", 1300, 560, 200, "pop", "b162:loyal", "b165"),
    TOP("t6", "they hold *on*", "b163:hold", "b164"),
    TOP("t7", "loyalty is *good*", "b164:loyalty", "b165"),
    I("lk", "lock", 1300, 560, 200, "pop", "b165:pointed", "b166"),
    TOP("t8", "the wrong person: *stuck*", "b165:wrong", "b166"),
    ST("pa", 760, GY, "left", "b166:person", [["happy", "b166:person"]], [["smile", "b166:person"]], out="b167"),
    ST("pb", 1160, GY, "right", "b166:person", [["happy", "b166:person"]], [["smile", "b166:person"]], out="b167", flip=True, variant="bow"),
    I("pf", "film", 1600, 430, 260, "pop", "b166:highlight", "b167"),
    K("pk", 1600, 430, 280, "b166:reel", "b167"),
    TOP("t9", "a !person!, not a highlight reel", "b166:person", "b167"),
    *BED("z", "b167:next", "b170", [["give", "b167:phone"], ["idle", "b169:nothing"]], [["neutral", "b167:next"], ["smile", "b169:answer"]], x=860),
    I("zb", "bell", 1060, 400, 100, "pop", "b167:lights", "b168", color="accent", sway=12, period=0.35),
    I("zw", "window", 1560, 520, 260, "pop", "b169:nothing", "b170"),
    I("zs", "sun", 1560, 460, 120, "pop", "b169:answer", "b170"),
    TOP("t10", "remember the *whole* movie", "b167:whole", "b168"),
    TOP("t11", "what's *different* this time?", "b168:different", "b169"),
    TOP("t12", "nothing? that's your *answer*", "b169:nothing", "b170"),
    TOP("t13", "your *challenge* this week", "b170:challenge", "b171"),
    I("nb", "notebook", 960, 580, 280, "pop", "b170:challenge", "b174"),
    TOP("t14", "*3* real reasons it ended", "b171:three", "b172"),
    TOP("t15", "keep the *list* somewhere you'll see it", "b172:keep", "b173", size=58),
    TOP("t16", "did it *help*?", "b173:helped", "b174"),
    I("el", "loop", 760, 570, 220, "pop", "b174:back", "b177:habit"),
    I("eq", "question", 1160, 570, 220, "pop", "b175:work", "b177:habit"),
    TOP("t17", "ever gone *back*?", "b174:back", "b175"),
    TOP("t18", "did it *work*?", "b175:work", "b176"),
    TOP("t18b", "tell me in the *comments*", "b176:tell", "b177:habit"),
    I("end", "heart", 960, 560, 200, "pop", "b177:habit", None, color="accent", pulse=1.08, beat=1.2),
    TOP("t19", "which habit *next*?", "b177:habit", hero=True, size=80),
    T("t20", "@darealwhy", 960, 820, 44, "bottom", "b178:comments", weight=M, color="muted"),
]})

(ROOT / "script").mkdir(exist_ok=True)
(ROOT / "script/script.json").write_text(json.dumps({"title": "The Psychology of People Who Keep Going Back to Their Ex", "scenes": scenes}, indent=1, ensure_ascii=False))
print(sum(len(s["elements"]) for s in scenes), "elements,", len(S), "sentences")
