"""Writes script/script.json for video 6 from timing/words.json (one beat per spoken sentence)
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
scenes.append({"id": "hook", "beats": R(0, 15), "elements": [
    ST("me", 520, 660, "left", "b00:lost", [["holdHead", "b00:lost"], ["shrug", "b03:block"]], [["tight", "b00:lost"]], out="b04"),
    I("map", "map", 860, 560, 200, "pop", "b00:lost", "b04"),
    T("t0", "you're *lost*", 960, 200, 80, "top", "b00:lost", "b01"),
    ST("st", 1400, 660, "right", "b01:person", [["idle", "b01:person"]], [["smile", "b01:person"]], out="b04", flip=True, variant="bow"),
    T("t1", "a person *right there*", 960, 200, 64, "top", "b01:person", "b02"),
    T("t2", "you could just !ask!", 960, 200, 80, "top", "b02:ask", "b03"),
    T("t3", "the same block, *three times*", 960, 200, 64, "top", "b03:block", "b04"),
    ST("w", 760, 660, "left", "b04:buried", [["holdHead", "b04:buried"], ["happy", "b04:fine"]], [["tight", "b04:buried"], ["smile", "b04:fine"]], out="b05"),
    I("bc", "briefcase", 1180, 600, 220, "right", "b04:work", "b05"),
    BUB("ok", "I'm fine.", 760, 300, 260, "b04:say", "b05", fontSize=56),
    T("t4", "sound *familiar*?", 960, 480, 110, "top", "b05:familiar", "b06"),
    T("t5", "here's the *strange* part", 960, 480, 90, "top", "b06:strange", "b07"),
    I("ppl", "people", 960, 500, 260, "pop", "b07:thousands", "b08"),
    T("t6", "tested with *thousands* of strangers", 960, 800, 64, "bottom", "b07:tested", "b08"),
    T("t7", "wrong about almost !everything!", 960, 220, 72, "slam", "b08:wrong", "b12", hero=True),
    T("w1", "how many say *yes*", 960, 420, 60, "left", "b09:yes", "b12"),
    T("w2", "how they'll *feel*", 960, 540, 60, "right", "b10:feel", "b12"),
    T("w3", "how they'll *see you*", 960, 660, 60, "left", "b11:see", "b12"),
    T("t8", "you'll know *why*", 960, 400, 80, "top", "b12:why", "b15"),
    T("t9", "the !one thing! that gets a yes", 960, 560, 72, "bottom", "b13:thing", "b15"),
    T("t10", "it isn't what you'd *guess*", 960, 700, 56, "bottom", "b14:guess", "b15", weight=M),
    T("t11", "almost *300 years* ago", 960, 480, 90, "top", "b15:almost"),
]})
# 2 · Franklin and the book --------------------------------------------------------------------
scenes.append({"id": "franklin", "beats": R(16, 34), "elements": [
    CH("01", "The rival and the *book*", "b16:start", "b17"),
    CARD("card", "THE 1730s · PENNSYLVANIA", "Benjamin Franklin", "clerk of the Assembly", 960, 220, "b17:franklin", "b19"),
    ST("fr", 600, 680, "left", "b17:franklin", [["idle", "b17:franklin"], ["armsCrossed", "b19:speech"], ["give", "b24:wrote"], ["happy", "b27:spoke"]],
       [["neutral", "b17:franklin"], ["tight", "b19:speech"], ["smile", "b24:wrote"]], out="b29", hat=True),
    ST("rv", 1320, 680, "right", "b19:member", [["point", "b19:member"], ["armsCrossed", "b20:grovel"], ["give", "b25:sent"], ["happy", "b27:spoke"]],
       [["tight", "b19:member"], ["neutral", "b25:sent"], ["smile", "b27:spoke"]], out="b29", flip=True),
    T("t1", "a long speech *against* him", 1320, 300, 48, "top", "b19:speech", "b20"),
    T("t2", "no *groveling*", 960, 220, 64, "left", "b20:grovel", "b22"),
    T("t3", "no *fighting*", 960, 320, 64, "right", "b21:fight", "b22"),
    T("t4", "something !strange!", 960, 220, 80, "slam", "b22:strange", "b23"),
    I("bk", "book", 1320, 330, 160, "pop", "b23:book", "b26"),
    T("t5", "a rare *book*", 960, 220, 64, "top", "b23:book", "b24"),
    BUB("ask", "Could I borrow it?", 600, 330, 300, "b24:borrow", "b25", fontSize=46),
    T("t6", "sent *straight away*", 960, 220, 64, "top", "b25:straight", "b26"),
    I("let", "letter", 960, 480, 160, "pop", "b26:thanks", "b27"),
    T("t7", "returned · with *thanks*", 960, 220, 64, "top", "b26:returned", "b27"),
    T("t8", "the man spoke to him · real *courtesy*", 960, 220, 56, "top", "b27:spoke", "b28"),
    T("t9", "!friends! for life", 960, 220, 80, "slam", "b28:friends", "b29", hero=True),
    I("auto", "book", 960, 520, 240, "pop", "b29:autobiography", "b32"),
    T("t10", "Franklin's *autobiography*", 960, 220, 64, "top", "b29:autobiography", "b31"),
    T("t11", "THE BEN FRANKLIN EFFECT", 960, 220, 76, "slam", "b31:kindness", "b32", hero=True),
    T("q1", "“He that has once done you a *kindness*", 960, 790, 46, "bottom", "b31:kindness", "b32", weight=M),
    T("q2", "will be more ready to do you *another*…”", 960, 860, 46, "bottom", "b31:another", "b32", weight=M),
    T("t12", "asking cost him *nothing*", 960, 400, 72, "top", "b32:cost", "b34"),
    T("t13", "it won him a !friend!", 960, 560, 80, "slam", "b33:friend", "b34"),
    T("t14", "so why do we feel the *opposite*?", 960, 480, 80, "top", "b34:opposite"),
]})
# 3 · the experiments --------------------------------------------------------------------------
scenes.append({"id": "tests", "beats": R(35, 62), "elements": [
    CH("02", "The *experiments*", "b35:start", "b35:psychologists"),
    CARD("c1", "STUDY · 1969", "Testing Franklin's idea", "Jecker & Landy", 960, 220, "b35:tested", "b37"),
    I("mn", "money", 960, 520, 220, "pop", "b36:money", "b40"),
    T("t1", "win some *money*", 960, 800, 56, "bottom", "b36:money", "b37"),
    BUB("bk", "Could I have it back?", 960, 300, 360, "b38:back", "b40", fontSize=46),
    T("t2", "his own *pocket*", 960, 820, 56, "bottom", "b39:pocket", "b40"),
    ST("ga", 600, 680, "left", "b40:asked", [["happy", "b40:asked"]], [["smile", "b40:asked"]], out="b43"),
    ST("gb", 1320, 680, "right", "b40:didn't", [["idle", "b40:didn't"]], [["neutral", "b40:didn't"]], out="b43", flip=True, variant="bow"),
    T("l1", "asked for a favor: liked him *more*", 600, 300, 44, "top", "b40:more", "b43"),
    T("l2", "not asked", 1320, 300, 44, "top", "b40:didn't", "b43", color="muted"),
    T("t3", "a favor pulled them !closer!", 960, 1000, 56, "bottom", "b42:closer", "b43"),
    CARD("c2", "STUDY · 2008", "How many asks until a yes?", "Flynn & Lake", 960, 220, "b43:stanford", "b48"),
    T("t4", "how many strangers before a *yes*?", 960, 480, 64, "top", "b44:yes", "b45"),
    T("t5", "“walk me to the *gym*?”", 960, 400, 60, "top", "b45:gym", "b46"),
    BAR("g1", 760, 350, "guessed: ~7 asks", "muted", "b46:seven", "b48"),
    BAR("g2", 1160, 115, "reality: ~2", "accent", "b47:two", "b48"),
    T("t6", "raising money for *charity*", 960, 220, 64, "top", "b48:another", "b51"),
    BAR("f1", 760, 360, "expected: 210 asks", "muted", "b49:two", "b51"),
    BAR("f2", 1160, 210, "needed: 122", "accent", "b50:one", "b51"),
    T("t7", "14,000+ strangers", 960, 220, 64, "top", "b51:fourteen", "b53"),
    T("t8", "yeses underestimated by about *half*", 960, 480, 64, "bottom", "b51:half", "b52"),
    T("t9", "HALF", 960, 480, 170, "slam", "b52:half", "b53", hero=True),
    T("t10", "we expect *no*", 960, 420, 72, "left", "b53:think", "b55"),
    T("t11", "it's mostly !yes!", 960, 560, 80, "right", "b54:yes", "b55"),
    T("t12", "it goes *further*", 960, 480, 80, "top", "b55:further", "b56"),
    T("t13", "something a little bit *wrong*", 960, 220, 64, "top", "b56:strangers", "b58"),
    I("lib", "book", 760, 520, 240, "left", "b57:library", "b59"),
    I("pn", "pen", 1160, 520, 220, "right", "b57:pen", "b59"),
    T("t14", "write !PICKLE! in a library book", 960, 820, 56, "bottom", "b57:pickle", "b59"),
    T("t15", "more agreed than *expected*", 960, 220, 64, "top", "b58:expected", "b59"),
    I("dr", "door", 960, 480, 240, "pop", "b59:strangers", "b60"),
    T("t16", "they'll probably hold a *door*", 960, 800, 64, "bottom", "b59:door", "b60"),
    T("t17", "so why are we so sure they *won't*?", 960, 480, 72, "top", "b60:sure", "b61"),
    I("br", "brain", 960, 460, 240, "pop", "b61:brain", "b62:end"),
    T("t18", "three *predictions*", 960, 760, 64, "bottom", "b61:predictions", "b62:end"),
    T("t19", "all !wrong!", 960, 880, 80, "slam", "b62:wrong", "b62:end", hero=True),
]})
# 4 · three fears ------------------------------------------------------------------------------
scenes.append({"id": "fears", "beats": R(63, 107), "elements": [
    CH("03", "Three *fears*", "b63:start", "b63:needing"),
    T("t0", "needing help = didn't try hard *enough*?", 960, 480, 64, "top", "b63:needing", "b64"),
    T("t1", "three fears in *every ask*", 960, 480, 80, "top", "b64:three", "b65"),
    T("h1", "1 · “they'll say no”", 960, 180, 64, "slam", "b65:fear", "b73"),
    T("t2", "what your brain *forgets*", 960, 480, 72, "top", "b66:forgets", "b67"),
    ST("as", 600, 680, "left", "b67:picture", [["holdHead", "b67:picture"]], [["tight", "b67:picture"]], out="b70"),
    ST("tg", 1320, 680, "right", "b68:theirs", [["shrug", "b68:theirs"]], [["tight", "b68:theirs"]], out="b70", flip=True, variant="bow"),
    T("l1", "your *embarrassment*", 600, 320, 52, "top", "b67:embarrassment", "b70"),
    T("l2", "*theirs*", 1320, 320, 60, "top", "b68:theirs", "b70"),
    T("l3", "saying no is awkward *too*", 960, 1000, 56, "bottom", "b69:awkward", "b70"),
    T("t3", "askers think: how hard to *ask*", 960, 420, 64, "left", "b70:ask", "b72"),
    T("t4", "they forget: how hard to !refuse!", 960, 560, 64, "right", "b71:refuse", "b72"),
    T("t5", "the yeses catch them off *guard*", 960, 480, 72, "top", "b72:yeses", "b73"),
    T("h2", "2 · “I'll be a burden”", 960, 180, 64, "slam", "b73:fear", "b85"),
    CARD("c1", "STUDY · 2022", "2,000+ people", "Zhao & Epley", 960, 380, "b74:twenty", "b75"),
    ST("ak", 600, 680, "left", "b75:asked", [["give", "b75:asked"], ["happy", "b78:helpers"]], [["smile", "b75:asked"]], out="b79"),
    I("cam", "camera", 960, 560, 170, "pop", "b75:photo", "b79"),
    ST("hp", 1320, 680, "right", "b75:strangers", [["idle", "b75:strangers"], ["happy", "b78:better"]], [["neutral", "b75:strangers"], ["smile", "b78:better"]], out="b79", flip=True, variant="bow"),
    T("t6", "expected: *inconvenienced*", 960, 320, 56, "top", "b76:inconvenienced", "b77"),
    T("t7", "they were !wrong!", 960, 320, 72, "slam", "b77:wrong", "b78"),
    T("t8", "more *willing* · felt *better*", 960, 320, 56, "top", "b78:willing", "b79"),
    T("t9", "remember when you *helped*?", 960, 320, 60, "top", "b79:remember", "b82"),
    I("ht", "heart", 960, 560, 220, "pop", "b80:warm", "b82", color="accent"),
    T("t10", "*warm* memories · it felt *good*", 960, 820, 56, "bottom", "b80:warm", "b82"),
    T("t11", "we think we're *taking*", 960, 400, 72, "left", "b82:taking", "b85"),
    T("t12", "we're !giving!", 960, 540, 80, "right", "b83:giving", "b85"),
    T("t13", "a small chance to be *kind*", 960, 680, 56, "bottom", "b84:kind", "b85"),
    T("h3", "3 · “they'll think I'm weak”", 960, 180, 64, "slam", "b85:fear", "b105"),
    T("t14", "the *big* one", 960, 480, 90, "top", "b86:big", "b87"),
    CARD("c2", "STUDY · 2015", "Harvard & Wharton", "Brooks, Gino & Schweitzer", 960, 380, "b87:harvard", "b89"),
    I("pz", "puzzle", 960, 620, 180, "pop", "b88:brainteasers", "b89"),
    T("t15", "~170 people · *brainteasers*", 960, 820, 52, "bottom", "b88:hundred", "b89"),
    ST("a1", 600, 680, "left", "b89:asked", [["point", "b89:asked"]], [["smile", "b89:asked"]], out="b92"),
    ST("a2", 1320, 680, "right", "b90:didn't", [["idle", "b90:didn't"]], [["neutral", "b90:didn't"]], out="b92", flip=True, variant="bow"),
    T("l4", "asked for *advice*", 600, 320, 52, "top", "b89:advice", "b92"),
    T("l5", "didn't ask", 1320, 320, 52, "top", "b90:didn't", "b92", color="muted"),
    T("l6", "rated more !competent!", 960, 1000, 56, "bottom", "b91:competent", "b92"),
    T("t16", "not less", 960, 400, 80, "left", "b92:less", "b94", color="muted"),
    T("t17", "MORE", 960, 580, 150, "slam", "b93:more", "b94", hero=True),
    T("t18", "especially when it's *hard*", 960, 420, 64, "top", "b94:hard", "b96"),
    T("t19", "easy tasks: didn't *hurt*", 960, 560, 56, "bottom", "b95:hurt", "b96"),
    ST("sm", 960, 680, "bottom", "b96:asked", [["victory", "b96:smart"]], [["smile", "b96:smart"]], out="b98"),
    T("t20", "being asked feels *smart*", 960, 300, 64, "top", "b96:smart", "b98"),
    T("t21", "one *catch*", 960, 360, 72, "top", "b98:catch", "b100"),
    T("t22", "ask *directly* · they know the *topic*", 960, 520, 56, "bottom", "b99:directly", "b100"),
    T("t23", "the fear has it !backwards!", 960, 480, 90, "slam", "b100:backwards", "b101", hero=True),
    ST("me", 960, 680, "bottom", "b101:think", [["idle", "b101:think"], ["happy", "b104:flattered"]], [["neutral", "b101:think"], ["smile", "b104:flattered"]], out="b105"),
    T("t24", "someone asked *your* advice", 960, 300, 64, "top", "b101:advice", "b102"),
    T("t25", "did you think *less* of them?", 960, 300, 64, "top", "b102:less", "b103"),
    T("t26", "probably *not*", 960, 300, 72, "top", "b103:not", "b104"),
    T("t27", "you felt !flattered!", 960, 300, 72, "slam", "b104:flattered", "b105"),
    T("t28", "which fear is *yours*?", 960, 360, 80, "top", "b105:yours"),
    T("t29", "1 · 2 · 3", 960, 540, 120, "slam", "b106:number", hero=True),
    T("t30", "put it in the *comments*", 960, 720, 56, "bottom", "b107:comments"),
]})
# 5 · what it costs ---------------------------------------------------------------------------
scenes.append({"id": "cost", "beats": R(108, 119), "elements": [
    CH("04", "What it *costs*", "b108:start", "b109"),
    I("cal", "calendar", 960, 480, 220, "pop", "b109:project", "b110"),
    T("t1", "three days instead of *one*", 960, 780, 64, "bottom", "b109:days", "b110"),
    I("mt", "mountain", 960, 480, 240, "pop", "b110:problem", "b111"),
    T("t2", "the problem *grows*", 960, 780, 64, "bottom", "b110:grows", "b111"),
    I("q", "question", 960, 480, 220, "pop", "b111:question", "b112"),
    T("t3", "the question you never *ask*", 960, 780, 64, "bottom", "b111:ask", "b112"),
    ST("fd", 960, 680, "bottom", "b112:friend", [["give", "b112:helped"]], [["smile", "b112:friend"]], out="b113"),
    T("t4", "a friend who'd help in *ten minutes*", 960, 260, 60, "top", "b112:friend", "b113"),
    ST("al", 960, 680, "bottom", "b113:lonely", [["headDown", "b113:lonely"]], [["frown", "b113:lonely"]], out="b114"),
    T("t5", "carrying *everything* by yourself", 960, 260, 60, "top", "b113:carrying", "b114"),
    CARD("c1", "PSYCHOLOGIST", "Nicholas Epley", "co-author of the 2022 study", 960, 220, "b114:epley", "b117"),
    T("t6", "not asking isn't *kind*", 960, 480, 72, "top", "b115:asking", "b117"),
    T("t7", "it's a little !unkind!", 960, 620, 80, "slam", "b116:unkind", "b117"),
    T("t8", "you take away their *chance to help*", 960, 480, 64, "top", "b117:taking", "b118"),
    T("t9", "it sounds *harsh*", 960, 480, 90, "top", "b118:harsh", "b119"),
    T("t10", "but it wasn't over yet", 960, 480, 100, "slam", "b119:over", hero=True),
]})
# 6 · how to ask ------------------------------------------------------------------------------
scenes.append({"id": "fix", "beats": R(120, 153), "elements": [
    CH("05", "How to *ask*", "b120:start", "b121"),
    T("t0", "how do you *ask*?", 960, 480, 100, "top", "b121:ask", "b122"),
    T("h1", "rule 1 · ask in *person*", 960, 180, 64, "slam", "b122:person", "b140"),
    I("ph", "phone", 560, 540, 200, "pop", "b123:text", "b126"),
    K("k1", 560, 540, 240, "b123:text", "b126"),
    I("em", "letter", 960, 540, 200, "pop", "b124:email", "b126"),
    K("k2", 960, 540, 240, "b124:email", "b126"),
    ST("wk", 1380, 680, "right", "b125:walk", [["point", "b125:walk"]], [["smile", "b125:walk"]], out="b126", flip=True),
    CARD("c1", "STUDY · 2017", "Email vs face to face", "Roghanizad & Bohns", 960, 380, "b126:twenty", "b127"),
    I("em2", "letter", 640, 540, 200, "left", "b127:email", "b130"),
    ST("ff", 1320, 680, "right", "b128:face", [["give", "b128:face"]], [["smile", "b128:face"]], out="b130", flip=True, variant="bow"),
    T("t1", "expected: about the *same*", 960, 1000, 56, "bottom", "b129:same", "b130"),
    T("t2", "!34 TIMES! more effective", 960, 340, 72, "slam", "b130:thirty", "b131", hero=True),
    BAR("e", 760, 14, "email", "muted", "b130:requests", "b131"),
    BAR("p", 1160, 420, "in person", "accent", "b130:thirty", "b131"),
    T("t3", "the twist inside the *twist*", 960, 480, 80, "top", "b131:twist", "b132"),
    I("em3", "letter", 960, 480, 200, "pop", "b132:email", "b134"),
    T("t4", "by email, they *overestimate* the yeses", 960, 780, 56, "bottom", "b133:overestimate", "b134"),
    T("t5", "video & phone: in *between*", 960, 480, 64, "top", "b134:between", "b135"),
    T("t6", "the thing I *promised*", 960, 400, 72, "top", "b135:promised", "b136"),
    T("t7", "not the perfect wording", 960, 400, 72, "top", "b136:wording", "b138", color="muted"),
    T("t8", "SHOWING UP", 960, 560, 120, "slam", "b137:showing", "b138", hero=True),
    I("em4", "letter", 640, 540, 200, "left", "b138:email", "b140"),
    T("t9", "easy to *ignore*", 640, 800, 56, "bottom", "b138:ignore", "b140"),
    ST("pr", 1320, 680, "right", "b139:person", [["idle", "b139:person"]], [["smile", "b139:person"]], out="b140", flip=True, variant="bow"),
    T("t10", "a person is !not!", 1320, 300, 56, "top", "b139:not", "b140"),
    T("h2", "rule 2 · be *specific*", 960, 180, 64, "slam", "b140:specific", "b145"),
    BUB("s1", "Could you look at this for 10 minutes on Friday?", 600, 420, 380, "b141:look", "b145", fontSize=38),
    T("s1l", "easy to say *yes*", 600, 800, 56, "bottom", "b142:yes", "b145"),
    BUB("s2", "Can you help me sometime?", 1320, 420, 320, "b143:help", "b145", fontSize=42),
    T("s2l", "easy to put *off*", 1320, 800, 56, "bottom", "b144:off", "b145"),
    T("h3", "rule 3 · ask for *advice*", 960, 180, 64, "slam", "b145:advice", "b149"),
    BUB("ad", "What would you do?", 960, 420, 340, "b146:what", "b149", fontSize=46),
    T("t11", "makes them the *expert*", 960, 680, 64, "bottom", "b147:expert", "b149"),
    T("t12", "they think *more* of you", 960, 800, 56, "bottom", "b148:more", "b149"),
    T("h4", "rule 4 · make “no” *easy*", 960, 180, 64, "slam", "b149:easy"),
    T("t13", "saying no is *hard*", 960, 360, 64, "left", "b150:hard", "b152"),
    T("t14", "give a real way *out*", 960, 480, 64, "right", "b151:out", "b152"),
    BUB("nw", "No worries if you can't", 960, 420, 360, "b152:worries", fontSize=46),
    T("t15", "pressure → *invitation*", 960, 680, 64, "bottom", "b152:invitation"),
    T("t16", "the yeses will !mean it!", 960, 820, 64, "bottom", "b153:mean"),
]})
# 7 · the twist and the ending -------------------------------------------------------------------
scenes.append({"id": "end", "tail": 2.6, "beats": R(154, 174), "elements": [
    T("t0", "the !twist!", 960, 480, 130, "slam", "b154:twist", "b155", hero=True),
    T("t1", "they think they're *protecting* themselves", 960, 220, 60, "top", "b155:protecting", "b159"),
    T("f1", "from the *no*", 960, 400, 64, "left", "b156:no", "b159"),
    T("f2", "from being a *burden*", 960, 520, 64, "right", "b157:burden", "b159"),
    T("f3", "from looking *weak*", 960, 640, 64, "left", "b158:weak", "b159"),
    T("r1", "the no is *rarer*", 960, 360, 64, "top", "b159:rarer", "b162"),
    T("r2", "the burden is *lighter*", 960, 480, 64, "top", "b160:lighter", "b162"),
    T("r3", "the weakness: in !your head!", 960, 600, 64, "top", "b161:head", "b162"),
    ST("fr", 720, 680, "left", "b162:impressive", [["happy", "b162:impressive"]], [["smile", "b162:impressive"]], out="b164", hat=True),
    ST("rv", 1200, 680, "right", "b162:rival", [["happy", "b162:rival"]], [["smile", "b162:rival"]], out="b164", flip=True),
    I("bk", "book", 960, 380, 150, "pop", "b163:book", "b164"),
    T("t2", "he won him over by *borrowing a book*", 960, 200, 56, "top", "b163:borrow", "b164"),
    T("t3", "let someone !help you!", 960, 480, 90, "slam", "b164:help", "b165", hero=True),
    ST("lo", 600, 680, "left", "b165:lost", [["point", "b165:ask"]], [["smile", "b165:ask"]], out="b167"),
    ST("gd", 1320, 680, "right", "b166:second", [["happy", "b166:second"]], [["smile", "b166:second"]], out="b167", flip=True, variant="bow"),
    T("t4", "just *ask*", 960, 220, 80, "top", "b165:ask", "b167"),
    T("t5", "the *second* person will walk you there", 960, 1000, 52, "bottom", "b166:second", "b167"),
    T("t6", "your *challenge* this week", 960, 220, 72, "top", "b167:challenge", "b171"),
    T("t7", "one person · one small, specific thing", 960, 440, 56, "bottom", "b168:small", "b171"),
    T("t8", "in !person!", 960, 580, 90, "slam", "b169:person", "b171"),
    T("t9", "then tell me what *happened*", 960, 760, 56, "bottom", "b170:happened", "b171"),
    T("t10", "never ask, or always *help*?", 960, 200, 72, "top", "b171:never"),
    I("pp", "people", 960, 480, 220, "pop", "b171:never"),
    T("t11", "which habit *next*?", 960, 760, 80, "bottom", "b173:habit", hero=True),
    T("t12", "@darealwhy", 960, 880, 48, "bottom", "b174:comments", weight=M, color="muted"),
]})

(ROOT / "script").mkdir(exist_ok=True)
(ROOT / "script/script.json").write_text(json.dumps({"title": "The Psychology of People Who Never Ask for Help", "scenes": scenes}, indent=1, ensure_ascii=False))
print(sum(len(s["elements"]) for s in scenes), "elements,", len(S), "sentences")
