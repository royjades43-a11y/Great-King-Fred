"""Writes script/script.json for video 11 from timing/words.json (one beat per spoken sentence)
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


def COUCH(p, at, out, poses=None, mouths=None, x=960):
    """the Thursday-night couch: couch, a sitting stick, the phone beside them"""
    return [I(p + "cc", "couch", x, 700, 520, "pop", at, out),
            ST(p + "me", x - 90, 705, "bottom", at, poses or [["idle", at]], mouths or [["neutral", at]], out=out, scale=0.7, sit=True)]
def PCT(id, x, h, txt, at, out, y=860):
    return T(id, txt, x, y - h - 50, 52, "bottom", at, out, weight=M)

# 1 · hook ------------------------------------------------------------------------------
scenes.append({"id": "hook", "beats": R(0, 21), "elements": [
    *COUCH("a", "b00:thursday", "b10", [["idle", "b00:thursday"], ["give", "b07:type"]],
           [["neutral", "b00:thursday"], ["o", "b03:hey"], ["frown", "b05:sleep"], ["smile", "b07:type"], ["o", "b09:why"]]),
    I("moon", "moon", 420, 330, 110, "pop", "b00:night", "b10"),
    TOP("t0", "thursday *night*", "b00:thursday", "b01"),
    TOP("t1", "finally on the *couch*", "b01:finally", "b02"),
    I("ph", "phone", 1090, 610, 90, "pop", "b02:phone", "b10", sway=8, period=0.25),
    I("bell", "bell", 1180, 470, 90, "pop", "b02:buzzes", "b04", color="accent", sway=12, period=0.35),
    TOP("t2", "your phone *buzzes*", "b02:buzzes", "b03"),
    BUB("rq", "Help me move on Saturday?", 1460, 430, 260, "b04:any", "b07", fontSize=34),
    I("bx", "box", 1560, 640, 130, "pop", "b04:move", "b07"),
    TOP("t3", "help me *move*?", "b04:move", "b05"),
    I("th", "thought", 560, 380, 300, "pop", "b05:sleep", "b07"),
    I("tb", "bed", 560, 370, 140, "pop", "b05:sleep", "b07"),
    TOP("t4", "sleep *in*", "b05:sleep", "b06"),
    TOP("t5", "do *nothing* at all", "b06:nothing", "b07"),
    BUB("sr", "Sure! What time?", 1460, 430, 230, "b07:sure", "b10", fontSize=40),
    TOP("t6", "you type: *sure!*", "b07:type", "b09"),
    TOP("t7", "why did I just *do* that?", "b09:why", "b10"),
    HERO("t8", "sound familiar?", "b10:sound", "b11", size=100),
    ST("me2", 760, GY, "left", "b11:not", [["shrug", "b11:not"], ["headDown", "b13:fight"]], [["neutral", "b11:not"], ["frown", "b13:fight"]], out="b14"),
    TOP("t9", "not lazy · not *selfish*", "b11:lazy", "b12"),
    BUB("no", "No.", 1010, 360, 150, "b12:no", "b14", fontSize=56),
    I("bo", "bolt", 1380, 440, 130, "pop", "b13:fight", "b14"),
    TOP("t10", "for *you*, no doesn't feel small", "b12:you", "b13"),
    TOP("t11", "it feels like a *fight*", "b13:feels", "b14"),
    I("co", "people", 960, 580, 280, "pop", "b14:company", "b15"),
    TOP("t12", "you're in good *company*", "b14:company", "b15"),
    I("i1", "book", 560, 580, 220, "pop", "b16:library", "b19"),
    I("i1p", "pen", 650, 500, 100, "pop", "b16:write", "b19"),
    I("i2", "chat", 960, 580, 220, "pop", "b17:refusals", "b19"),
    I("i3", "people", 1360, 580, 220, "pop", "b18:asked", "b19"),
    TOP("t13", "why no is so hard to *say*", "b15:why", "b16"),
    I("lk", "lock", 960, 580, 220, "pop", "b15:psychologists", "b16"),
    TOP("t14", "a library *book*", "b16:library", "b17"),
    TOP("t15", "which refusals *work*", "b17:refusals", "b18"),
    TOP("t16", "who gets asked the *most*", "b18:who", "b19"),
    ST("me3", 960, GY, "bottom", "b19:by", [["shrug", "b19:yes"]], [["o", "b19:yes"]], out="b20"),
    TOP("t17", "why yes slips *out*", "b19:yes", "b20"),
    I("q", "question", 960, 560, 240, "pop", "b20:swap", "b21"),
    TOP("t18", "the one small word *swap*", "b20:one", "b21"),
    I("al", "alarm", 960, 570, 240, "pop", "b21:dangerous"),
    TOP("t19", "why no feels so *dangerous*", "b21:why"),
]})
# 2 · why no feels dangerous ------------------------------------------------------------------
G = [560, 760, 960]
scenes.append({"id": "belong", "beats": R(22, 46), "elements": [
    *[ST(f"g{i}", x, GY, "bottom", "b22:most", [["happy", "b22:most"]], [["smile", "b22:most"]], out="b24", scale=0.75) for i, x in enumerate(G)],
    ST("lo", 1160, GY, "bottom", "b22:most", [["idle", "b22:pushed"], ["headDown", "b23:alone"]], [["smile", "b22:most"], ["frown", "b22:pushed"]], out="b24",
       scale=0.75, move=[[1560, GY, "b22:pushed", 1.4]]),
    TOP("t0", "pushed out of the *group*", "b22:pushed", "b23"),
    TOP("t1", "alone: less likely to *survive*", "b23:alone", "b24"),
    CARD("c1", "1995 · THE NEED TO BELONG", "One of our most basic drives", "Baumeister & Leary", 960, 220, "b24:baumeister", "b26"),
    I("bp", "people", 960, 620, 300, "pop", "b24:baumeister", "b26"),
    I("bh", "heart", 960, 440, 100, "pop", "b25:basic", "b26", color="accent", pulse=1.12, beat=0.9),
    ST("ak", 640, GY, "left", "b26:someone", [["point", "b26:asks"]], [["smile", "b26:asks"]], out="b30"),
    ST("yu", 1280, GY, "right", "b26:someone", [["idle", "b26:asks"], ["headDown", "b28:wrong"]], [["neutral", "b26:asks"], ["frown", "b28:wrong"]], out="b30", flip=True),
    BUB("hq", "Can you help?", 700, 335, 200, "b26:asks", "b30", fontSize=32),
    BUB("gq", "Still one of us?", 1220, 335, 200, "b27:still", "b30", fontSize=30),
    TOP("t2", "a *different* question", "b26:different", "b27"),
    TOP("t3", "still part of the *group*?", "b27:still", "b28"),
    TOP("t4", "no feels *wrong*", "b28:wrong", "b29"),
    I("sat", "calendar", 960, 500, 150, "pop", "b29:saturday", "b30"),
    TOP("t5", "even just a *Saturday*", "b29:saturday", "b30"),
    TOP("t6", "but here's the *thing*", "b30:thing", "b31"),
    I("fr", "rain", 700, 560, 320, "pop", "b31:fear", "b32"),
    I("fo", "cloud", 1260, 620, 160, "pop", "b31:fallout", "b32"),
    T("frl", "fear", 700, 800, 44, "bottom", "b31:fear", "b32", color="muted"),
    T("fol", "fallout", 1260, 800, 44, "bottom", "b31:fallout", "b32", color="muted"),
    TOP("t7", "the fear is much bigger than the *fallout*", "b31:fear", "b32", size=56),
    CARD("c2", "2023 · 5 EXPERIMENTS", "More than 2,000 people", "Givi & Kirk", 960, 220, "b32:givi", "b33"),
    I("gp", "people", 960, 620, 300, "pop", "b32:experiments", "b33"),
    ST("ir", 620, GY, "left", "b33:some", [["give", "b33:invited"], ["shrug", "b39:people"], ["happy", "b40:fine"]], [["smile", "b33:some"], ["neutral", "b39:people"], ["smile", "b40:fine"]], out="b41"),
    I("lt", "letter", 850, 520, 140, "pop", "b33:invited", "b37"),
    ST("iv", 1300, GY, "right", "b33:some", [["idle", "b33:some"], ["headDown", "b37:worst"], ["happy", "b40:fine"]], [["smile", "b33:some"], ["frown", "b37:worst"], ["smile", "b40:fine"]], out="b41", flip=True, variant="bow"),
    I("mu", "frame", 960, 340, 150, "pop", "b34:museum", "b35"),
    I("cf", "chef", 960, 340, 160, "pop", "b35:chef", "b36"),
    TOP("t8", "*invited* to something", "b33:invited", "b34"),
    TOP("t9", "a museum *exhibit*", "b34:museum", "b35"),
    TOP("t10", "a celebrity *chef*", "b35:celebrity", "b36"),
    TOP("t11", "the one who *sent* the invitation", "b36:sent", "b37"),
    I("wt", "thought", 1460, 360, 300, "pop", "b37:worst", "b39"),
    I("wr", "rain", 1440, 350, 120, "pop", "b37:worst", "b39"),
    I("wb", "broken", 1530, 380, 70, "pop", "b38:hurt", "b39"),
    TOP("t12", "they expected the *worst*", "b37:expected", "b38"),
    TOP("t13", "angry · hurt · less likely to *invite*", "b38:angry", "b39", size=56),
    TOP("t14", "the people who got the no?", "b39:people", "b40", color="muted"),
    BUB("ok", "ok!", 700, 370, 140, "b40:fine", "b41", fontSize=50),
    TOP("t15", "mostly… !fine!", "b40:mostly", "b41"),
    HERO("t16", "the irony", "b41:irony", "b42", size=110, y=TY),
    ST("pa", 700, GY, "left", "b42:all", [["point", "b42:asking"], ["idle", "b43:saying"], ["sorry", "b44:turned"], ["happy", "b45:less"]],
       [["smile", "b42:all"], ["frown", "b43:saying"], ["neutral", "b44:turned"], ["smile", "b45:less"]], out="b46"),
    ST("pb", 1220, GY, "right", "b42:all", [["shrug", "b42:bothers"], ["point", "b43:saying"], ["armsCrossed", "b44:turned"], ["happy", "b45:less"]],
       [["smile", "b42:all"], ["neutral", "b43:saying"], ["tight", "b44:turned"], ["smile", "b45:less"]], out="b46", flip=True, variant="bow"),
    TOP("t17", "how little a no *bothers* us", "b42:how", "b43"),
    TOP("t18", "we just *forget* it", "b43:forget", "b44"),
    TOP("t19", "turned down *themselves*", "b44:turned", "b45"),
    TOP("t20", "→ worried *less*", "b45:worried", "b46"),
    I("wq", "question", 960, 570, 240, "pop", "b46:why"),
    TOP("t21", "why does *yes* keep slipping out?", "b46:why"),
]})
# 3 · yes on autopilot ---------------------------------------------------------------------
scenes.append({"id": "autopilot", "beats": R(47, 78), "elements": [
    TOP("t0", "part of it is *speed*", "b47:part", "b48"),
    ST("rf", 960, GY, "bottom", "b47:part", [["idle", "b47:part"], ["shrug", "b48:decisions"], ["victory", "b49:reflexes"]], [["neutral", "b47:part"], ["o", "b49:reflexes"]], out="b50"),
    I("sp", "bolt", 1260, 440, 130, "pop", "b49:reflexes", "b50"),
    TOP("t1", "yeses aren't *decisions*", "b48:yeses", "b49"),
    TOP("t2", "they're !reflexes!", "b49:reflexes", "b50"),
    CARD("c1", "LATE 1970s · COPY MACHINE", "A sneaky experiment", "Langer et al.", 960, 220, "b50:langer", "b51"),
    I("cpx", "copier", 960, 610, 300, "pop", "b50:copy", "b51"),
    I("cp", "copier", 1100, 610, 280, "pop", "b51:stranger", "b54"),
    ST("us", 1380, GY, "right", "b51:stranger", [["give", "b51:stranger"], ["shrug", "b53:may"]], [["neutral", "b51:stranger"], ["o", "b53:machine"]], out="b54", flip=True, variant="bow"),
    ST("st", 640, GY, "left", "b51:stranger", [["idle", "b51:walked"], ["point", "b52:excuse"]], [["smile", "b51:walked"]], out="b54"),
    TOP("t3", "asked to go *first*", "b51:first", "b52"),
    BUB("sb", "May I use the copy machine?", 730, 335, 210, "b52:excuse", "b54", fontSize=28),
    TOP("t4", "*5* pages", "b52:five", "b53"),
    TOP("t4b", "may I use the copy *machine*?", "b53:may", "b54"),
    BAR("k1", 600, 300, "just asking", "muted", "b54:sixty", "b64"),
    PCT("p1", 600, 300, "60%", "b54:sixty", "b64"),
    TOP("t5", "about *60%* let them", "b54:about", "b55"),
    TOP("t6", "add a *reason*", "b55:reason", "b56"),
    BUB("ru", "Because I'm in a rush.", 960, 420, 240, "b56:because", "b57", fontSize=34),
    BAR("k2", 960, 470, "in a rush", "accent", "b57:ninety-four", "b64"),
    PCT("p2", 960, 470, "94%", "b57:ninety-four", "b64"),
    TOP("t7", "*94%* said yes", "b57:about", "b58"),
    TOP("t8", "now the *funny* part", "b58:funny", "b59"),
    TOP("t9", "a reason that wasn't a *reason*", "b59:reason", "b60"),
    BUB("cq", "…because I have to make copies?", 1380, 420, 240, "b60:because", "b61", fontSize=30),
    TOP("t10", "because I have to make *copies*", "b60:because", "b61"),
    I("cp2", "copier", 1600, 600, 180, "pop", "b61:course", "b63"),
    TOP("t11", "*of course* they had to make copies", "b61:course", "b62", size=56),
    TOP("t12", "*everyone* had to make copies", "b62:everyone", "b63"),
    BAR("k3", 1320, 465, "make copies", "accent", "b63:ninety-three", "b64"),
    PCT("p3", 1320, 465, "93%", "b63:ninety-three", "b64"),
    TOP("t13", "still *93%*", "b63:still", "b64"),
    HERO("t14", "because…", "b64:because", "b65", size=130),
    I("ab", "brain", 760, 580, 260, "pop", "b65:brain", "b66"),
    I("ap", "plane", 1220, 560, 220, "pop", "b65:autopilot", "b66"),
    TOP("t15", "yes on *autopilot*", "b65:autopilot", "b66"),
    TOP("t16", "it goes *further*", "b66:further", "b67"),
    I("fs", "signpost", 960, 590, 260, "pop", "b66:autopilot", "b67"),
    I("bk0", "book", 960, 620, 260, "pop", "b67:students", "b68"),
    CARD("c2", "2014 · AN ODD REQUEST", "Write one word in a library book", "Bohns et al.", 960, 220, "b67:bohns", "b68"),
    I("bk", "book", 960, 600, 340, "pop", "b68:asked", "b70"),
    I("pn", "pen", 1160, 520, 150, "pop", "b68:pen", "b70"),
    T("pk", "“pickle”", 960, 820, 64, "bottom", "b69:pickle", "b70", color="accent", weight=M),
    TOP("t17", "one word, in *pen*", "b68:pen", "b69"),
    TOP("t18", "the word: !pickle!", "b69:pickle", "b70"),
    BAR("g1", 760, 140, "guessed", "muted", "b70:twenty-eight", "b72"),
    PCT("q1", 760, 140, "28%", "b70:twenty-eight", "b72"),
    BAR("g2", 1160, 320, "did it", "accent", "b71:sixty-four", "b72"),
    PCT("q2", 1160, 320, "64%", "b71:sixty-four", "b72"),
    TOP("t19", "they guessed *28%*", "b70:guessed", "b71"),
    TOP("t20", "*64%* wrote pickle", "b71:sixty-four", "b72"),
    ST("hz", 860, GY, "bottom", "b72:many", [["shrug", "b72:hesitated"], ["sorry", "b73:vandalism"], ["give", "b74:did"]], [["o", "b72:hesitated"], ["tight", "b73:vandalism"], ["neutral", "b74:did"]], out="b75"),
    I("hb", "book", 1180, 620, 200, "pop", "b74:did", "b75"),
    TOP("t21", "many *hesitated*", "b72:hesitated", "b73"),
    TOP("t22", "“*vandalism*”", "b73:vandalism", "b74"),
    TOP("t23", "…and did it *anyway*", "b74:did", "b75"),
    ST("fa", 760, GY, "left", "b75:because", [["point", "b75:saying"]], [["smile", "b75:saying"]], out="b77"),
    ST("fb", 1160, GY, "right", "b75:because", [["sorry", "b75:awkward"], ["shrug", "b76:worse"]], [["tight", "b75:awkward"], ["frown", "b76:worse"]], out="b77", flip=True, variant="bow"),
    TOP("t24", "no to someone's *face* is awkward", "b75:no", "b76", size=58),
    TOP("t25", "awkward feels worse than *wrong*", "b76:awkward", "b77"),
    ST("dc", 960, GY, "bottom", "b77:think", [["idle", "b77:think"], ["shrug", "b78:decide"]], [["neutral", "b77:think"], ["o", "b78:mouth"]], out=None),
    BUB("ys", "yes!", 1150, 400, 140, "b78:mouth", None, fontSize=48),
    TOP("t26", "the last time you said *yes*", "b77:last", "b78"),
    TOP("t27", "did *you* decide?", "b78:you"),
]})
# 4 · the future-you trap -----------------------------------------------------------------
scenes.append({"id": "future", "beats": R(79, 95), "elements": [
    I("cal", "calendar", 960, 590, 300, "pop", "b79:trap", "b80"),
    TOP("t0", "another *trap*", "b79:trap", "b79:hiding"),
    TOP("t1", "hiding in your *calendar*", "b79:hiding", "b80"),
    CARD("c1", "2005 · FUTURE TIME", "How much spare time will you have?", "Zauberman & Lynch", 960, 220, "b80:zauberman", "b81"),
    I("hg", "hourglass", 960, 620, 260, "pop", "b80:future", "b81"),
    I("td", "grid", 640, 590, 260, "pop", "b81:spare", "b85"),
    T("tdl", "today", 640, 790, 46, "bottom", "b81:spare", "b85", color="muted"),
    I("nm", "calendar", 1280, 590, 260, "pop", "b82:month", "b85"),
    T("nml", "next month", 1280, 790, 46, "bottom", "b82:month", "b85", color="muted"),
    I("ns", "sun", 1420, 420, 110, "pop", "b83:free", "b85"),
    I("nmo", "money", 960, 430, 110, "pop", "b84:money", "b85"),
    TOP("t2", "spare time *today*?", "b81:spare", "b82"),
    TOP("t3", "…a month from *now*?", "b82:month", "b83"),
    TOP("t4", "more free time in the *future*", "b83:more", "b84"),
    TOP("t5", "more optimistic about *time*", "b84:optimistic", "b85"),
    I("nf", "grid", 960, 590, 300, "pop", "b85:busy", "b86"),
    TOP("t6", "just as *busy*", "b85:busy", "b86"),
    I("gf", "gift", 960, 590, 260, "pop", "b86:favor", "b88"),
    TOP("t7", "a favor in five weeks feels *free*", "b86:favor", "b87", size=58),
    TOP("t8", "a problem for *future* you", "b87:problem", "b88"),
    ST("nw", 700, GY, "left", "b88:then", [["idle", "b88:then"], ["shrug", "b89:job"], ["headDown", "b90:tiredness"]], [["neutral", "b88:then"], ["frown", "b90:tiredness"]], out="b92"),
    ST("fu", 1220, GY, "right", "b88:shows", [["idle", "b88:then"], ["shrug", "b89:job"], ["headDown", "b90:tiredness"]], [["neutral", "b88:then"], ["frown", "b90:tiredness"]], out="b92", flip=True),
    T("nwl", "you", 700, 290, 44, "bottom", "b88:then", "b92", color="muted"),
    T("ful", "future you", 1220, 290, 44, "bottom", "b88:shows", "b92", color="muted"),
    I("j1", "briefcase", 960, 470, 110, "pop", "b89:job", "b90"),
    I("j2", "moon", 960, 470, 110, "pop", "b90:tiredness", "b91"),
    I("j3", "calendar", 960, 470, 110, "pop", "b91:saturday", "b92"),
    TOP("t9", "future you is just *you*", "b88:just", "b89"),
    TOP("t10", "same *job*", "b89:job", "b90"),
    TOP("t11", "same *tiredness*", "b90:tiredness", "b91"),
    TOP("t12", "same *Saturday*", "b91:saturday", "b92"),
    TOP("t13", "the “yes… *damn*” effect", "b92:yes", "b93"),
    ST("yd", 860, GY, "bottom", "b92:nicknamed", [["happy", "b93:yes"], ["holdHead", "b94:damn"]], [["smile", "b93:yes"], ["frown", "b94:damn"]], out="b95"),
    BUB("yy", "yes!", 1060, 400, 140, "b93:yes", "b94", fontSize=48),
    I("yc", "calendar", 1200, 560, 160, "pop", "b94:day", "b95"),
    TOP("t14", "you say *yes*", "b93:yes", "b94"),
    TOP("t15", "…you say !damn!", "b94:damn", "b95"),
    I("pc", "calendar", 960, 590, 280, "pop", "b95:calendar"),
    I("pq", "question", 1220, 440, 120, "pop", "b95:past"),
    TOP("t16", "how many did *past* you agree to?", "b95:how"),
]})
# 5 · who gets asked ----------------------------------------------------------------------
scenes.append({"id": "asked", "beats": R(96, 117), "elements": [
    TOP("t0", "even less *fair*", "b96:fair", "b97"),
    ST("rl", 960, GY, "bottom", "b96:here's", [["happy", "b97:say"], ["strain", "b97:asked"]], [["smile", "b97:say"], ["o", "b97:asked"]], out="b98"),
    I("r1", "chat", 680, 420, 130, "pop", "b97:asked", "b98"),
    I("r2", "letter", 1240, 420, 130, "pop", "b97:most#2", "b98"),
    TOP("t1", "who say yes the most, get asked the *most*", "b97:who", "b98", size=56),
    CARD("c1", "2017 · TASKS NOBODY WANTS", "Work that never gets you promoted", "Babcock et al.", 960, 220, "b98:babcock", "b99"),
    I("cb", "briefcase", 960, 620, 260, "pop", "b98:babcock", "b100"),
    TOP("t2", "never get you *promoted*", "b99:promoted", "b100"),
    I("n1", "clipboard", 560, 590, 220, "pop", "b100:notes", "b103"),
    I("n2", "partyhat", 960, 590, 220, "pop", "b101:party", "b103"),
    I("n3", "chair", 1360, 600, 220, "pop", "b102:committee", "b103"),
    TOP("t3", "taking *notes*", "b100:taking", "b101"),
    TOP("t4", "the office *party*", "b101:office", "b102"),
    TOP("t5", "one more *committee*", "b102:one", "b103"),
    ST("wm", 760, GY, "left", "b103:women", [["victory", "b103:volunteered"]], [["smile", "b103:volunteered"]], out="b104", variant="bow"),
    ST("mn", 1160, GY, "right", "b103:women", [["idle", "b103:women"]], [["neutral", "b103:women"]], out="b104", flip=True),
    TOP("t6", "women volunteered *more*", "b103:volunteered", "b104"),
    BAR("k1", 760, 380, "women", "accent", "b104:seventy-six", "b107"),
    PCT("p1", 760, 380, "76%", "b104:seventy-six", "b107"),
    BAR("k2", 1160, 255, "men", "muted", "b105:fifty-one", "b107"),
    PCT("p2", 1160, 255, "51%", "b105:fifty-one", "b107"),
    TOP("t7", "asked directly: women *76%*", "b104:asked", "b105"),
    TOP("t8", "men: *51%*", "b105:fifty-one", "b106"),
    TOP("t9", "not just who *volunteered*", "b106:volunteered", "b107"),
    *[ST(f"x{i}", x, GY, "left", "b107:both", [["idle", "b107:both"], ["point", "b107:ask"]], [["neutral", "b107:both"]], out="b109", scale=0.7)
      for i, x in enumerate([480, 700, 920])],
    ST("tg", 1360, GY, "right", "b107:both", [["idle", "b107:both"], ["shrug", "b108:yes"]], [["neutral", "b107:both"], ["o", "b107:woman"]], out="b109", scale=0.7, flip=True, variant="bow"),
    TOP("t10", "more likely to ask a *woman*", "b107:likely", "b108"),
    TOP("t11", "who they expected to say *yes*", "b108:expected", "b109"),
    I("w1", "laptop", 560, 590, 220, "pop", "b109:workplace", "b112"),
    I("w2", "house", 960, 590, 220, "pop", "b110:family", "b112"),
    I("w3", "chat", 1360, 590, 220, "pop", "b111:chat", "b112"),
    TOP("t12", "your *workplace*", "b109:workplace", "b110"),
    TOP("t13", "your *family*", "b110:family", "b111"),
    TOP("t14", "your group *chat*", "b111:group", "b112"),
    I("wq", "question", 960, 580, 240, "pop", "b112:who", "b113"),
    TOP("t15", "who always gets *asked*?", "b112:who", "b113"),
    ST("yo", 960, GY, "bottom", "b113:if", [["shrug", "b113:best"], ["headDown", "b114:no"], ["strain", "b115:reliable"]], [["neutral", "b113:if"], ["frown", "b114:no"], ["o", "b116:requests"]], out="b117"),
    TOP("t16", "not because you're the *best*", "b113:not", "b114"),
    TOP("t17", "…because you won't say !no!", "b114:because", "b115"),
    TOP("t18", "the irony of being *reliable*", "b115:irony", "b116"),
    I("s1", "box", 1220, 640, 130, "pop", "b116:reward", "b117"),
    I("s2", "box", 1220, 520, 120, "pop", "b116:helping", "b117"),
    I("s3", "box", 1220, 410, 110, "pop", "b116:requests", "b117"),
    TOP("t19", "the reward: more !requests!", "b116:reward", "b117"),
    HERO("t20", "But it wasn't over yet.", "b117:but", None, size=90),
]})
# 6 · what yes costs, and the word that helps ----------------------------------------------
scenes.append({"id": "cost", "beats": R(118, 147), "elements": [
    I("a1", "box", 760, 620, 150, "pop", "b118:yeses", "b119"),
    I("a2", "box", 960, 620, 150, "pop", "b118:add", "b119"),
    I("a3", "box", 1160, 620, 150, "pop", "b118:up", "b119"),
    TOP("t0", "all those yeses add *up*", "b118:all", "b119"),
    CARD("c1", "2005 · ABOVE AND BEYOND", "Going the extra mile at work", "Bolino & Turnley", 960, 220, "b119:bolino", "b120"),
    I("cb", "briefcase", 960, 620, 260, "pop", "b119:employees", "b120"),
    ST("wk", 820, GY, "left", "b120:staying", [["give", "b120:staying"], ["strain", "b123:overload"], ["holdHead", "b124:conflict"]], [["neutral", "b120:staying"], ["frown", "b123:stress"]], out="b125"),
    I("lp", "laptop", 1120, 600, 220, "pop", "b120:staying", "b125"),
    I("lm", "moon", 1460, 330, 110, "pop", "b120:late", "b123"),
    I("lb", "box", 1460, 560, 130, "pop", "b121:extra", "b123"),
    I("lh", "heart", 1460, 440, 100, "pop", "b122:helping", "b123", color="accent"),
    TOP("t1", "staying *late*", "b120:staying", "b121"),
    TOP("t2", "extra *work*", "b121:extra", "b122"),
    TOP("t3", "helping without being *asked*", "b122:helping", "b123"),
    I("ls", "bolt", 1460, 420, 120, "pop", "b123:stress", "b125"),
    I("lho", "house", 1460, 620, 170, "pop", "b124:home", "b125"),
    TOP("t4", "more overload · more *stress*", "b123:overload", "b124"),
    TOP("t5", "conflict between work and *home*", "b124:conflict", "b125"),
    ST("hp", 960, GY, "bottom", "b125:course", [["happy", "b125:course"], ["give", "b126:best"]], [["smile", "b125:course"]], out="b127"),
    I("hh", "heart", 1200, 470, 110, "pop", "b126:best", "b127", color="accent", pulse=1.12, beat=0.9),
    TOP("t6", "helping isn't the *problem*", "b125:helping", "b126"),
    TOP("t7", "one of the *best* things people do", "b126:best", "b127", size=58),
    TOP("t8", "the yes you didn't *choose*", "b127:yes", "b128"),
    I("yc", "check", 960, 590, 220, "pop", "b127:yes", "b128"),
    I("ye", "check", 520, 590, 200, "pop", "b128:every", "b132"),
    T("yel", "yes", 520, 790, 46, "bottom", "b128:every", "b132", color="muted"),
    I("x1", "moon", 960, 590, 170, "pop", "b129:sleep", "b132"),
    I("x2", "house", 1220, 590, 180, "pop", "b130:family", "b132"),
    I("x3", "notebook", 1480, 590, 180, "pop", "b131:project", "b132"),
    TOP("t9", "every yes is a no to *something*", "b128:every", "b129", size=58),
    TOP("t10", "your *sleep*", "b129:sleep", "b130"),
    TOP("t11", "your *family*", "b130:family", "b131"),
    TOP("t12", "the project you keep *pushing*", "b131:project", "b132"),
    I("hq", "question", 960, 580, 240, "pop", "b132:how", "b133"),
    TOP("t13", "so how do you say *no*?", "b132:how", "b133"),
    CARD("c2", "2012 · TWO TINY PHRASES", "“I can't” vs “I don't”", "Patrick & Hagtvedt", 960, 220, "b133:patrick", "b134"),
    I("cc", "chat", 960, 620, 260, "pop", "b133:patrick", "b134"),
    BUB("b1", "I can't.", 640, 500, 200, "b134:can't", "b137", fontSize=52),
    BUB("b2", "I don't.", 1280, 500, 200, "b134:don't", "b137", fontSize=52),
    TOP("t14", "“I *can't*” · “I *don't*”", "b134:can't", "b135"),
    TOP("t15", "people *practiced* one", "b135:practiced", "b136"),
    TOP("t16", "a thank-you *snack*", "b136:snack", "b137"),
    I("ch", "choc", 760, 600, 230, "pop", "b137:chocolate", "b138"),
    I("gr", "granola", 1160, 600, 240, "pop", "b137:granola", "b138"),
    TOP("t17", "chocolate or *granola*?", "b137:chocolate", "b138"),
    BAR("k1", 760, 380, "I don't", "accent", "b138:sixty-four", "b140"),
    PCT("p1", 760, 380, "64%", "b138:sixty-four", "b140"),
    BAR("k2", 1160, 230, "I can't", "muted", "b139:thirty-nine", "b140"),
    PCT("p2", 1160, 230, "39%", "b139:thirty-nine", "b140"),
    I("gi", "granola", 1520, 520, 170, "pop", "b138:granola", "b140"),
    TOP("t18", "*64%* of “I don't” picked granola", "b138:sixty-four", "b139", size=58),
    TOP("t19", "only *39%* of “I can't”", "b139:only", "b140"),
    ST("me", 760, GY, "left", "b140:can't", [["sorry", "b140:rule"], ["shrug", "b142:once"], ["proud", "b143:don't"]], [["neutral", "b140:rule"], ["frown", "b142:once"], ["smile", "b143:are"]], out="b147"),
    ST("ot", 1160, GY, "right", "b140:can't", [["idle", "b140:rule"], ["point", "b142:can't"], ["idle", "b143:are"]], [["smile", "b140:rule"], ["neutral", "b143:are"]], out="b147", flip=True, variant="bow"),
    BUB("ob", "Can't you just this once?", 1400, 400, 220, "b142:can't", "b144", fontSize=30),
    I("sh", "shield", 520, 430, 120, "pop", "b145:conviction", "b147"),
    TOP("t20", "“I can't” = a *rule*", "b140:rule", "b141"),
    TOP("t21", "it invites a *negotiation*", "b141:invites", "b142"),
    TOP("t22", "“I don't” = who you *are*", "b143:don't", "b144"),
    TOP("t23", "persuaded *other* people too", "b144:persuaded", "b145"),
    TOP("t24", "!conviction!", "b145:conviction", "b146"),
    TOP("t25", "people don't argue with who you *are*", "b146:people", "b147", size=58),
    I("ck", "checklist", 960, 590, 260, "pop", "b147:here's"),
    TOP("t26", "here's what you can *do*", "b147:here's"),
]})
# 7 · five rules ---------------------------------------------------------------------------
scenes.append({"id": "rules", "beats": R(148, 170), "elements": [
    TOP("t1", "rule 1: buy yourself *time*", "b148:rule", "b149"),
    I("hg", "hourglass", 960, 580, 260, "pop", "b148:time", "b150"),
    TOP("t2", "your first *answer*", "b149:first", "b150"),
    BUB("lm", "Let me check and get back to you.", 960, 500, 300, "b150:let", "b152", fontSize=38),
    TOP("t3", "“let me *check*”", "b150:let", "b151"),
    TOP("t4", "a reflex → a *decision*", "b151:reflex", "b152"),
    TOP("t5", "rule 2: make it *tomorrow*", "b152:rule", "b153"),
    I("cl", "calendar", 960, 590, 280, "pop", "b152:tomorrow", "b156"),
    TOP("t6", "next month? ask one *question*", "b153:month", "b154"),
    TOP("t7", "would I say yes *tomorrow*?", "b154:would", "b155"),
    I("nx", "cross", 1260, 450, 110, "pop", "b155:no#2", "b156"),
    TOP("t8", "if no, the answer is !no!", "b155:if", "b156"),
    TOP("t9", "rule 3: “I *don't*,” not “I can't”", "b156:rule", "b157"),
    ST("r3", 640, GY, "left", "b156:rule", [["proud", "b156:don't"]], [["smile", "b156:don't"]], out="b160"),
    BUB("d1", "I don't take on new projects on weekends.", 1100, 420, 260, "b157:take", "b158", fontSize=32),
    BUB("d2", "I don't lend money to friends.", 1100, 420, 240, "b158:lend", "b160", fontSize=34),
    TOP("t10", "a *value*, not an excuse", "b159:value", "b160"),
    TOP("t11", "rule 4: short and *kind*", "b160:rule", "b161"),
    I("pp", "paper", 960, 580, 300, "pop", "b160:short", "b163"),
    TOP("t12", "no three-paragraph *excuse*", "b161:three-paragraph", "b162"),
    TOP("t13", "solve your problem *for* you", "b162:solve", "b163"),
    BUB("ty", "Thank you for asking. I'm going to pass this time.", 960, 520, 320, "b163:thank", "b166", fontSize=34),
    TOP("t14", "“thank you for *asking*”", "b163:thank", "b164"),
    TOP("t15", "“I'm going to *pass*”", "b164:pass", "b165"),
    TOP("t16", "that's !enough!", "b165:enough", "b166"),
    TOP("t17", "rule 5: the other *side*", "b166:rule", "b167"),
    ST("sa", 700, GY, "left", "b166:rule", [["point", "b167:asked"], ["sorry", "b168:no"], ["happy", "b169:probably"]], [["smile", "b166:rule"], ["neutral", "b168:no"], ["smile", "b169:probably"]], out=None,
       move=[[1220, GY, "b167:picture", 1.2]]),
    ST("sb", 1220, GY, "right", "b166:rule", [["idle", "b167:asked"], ["shrug", "b168:no"], ["happy", "b169:probably"]], [["smile", "b166:rule"], ["neutral", "b168:no"], ["smile", "b169:probably"]], out=None,
       flip=True, variant="bow", move=[[700, GY, "b167:picture", 1.2]]),
    TOP("t18", "picture being the one who *asked*", "b167:picture", "b168", size=58),
    TOP("t19", "would you stop being their *friend*?", "b168:stop", "b169"),
    I("fh", "heart", 960, 440, 120, "pop", "b169:probably", None, color="accent", pulse=1.12, beat=0.9),
    TOP("t20", "probably *not*", "b169:probably", "b170"),
    TOP("t21", "they won't *either*", "b170:won't"),
]})
# 8 · the twist and the ending ------------------------------------------------------------
scenes.append({"id": "end", "tail": 2.6, "beats": R(171, 192), "elements": [
    TOP("t0", "here's the !twist!", "b171:twist", "b172", size=80),
    ST("kd", 960, GY, "bottom", "b171:twist", [["idle", "b172:people"], ["happy", "b173:kindest"], ["give", "b174:notice"], ["proud", "b176:beautiful"]], [["neutral", "b172:people"], ["smile", "b173:kindest"]], out="b177"),
    I("kh", "heart", 960, 330, 100, "pop", "b173:kindest", "b177", color="accent", pulse=1.12, beat=0.9),
    I("ke", "eye", 1300, 470, 130, "pop", "b174:notice", "b175"),
    I("kp", "people", 1320, 580, 200, "pop", "b175:letting", "b176"),
    TOP("t1", "aren't *weak*", "b172:weak", "b173"),
    TOP("t2", "the *kindest* people in the room", "b173:kindest", "b174"),
    TOP("t3", "they notice what others *need*", "b174:notice", "b175"),
    TOP("t4", "they hate letting anyone *down*", "b175:hate", "b176"),
    TOP("t5", "a beautiful *thing*", "b176:beautiful", "b177"),
    I("gf", "gift", 960, 590, 280, "pop", "b177:yes", "b179"),
    TOP("t6", "yes means something if no was *possible*", "b177:yes", "b178", size=56),
    TOP("t7", "your yes stops being a *gift*", "b178:stops", "b179"),
    I("gb", "bolt", 960, 590, 240, "pop", "b179:reflex", "b180"),
    TOP("t8", "it becomes a *reflex*", "b179:becomes", "b180"),
    I("gf2", "gift", 960, 590, 280, "pop", "b180:worth", "b181"),
    I("gh", "heart", 1140, 440, 100, "pop", "b180:worth", "b181", color="accent", pulse=1.12, beat=0.9),
    TOP("t9", "saying no makes your yes *worth* something", "b180:saying", "b181", size=56),
    *COUCH("z", "b181:next", "b184", [["idle", "b181:next"], ["give", "b183:say"]], [["neutral", "b181:next"], ["smile", "b183:kindly"]]),
    I("zp", "phone", 1090, 610, 90, "pop", "b181:phone", "b184", sway=8, period=0.25),
    BUB("zb", "I'm going to pass this time.", 1460, 430, 240, "b183:kindly", "b184", fontSize=34),
    TOP("t10", "your phone *buzzes*", "b181:next", "b181:take"),
    TOP("t11", "take a *breath*", "b181:take", "b182"),
    TOP("t12", "if it were *tomorrow*", "b182:if", "b183"),
    TOP("t13", "say it kindly, let it *go*", "b183:say", "b184"),
    TOP("t14", "your *challenge* this week", "b184:challenge", "b185"),
    I("nb", "notebook", 960, 590, 260, "pop", "b184:so", "b185"),
    ST("cn", 800, GY, "left", "b185:say", [["proud", "b185:no"], ["shrug", "b188:minded"]], [["smile", "b185:no"]], out="b189"),
    BUB("cb", "No, thanks.", 1090, 380, 170, "b185:no", "b189", fontSize=34),
    TOP("t15", "say one small !no!", "b185:say", "b186"),
    TOP("t16", "something *easy*", "b186:easy", "b187"),
    TOP("t17", "notice what *happens*", "b187:notice", "b188"),
    TOP("t18", "did anyone even *mind*?", "b188:anyone", "b189"),
    I("eq", "question", 960, 570, 220, "pop", "b189:hardest", "b191:habit"),
    TOP("t19", "the hardest thing you said *yes* to?", "b189:hardest", "b190", size=58),
    TOP("t20", "tell me in the *comments*", "b190:tell", "b191:habit"),
    I("end", "heart", 960, 560, 200, "pop", "b191:habit", None, color="accent", pulse=1.08, beat=1.2),
    TOP("t21", "which habit *next*?", "b191:habit", hero=True, size=80),
    T("t22", "@darealwhy", 960, 820, 44, "bottom", "b192:comments", weight=M, color="muted"),
]})

(ROOT / "script").mkdir(exist_ok=True)
(ROOT / "script/script.json").write_text(json.dumps({"title": "The Psychology of People Who Can't Say No", "scenes": scenes}, indent=1, ensure_ascii=False))
print(sum(len(s["elements"]) for s in scenes), "elements,", len(S), "sentences")
