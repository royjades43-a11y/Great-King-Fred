"""Writes script/script.json for video 8 from timing/words.json (one beat per spoken sentence)
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
# 1 · hook ------------------------------------------------------------------------------
scenes.append({"id": "hook", "beats": R(0, 14), "elements": [
    ST("me", 560, 660, "left", "b00:open", [["idle", "b00:open"], ["headDown", "b02:type"], ["shrug", "b04:busy"]], [["neutral", "b00:open"], ["tight", "b04:busy"]], out="b08"),
    I("ph", "phone", 820, 560, 200, "pop", "b00:chat", "b08"),
    T("t1", "last message: *4 months ago*", 1360, 260, 56, "top", "b01:four", "b04"),
    BUB("m1", "Hey, how've you been?", 1360, 470, 340, "b02:hey", "b04", fontSize=46),
    K("k1", 1360, 470, 380, "b03:delete", "b04"),
    T("e1", "they're probably *busy*", 1360, 300, 60, "right", "b04:busy", "b08"),
    T("e2", "it's been too *long*", 1360, 420, 60, "right", "b05:long", "b08"),
    T("e3", "it would be *weird*", 1360, 540, 60, "right", "b06:weird", "b08"),
    T("e4", "if they wanted to talk, !they'd text you!", 1360, 700, 48, "bottom", "b07:wanted", "b08"),
    T("t2", "sound *familiar*?", 960, 480, 110, "top", "b08:familiar", "b09"),
    T("t3", "here's the *strange* part", 960, 480, 90, "top", "b09:strange", "b10"),
    *pair("p", "b10:other", "b11", [["headDown", "b10:other"]], [["headDown", "b10:friend"]]),
    T("t4", "your friend: !the same thing!", 960, 200, 72, "top", "b10:same", "b11"),
    I("fl", "flask", 960, 520, 240, "pop", "b11:tested", "b12"),
    T("t5", "psychologists *tested* it", 960, 800, 72, "bottom", "b11:tested", "b12"),
    T("t6", "the senders got it !wrong!", 960, 460, 100, "slam", "b12:wrong", "b13", hero=True),
    T("t7", "you'll know *why*", 960, 400, 80, "top", "b13:why"),
    T("t8", "and why your friend is !waiting for you!", 960, 560, 72, "bottom", "b14:waiting"),
]})
# 2 · the reach-out experiments -----------------------------------------------------------
scenes.append({"id": "study", "beats": R(15, 39), "elements": [
    CH("01", "The *reach-out* experiments", "b15:start", "b15:liu"),
    CARD("card", "STUDY · 2022", "The surprise of reaching out", "Peggy Liu et al.", 960, 220, "b15:liu", "b17"),
    T("t1", "REACHING OUT", 960, 520, 110, "slam", "b16:reaching", "b17", hero=True),
    T("t2", "!5,900+! people · !13! experiments", 960, 480, 90, "slam", "b17:five", "b18", hero=True),
    ST("sa", 540, 680, "left", "b18:reaching", [["point", "b18:reaching"]], [["smile", "b18:reaching"]], out="b20"),
    ST("sb", 1380, 680, "right", "b18:them", [["idle", "b18:them"], ["happy", "b19:higher"]], [["smile", "b18:them"]], out="b20", flip=True, variant="bow"),
    T("l1", "remembered *reaching out*", 540, 260, 46, "top", "b18:reaching", "b20"),
    T("l2", "remembered *being contacted*", 1380, 260, 46, "top", "b18:them", "b20"),
    T("l3", "appreciated it !more! than senders imagined", 960, 960, 48, "bottom", "b19:higher", "b20"),
    T("t3", "then: *for real*", 960, 220, 72, "top", "b20:really", "b23"),
    I("let", "letter", 760, 540, 260, "left", "b21:note", "b23"),
    I("ck", "cookie", 1180, 560, 200, "right", "b22:cookies", "b23"),
    T("t4", "how much did they *appreciate* it?", 960, 220, 64, "top", "b23:both", "b27"),
    BAR("g", 760, 220, "senders' guess", "muted", "b25:guessed", "b31"),
    BAR("r", 1160, 420, "how they really felt", "accent", "b26:truth", "b31"),
    T("t5", "senders !underestimated! it", 960, 220, 72, "top", "b27:underestimated", "b31"),
    T("t6", "not once · *again and again*", 960, 330, 52, "bottom", "b28:once", "b31", weight=M),
    T("t7", "the part that matters *most*", 960, 480, 90, "top", "b31:most", "b32"),
    T("t8", "more surprising = !bigger gap!", 960, 260, 80, "top", "b32:bigger", "b35"),
    T("t9", "from someone you'd *drifted from*", 960, 480, 64, "left", "b33:close", "b35"),
    T("t10", "out of the *blue*", 960, 620, 64, "right", "b34:blue", "b35"),
    T("t11", "think about *that*", 960, 480, 100, "top", "b35:think", "b36"),
    BUB("b1", "it's been too long", 960, 400, 340, "b36:stops", "b38", fontSize=52),
    T("t12", "is exactly what makes it !land!", 960, 700, 72, "bottom", "b37:exactly", "b38"),
    I("gift", "gift", 960, 480, 260, "pop", "b38:gift", "b39"),
    T("t13", "the weirdness is !the gift!", 960, 800, 72, "bottom", "b38:weirdness", "b39"),
    T("t14", "so why don't we *send it*?", 960, 480, 100, "top", "b39:send"),
]})
# 3 · three stories ------------------------------------------------------------------------
scenes.append({"id": "stories", "beats": R(40, 82), "elements": [
    CH("02", "Three *stories*", "b40:start", "b41"),
    T("t0", "all three are !wrong!", 960, 480, 110, "slam", "b41:wrong", "b42", hero=True),
    T("h1", "1 · “they don't want to hear from me”", 960, 180, 64, "slam", "b42:story", "b54"),
    CARD("c1", "CALLBACK · VIDEO 4", "The liking gap", "Boothby et al., 2018", 960, 380, "b43:liking", "b46"),
    T("t1", "they liked you *more* than you think", 960, 620, 60, "bottom", "b44:underestimate", "b46"),
    T("t2", "even *dormmates*, after months", 960, 740, 52, "bottom", "b45:dormmates", "b46", weight=M),
    I("ph", "phone", 960, 560, 240, "pop", "b46:carry", "b50"),
    T("t3", "every awkward *pause*", 440, 560, 56, "left", "b47:pause", "b50"),
    T("t4", "when they laughed", 1460, 560, 56, "right", "b48:laughed", "b50"),
    K("k1", 1460, 560, 530, "b48:forget", "b50"),
    T("t5", "silence = they've moved on?", 960, 860, 60, "bottom", "b49:silence", "b50"),
    T("t6", "they're *busy*", 640, 480, 80, "left", "b50:busy", "b52"),
    T("t7", "or !waiting for you!", 1280, 480, 80, "right", "b51:waiting", "b52"),
    T("t8", "not a *verdict*", 960, 420, 90, "top", "b52:friend", "b54"),
    T("t9", "a !gap!", 960, 620, 130, "slam", "b53:gap", "b54", hero=True),
    T("h2", "2 · “it'll be awkward”", 960, 180, 64, "slam", "b54:story", "b67"),
    CARD("c2", "STUDY · 2018", "Undervaluing gratitude", "Kumar & Epley", 960, 380, "b55:kumar", "b57"),
    I("let", "letter", 960, 660, 220, "pop", "b56:letter", "b57"),
    ST("w", 600, 680, "left", "b57:writers", [["holdHead", "b57:writers"], ["armsCrossed", "b61:worried"], ["idle", "b64:editing"]], [["tight", "b57:writers"]], out="b66"),
    ST("rc", 1320, 680, "right", "b57:receiver", [["idle", "b57:receiver"], ["happy", "b59:happy"]], [["neutral", "b57:receiver"], ["smile", "b59:happy"]], out="b66", flip=True, variant="bow"),
    T("l1", "expected: *awkward*", 600, 320, 56, "top", "b58:awkward", "b60"),
    T("l2", "really: much !happier!", 1320, 320, 56, "top", "b59:happy", "b60"),
    T("t10", "the human *detail*", 960, 320, 64, "top", "b60:human", "b61"),
    BUB("b1", "the right words…", 330, 400, 300, "b61:words", "b64", fontSize=46),
    I("hrt", "heart", 1320, 360, 160, "pop", "b63:warmth", "b64", color="accent"),
    T("t11", "you edit a *sentence*", 600, 960, 56, "left", "b64:editing", "b66"),
    T("t12", "they read a !feeling!", 1320, 960, 56, "right", "b65:feeling", "b66"),
    T("t13", "deleted for not sounding *perfect*?", 960, 520, 80, "top", "b66:delete", "b67"),
    T("h3", "3 · “if they cared, they'd text first”", 960, 180, 60, "slam", "b67:story", "b83"),
    T("t14", "feels like *self-respect*", 960, 480, 80, "top", "b68:selfrespect", "b69"),
    T("t15", "you texted *last time*", 960, 420, 72, "left", "b69:texted", "b71"),
    T("t16", "*their* turn", 960, 560, 72, "right", "b70:turn", "b71"),
    T("t17", "Clark & Mills: *two kinds* of relationship", 960, 300, 52, "top", "b71:clark", "b72", weight=M),
    T("x1", "EXCHANGE", 600, 330, 72, "left", "b72:exchange", "b76", hero=True),
    I("rec", "paper", 600, 560, 220, "left", "b72:score", "b76"),
    T("x2", "keep *score*", 600, 780, 56, "bottom", "b72:score", "b76"),
    T("x3", "you did this → I *owe* you", 600, 880, 44, "bottom", "b73:owe", "b76", weight=M, color="muted"),
    T("y1", "COMMUNAL", 1320, 330, 72, "right", "b75:communal", "b76", hero=True),
    I("hrt2", "heart", 1320, 560, 200, "right", "b75:communal", "b76", color="accent"),
    T("y2", "give because you *care*", 1320, 780, 56, "bottom", "b75:care", "b76"),
    T("t18", "a strict score = *exchange*", 960, 480, 80, "top", "b76:score", "b77"),
    T("t19", "a friend → a !transaction!", 960, 480, 90, "slam", "b77:transaction", "b78"),
    T("t20", "the *irony*", 960, 400, 90, "top", "b78:irony", "b80"),
    T("t21", "your friend keeps the *same score*", 960, 560, 64, "bottom", "b79:score", "b80"),
    *pair("w2", "b80:two", "b83", [["headDown", "b80:two"]], [["headDown", "b80:two"]]),
    T("t22", "both waiting for *proof*", 960, 320, 60, "top", "b80:prove", "b81"),
    T("t23", "both feel *forgotten*", 960, 320, 60, "top", "b81:forgotten", "b82"),
    T("t24", "neither one !forgot!", 960, 320, 72, "slam", "b82:forgot", "b83", hero=True),
]})
# 4 · what it costs ---------------------------------------------------------------------
scenes.append({"id": "cost", "beats": R(83, 123), "elements": [
    CH("03", "What it *costs*", "b83:start", "b84"),
    *pair("c", "b84:catch", "b89", [["happy", "b84:catch"], ["idle", "b86:nobody"]], [["happy", "b85:definitely"], ["idle", "b86:nobody"]], phones=False,
          ma=[["smile", "b84:catch"], ["neutral", "b86:nobody"]], mb=[["smile", "b85:definitely"], ["neutral", "b86:nobody"]]),
    BUB("q1", "We should catch up soon!", 600, 260, 340, "b84:catch", "b86", fontSize=44),
    BUB("q2", "Definitely!", 1320, 260, 260, "b85:definitely", "b86", fontSize=52),
    T("t1", "…and then nobody does", 960, 220, 64, "top", "b86:nobody", "b88"),
    T("t2", "both assumed the *other* would plan it", 960, 220, 60, "top", "b88:assumed", "b89"),
    T("t3", "what if nobody goes *first*?", 960, 480, 90, "top", "b89:first", "b90"),
    T("t4", "not dramatic", 960, 420, 72, "left", "b90:dramatic", "b92"),
    T("t5", "that's the !problem!", 960, 560, 80, "right", "b91:problem", "b92"),
    T("t6", "no big *fight*", 960, 420, 72, "top", "b92:fight", "b94"),
    T("t7", "just a pause that gets !longer!", 960, 560, 72, "bottom", "b93:longer", "b94"),
    CARD("c1", "STUDY · 2018", "How many hours make a friend?", "Jeffrey Hall", 960, 200, "b94:hall", "b98"),
    BAR("h1", 560, 100, "casual friend · 50 h", "muted", "b95:fifty", "b98"),
    BAR("h2", 960, 180, "friend · 90 h", "muted", "b96:ninety", "b98"),
    BAR("h3", 1360, 400, "close friend · 200+ h", "accent", "b97:two", "b98"),
    T("t8", "they don't happen on their *own*", 960, 420, 72, "top", "b98:own", "b100:layers"),
    T("t9", "someone has to !start! them", 960, 560, 80, "bottom", "b99:start", "b100:layers"),
    T("t10", "Dunbar: friendships sit in *layers*", 960, 180, 60, "top", "b100:layers", "b108"),
    I("ring", "circles", 960, 590, 520, "pop", "b100:layers", "b108"),
    T("n5", "5", 960, 590, 64, "pop", "b101:five", "b108", hero=True),
    T("n15", "15", 960, 472, 44, "pop", "b102:fifteen", "b108"),
    T("f5", "5 → *weekly*", 1520, 480, 56, "right", "b104:weekly", "b108"),
    T("f15", "15 → *monthly*", 1520, 600, 56, "right", "b105:monthly", "b108"),
    T("o1", "friends don't *leave*", 400, 480, 52, "left", "b106:leave", "b108"),
    T("o2", "they slide !outward!", 400, 600, 56, "left", "b107:outward", "b108"),
    CARD("c2", "STUDY · 18 MONTHS", "Moving away to university", "Roberts & Dunbar", 960, 220, "b108:students", "b111:effort"),
    T("t11", "less contact → friendships *faded*", 960, 480, 72, "top", "b109:faded", "b111:effort"),
    T("t12", "faster than *family* ties", 960, 620, 60, "bottom", "b110:family", "b111:effort"),
    T("t13", "the ones that survived: *effort*", 960, 220, 64, "top", "b111:effort", "b114"),
    I("ph", "phone", 600, 520, 220, "left", "b112:phone", "b114"),
    T("l1", "women: *talking*", 600, 780, 60, "bottom", "b112:women", "b114"),
    I("tk", "ticket", 1320, 520, 220, "right", "b113:together", "b114"),
    T("l2", "men: *doing things together*", 1320, 780, 60, "bottom", "b113:men", "b114"),
    T("t14", "a lot of people feel the *cost*", 960, 480, 90, "top", "b114:cost", "b115"),
    T("t15", "adults with *no close friends*", 960, 220, 64, "top", "b115:close", "b118"),
    BAR("s1", 1160, 288, "2021: 12%", "accent", "b115:twelve", "b118"),
    BAR("s2", 760, 72, "1990: 3%", "muted", "b116:three", "b118"),
    T("s3", "men: !15%!", 1560, 480, 80, "right", "b117:fifteen", "b118"),
    T("t16", "not only about *feelings*", 960, 480, 90, "top", "b118:feelings", "b119"),
    CARD("c3", "REVIEW · 148 STUDIES", "300,000+ people", "Holt-Lunstad et al., 2010", 960, 220, "b119:review", "b121"),
    T("t17", "strong ties: !+50%! odds of survival", 960, 520, 84, "slam", "b120:fifty", "b121", hero=True),
    I("cig", "cigarette", 960, 480, 320, "pop", "b121:smoking", "b122"),
    T("t18", "Surgeon General, 2023: like smoking up to *15 a day*", 960, 760, 52, "bottom", "b121:surgeon", "b122"),
    I("ph2", "phone", 960, 480, 260, "pop", "b122:message", "b123"),
    T("t19", "one message !nobody sent!", 960, 800, 72, "bottom", "b122:nobody", "b123"),
    T("t20", "but it wasn't over yet", 960, 480, 100, "slam", "b123:over", hero=True),
]})
# 5 · how to text first -----------------------------------------------------------------------
scenes.append({"id": "fix", "beats": R(124, 154), "elements": [
    CH("04", "How to text *first*", "b124:start", "b125"),
    T("t1", "not the gift", 600, 420, 64, "left", "b125:gift", "b128", color="muted"),
    T("t2", "not the wording", 1320, 420, 64, "right", "b126:wording", "b128", color="muted"),
    T("t3", "the !surprise!", 960, 620, 120, "slam", "b127:surprise", "b128", hero=True),
    T("t4", "someone *thought of them*", 960, 480, 90, "top", "b128:thought", "b129"),
    T("t5", "what your friend wants *too*", 960, 400, 72, "top", "b129:wants", "b130"),
    T("t6", "not a perfect message", 960, 400, 72, "top", "b130:perfect", "b132", color="muted"),
    T("t7", "proof you !crossed their mind!", 960, 560, 80, "bottom", "b131:proof", "b132"),
    T("t8", "so how do you *do it*?", 960, 480, 100, "top", "b132:do", "b133"),
    I("cl", "checklist", 360, 540, 300, "left", "b133:rule", "b152"),
    T("r1", "1 · don't wait for a *reason*", 1100, 200, 56, "right", "b133:reason", "b152"),
    T("e1", "“saw this and thought of you”", 1100, 268, 40, "right", "b134:saw", "b152", weight=M, color="muted"),
    T("r2", "2 · skip the *apology*", 1100, 370, 56, "right", "b136:apology", "b152"),
    T("e2", "“it's been forever, I miss talking to you”", 1100, 438, 40, "right", "b138:forever", "b152", weight=M, color="muted"),
    T("r3", "3 · say something *real*", 1100, 540, 56, "right", "b139:real", "b152"),
    T("e3", "“what's been the best part of your month?”", 1100, 608, 40, "right", "b142:best", "b152", weight=M, color="muted"),
    T("r4", "4 · stop keeping *score*", 1100, 710, 56, "right", "b144:score", "b152"),
    T("r5", "5 · make it a *habit*", 1100, 820, 56, "right", "b147:habit", "b152"),
    T("e5", "one person a week · about 10 seconds", 1100, 888, 40, "right", "b148:person", "b152", weight=M, color="muted"),
    T("t9", "the best part?", 960, 360, 90, "top", "b152:best"),
    T("t10", "it doesn't have to be *perfect*", 960, 520, 72, "bottom", "b153:perfect"),
    T("t11", "it just has to be !sent!", 960, 680, 90, "slam", "b154:sent", hero=True),
]})
# 6 · the twist and the ending -------------------------------------------------------------------
scenes.append({"id": "end", "tail": 2.6, "beats": R(155, 173), "elements": [
    T("t0", "the !twist!", 960, 480, 130, "slam", "b155:twist", "b156", hero=True),
    T("t1", "usually aren't *cold*", 960, 360, 80, "top", "b156:usually", "b159"),
    T("t2", "they care a *lot*", 960, 500, 80, "left", "b157:lot", "b159"),
    T("t3", "afraid of caring !more!", 960, 640, 80, "right", "b158:afraid", "b159"),
    *pair("f", "b159:person", "b165", [["headDown", "b159:person"], ["point", "b163:first"], ["happy", "b164:you"]], [["headDown", "b159:person"], ["happy", "b164:you"]],
          ma=[["neutral", "b159:person"], ["smile", "b163:first"]], mb=[["neutral", "b159:person"], ["smile", "b164:you"]]),
    T("t4", "not annoyed · not busy forever", 960, 200, 60, "top", "b159:annoyed", "b161"),
    T("t5", "they'd *love* to hear from you", 960, 200, 64, "top", "b161:love", "b163"),
    T("t6", "someone has to go *first*", 960, 200, 64, "top", "b163:first", "b165"),
    BUB("hi", "Hey! I miss you", 1580, 400, 280, "b163:first", "b165", fontSize=46),
    T("t7", "why not !you!?", 960, 960, 80, "slam", "b164:you", "b165", hero=True),
    T("t8", "your *challenge* for today", 960, 220, 72, "top", "b165:challenge", "b170"),
    I("ph", "phone", 960, 520, 260, "pop", "b166:think", "b170"),
    T("t9", "one person · one message · no reason", 960, 800, 56, "bottom", "b167:send", "b169"),
    T("t10", "then tell me what they *said*", 960, 800, 60, "bottom", "b169:said", "b170"),
    T("t11", "do *you* text first?", 960, 200, 90, "top", "b170:texts"),
    I("ph2", "phone", 960, 480, 220, "pop", "b170:friend"),
    T("t12", "which habit *next*?", 960, 760, 80, "bottom", "b172:habit", hero=True),
    T("t13", "@darealwhy", 960, 880, 48, "bottom", "b173:comments", weight=M, color="muted"),
]})

(ROOT / "script").mkdir(exist_ok=True)
(ROOT / "script/script.json").write_text(json.dumps({"title": "The Psychology of People Who Never Text First", "scenes": scenes}, indent=1, ensure_ascii=False))
print(sum(len(s["elements"]) for s in scenes), "elements,", len(S), "sentences")
