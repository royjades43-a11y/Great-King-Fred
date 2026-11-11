"""Writes script/script.json for video 9 from timing/words.json (one beat per spoken sentence)
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
# 1 · hook ------------------------------------------------------------------------------
scenes.append({"id": "hook", "beats": R(0, 17), "elements": [
    ST("me", 760, GY, "left", "b00:three", [["happy", "b00:three"], ["victory", "b01:different"], ["happy", "b02:pictured"], ["shrug", "b04:friends"], ["happy", "b05:you"]],
       [["smile", "b00:three"]], out="b07"),
    I("h1", "heart", 700, 420, 70, "pop", "b00:know", "b07", color="accent", bob=10, period=2.0),
    I("h2", "heart", 830, 400, 54, "pop", "b01:different", "b07", color="accent", bob=8, period=2.6),
    I("cal", "calendar", 1240, 560, 200, "right", "b00:dates", "b02"),
    TOP("t0", "three dates in", "b00:dates", "b01"),
    TOP("t1", "“this one is *different*”", "b01:different", "b02"),
    I("th", "thought", 1170, 420, 420, "pop", "b02:pictured", "b04"),
    I("sun", "sun", 1100, 400, 110, "pop", "b02:holidays", "b04"),
    I("dog", "dog", 1250, 410, 130, "pop", "b03:dog", "b04"),
    TOP("t2", "you've even named the *dog*", "b03:named", "b04"),
    ST("f1", 1300, GY, "right", "b04:friends", [["point", "b04:slow"]], [["tight", "b04:friends"]], out="b05", flip=True, variant="bow"),
    ST("f2", 1560, GY, "right", "b04:friends", [["armsCrossed", "b04:slow"]], [["tight", "b04:friends"]], out="b05", flip=True),
    TOP("t3", "“slow *down*”", "b04:slow", "b05"),
    TOP("t4", "but for *you*, it doesn't feel fast", "b05:you", "b06"),
    I("hb", "heart", 1180, 540, 200, "pop", "b06:fate", "b07", color="accent", pulse=1.14, beat=0.8),
    TOP("t5", "it feels like !fate!", "b06:fate", "b07"),
    ST("c1", 560, GY, "bottom", "b07:not", [["happy", "b07:not"]], [["smile", "b07:not"]], out="b10"),
    ST("c2", 960, GY, "bottom", "b08:millions", [["victory", "b08:millions"]], [["smile", "b08:millions"]], out="b10", variant="bow"),
    ST("c3", 1360, GY, "bottom", "b09:again", [["holdHead", "b09:again"]], [["o", "b09:again"]], out="b10"),
    TOP("t6", "you're not *alone*", "b07:not", "b09"),
    TOP("t7", "again… and *again*", "b09:again", "b10"),
    HERO("t8", "sound familiar?", "b10:sound", "b11", size=100),
    TOP("t9", "decades of *research*", "b11:decades", "b13"),
    I("i1", "bridge", 520, 560, 360, "pop", "b11:studied", "b13"),
    I("i2", "brain", 960, 560, 240, "pop", "b12:brain", "b13"),
    I("i3", "flask", 1400, 560, 240, "pop", "b12:blood", "b13"),
    I("sp", "bolt", 960, 560, 300, "pop", "b13:found", "b15", color="accent"),
    TOP("t10", "a little *uncomfortable*", "b13:uncomfortable", "b14"),
    TOP("t11", "the spark may not mean what you *think*", "b14:spark", "b15", size=58),
    TOP("t12", "why you fall so *fast*", "b15:why", "b16"),
    I("q", "question", 960, 560, 260, "pop", "b16:question", "b17"),
    TOP("t13", "the !one question!", "b16:one", "b17"),
    I("br", "bridge", 960, 640, 1500, "draw", "b17:wobbly", None, sway=1.2),
    TOP("t14", "a very *wobbly* bridge", "b17:wobbly"),
]})
# 2 · the shaky bridge ---------------------------------------------------------------------
BR = dict(sway=1.0, period=3.0)
scenes.append({"id": "bridge", "beats": R(18, 49), "elements": [
    CARD("c1", "1974 · CANADA", "Dutton & Aron", "an experiment about attraction", 960, 220, "b18:psychologists", "b20"),
    I("br", "bridge", 960, 640, 1500, "draw", "b20:picture", "b30", **BR),
    TOP("t1", "the Capilano Suspension *Bridge*", "b21:capilano", "b23"),
    TOP("t2", "~70 m above the *rapids*", "b23:seventy", "b25"),
    ST("you", 520, 505, "left", "b25:imagine", [["holdHead", "b25:gripping"], ["idle", "b27:questionnaire"]], [["o", "b25:imagine"], ["smile", "b27:questionnaire"]],
       out="b30", scale=0.55, move=[[760, 515, "b25:halfway", 1.6]]),
    TOP("t3", "imagine you're *halfway* across", "b25:imagine", "b26"),
    ST("wo", 1220, 515, "right", "b26:woman", [["idle", "b26:woman"], ["give", "b28:tears"]], [["smile", "b26:woman"]], out="b30", scale=0.55, flip=True, variant="bow",
       move=[[960, 520, "b26:stops", 1.2]]),
    I("sc", "scrap", 900, 420, 90, "pop", "b28:number", "b30"),
    BUB("call", "Call me if you want to talk more.", 1180, 270, 340, "b29:call", "b30", fontSize=40),
    I("br1", "bridge", 520, 430, 560, "pop", "b30:repeated", "b40", **BR),
    I("br2", "bridgeLow", 1400, 440, 520, "pop", "b30:second", "b40"),
    TOP("t4", "a *second* bridge: low and solid", "b30:second", "b32"),
    TOP("t5", "who *called*?", "b32:called", "b35"),
    I("ph", "phone", 960, 560, 160, "pop", "b32:called", "b33", sway=8, period=0.5),
    BAR("bs", 1400, 50, "2 of 16", "muted", "b33:two", "b40", y=960, w=150),
    BAR("bw", 520, 200, "9 of 18", "accent", "b34:nine", "b40", y=960, w=150),
    HERO("t6", "HALF", "b35:half", "b36", size=120, y=TY),
    TOP("t7", "same woman · same questions · same number", "b36:same", "b39", size=52),
    TOP("t8", "the only difference: the *bridge*", "b39:only", "b40"),
    ST("mi", 960, GY, "bottom", "b40:man", [["give", "b40:interviewer"], ["shrug", "b40:difference"]], [["neutral", "b40:man"]], out="b41"),
    TOP("t9", "a male interviewer: *no* difference", "b40:man", "b41"),
    ST("sh", 960, GY, "bottom", "b41:happened", [["holdHead", "b42:pounding"], ["happy", "b45:attraction"]], [["o", "b42:pounding"], ["smile", "b45:attraction"]], out="b48"),
    I("hp", "heart", 1200, 470, 150, "pop", "b42:hearts", "b48", color="accent", pulse=1.2, beat=0.55),
    TOP("t10", "so what *happened*?", "b41:happened", "b42"),
    TOP("t11", "hearts already *pounding*", "b42:pounding", "b43"),
    TOP("t12", "full of *fear*…", "b43:fear", "b45"),
    TOP("t13", "…read as !attraction!", "b45:read", "b46"),
    TOP("t14", "misattribution of *arousal*", "b46:misattribution", "b47"),
    TOP("t15", "the bridge did half the *flirting*", "b47:bridge", "b48"),
    I("fb", "bridge", 600, 560, 380, "pop", "b47:bridge", "b48", sway=1.5, period=2.0),
    ST("nd", 960, GY, "bottom", "b48:probably", [["shrug", "b48:probably"]], [["smile", "b48:probably"]], out="b49:end"),
    TOP("t16", "not dating on a rope bridge?", "b48:dating", "b49"),
    I("q", "question", 1240, 520, 180, "pop", "b49:love", "b49:end"),
    TOP("t17", "so what about your *love life*?", "b49:love"),
]})
# 3 · your brain in love -------------------------------------------------------------------
scenes.append({"id": "brain", "beats": R(50, 73), "elements": [
    I("bolt", "bolt", 960, 560, 260, "pop", "b50:quite", "b52", color="accent"),
    TOP("t0", "the same kind of *storm*", "b51:storm", "b52"),
    CARD("c1", "2005 · BRAIN SCANS", "17 people, intensely in love", "Aron, Fisher et al.", 960, 220, "b52:scanned", "b55"),
    I("br", "brain", 960, 620, 340, "draw", "b52:brains", "b60"),
    I("h1", "heart", 720, 560, 70, "pop", "b53:love", "b55", color="accent", bob=10),
    I("h2", "heart", 1200, 520, 60, "pop", "b53:intensely", "b55", color="accent", bob=8, period=2.8),
    TOP("t1", "a photo of their *partner*", "b55:photo", "b56"),
    I("gl", "glow", 1010, 640, 120, "pop", "b55:lit", "b60", pulse=1.25, beat=1.0),
    TOP("t2", "the reward system: *dopamine*", "b56:reward", "b57"),
    TOP("t3", "*wanting* · craving", "b57:wanting", "b58"),
    TOP("t4", "not calm satisfaction", "b58:calm", "b59", color="muted"),
    HERO("t5", "WANTING", "b59:wanting", "b60", size=110, y=TY),
    TOP("t6", "Italy: a blood *test*", "b60:italy", "b61"),
    I("fa", "flask", 760, 600, 240, "pop", "b60:measured", "b63"),
    I("fb", "flask", 1160, 600, 240, "pop", "b60:blood", "b63"),
    I("fh", "heart", 760, 400, 80, "pop", "b61:love", "b63", color="accent"),
    I("fl", "loop", 1160, 400, 90, "pop", "b61:obsessive", "b63"),
    TOP("t7", "new love ≈ *obsessive* thinking", "b62:serotonin", "b63", size=58),
    ST("me", 960, GY, "bottom", "b63:thinking", [["holdHead", "b63:thinking"], ["happy", "b64:chemistry"]], [["o", "b63:thinking"], ["smile", "b64:chemistry"]], out="b66"),
    TOP("t8", "not *weakness*", "b63:weakness", "b64"),
    TOP("t9", "!chemistry!", "b64:chemistry", "b65", size=80),
    I("mn", "moon", 1300, 420, 120, "pop", "b65:sleep", "b66"),
    I("pl", "plate", 1460, 560, 130, "pop", "b65:meals", "b66"),
    I("ph", "phone", 1300, 700, 120, "pop", "b65:phone", "b66", sway=6, period=0.6),
    TOP("t10", "lose sleep · skip meals · check your phone", "b65:sleep", "b66", size=52),
    I("cal", "calendar", 960, 560, 240, "pop", "b66:year", "b67"),
    TOP("t11", "a year later: back to *normal*", "b66:year", "b67"),
    TOP("t12", "Dorothy Tennov", "b67:tennov", "b68", color="muted"),
    HERO("t13", "LIMERENCE", "b68:limerence", "b69", size=110, y=TY),
    I("hg", "hourglass", 960, 580, 280, "pop", "b67:name", "b72"),
    TOP("t14", "about *18 months to 3 years*", "b69:eighteen", "b70"),
    TOP("t15", "it's *real*", "b70:real", "b71"),
    TOP("t16", "and *temporary*", "b71:temporary", "b72"),
    I("q", "question", 960, 560, 260, "pop", "b72:question", "b73:end"),
    TOP("t17", "why do some of us fall *faster*?", "b73:faster"),
]})
# 4 · the love quiz ---------------------------------------------------------------------------
scenes.append({"id": "quiz", "beats": R(74, 110), "elements": [
    I("np", "news", 960, 560, 300, "pop", "b74:psychologists", "b76"),
    TOP("t0", "1987 · a *love quiz*", "b74:quiz", "b75"),
    TOP("t1", "*620* readers replied", "b75:six", "b76"),
    TOP("t2", "three styles of love", "b76:secure", "b81"),
    BAR("q1", 600, 392, "secure · 56%", "muted", "b76:fifty", "b81", y=960, w=170),
    BAR("q2", 960, 175, "avoidant · 25%", "muted", "b78:twenty", "b81", y=960, w=170),
    BAR("q3", 1320, 133, "anxious · 19%", "accent", "b80:nineteen", "b81", y=960, w=170),
    ST("ax", 960, GY, "bottom", "b81:those", [["holdHead", "b81:those"], ["happy", "b87:gentle"]], [["o", "b81:those"], ["smile", "b87:gentle"]], out="b88"),
    TOP("t3", "love, the anxious way", "b81:those", "b82"),
    I("a1", "loop", 620, 420, 130, "pop", "b82:obsession", "b87"),
    TOP("t4", "*obsession*", "b82:obsession", "b83"),
    I("a2", "heartbeat", 1300, 420, 150, "pop", "b83:highs", "b87"),
    TOP("t5", "highs and *lows*", "b83:highs", "b84"),
    I("a3", "heart", 600, 680, 120, "pop", "b84:extreme", "b87", color="accent", pulse=1.15),
    TOP("t6", "extreme *attraction*", "b84:extreme", "b85"),
    I("a4", "phone", 1320, 680, 120, "pop", "b85:wish", "b87"),
    TOP("t7", "a need for it to be *returned*", "b85:wish", "b86"),
    I("a5", "bolt", 960, 360, 110, "pop", "b86:jealousy", "b87", color="accent"),
    TOP("t8", "*jealousy*", "b86:jealousy", "b87"),
    I("gh", "heart", 1050, 610, 80, "pop", "b87:gentle", "b88", color="accent"),
    TOP("t9", "be *gentle* with yourself", "b87:recognise", "b88"),
    TOP("t9b", "love doesn't arrive *slowly*", "b88:love", "b89"),
    I("wv", "wave", 400, 560, 380, "left", "b88:love", "b90", move=[[960, 560, "b89:hits", 0.9]]),
    TOP("t10", "it hits like a !wave!", "b89:hits", "b90"),
    CARD("c1", "PSYCHIATRIST & PSYCHOLOGIST", "Amir Levine & Rachel Heller", "authors of “Attached”", 960, 220, "b90:levine", "b91"),
    I("al", "alarm", 760, 580, 240, "pop", "b91:alarm", "b94", sway=10, period=0.35),
    I("ah", "heart", 1160, 580, 200, "pop", "b91:chemistry", "b94", color="accent", pulse=1.18, beat=0.5),
    TOP("t11", "an *alarm*, not chemistry", "b91:alarm", "b92"),
    I("hot", "sun", 560, 400, 110, "pop", "b92:hot", "b94"),
    I("cold", "snow", 1360, 400, 110, "pop", "b92:cold", "b94"),
    TOP("t12", "hot and *cold*", "b92:hot", "b93"),
    TOP("t13", "racing feels like *passion*", "b93:racing", "b94"),
    I("br", "bridge", 960, 640, 1100, "pop", "b94:remember", "b96", sway=1.2, period=2.6),
    ST("bp", 960, 545, "bottom", "b95:person", [["armsCrossed", "b95:person"]], [["tight", "b95:person"]], out="b96", scale=0.45),
    TOP("t14", "remember the *bridge*?", "b94:remember", "b95"),
    TOP("t15", "sometimes the bridge is the !person!", "b95:sometimes", "b96"),
    ST("ck", 1260, GY, "right", "b96:irony", [["give", "b97:texts"]], [["smile", "b97:calm"]], out="b100", flip=True, variant="bow"),
    I("cp", "phone", 1040, 560, 110, "pop", "b96:irony", "b100"),
    I("cc", "check", 1040, 430, 80, "pop", "b97:time", "b100", color="accent"),
    ST("vw", 640, GY, "left", "b96:irony", [["shrug", "b97:boring"]], [["neutral", "b97:person"]], out="b100"),
    TOP("t16", "the *irony*", "b96:irony", "b97"),
    TOP("t17", "calm can feel *boring*", "b97:boring", "b99"),
    TOP("t18", "nothing sets off your *alarm*", "b99:nothing", "b100"),
    I("hp", "heart", 840, 560, 200, "pop", "b101:pounding", "b102", color="accent", pulse=1.2, beat=0.5),
    I("hq", "question", 1100, 560, 200, "pop", "b101:match", "b102"),
    TOP("t19", "a pounding heart… or a *match*?", "b100:honest", "b102"),
    ST("p1", 600, GY, "left", "b102:fixed", [["idle", "b102:fixed"], ["happy", "b103:secure"]], [["smile", "b102:fixed"]], out="b105", move=[[820, GY, "b103:steady", 1.4]]),
    ST("p2", 1320, GY, "right", "b102:fixed", [["idle", "b102:fixed"], ["happy", "b103:secure"]], [["smile", "b102:fixed"]], out="b105", flip=True, variant="bow", move=[[1100, GY, "b103:steady", 1.4]]),
    TOP("t20", "styles aren't *fixed*", "b102:fixed", "b104"),
    TOP("t21", "you can !too!", "b104:too", "b105"),
    ST("mn", 760, GY, "left", "b105:surprise", [["idle", "b106:believe"], ["give", "b108:saying"], ["happy", "b110:company"]], [["smile", "b106:believe"]], out="b111"),
    ST("wn", 1160, GY, "right", "b105:surprise", [["idle", "b106:believe"], ["happy", "b109:first"]], [["neutral", "b106:believe"], ["o", "b108:saying"], ["smile", "b109:first"]], out="b111", flip=True, variant="bow"),
    TOP("t21b", "one more *surprise*", "b105:surprise", "b106"),
    TOP("t22", "who falls in love *first*?", "b106:believe", "b107:opposite"),
    TOP("t23", "the *opposite*", "b107:opposite", "b108"),
    BUB("lv", "I love you!", 560, 390, 280, "b108:saying", "b111", fontSize=54),
    TOP("t24", "men: about *6 weeks* earlier", "b108:six", "b109"),
    TOP("t25", "the man said it *first*", "b109:first", "b110"),
    TOP("t26", "you're in good *company*", "b110:company", "b111"),
]})
# 5 · love at first sight -------------------------------------------------------------------
scenes.append({"id": "sight", "beats": R(111, 125), "elements": [
    ST("l", 420, GY, "left", "b111:sight", [["idle", "b111:sight"], ["point", "b113:look"], ["happy", "b113:that"]], [["smile", "b111:sight"]], out="b114"),
    ST("r", 1500, GY, "right", "b111:sight", [["idle", "b111:sight"]], [["neutral", "b111:sight"]], out="b114", flip=True, variant="bow"),
    I("fh", "heart", 560, 460, 110, "pop", "b113:look", "b114", color="accent", move=[[1360, 460, "b113:room", 1.3]]),
    TOP("t0", "love at first *sight*?", "b111:sight", "b112"),
    TOP("t0b", "maybe you've *felt* it", "b112:felt", "b113"),
    TOP("t1", "one look… and that was *that*", "b113:look", "b114"),
    CARD("c1", "2017 · THE NETHERLANDS", "Love at first sight", "Zsok et al.", 960, 220, "b114:netherlands", "b116"),
    I("x1", "cross", 960, 600, 200, "pop", "b115:intimacy", "b116", color="accent"),
    I("eye", "heart", 960, 600, 220, "pop", "b116:physical", "b117", color="accent", pulse=1.1),
    TOP("t2", "mostly *physical attraction*", "b116:physical", "b117"),
    *couple("d", "b117:speed", "b118", [["happy", "b117:speed"]], [["idle", "b117:speed"]]),
    I("dh", "heart", 820, 430, 90, "pop", "b117:love", "b118", color="accent", pulse=1.15),
    I("dq", "question", 1100, 430, 90, "pop", "b117:mutual", "b118"),
    TOP("t3", "not one was *mutual*", "b117:mutual", "b118"),
    I("hg", "hourglass", 960, 560, 240, "pop", "b118:later", "b119"),
    TOP("t4", "often decided *later*", "b118:later", "b119"),
    I("lp", "laptop", 820, 580, 260, "pop", "b119:researchers", "b122"),
    I("ck", "checklist", 1160, 580, 200, "pop", "b120:hundred", "b122"),
    TOP("t5", "researchers tried a *computer*", "b119:researchers", "b120"),
    TOP("t6", "100+ questions", "b120:hundred", "b121"),
    I("lq", "question", 960, 380, 120, "pop", "b121:predict", "b122"),
    TOP("t7", "no *prediction*", "b121:couldn't", "b122"),
    I("fk", "flask", 760, 560, 220, "pop", "b122:chemistry", "b125", bob=10),
    I("pp", "paper", 1160, 560, 200, "pop", "b123:paper", "b125"),
    K("kp", 1160, 560, 240, "b123:paper", "b125"),
    TOP("t8", "chemistry is *real*", "b122:chemistry", "b123"),
    TOP("t9", "but it's not on *paper*", "b123:paper", "b124"),
    TOP("t10", "three dates ≈ *paper*", "b124:dates", "b125"),
    HERO("t11", "but it wasn't over yet", "b125:over", size=96),
]})
# 6 · what the numbers say -------------------------------------------------------------------
scenes.append({"id": "numbers", "beats": R(126, 138), "elements": [
    TOP("t0", "a *cost* to falling too fast", "b126:cost", "b127"),
    I("rg", "rings", 960, 560, 260, "pop", "b126:cost", "b127"),
    CARD("c1", "2015 · ~3,000 MARRIED PEOPLE", "Francis-Tan & Mialon", "dating time vs divorce", 960, 220, "b127:economists", "b128"),
    TOP("t1", "the risk of *divorce*", "b128:couples", "b131"),
    BAR("d1", 560, 400, "dated < 1 year", "muted", "b128:couples", "b131", y=960, w=180),
    BAR("d2", 960, 320, "1–2 years: −20%", "muted", "b129:twenty", "b131", y=960, w=180),
    BAR("d3", 1360, 244, "3+ years: −39%", "accent", "b130:three", "b131", y=960, w=180),
    I("bal", "question", 960, 560, 240, "pop", "b131:prove", "b133"),
    TOP("t2", "a link, not *proof*", "b131:prove", "b133"),
    ST("a", 760, GY, "blur", "b133:time", [["idle", "b133:time"], ["happy", "b134:actually"]], [["smile", "b133:time"]], out="b135"),
    ST("b", 1160, GY, "blur", "b133:time", [["idle", "b133:time"], ["happy", "b134:actually"]], [["smile", "b134:actually"]], out="b135", flip=True, variant="bow"),
    I("hgl", "hourglass", 960, 420, 140, "pop", "b133:time", "b135"),
    TOP("t3", "time lets the rush wear *off*", "b134:rush", "b135"),
    I("cal", "calendar", 960, 560, 260, "pop", "b135:remember", "b138"),
    TOP("t3b", "*Tennov's* estimate?", "b135:remember", "b136"),
    TOP("t4", "*18 months to 3 years*", "b136:eighteen", "b137"),
    TOP("t5", "how long the safer couples *waited*", "b137:safer", "b138"),
    I("q", "question", 960, 560, 240, "pop", "b138:right", "b138:end"),
    TOP("t6", "the *right* speed?", "b138:right"),
]})
# 7 · five rules -------------------------------------------------------------------------------
scenes.append({"id": "rules", "beats": R(139, 159), "elements": [
    TOP("r1", "rule 1 · the bridge *check*", "b139:rule", "b141"),
    I("br", "bridge", 960, 660, 1100, "draw", "b139:bridge", "b143", sway=1.0),
    ST("rs", 960, 565, "bottom", "b140:racing", [["holdHead", "b140:racing"], ["happy", "b142:calm"]], [["o", "b140:racing"], ["smile", "b142:calm"]], out="b143", scale=0.45),
    I("rh", "heart", 1100, 420, 90, "pop", "b140:heart", "b142", color="accent", pulse=1.2, beat=0.5),
    TOP("r1b", "them… or the *uncertainty*?", "b141:them", "b142"),
    TOP("r1c", "calm and safe is a *good* sign", "b142:calm", "b143"),
    TOP("r2", "rule 2 · every *weather*", "b143:rule", "b148"),
    ST("w", 760, GY, "left", "b143:weather", [["idle", "b143:weather"], ["headDown", "b144:tired"], ["holdHead", "b145:stressed"], ["shrug", "b146:hungry"], ["armsCrossed", "b147:wrong"], ["happy", "b148:bad"]],
       [["neutral", "b143:weather"], ["tight", "b144:tired"], ["o", "b146:hungry"], ["frown", "b147:wrong"], ["smile", "b148:bad"]], out="b149"),
    I("wsun", "sun", 1200, 400, 130, "pop", "b143:weather", "b144"),
    I("wm", "moon", 1200, 520, 160, "pop", "b144:tired", "b145"),
    I("wb", "rain", 1200, 520, 180, "pop", "b145:stressed", "b146"),
    I("wp", "plate", 1200, 520, 170, "pop", "b146:hungry", "b147"),
    I("wx", "cross", 1200, 520, 150, "pop", "b147:wrong", "b148", color="accent"),
    I("wc", "cloud", 1200, 520, 190, "pop", "b148:bad", "b149"),
    TOP("r2b", "know them on a *bad* day", "b148:bad", "b149"),
    TOP("r3", "rule 3 · keep your *own* life", "b149:rule", "b152"),
    ST("o", 960, GY, "bottom", "b149:keep", [["happy", "b149:keep"], ["headDown", "b151:fall"], ["proud", "b152:don't"]], [["smile", "b149:keep"], ["frown", "b151:fall"], ["smile", "b152:don't"]], out="b153"),
    I("of", "people", 600, 460, 160, "pop", "b150:friends", "b152", move=[[600, 900, "b151:away", 0.9]]),
    I("oh", "book", 1320, 440, 150, "pop", "b150:hobbies", "b152", move=[[1320, 900, "b151:away", 0.9]]),
    I("orr", "calendar", 1320, 700, 140, "pop", "b150:routines", "b152", move=[[1320, 1000, "b151:fall", 0.9]]),
    STAMP("dont", "DON'T", 960, 400, 100, "b152:don't", "b153"),
    TOP("r4", "rule 4 · actions over *words*", "b153:rule", "b154"),
    I("ph", "phone", 620, 560, 180, "pop", "b153:actions", "b157", sway=6, period=0.5),
    I("cal", "calendar", 1300, 560, 200, "pop", "b153:feelings", "b157"),
    TOP("r4b", "words: *fast*", "b154:words", "b155"),
    TOP("r4c", "consistency: *slow*", "b155:consistency", "b156"),
    TOP("r4d", "week after *week*", "b156:week", "b157"),
    TOP("r5", "rule 5 · give it *time*", "b157:rule", "b159"),
    I("hg", "hourglass", 960, 580, 280, "pop", "b157:time"),
    I("h5", "heart", 1180, 460, 100, "pop", "b158:rush", None, color="accent", pulse=1.12),
    TOP("r5b", "let it *settle*", "b159:settle", size=58),
]})
# 8 · the twist and the ending -------------------------------------------------------------------
scenes.append({"id": "end", "tail": 2.6, "beats": R(160, 181), "elements": [
    HERO("t0", "the twist", "b160:twist", "b161", size=110, y=TY),
    ST("me", 960, GY, "bottom", "b161:falling", [["happy", "b161:falling"], ["victory", "b164:whole"], ["happy", "b166:patience"]], [["smile", "b161:falling"]], out="b169"),
    I("bh", "heart", 960, 600, 90, "pop", "b162:big", "b169", color="accent", pulse=1.2, beat=0.9),
    TOP("t1", "falling fast isn't a *flaw*", "b161:flaw", "b162"),
    TOP("t2", "a *big* heart", "b162:big", "b164"),
    TOP("t3", "you love with your *whole chest*", "b164:whole", "b166"),
    I("hg", "hourglass", 1280, 560, 160, "pop", "b166:patience", "b169"),
    TOP("t4", "just add *patience*", "b166:patience", "b167"),
    TOP("t5", "not how fast you fall…", "b167:fast", "b168", color="muted"),
    TOP("t6", "…how fast you !decide!", "b168:decide", "b169"),
    I("br", "bridge", 760, 640, 1000, "pop", "b169:bridge", "b173", sway=1.1),
    I("lo", "bridgeLow", 1620, 700, 520, "pop", "b169:bridge", "b173"),
    ST("w", 760, 560, "bottom", "b169:men", [["holdHead", "b169:men"], ["idle", "b171:step"], ["happy", "b172:them"]], [["o", "b169:men"], ["smile", "b172:them"]],
       out="b173", scale=0.42, move=[[1520, 585, "b171:step", 2.2]]),
    ST("pt", 1720, 585, "right", "b171:time", [["happy", "b172:them"]], [["smile", "b171:time"]], out="b173", scale=0.42, flip=True, variant="bow"),
    TOP("t7", "they felt something *real*", "b169:real", "b171"),
    TOP("t8", "one more *step*", "b171:step", "b172"),
    TOP("t9", "make sure it's them, not the !bridge!", "b172:sure", "b173", size=60),
    TOP("t10", "your *challenge* this week", "b173:challenge", "b178"),
    I("cb", "bridge", 760, 640, 800, "pop", "b173:challenge", "b178", sway=1.1),
    I("cq", "question", 1320, 560, 200, "pop", "b174:fast", "b178"),
    ST("rf", 640, GY, "left", "b178:fast", [["victory", "b178:fast"]], [["smile", "b178:fast"]], out="b180:habit"),
    ST("rs", 1280, GY, "right", "b178:or", [["idle", "b178:or"]], [["smile", "b178:or"]], out="b180:habit", flip=True, variant="bow"),
    I("rh", "heart", 640, 340, 80, "pop", "b178:fast", "b180:habit", color="accent", pulse=1.2, beat=0.5),
    I("rt", "hourglass", 1280, 360, 100, "pop", "b178:time", "b180:habit"),
    TOP("t11", "fast… or *slow*?", "b178:fast", "b180:habit"),
    I("end", "heart", 960, 560, 200, "pop", "b180:habit", None, color="accent", pulse=1.08, beat=1.2),
    TOP("t12", "which habit *next*?", "b180:habit", hero=True, size=80),
    T("t13", "@darealwhy", 960, 820, 44, "bottom", "b181:comments", weight=M, color="muted"),
]})

(ROOT / "script").mkdir(exist_ok=True)
(ROOT / "script/script.json").write_text(json.dumps({"title": "The Psychology of People Who Fall in Love Too Fast", "scenes": scenes}, indent=1, ensure_ascii=False))
print(sum(len(s["elements"]) for s in scenes), "elements,", len(S), "sentences")
