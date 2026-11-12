"""Writes script/script.json for video 12 from timing/words.json (one beat per spoken sentence)
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


def BED(p, at, out, poses=None, mouths=None, x=700):
    """the late-night bed: bed, a sitting stick, a glowing phone, a moon"""
    return [I(p + "bed", "bed", x, 720, 560, "pop", at, out),
            ST(p + "me", x - 20, 630, "bottom", at, poses or [["give", at]], mouths or [["neutral", at]], out=out, scale=0.62, sit=True),
            I(p + "ph", "phone", x + 150, 545, 100, "pop", at, out),
            I(p + "gl", "glow", x + 150, 545, 150, "pop", at, out, pulse=1.08, beat=1.6),
            I(p + "mn", "moon", x - 360, 330, 110, "pop", at, out)]
def PCT(id, x, h, txt, at, out, y=860):
    return T(id, txt, x, y - h - 50, 52, "bottom", at, out, weight=M)

# 1 · hook ------------------------------------------------------------------------------
scenes.append({"id": "hook", "beats": R(0, 25), "elements": [
    *BED("a", "b00:late", "b13", [["give", "b00:late"]],
         [["neutral", "b00:late"], ["o", "b05:ok"], ["frown", "b09:mad"], ["tight", "b12:forty"]]),
    TOP("t0", "it's *late*", "b00:late", "b01"),
    TOP("t1", "you should be *asleep*", "b01:should", "b02"),
    TOP("t2", "staring at *one* text", "b02:staring", "b03"),
    BUB("s1", "Sounds good! Can't wait!", 1480, 380, 200, "b03:wrote", "b09", fontSize=34),
    TOP("t3", "you wrote…", "b03:wrote", "b05", color="muted"),
    BUB("r1", "ok.", 1480, 600, 140, "b05:ok", "b12", fontSize=56),
    TOP("t4", "they wrote back: *ok.*", "b05:wrote", "b06"),
    TOP("t5", "no capital *letter*", "b06:capital", "b07"),
    TOP("t6", "no exclamation *mark*", "b07:exclamation", "b08"),
    TOP("t7", "just !ok.!", "b08:just", "b09"),
    I("qa", "question", 1260, 330, 100, "pop", "b09:mad", "b12"),
    I("qb", "question", 1480, 300, 100, "pop", "b10:wrong", "b12"),
    I("qc", "question", 1700, 330, 100, "pop", "b11:too", "b12"),
    TOP("t8", "are they *mad*?", "b09:mad", "b10"),
    TOP("t9", "did I say something *wrong*?", "b10:say", "b11"),
    TOP("t10", "was the ! too *much*?", "b11:exclamation", "b12"),
    I("ck", "clock", 1480, 450, 170, "pop", "b12:forty", "b13", sway=8, period=0.5),
    T("ckl", "+40 min", 1480, 590, 52, "bottom", "b12:forty", "b13", color="accent", weight=M),
    TOP("t11", "*40* minutes later", "b12:forty", "b13"),
    I("ob", "bed", 960, 720, 560, "pop", "b13:asleep", "b14"),
    ST("sl", 940, 630, "bottom", "b13:asleep", [["headDown", "b13:asleep"]], [["neutral", "b13:asleep"]], out="b14", scale=0.62, sit=True),
    T("zz", "z z z", 1060, 470, 64, "bottom", "b13:asleep", "b14", color="muted", weight=M),
    TOP("t12", "…and they're !asleep!", "b13:and", "b14"),
    HERO("t13", "sound familiar?", "b14:sound", "b15", size=100),
    ST("me", 760, GY, "bottom", "b15:not", [["shrug", "b15:not"], ["idle", "b16:brain"], ["holdHead", "b17:one"]],
       [["neutral", "b15:not"], ["smile", "b16:brain"], ["tight", "b17:one"]], out="b19"),
    TOP("t14", "not crazy · not *dramatic*", "b15:crazy", "b16"),
    I("br", "brain", 1200, 470, 170, "pop", "b16:brain", "b19"),
    TOP("t15", "your brain is doing its *job*", "b16:brain", "b17"),
    I("lp", "loop", 1200, 470, 300, "pop", "b17:one", "b19", pulse=1.06, beat=0.8),
    TOP("t16", "one more *time*", "b17:one", "b18"),
    TOP("t17", "…and one more *time*", "b18:one", "b19"),
    I("bk", "brain", 960, 580, 240, "pop", "b19:psychologists", "b20"),
    TOP("t18", "what all that thinking *does*", "b19:studied", "b20"),
    I("i1", "phone", 560, 580, 200, "pop", "b20:pinged", "b23", sway=8, period=0.3),
    I("i2", "shirt", 960, 580, 220, "pop", "b21:t-shirt", "b23"),
    I("i3", "checklist", 1360, 580, 220, "pop", "b22:worries", "b23"),
    TOP("t19", "pinged *thousands* of people", "b20:pinged", "b21"),
    TOP("t20", "an embarrassing *T-shirt*", "b21:embarrassing", "b22"),
    TOP("t21", "how many worries come *true*", "b22:worries", "b23"),
    ST("me2", 760, GY, "bottom", "b23:by", [["idle", "b23:by"], ["happy", "b24:let"]], [["neutral", "b23:by"], ["smile", "b24:let"]], out="b25"),
    I("rp", "loop", 1200, 470, 200, "pop", "b23:replaying", "b24"),
    TOP("t22", "why your mind keeps *replaying*", "b23:why", "b24"),
    I("lb", "bird", 1200, 470, 150, "pop", "b24:let", "b25", move=[[1560, 300, "b24:go", 1.4]]),
    TOP("t23", "the one move that helps it *let go*", "b24:one", "b25", size=58),
    I("wh", "thought", 960, 560, 320, "pop", "b25:mind"),
    I("wq", "question", 980, 545, 110, "pop", "b25:looking"),
    TOP("t24", "where does your mind *go*?", "b25:where"),
]})
# 2 · the wandering mind -------------------------------------------------------------------
scenes.append({"id": "wander", "beats": R(26, 47), "elements": [
    CARD("c1", "2010 · HARVARD", "An app that pinged people", "Killingsworth & Gilbert", 960, 220, "b26:killingsworth", "b27"),
    I("ip", "phone", 960, 620, 260, "pop", "b26:iphone", "b27"),
    ST("pp", 760, GY, "left", "b27:pinged", [["idle", "b27:pinged"], ["give", "b29:what"]], [["neutral", "b27:pinged"], ["o", "b29:what"]], out="b32"),
    I("ph", "phone", 1020, 560, 110, "pop", "b27:pinged", "b32", sway=8, period=0.3),
    TOP("t0", "at *random* moments", "b27:random", "b28"),
    TOP("t1", "three *questions*", "b28:three", "b32"),
    BUB("q1", "What are you doing?", 1420, 400, 190, "b29:what", "b30", fontSize=32),
    BUB("q2", "What are you thinking about?", 1420, 400, 210, "b30:what", "b31", fontSize=30),
    BUB("q3", "How do you feel?", 1420, 400, 190, "b31:how", "b32", fontSize=32),
    I("pe", "people", 960, 600, 320, "pop", "b32:more", "b33"),
    TOP("t2", "*2,000+* people", "b32:thousand", "b33"),
    ST("wd", 760, GY, "bottom", "b33:minds", [["idle", "b33:minds"], ["headDown", "b38:less"], ["idle", "b39:pleasant"]],
       [["neutral", "b33:minds"], ["frown", "b38:less"], ["neutral", "b39:pleasant"]], out="b40"),
    I("wt", "thought", 1180, 400, 240, "pop", "b33:else", "b40", bob=8),
    TOP("t3", "minds *somewhere else*", "b33:somewhere", "b34"),
    TOP("t4", "*46.9%* of the time", "b34:forty-six", "b35", size=80),
    I("s1", "rain", 1180, 385, 110, "pop", "b35:shower", "b36"),
    I("s2", "briefcase", 1180, 385, 110, "pop", "b36:work", "b37"),
    I("s3", "chat", 1180, 385, 110, "pop", "b37:conversation", "b38"),
    TOP("t5", "in the *shower*", "b35:shower", "b36"),
    TOP("t6", "at *work*", "b36:work", "b37"),
    TOP("t7", "mid-*conversation*", "b37:middle", "b38"),
    I("s4", "cloud", 1180, 385, 110, "pop", "b38:wandered", "b39"),
    TOP("t8", "wandering → less *happy*", "b38:wandered", "b39"),
    I("s5", "sun", 1180, 385, 110, "pop", "b39:pleasant", "b40"),
    TOP("t9", "even pleasant *daydreams*", "b39:pleasant", "b40"),
    I("ti", "paper", 960, 600, 260, "pop", "b40:title", "b41"),
    TOP("t10", "right in their *title*", "b40:title", "b41"),
    HERO("t11", "a wandering mind is an *unhappy* mind", "b41:wandering", "b42", size=70),
    ST("ov", 760, GY, "bottom", "b42:overthinker", [["idle", "b42:overthinker"], ["holdHead", "b46:party"]],
       [["neutral", "b42:overthinker"], ["tight", "b46:party"]], out="b47"),
    I("oc", "thought", 1180, 400, 260, "pop", "b42:wander", "b47"),
    I("o1", "loop", 1190, 385, 110, "pop", "b43:wanders", "b44"),
    I("o2", "phone", 1190, 385, 100, "pop", "b44:text", "b45"),
    I("o3", "table", 1190, 390, 130, "pop", "b45:meeting", "b46"),
    I("o4", "partyhat", 1190, 385, 100, "pop", "b46:party", "b47"),
    TOP("t12", "it doesn't just *wander*", "b42:doesn't", "b43"),
    TOP("t13", "back to the *same spot*", "b43:back", "b44"),
    TOP("t14", "the *text*", "b44:text", "b45"),
    TOP("t15", "the *meeting*", "b45:meeting", "b46"),
    TOP("t16", "a party, six years *ago*", "b46:party", "b47"),
    I("lq", "question", 960, 570, 240, "pop", "b47:looking"),
    TOP("t17", "what's it *looking* for?", "b47:what"),
]})
# 3 · the spotlight ------------------------------------------------------------------------
scenes.append({"id": "spot", "beats": R(48, 69), "elements": [
    ST("yo", 760, GY, "bottom", "b48:usually", [["idle", "b48:usually"], ["shrug", "b51:think"]], [["neutral", "b48:usually"], ["o", "b51:think"]], out="b52"),
    TOP("t0", "it's looking for *one* thing", "b48:looking", "b49"),
    I("ey", "eye", 1200, 460, 150, "pop", "b49:people", "b52"),
    TOP("t1", "what others think of *you*", "b49:what", "b50"),
    TOP("t2", "here's the *problem*", "b50:problem", "b51"),
    TOP("t3", "they think about you *less*", "b51:think", "b52"),
    CARD("c1", "2000 · AN EMBARRASSING SHIRT", "Walk into a room wearing this", "Gilovich et al.", 960, 220, "b52:gilovich", "b53"),
    I("sh", "shirt", 960, 620, 260, "pop", "b52:cruel", "b53"),
    ST("w", 620, GY, "left", "b53:college", [["idle", "b53:college"], ["sorry", "b54:deeply"]],
       [["neutral", "b53:college"], ["tight", "b54:deeply"]], out="b56", move=[[860, GY, "b55:walked", 1.2]]),
    I("ws", "shirt", 620, 650, 200, "pop", "b53:t-shirt", "b55:walked"),
    TOP("t4", "a *Barry Manilow* T-shirt", "b53:t-shirt", "b54"),
    TOP("t5", "*deeply* embarrassing", "b54:deeply", "b55"),
    *[ST(f"pr{i}", x, GY, "right", "b55:room", [["idle", "b55:room"]], [["neutral", "b55:room"]], out="b56", scale=0.7, flip=True)
      for i, x in enumerate([1180, 1400, 1620])],
    TOP("t6", "a room full of *peers*", "b55:room", "b56"),
    BAR("k1", 760, 300, "guessed", "muted", "b56:half", "b58"),
    PCT("p1", 760, 300, "~50%", "b56:half", "b58"),
    BAR("k2", 1160, 150, "noticed", "accent", "b57:quarter", "b58"),
    PCT("p2", 1160, 150, "~25%", "b57:quarter", "b58"),
    TOP("t7", "they guessed *half* noticed", "b56:guessed", "b57"),
    TOP("t8", "really: about a *quarter*", "b57:reality", "b58"),
    ST("s0", 960, GY, "bottom", "b58:psychologists", [["idle", "b58:psychologists"], ["sorry", "b59:stage"]], [["neutral", "b58:psychologists"], ["tight", "b59:stage"]], out="b61"),
    I("sp0", "spot", 960, 610, 795, "pop", "b58:spotlight", "b61"),
    TOP("t9", "the *spotlight* effect", "b58:spotlight", "b59"),
    TOP("t10", "you feel *on stage*", "b59:feel", "b60"),
    ST("s1", 420, GY, "left", "b60:everyone", [["sorry", "b60:everyone"]], [["tight", "b60:everyone"]], out="b61", scale=0.7),
    I("sp1", "spot", 420, 699, 566, "pop", "b60:everyone", "b61"),
    ST("s2", 1500, GY, "right", "b60:everyone", [["sorry", "b60:everyone"]], [["tight", "b60:everyone"]], out="b61", scale=0.7, flip=True),
    I("sp2", "spot", 1500, 699, 566, "pop", "b60:everyone", "b61"),
    TOP("t11", "everyone feels on stage *too*", "b60:everyone", "b61"),
    I("sh2", "shirt", 960, 590, 240, "pop", "b61:stop", "b62"),
    TOP("t12", "not just *T-shirts*", "b61:stop", "b62"),
    CARD("c2", "2018 · STRANGERS CHAT", "How much did they like you?", "Boothby et al.", 960, 220, "b62:boothby", "b63"),
    I("ch", "chat", 960, 620, 260, "pop", "b62:strangers", "b63"),
    ST("la", 700, GY, "left", "b63:afterward", [["idle", "b63:afterward"], ["shrug", "b64:low"], ["happy", "b65:more"]],
       [["neutral", "b63:afterward"], ["frown", "b64:low"], ["smile", "b65:more"]], out="b67"),
    ST("lb", 1220, GY, "right", "b63:afterward", [["idle", "b63:afterward"], ["happy", "b65:liked"]], [["smile", "b63:afterward"]], out="b67", flip=True, variant="bow"),
    TOP("t13", "how much did they *like* me?", "b63:guessed", "b64"),
    I("h1", "heart", 840, 380, 80, "pop", "b64:low", "b67", color="accent"),
    TOP("t14", "most guessed too *low*", "b64:most", "b65"),
    I("h2", "heart", 1080, 360, 150, "pop", "b65:more", "b67", color="accent", pulse=1.12, beat=0.9),
    TOP("t15", "they liked you *more*", "b65:partners", "b66"),
    TOP("t16", "the !liking gap!", "b66:liking", "b67"),
    I("cl", "calendar", 960, 590, 260, "pop", "b67:roommates", "b68"),
    TOP("t17", "it lasted for *months*", "b67:lasted", "b68"),
    ST("rp", 760, GY, "bottom", "b68:conversation", [["holdHead", "b68:replaying"], ["happy", "b69:fine"]], [["tight", "b68:replaying"], ["smile", "b69:fine"]]),
    I("rl", "loop", 1080, 400, 140, "pop", "b68:replaying", "b69"),
    TOP("t18", "that talk you keep *replaying*?", "b68:conversation", "b69"),
    ST("op", 1250, GY, "right", "b69:other", [["happy", "b69:other"]], [["smile", "b69:other"]], flip=True, variant="bow", move=[[1650, GY, "b69:walked", 1.6]]),
    TOP("t19", "it went *fine*", "b69:thinking"),
]})
# 4 · loops -------------------------------------------------------------------------------
scenes.append({"id": "loops", "beats": R(70, 94), "elements": [
    ST("th", 760, GY, "bottom", "b70:overthinking", [["give", "b70:useful"]], [["neutral", "b70:overthinking"]], out="b72"),
    I("pz", "puzzle", 1150, 560, 200, "pop", "b71:working", "b72"),
    TOP("t0", "overthinking feels *useful*", "b70:feels", "b71"),
    TOP("t1", "like *working* on the problem", "b71:working", "b72"),
    HERO("t2", "is it?", "b72:is", "b73", size=120),
    TOP("t3", "a word for *this*", "b73:word", "b74"),
    I("rn", "loop", 960, 580, 240, "pop", "b73:word", "b75"),
    HERO("t4", "rumination", "b74:rumination", "b75", size=110, y=TY),
    I("cw", "cow", 900, 600, 380, "pop", "b75:cow", "b77"),
    TOP("t5", "a cow chewing its *cud*", "b75:cow", "b76"),
    I("cl", "loop", 1280, 420, 150, "pop", "b76:chew", "b77", pulse=1.08, beat=0.6),
    TOP("t6", "chew, swallow, chew *again*", "b76:chew", "b77"),
    CARD("c1", "1995 · RUMINATION", "Does it actually help?", "Lyubomirsky & Nolen-Hoeksema", 960, 220, "b77:lyubomirsky", "b78"),
    I("bn", "brain", 960, 620, 240, "pop", "b77:tested", "b78"),
    ST("ru", 640, GY, "left", "b78:people", [["headDown", "b78:down"], ["holdHead", "b79:focusing"], ["give", "b81:solve"], ["headDown", "b82:worse"]],
       [["frown", "b78:down"], ["tight", "b82:worse"]], out="b84"),
    ST("di", 1280, GY, "right", "b78:people", [["headDown", "b78:down"], ["idle", "b80:else"], ["give", "b81:solve"], ["happy", "b82:worse"]],
       [["frown", "b78:down"], ["neutral", "b80:else"], ["smile", "b82:worse"]], out="b84", flip=True, variant="bow"),
    TOP("t7", "already feeling *down*", "b78:down", "b79"),
    I("rc", "rain", 640, 340, 130, "pop", "b79:focusing", "b84"),
    TOP("t8", "focus on your *feelings*…", "b79:focusing", "b80"),
    I("fr", "frame", 1560, 470, 150, "pop", "b80:else", "b81"),
    TOP("t9", "…or something *else*", "b80:something", "b81"),
    I("z1", "puzzle", 900, 560, 130, "pop", "b81:solve", "b84"),
    I("z2", "puzzle", 1560, 560, 130, "pop", "b81:solve", "b84"),
    TOP("t10", "then: solve *problems*", "b81:solve", "b82"),
    I("x1", "cross", 900, 420, 90, "pop", "b82:worse", "b84"),
    TOP("t11", "ruminators: *worse* solutions", "b82:ruminators", "b83"),
    TOP("t12", "and they felt *worse*", "b83:felt", "b84"),
    I("pg", "mountain", 960, 580, 260, "pop", "b84:progress", "b85"),
    TOP("t13", "it felt like *progress*", "b84:felt", "b85"),
    I("lo", "loop", 960, 570, 300, "pop", "b85:loop", "b86", pulse=1.06, beat=0.7),
    TOP("t14", "it was a !loop!", "b85:loop", "b86"),
    I("wt", "thought", 960, 560, 300, "pop", "b86:worried", "b87"),
    TOP("t15", "the things you *worry* about?", "b86:things", "b87"),
    CARD("c2", "2020 · A WORRY DIARY", "Did the worries come true?", "LaFreniere & Newman", 960, 220, "b87:lafreniere", "b88"),
    I("nb", "notebook", 960, 620, 260, "pop", "b87:test", "b88"),
    I("nb2", "notebook", 760, 590, 260, "pop", "b88:wrote", "b90"),
    I("ca", "calendar", 1180, 590, 220, "pop", "b88:ten", "b89"),
    T("cal", "10 days", 1180, 800, 46, "bottom", "b88:ten", "b89", color="muted"),
    TOP("t16", "worries for *ten* days", "b88:worries", "b89"),
    I("cc", "checklist", 1180, 590, 220, "pop", "b89:checked", "b90"),
    TOP("t17", "which ones came *true*?", "b89:which", "b90"),
    BAR("k1", 760, 420, "didn't happen", "accent", "b90:ninety-one", "b92"),
    PCT("p1", 760, 420, "91%", "b90:ninety-one", "b92"),
    BAR("k2", 1160, 45, "came true", "muted", "b90:hadn't", "b92"),
    PCT("p2", 1160, 45, "9%", "b90:hadn't", "b92"),
    TOP("t18", "about *91%* hadn't", "b90:about", "b91"),
    TOP("t19", "for many: not a *single* one", "b91:single", "b92"),
    I("al", "alarm", 960, 580, 240, "pop", "b92:emergency", "b94", sway=10, period=0.3),
    TOP("t20", "each felt like an *emergency*", "b92:emergency", "b93"),
    I("ax", "cross", 1200, 420, 110, "pop", "b93:false", "b94"),
    TOP("t21", "mostly !false alarms!", "b93:most", "b94"),
    I("wk", "calendar", 960, 590, 260, "pop", "b94:week"),
    I("wq", "question", 1220, 440, 120, "pop", "b94:never"),
    TOP("t22", "your week, on what never *happened*?", "b94:how", size=58),
]})
# 5 · decisions ---------------------------------------------------------------------------
scenes.append({"id": "decide", "beats": R(95, 114), "elements": [
    ST("dc", 760, GY, "bottom", "b95:overthinking", [["shrug", "b95:decisions"]], [["o", "b95:decisions"]], out="b97"),
    I("sg", "signpost", 1150, 560, 240, "pop", "b95:decisions", "b97"),
    TOP("t0", "it hits *decisions* hardest", "b95:hits", "b96"),
    TOP("t1", "more thinking → a *worse* choice", "b96:more", "b97"),
    CARD("c1", "1993 · A FREE POSTER", "Pick one to take home", "Wilson et al.", 960, 220, "b97:wilson", "b98"),
    I("fp", "frame", 960, 620, 260, "pop", "b97:poster", "b98"),
    I("f1", "frame", 880, 420, 150, "pop", "b98:picked", "b103"),
    I("f2", "frame", 1040, 420, 150, "pop", "b98:picked", "b103"),
    ST("pa", 640, GY, "left", "b98:some", [["point", "b98:picked"], ["happy", "b101:students"]], [["smile", "b98:picked"]], out="b103"),
    ST("pb", 1280, GY, "right", "b99:others", [["give", "b99:wrote"], ["headDown", "b101:less"]], [["neutral", "b99:wrote"], ["frown", "b101:less"]], out="b103", flip=True, variant="bow"),
    I("pw", "paper", 1540, 560, 150, "pop", "b99:wrote", "b101"),
    TOP("t2", "some just picked what they *liked*", "b98:picked", "b99"),
    TOP("t3", "others wrote down *why*", "b99:wrote", "b100"),
    I("cp", "phone", 960, 640, 110, "pop", "b100:called", "b101", sway=8, period=0.3),
    TOP("t4", "*weeks* later…", "b100:weeks", "b101"),
    TOP("t5", "the analyzers: *less* happy", "b101:less", "b102"),
    TOP("t6", "easy to *explain* ≠ really liked", "b102:explain", "b103"),
    CARD("c2", "2006 · THE FIRST JOB HUNT", "The best, or good enough?", "Iyengar, Wells & Schwartz", 960, 220, "b103:iyengar", "b104"),
    I("bc", "briefcase", 960, 620, 260, "pop", "b103:jobs", "b104"),
    ST("mx", 760, GY, "bottom", "b104:some", [["victory", "b104:maximizers"]], [["smile", "b104:maximizers"]], out="b106"),
    TOP("t7", "the *maximizers*", "b104:maximizers", "b105"),
    I("md", "medal", 1140, 470, 160, "pop", "b105:best", "b106"),
    TOP("t8", "the *best*, not just good", "b105:best", "b106"),
    BAR("k1", 640, 380, "maximizers", "accent", "b106:twenty", "b111"),
    PCT("p1", 640, 380, "+20%", "b106:twenty", "b111"),
    BAR("k2", 1000, 315, "others", "muted", "b106:twenty", "b111"),
    TOP("t9", "about *20%* more pay", "b106:paying", "b107"),
    ST("mw", 1440, GY, "right", "b107:worse", [["headDown", "b107:worse"], ["holdHead", "b109:stressed"], ["shrug", "b110:did"]],
       [["frown", "b107:worse"], ["tight", "b109:stressed"]], out="b111", flip=True),
    TOP("t10", "…and yet, they felt *worse*", "b107:yet", "b108"),
    TOP("t11", "less *satisfied*", "b108:satisfied", "b109"),
    TOP("t12", "more stressed and *anxious*", "b109:stressed", "b110"),
    TOP("t13", "did *better*, felt !worse!", "b110:did", "b111"),
    I("bo", "book", 960, 590, 260, "pop", "b111:book", "b113"),
    TOP("t14", "*The Paradox of Choice*", "b111:paradox", "b112"),
    TOP("t15", "more options, *less* satisfied", "b112:options", "b113"),
    I("cu", "couch", 860, 700, 520, "pop", "b113:ever", "b114"),
    ST("cs", 770, 705, "bottom", "b113:ever", [["idle", "b113:ever"], ["headDown", "b113:watched"]], [["neutral", "b113:ever"], ["frown", "b113:watched"]], out="b114", scale=0.7, sit=True),
    I("tv", "tv", 1440, 560, 240, "pop", "b113:show", "b114"),
    TOP("t16", "*40* minutes picking a show", "b113:forty", "b113:watched"),
    TOP("t17", "…then watched *nothing*", "b113:watched", "b114"),
    HERO("t18", "But it wasn't over yet.", "b114:but", None, size=90),
]})
# 6 · the plan ----------------------------------------------------------------------------
scenes.append({"id": "plan", "beats": R(115, 145), "elements": [
    ST("pl", 960, GY, "bottom", "b115:because", [["idle", "b115:because"], ["headDown", "b117:tapping"]], [["neutral", "b115:because"], ["frown", "b117:tapping"]], out="b118"),
    I("pt", "thought", 1260, 400, 220, "pop", "b115:thought", "b118"),
    I("pc", "checklist", 1265, 385, 100, "pop", "b116:unfinished", "b118"),
    TOP("t0", "your brain won't *drop* it", "b115:reason", "b116"),
    TOP("t1", "*unfinished* business sticks", "b116:unfinished", "b117"),
    ST("tp", 680, GY, "left", "b117:tapping", [["point", "b117:tapping"]], [["neutral", "b117:tapping"]], out="b118", variant="bow"),
    TOP("t2", "tap, tap: not *done*", "b117:tapping", "b118"),
    CARD("c1", "1920s · THE ZEIGARNIK EFFECT", "Unfinished tasks stay with you", "Bluma Zeigarnik", 960, 220, "b118:zeigarnik", "b119"),
    I("zp", "pause", 960, 620, 240, "pop", "b118:zeigarnik", "b119"),
    ST("wt", 760, GY, "left", "b119:story", [["give", "b119:restaurant"], ["happy", "b121:paid"]], [["neutral", "b119:story"], ["smile", "b121:vanished"]], out="b122"),
    I("np", "notebook", 1000, 560, 110, "pop", "b119:restaurant", "b122"),
    I("rt", "plate", 1460, 600, 200, "pop", "b119:restaurant", "b122"),
    TOP("t3", "a *restaurant*, 1920s", "b119:restaurant", "b120"),
    I("wc", "thought", 1200, 380, 220, "pop", "b120:remembered", "b122"),
    I("wo", "plate", 1205, 365, 100, "pop", "b120:unpaid", "b121:vanished"),
    TOP("t4", "every *unpaid* order", "b120:unpaid", "b121"),
    I("mo", "money", 1460, 440, 120, "pop", "b121:paid", "b122"),
    TOP("t5", "paid → !gone!", "b121:paid", "b122"),
    I("ip", "pause", 760, 590, 220, "pop", "b122:interrupted", "b123"),
    I("ic", "check", 1160, 590, 200, "pop", "b122:finished", "b123"),
    T("ipl", "remembered", 760, 800, 46, "bottom", "b122:interrupted", "b123", color="accent"),
    T("icl", "forgotten", 1160, 800, 46, "bottom", "b122:finished", "b123", color="muted"),
    TOP("t6", "interrupted tasks *stick*", "b122:interrupted", "b123"),
    CARD("c2", "2011 · CONSIDER IT DONE", "How to quiet an unfinished goal", "Masicampo & Baumeister", 960, 220, "b123:masicampo", "b124"),
    I("cd", "checklist", 960, 620, 260, "pop", "b123:stop", "b124"),
    ST("rd", 700, GY, "left", "b124:people", [["idle", "b124:people"], ["give", "b125:passage"], ["happy", "b132:went"]],
       [["neutral", "b124:people"], ["o", "b126:drifting"], ["neutral", "b128:wrote"], ["smile", "b132:went"]], out="b133"),
    I("gc", "thought", 1200, 380, 230, "pop", "b124:goal", "b132:went"),
    I("gs", "checklist", 1205, 365, 100, "pop", "b124:goal", "b132:went"),
    TOP("t7", "an *unfinished* goal", "b124:important", "b125"),
    I("bk", "book", 940, 560, 150, "pop", "b125:passage", "b127"),
    TOP("t8", "read a *passage*", "b125:passage", "b126"),
    TOP("t9", "the mind drifts *back*", "b126:drifting", "b127"),
    TOP("t10", "one small *thing*", "b127:one", "b128"),
    I("pn", "paper", 1460, 600, 230, "pop", "b128:plan", "b133"),
    TOP("t11", "a *specific* plan", "b128:specific", "b129"),
    TOP("t12", "*when*, *where*, *how*", "b129:when", "b130"),
    I("nx", "cross", 1640, 420, 100, "pop", "b130:do", "b131"),
    TOP("t13", "they didn't *do* the task", "b130:didn't", "b131"),
    I("ny", "check", 1640, 420, 100, "pop", "b131:planned", "b133"),
    TOP("t14", "they just !planned! it", "b131:planned", "b132"),
    TOP("t15", "the thoughts went *away*", "b132:intrusive", "b133"),
    ST("cm", 760, GY, "bottom", "b133:brain", [["idle", "b133:brain"], ["happy", "b134:plan"]], [["neutral", "b133:brain"], ["smile", "b134:plan"]], out="b135"),
    I("mn", "moon", 1200, 400, 120, "pop", "b133:tonight", "b134"),
    TOP("t16", "it doesn't need it solved *tonight*", "b133:doesn't", "b134", size=58),
    I("pp", "paper", 1200, 560, 200, "pop", "b134:plan", "b135"),
    TOP("t17", "it needs a !plan!", "b134:needs", "b135"),
    I("sl", "chat", 960, 580, 240, "pop", "b135:trick", "b136"),
    TOP("t18", "a little *silly*", "b135:silly", "b136"),
    CARD("c3", "2014 · SELF-TALK", "Before a stressful speech", "Kross et al.", 960, 220, "b136:kross", "b137"),
    I("mc", "mic", 960, 620, 240, "pop", "b136:speech", "b137"),
    ST("i1", 640, GY, "left", "b137:some", [["strain", "b137:talked"], ["holdHead", "b140:anxious"], ["headDown", "b142:beating"]],
       [["tight", "b137:talked"], ["frown", "b142:beating"]], out="b143"),
    BUB("ib", "I…", 820, 380, 150, "b137:i", "b143", fontSize=50),
    TOP("t19", "talking to *yourself*", "b137:talked", "b138"),
    ST("i2", 1280, GY, "right", "b138:others", [["idle", "b138:others"], ["proud", "b140:name"]], [["neutral", "b138:others"], ["smile", "b139:sam"]], out="b143", flip=True, variant="bow"),
    TOP("t20", "or your own *name*", "b138:name", "b139"),
    BUB("sb", "Sam, you can do this.", 1100, 380, 190, "b139:sam", "b143", fontSize=30),
    TOP("t21", "name group: less *anxious*", "b140:less", "b141"),
    I("me", "medal", 1560, 480, 130, "pop", "b141:judges", "b143"),
    TOP("t22", "speeches rated *better*", "b141:rated", "b142"),
    TOP("t23", "less beating themselves *up*", "b142:less", "b143"),
    ST("d1", 700, GY, "left", "b143:using", [["idle", "b143:using"], ["point", "b144:advice"]], [["smile", "b143:using"]], out="b145"),
    ST("d2", 1220, GY, "right", "b143:using", [["headDown", "b143:using"], ["happy", "b144:friend"]], [["frown", "b143:using"], ["smile", "b144:friend"]], out="b145", flip=True, variant="bow"),
    I("sp", "split", 960, 470, 160, "pop", "b143:distance", "b144"),
    TOP("t24", "a little *distance*", "b143:distance", "b144"),
    BUB("ad", "You've got this.", 900, 380, 170, "b144:advice", "b145", fontSize=32),
    TOP("t25", "advice to a *friend*", "b144:giving", "b145"),
    I("fq", "question", 960, 570, 240, "pop", "b145:why"),
    TOP("t26", "easier for a *friend*?", "b145:easier"),
]})
# 7 · five rules --------------------------------------------------------------------------
scenes.append({"id": "rules", "beats": R(146, 173), "elements": [
    I("cl", "checklist", 960, 590, 260, "pop", "b146:here's", "b147"),
    TOP("t0", "here's what you can *do*", "b146:here's", "b147"),
    TOP("t1", "rule 1: worry → *plan*", "b147:rule", "b149"),
    I("wc", "thought", 620, 580, 270, "pop", "b147:worry", "b149"),
    I("wp", "paper", 1300, 600, 240, "pop", "b147:plan", "b151"),
    BUB("ns", "What's the next step?", 960, 380, 190, "b148:ask", "b149", fontSize=32),
    TOP("t2", "with a *when* and a *where*", "b149:when", "b150"),
    ST("od", 760, GY, "bottom", "b150:then", [["happy", "b150:duty"]], [["smile", "b150:duty"]], out="b151"),
    TOP("t3", "brain: off *duty*", "b150:let", "b151"),
    TOP("t4", "rule 2: a worry *receipt*", "b151:rule", "b152"),
    I("rc", "receipt", 960, 590, 300, "pop", "b151:receipt", "b159"),
    ST("rw", 600, GY, "left", "b152:write", [["give", "b152:write"], ["shrug", "b154:did"], ["happy", "b155:most"]], [["neutral", "b152:write"], ["smile", "b155:most"]], out="b159"),
    TOP("t5", "write it *down*", "b152:write", "b153"),
    I("rk", "calendar", 1360, 560, 200, "pop", "b153:week", "b155"),
    TOP("t6", "check it in a *week*", "b153:check", "b154"),
    TOP("t7", "did it *happen*?", "b154:did", "b155"),
    TOP("t8", "usually: !no!", "b155:most", "b156"),
    TOP("t9", "see it in *writing*", "b156:see", "b157"),
    TOP("t10", "a *terrible* track record", "b157:terrible", "b158"),
    TOP("t11", "make it show its *receipts*", "b158:make", "b159"),
    TOP("t12", "rule 3: use your *name*", "b159:rule", "b160"),
    ST("nm", 760, GY, "bottom", "b159:talk", [["idle", "b159:talk"], ["shrug", "b162:strange"], ["proud", "b163:works"]], [["smile", "b159:talk"]], out="b164"),
    BUB("ok", "Okay, Sam. What would you tell a friend?", 1180, 400, 240, "b160:okay", "b162", fontSize=30),
    TOP("t13", "it sounds *strange*", "b162:sounds", "b163"),
    TOP("t14", "it works *better*", "b163:works", "b164"),
    TOP("t15", "rule 4: good *enough*", "b164:rule", "b165"),
    I("ge", "check", 960, 590, 220, "pop", "b164:rule", "b165"),
    K("ln", 960, 520, 1000, "b165:bar", "b168"),
    *[I(f"o{i}", "plate", x, 640, 170, "pop", "b165:choices", "b168") for i, x in enumerate([560, 960, 1360])],
    TOP("t16", "set the bar *first*", "b165:set", "b166"),
    I("ok1", "check", 560, 420, 110, "pop", "b166:first", "b168"),
    TOP("t17", "first to clear it *wins*", "b166:first", "b167"),
    I("lm", "moon", 1500, 360, 100, "pop", "b167:ten", "b168"),
    TOP("t18", "good tonight > perfect at *ten*", "b167:good", "b168"),
    TOP("t19", "rule 5: a real *job*", "b168:rule", "b169"),
    ST("jb", 760, GY, "bottom", "b168:rule", [["idle", "b168:rule"], ["happy", "b170:walk"], ["give", "b172:cook"], ["proud", "b173:back"]],
       [["neutral", "b168:rule"], ["smile", "b170:walk"]], move=[[1100, GY, "b170:walk", 1.4], [760, GY, "b173:back", 1.2]]),
    I("rl", "loop", 1100, 420, 150, "pop", "b169:rumination", "b170"),
    TOP("t20", "rumination loves an *idle* mind", "b169:rumination", "b170"),
    TOP("t21", "take a *walk*", "b170:walk", "b171"),
    I("cp", "phone", 1400, 520, 130, "pop", "b171:call", "b172", sway=8, period=0.3),
    TOP("t22", "call *someone*", "b171:call", "b172"),
    I("ck", "plate", 1400, 560, 170, "pop", "b172:cook", "b173"),
    TOP("t23", "cook *something*", "b172:cook", "b173"),
    TOP("t24", "then come *back*", "b173:come"),
]})
# 8 · the twist and the ending ------------------------------------------------------------
scenes.append({"id": "end", "tail": 2.6, "beats": R(174, 195), "elements": [
    TOP("t0", "here's the !twist!", "b174:twist", "b175", size=80),
    ST("kd", 960, GY, "bottom", "b174:twist", [["idle", "b175:overthinkers"], ["proud", "b176:careful"], ["happy", "b177:remember"], ["give", "b180:coffee"], ["proud", "b181:strength"]],
       [["neutral", "b175:overthinkers"], ["smile", "b176:careful"]], out="b182"),
    TOP("t1", "they aren't *broken*", "b175:broken", "b176"),
    TOP("t2", "the most *careful* people", "b176:careful", "b177"),
    I("dn", "notebook", 1320, 470, 130, "pop", "b177:details", "b182"),
    TOP("t3", "they remember *details*", "b177:remember", "b178"),
    I("dh", "heart", 600, 440, 110, "pop", "b178:feel", "b182", color="accent", pulse=1.12, beat=0.9),
    TOP("t4", "how others *feel*", "b178:think", "b179"),
    I("de", "eye", 1320, 640, 130, "pop", "b179:problems", "b182"),
    TOP("t5", "they see problems *coming*", "b179:see", "b180"),
    I("dc", "coffee", 600, 630, 140, "pop", "b180:coffee", "b182"),
    TOP("t6", "your friend's *coffee* order", "b180:remembers", "b181"),
    TOP("t7", "a real !strength!", "b181:strength", "b182"),
    I("lc", "loop", 960, 570, 300, "pop", "b182:thinking", "b183", pulse=1.06, beat=0.7),
    TOP("t8", "thinking isn't the *problem*", "b182:thinking", "b183"),
    I("fw", "signpost", 960, 580, 260, "pop", "b183:circles", "b184"),
    TOP("t9", "thinking in !circles! is", "b183:thinking", "b184"),
    *BED("z", "b184:next", "b188", [["give", "b184:next"], ["happy", "b185:busy"]], [["neutral", "b184:next"], ["smile", "b185:probably"]]),
    BUB("zb", "ok.", 1480, 560, 140, "b184:ok", "b188", fontSize=56),
    TOP("t10", "your phone says *ok.*", "b184:next", "b184:take"),
    TOP("t11", "take a *breath*", "b184:take", "b185"),
    TOP("t12", "probably just *busy*", "b185:probably", "b186"),
    TOP("t13", "or !asleep!", "b186:asleep", "b187"),
    TOP("t14", "and you can be *too*", "b187:you", "b188"),
    TOP("t15", "your *challenge* this week", "b188:challenge", "b189"),
    I("cn", "notebook", 960, 590, 260, "pop", "b188:so", "b190"),
    TOP("t16", "write down *one* worry", "b189:write", "b190"),
    I("cc", "calendar", 960, 590, 260, "pop", "b190:check", "b192"),
    T("ccl", "+7 days", 960, 800, 50, "bottom", "b190:seven", "b192", color="accent", weight=M),
    TOP("t17", "check it in *7* days", "b190:check", "b191"),
    I("cq", "question", 1250, 440, 120, "pop", "b191:true", "b192"),
    TOP("t18", "did it come *true*?", "b191:came", "b192"),
    I("eq", "thought", 960, 560, 300, "pop", "b192:overthought", "b194"),
    TOP("t19", "what have you overthought the *most*?", "b192:what", "b193", size=58),
    TOP("t20", "tell me in the *comments*", "b193:tell", "b194"),
    I("tc", "chat", 960, 580, 240, "pop", "b193:tell", "b194"),
    I("end", "heart", 960, 560, 200, "pop", "b194:habit", None, color="accent", pulse=1.08, beat=1.2),
    TOP("t21", "which habit *next*?", "b194:habit", hero=True, size=80),
    T("t22", "@darealwhy", 960, 820, 44, "bottom", "b195:comments", weight=M, color="muted"),
]})

(ROOT / "script").mkdir(exist_ok=True)
(ROOT / "script/script.json").write_text(json.dumps({"title": "The Psychology of People Who Overthink Everything", "scenes": scenes}, indent=1, ensure_ascii=False))
print(sum(len(s["elements"]) for s in scenes), "elements,", len(S), "sentences")
