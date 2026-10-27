"""Writes script/script.json for video 4 from timing/words.json (one beat per spoken sentence)
plus the hand-placed elements below. Cues are "bNN:word" = that word of sentence NN.
The voice reads script/tts.txt, so cue words are its spellings ("twenty", "Dezzy", "ree-runs")."""
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
# 1 · hook ------------------------------------------------------------------------------
riders = [ST(f"r{i}", 420 + i * 270, 700, "bottom", "b00:commuters", [["headDown", "b00:commuters"], ["happy", "b04:talkers"]],
             [["neutral", "b00:commuters"], ["smile", "b04:talkers"]], out="b05", scale=0.55, flip=i % 2 == 1, delay=0.06 * i) for i in range(5)]
scenes.append({"id": "hook", "beats": R(0, 6), "elements": [
    I("train", "train", 960, 600, 360, "none", "b00:start", "b00:commuters", startAtZero=True),
    T("t0", "*Chicago* · 2014", 960, 220, 72, "top", "b00:chicago", "b01"),
    *riders,
    T("t1", "talk to the *stranger* next to you", 960, 220, 64, "top", "b01:stranger", "b02"),
    T("t2", "prediction: a !worse! ride", 960, 220, 72, "top", "b02:worse", "b03"),
    T("t3", "they were !wrong!", 960, 220, 96, "slam", "b03:wrong", "b04", hero=True),
    T("t4", "talkers: a *happier* commute", 960, 220, 72, "top", "b04:happier", "b05"),
    T("t5", "so why do we *hate* small talk?", 960, 400, 80, "slam", "b05:hate", "b06"),
    I("brain", "brain", 960, 520, 260, "pop", "b06:brain"),
    T("t6", "what your brain gets !wrong!", 960, 820, 72, "bottom", "b06:wrong"),
]})
# 2 · the enemy alien who named small talk -------------------------------------------------
scenes.append({"id": "origins", "beats": R(7, 25), "elements": [
    CH("01", "Bonding through *words*", "b07:start", "b07:island"),
    I("palm", "palm", 1380, 560, 320, "right", "b07:tropical", "b13"),
    ST("m", 600, 640, "left", "b07:man", [["idle", "b07:man"], ["proud", "b08:name"], ["shrug", "b10:enemy"], ["happy", "b11:working"], ["point", "b13:noticed"]],
       [["neutral", "b07:man"], ["smile", "b08:name"], ["o", "b10:enemy"], ["smile", "b11:working"]], out="b14"),
    CARD("card", "ANTHROPOLOGIST · POLAND", "Bronisław Malinowski", "1884–1942", 960, 220, "b08:name", "b09"),
    T("t1", "WWI · *Austro-Hungarian* papers", 960, 220, 64, "top", "b09:war", "b10"),
    STAMP("st", "ENEMY ALIEN", 1300, 300, 72, "b10:enemy", "b11"),
    T("t2", "free to keep *working*", 960, 220, 64, "top", "b11:working", "b12"),
    I("nb", "notebook", 1000, 560, 200, "pop", "b12:recording", "b14"),
    T("t3", "the *Trobriand Islands*", 960, 220, 64, "top", "b12:trobriand", "b13"),
    T("t4", "something *odd*", 960, 220, 72, "top", "b13:odd", "b14"),
    T("t5", "talk with no real !information!", 960, 300, 72, "top", "b14:information", "b18"),
    BUB("q1", "How are you?", 480, 620, 260, "b15:how", "b18", fontSize=44),
    BUB("q2", "Nice weather.", 960, 760, 260, "b16:nice", "b18", fontSize=44),
    BUB("q3", "Where are you going?", 1440, 620, 300, "b17:where", "b18", fontSize=40),
    T("t6", "PHATIC COMMUNION", 960, 440, 130, "slam", "b18:phatic", "b20", hero=True),
    T("t7", "Malinowski, 1923", 960, 300, 48, "bottom", "b18:nineteen", "b19", weight=M, color="muted"),
    T("t8", "bonding through *words*", 960, 610, 72, "bottom", "b19:bonding", "b20"),
    T("t9", "not *what* you say", 960, 400, 90, "top", "b20:say", "b21"),
    T("t10", "but *that* you said something", 960, 560, 80, "bottom", "b21:something", "b22"),
    ST("s1", 640, 640, "left", "b22:nobody", [["armsCrossed", "b22:nobody"]], [["tight", "b22:nobody"]], out="b26"),
    ST("s2", 1280, 640, "right", "b22:spoke", [["armsCrossed", "b22:spoke"], ["happy", "b25:threat"]], [["tight", "b22:spoke"], ["smile", "b25:threat"]], out="b26", flip=True),
    T("t11", "a stranger's !silence!", 960, 220, 72, "top", "b23:silence", "b24"),
    I("al", "alarm", 960, 500, 200, "pop", "b24:alarming", "b25"),
    T("t12", "isn't reassuring. it's !alarming!", 960, 220, 64, "top", "b24:alarming", "b25"),
    BUB("q4", "I'm not a threat.", 960, 360, 300, "b25:threat", fontSize=50),
]})
# 3 · the original social glue ---------------------------------------------------------------
scenes.append({"id": "glue", "beats": R(26, 39), "elements": [
    CH("02", "The original *social glue*", "b26:start", "b27:look", "right"),
    ST("a", 760, 660, "left", "b28:monkeys", [["give", "b28:monkeys"]], [["smile", "b28:monkeys"]], scale=0.8, out="b31"),
    ST("b", 1160, 660, "right", "b28:grooming", [["headDown", "b28:grooming"]], [["smile", "b28:grooming"]], scale=0.8, flip=True, out="b31"),
    T("t1", "primates bond by *grooming*", 960, 220, 72, "top", "b28:grooming", "b29"),
    T("t2", "up to *a fifth* of the day", 960, 220, 72, "top", "b29:fifth", "b30"),
    T("t3", "slow · quiet · *one-on-one*", 960, 220, 72, "top", "b30:slow", "b31"),
    CARD("card", "PSYCHOLOGY · ROBIN DUNBAR", "Grooming, gossip & language", "the grooming hypothesis", 960, 230, "b31:dunbar", "b32"),
] + [ST(f"g{i}", 330 + (i % 6) * 252, 560 + (i // 6) * 250, "bottom", "b32:groom", [["idle", "b32:groom"]], [["neutral", "b32:groom"]],
        scale=0.38, out="b34", delay=0.03 * i) for i in range(12)] + [
    T("t4", "you can't groom *50 friends*", 960, 220, 72, "top", "b32:fifty", "b33"),
    I("chat", "chat", 960, 900, 160, "pop", "b33:talk", "b34"),
    T("t5", "but you can *talk* to several", 960, 220, 72, "top", "b33:talk", "b34"),
    T("t6", "talk took grooming's *job*", 960, 470, 90, "slam", "b34:job", "b35"),
    BAR("bar1", 760, 360, "social topics", "accent", "b35:social", "b39"),
    BAR("bar2", 1160, 180, "everything else", "muted", "b35:topics", "b39"),
    T("t7", "about *two-thirds* of conversation", 960, 220, 64, "top", "b35:twothirds", "b36"),
    T("w1", "who did *what*", 960, 200, 56, "left", "b36:did", "b39"),
    T("w2", "who said *what*", 960, 280, 56, "right", "b37:said", "b39"),
    T("w3", "how everyone's *doing*", 960, 360, 56, "left", "b38:doing", "b39"),
    T("t8", "the pointless talk !was the point!", 960, 500, 80, "slam", "b39:point", hero=True),
]})
# 4 · a few seconds, a whole career ------------------------------------------------------------
scenes.append({"id": "ties", "beats": R(40, 63), "elements": [
    CARD("card", "STUDY · 2014 · VANCOUVER", "The Starbucks study", "Sandstrom & Dunn", 960, 220, "b40:coffee", "b42"),
    I("cup", "coffee", 960, 600, 240, "pop", "b40:coffee", "b44"),
    ST("fast", 520, 650, "left", "b42:efficient", [["point", "b42:efficient"], ["idle", "b45:mood"]], [["tight", "b42:efficient"]], out="b48"),
    T("e1", "be *efficient*", 520, 220, 64, "left", "b42:efficient", "b45"),
    T("e2", "get in, pay, get out", 520, 300, 48, "left", "b43:get", "b45", weight=M, color="muted"),
    ST("chat", 1400, 650, "right", "b44:other", [["happy", "b44:smile"], ["give", "b44:chat"], ["victory", "b45:better"]],
       [["smile", "b44:smile"]], out="b48", flip=True),
    T("e3", "smile · eye contact · *chat*", 1400, 220, 56, "right", "b44:smile", "b45"),
    T("t1", "a better *mood*", 1400, 220, 72, "top", "b45:mood", "b46"),
    T("t2", "more *belonging*", 1400, 220, 72, "top", "b46:belonging", "b47"),
    T("t3", "from a *few seconds* with a stranger", 960, 220, 60, "top", "b47:seconds", "b48"),
    T("t4", "more than a good *mood*", 960, 480, 90, "top", "b48:mood", "b49"),
    CARD("card2", "SOCIOLOGY · 1973", "Mark Granovetter", "people who had just changed jobs", 960, 220, "b49:sociologist", "b52"),
    I("bc", "briefcase", 960, 560, 240, "pop", "b49:jobs", "b51"),
    T("t5", "*more than half*: through a contact", 960, 820, 64, "bottom", "b50:half", "b51"),
    T("t6", "the strange *part*", 960, 500, 90, "top", "b51:strange", "b52"),
    T("t7", "!84%!", 960, 400, 220, "slam", "b52:eighty", "b53", hero=True),
    T("t8", "saw them only *occasionally* or *rarely*", 960, 640, 60, "bottom", "b52:occasionally", "b53"),
    T("t9", "not their best !friends!", 960, 220, 72, "top", "b53:friends", "b54"),
    I("net", "network", 960, 560, 320, "pop", "b54:acquaintances", "b56"),
    T("t10", "*acquaintances*", 960, 220, 90, "slam", "b54:acquaintances", "b56", hero=True),
    T("t11", "people you know through *small talk*", 960, 860, 56, "bottom", "b55:small", "b56"),
    I("q", "question", 960, 520, 220, "pop", "b56:why", "b57"),
    T("t12", "close friends know what *you* know", 960, 400, 72, "left", "b57:close", "b59"),
    T("t13", "acquaintances know what you *don't*", 960, 560, 72, "right", "b58:don't", "b59"),
    CARD("card3", "2022 · SCIENCE", "~20 million LinkedIn users", "Rajkumar et al.", 960, 260, "b59:study", "b61"),
    T("t14", "moderately *weak ties* win", 960, 560, 80, "bottom", "b60:weak", "b61"),
    I("sun", "sun", 960, 520, 240, "pop", "b61:weather", "b62"),
    T("t15", "the weather chat → your *next career*", 960, 820, 64, "bottom", "b61:career", "b62"),
    T("t16", "so why does it feel so !awful!?", 960, 500, 90, "slam", "b63:awful", hero=True),
]})
# 5 · where it breaks ---------------------------------------------------------------------
scenes.append({"id": "breaks", "beats": R(64, 98), "elements": [
    CH("03", "Where it *breaks*", "b64:start", "b65:twenty"),
    CARD("card", "STUDY · 2010", "79 students, 4 days", "Mehl, Vazire et al.", 960, 220, "b65:psychologist", "b67"),
    I("mic", "mic", 960, 580, 240, "pop", "b65:recorder", "b68"),
    T("t1", "every *12.5 min*: 30 seconds", 960, 830, 64, "bottom", "b66:twelve", "b67"),
    T("t2", "*20,000+* snippets of life", 960, 830, 64, "bottom", "b67:twenty", "b68"),
    T("t3", "*small talk* or something *deeper*", 960, 500, 72, "top", "b68:small", "b69"),
    T("t4", "the happiest people", 960, 220, 64, "top", "b69:happiest", "b72"),
    BAR("bar1", 760, 360, "deep talk: 2×", "accent", "b69:twice", "b72"),
    BAR("bar2", 1160, 110, "small talk: ⅓", "muted", "b70:third", "b72"),
    T("t5", "onto *something*", 960, 320, 60, "bottom", "b71:something", "b72", weight=M),
    T("t6", "DEPTH MATTERS", 960, 480, 140, "slam", "b72:depth", "b73", hero=True),
    I("br", "brain", 960, 540, 260, "pop", "b73:brain", "b74"),
    T("t7", "the brain starts !lying!", 960, 830, 72, "bottom", "b73:lying", "b74"),
    I("train", "train", 960, 620, 300, "bottom", "b74:trains", "b79"),
    T("t8", "how many would *want* to talk?", 960, 220, 72, "top", "b75:want", "b76"),
    T("t9", "guess: !fewer than half!", 960, 220, 80, "slam", "b76:fewer", "b77"),
    T("t10", "reality: happy to *talk*", 960, 220, 72, "top", "b77:happy", "b78"),
    T("t11", "not a single *snub*", 960, 900, 60, "bottom", "b78:snubbed", "b79"),
] + [ST(f"r{i}", 420 + i * 270, 680, "bottom", "b79:assume", [["headDown", "b79:assume"]], [["tight", "b79:assume"]],
        out="b82", scale=0.55, flip=i % 2 == 1, delay=0.06 * i) for i in range(5)] + [
    T("t12", "we assume they want *silence*", 960, 220, 64, "top", "b79:alone", "b80"),
    T("t13", "they assume the *same* about us", 960, 220, 64, "top", "b80:same", "b81"),
    T("t14", "a whole carriage, in !silence!", 960, 220, 64, "top", "b81:silence", "b82"),
    T("t15", "we think we're *being watched*", 960, 220, 72, "top", "b82:watched", "b83"),
    ST("w", 760, 660, "left", "b83:students", [["proud", "b83:students"], ["shrug", "b86:guessed"], ["happy", "b87:quarter"]],
       [["smile", "b83:students"], ["o", "b86:guessed"], ["smile", "b87:quarter"]], out="b88"),
    I("sh", "shirt", 1240, 560, 260, "right", "b83:tshirt", "b86"),
    T("t16", "a *Barry Manilow* T-shirt", 1240, 820, 60, "bottom", "b84:barry", "b85"),
    T("t17", "chosen to be !uncool!", 1240, 820, 60, "bottom", "b85:uncool", "b86"),
    T("t18", "how many *noticed*?", 1240, 220, 64, "top", "b86:noticed", "b88"),
    BAR("bar3", 1080, 300, "guessed ~50%", "muted", "b86:half", "b88"),
    BAR("bar4", 1400, 140, "actually <25%", "accent", "b87:quarter", "b88"),
    T("t19", "THE SPOTLIGHT EFFECT", 960, 480, 120, "slam", "b88:spotlight", "b89", hero=True),
    T("t20", "every pause feels *huge*", 960, 400, 80, "left", "b89:huge", "b90"),
    T("t21", "every clumsy line, *unforgettable*", 960, 540, 64, "right", "b89:unforgettable", "b90"),
    T("t22", "most people don't *notice*", 960, 400, 80, "top", "b90:notice", "b92"),
    I("sh2", "shirt", 960, 640, 200, "pop", "b91:shirt", "b92"),
    CARD("card2", "STUDY · 2011 · NETHERLANDS", "Brief silences", "Koudenburg, Postmes & Gordijn", 960, 220, "b93:dutch", "b94"),
    BUB("bb", "…", 960, 560, 300, "b93:pause", "b95", fontSize=90),
    T("t23", "enough to feel !rejected!", 960, 860, 72, "bottom", "b94:rejected", "b95"),
    T("t24", "4 SECONDS", 960, 480, 200, "slam", "b95:four", "b96", hero=True),
    T("t25", "a test you're *failing*", 960, 400, 80, "top", "b96:failing", "b98"),
    T("t26", "every pause = “they're *bored*”", 960, 560, 64, "bottom", "b97:bored", "b98"),
    T("t27", "they feel the *exact same*", 960, 480, 90, "slam", "b98:same"),
]})
# 6 · the liking gap ---------------------------------------------------------------------------
scenes.append({"id": "gap", "beats": R(99, 110), "elements": [
    T("t0", "it gets !worse!", 960, 480, 110, "slam", "b99:worse", "b100"),
    CARD("card", "STUDY · 2018", "Five-minute chats", "Boothby, Cooney, Sandstrom & Clark", 960, 220, "b100:researchers", "b101"),
    ST("a", 640, 660, "left", "b100:strangers", [["idle", "b100:strangers"], ["shrug", "b101:liked"], ["headDown", "b102:low"]],
       [["smile", "b100:strangers"], ["o", "b101:liked"], ["frown", "b102:low"]], out="b104"),
    ST("b", 1280, 660, "right", "b100:paired", [["idle", "b100:paired"], ["happy", "b103:partners"], ["victory", "b103:more"]],
       [["smile", "b100:paired"]], out="b104", flip=True),
    BUB("q", "how much did they like me?", 640, 220, 360, "b101:liked", "b103", fontSize=40),
    T("t1", "guess: too !low!", 640, 990, 60, "bottom", "b102:low", "b104"),
    T("t2", "reality: liked you *more*", 1280, 220, 64, "top", "b103:liked", "b104"),
    T("t3", "THE LIKING GAP", 960, 480, 140, "slam", "b104:liking", "b105", hero=True),
    T("t3b", "it didn't *vanish*", 960, 480, 100, "top", "b105:vanish", "b106"),
    I("cal", "calendar", 960, 560, 240, "pop", "b106:roommates", "b107"),
    T("t4", "roommates: lasted for *months*", 960, 830, 64, "bottom", "b106:months", "b107"),
    T("t5", "shyer → *bigger gap*", 960, 480, 100, "slam", "b107:bigger", "b108"),
    T("t6", "“that was awkward”", 960, 420, 90, "top", "b108:awkward", "b110"),
    K("k1", 960, 420, 760, "b108:wrong", "b110"),
    T("t7", "often !wrong!", 960, 580, 90, "bottom", "b108:wrong", "b110"),
    T("t8", "you can't see it from the *inside*", 960, 760, 56, "bottom", "b109:inside", "b110", weight=M),
    T("t9", "but it wasn't over yet", 960, 480, 100, "slam", "b110:over", hero=True),
]})
# 7 · the deep end ------------------------------------------------------------------------------
scenes.append({"id": "deep", "beats": R(111, 122), "elements": [
    CH("04", "The *deep* end", "b111:start", "b111:skip", "right"),
    T("t0", "skip the small talk *completely*?", 960, 480, 80, "top", "b111:completely", "b112"),
    CARD("card", "2021 · 12 EXPERIMENTS", "1,800+ people", "Kardas, Kumar & Epley", 960, 220, "b112:researchers", "b114"),
    T("t1", "strangers + *deep questions*", 960, 600, 72, "bottom", "b113:deep", "b114"),
    BUB("q", "When did you last cry in front of someone?", 960, 300, 420, "b114:things", "b115", fontSize=44),
    ST("a", 640, 680, "left", "b114:things", [["shrug", "b115:awkward"], ["armsCrossed", "b116:care"], ["happy", "b118:connected"], ["give", "b119:listen"]],
       [["tight", "b115:awkward"], ["frown", "b116:care"], ["smile", "b118:connected"]], out="b121", scale=0.85),
    ST("b", 1280, 680, "right", "b114:person", [["shrug", "b115:awkward"], ["armsCrossed", "b116:care"], ["happy", "b118:connected"], ["victory", "b120:deep"]],
       [["tight", "b115:awkward"], ["frown", "b116:care"], ["smile", "b118:connected"]], out="b121", scale=0.85, flip=True),
    T("t2", "expected: *awkward*", 960, 220, 72, "top", "b115:awkward", "b116"),
    T("t3", "expected: they won't *care*", 960, 220, 72, "top", "b116:care", "b117"),
    T("t4", "then they *talked*", 960, 220, 80, "top", "b117:talked", "b118"),
    T("t5", "less awkward · more *connected*", 960, 220, 64, "top", "b118:connected", "b119"),
    T("t6", "they *wanted* to listen", 960, 220, 72, "top", "b119:listen", "b120"),
    T("t7", "most preferred the *deep* one", 960, 220, 72, "top", "b120:preferred", "b121"),
    T("t8", "right about what they *wanted*", 960, 420, 80, "left", "b121:right", "b122"),
    T("t9", "wrong about !other people!", 960, 560, 80, "right", "b122:wrong"),
]})
# 8 · the shortcut: follow-up questions --------------------------------------------------------
scenes.append({"id": "follow", "beats": R(123, 146), "elements": [
    BUB("nw", "Nice weather.", 600, 480, 300, "b123:nice", "b124", fontSize=46),
    T("t0", "→ something *real*?", 1300, 480, 80, "right", "b123:real", "b124"),
    CARD("card", "HARVARD · 2017", "Live conversations", "Huang, Yeomans, Brooks, Minson & Gino", 960, 220, "b124:harvard", "b125"),
    I("q1", "question", 640, 600, 180, "left", "b125:questions", "b126"),
    I("q2", "question", 960, 600, 200, "pop", "b125:asked", "b126"),
    I("q3", "question", 1280, 600, 180, "right", "b125:liked", "b126"),
    T("t1", "more questions = *liked more*", 960, 860, 64, "bottom", "b125:liked", "b126"),
    T("t2", "THE FOLLOW-UP QUESTION", 960, 420, 110, "slam", "b126:followup", "b127", hero=True),
    BUB("f1", "Wait, why did you move here?", 640, 680, 360, "b127:why", "b130", fontSize=40),
    BUB("f2", "What was that like?", 1300, 680, 300, "b128:like", "b130", fontSize=42),
    T("t3", "proof you were *listening*", 960, 220, 80, "top", "b129:listening", "b130"),
    T("t4", "they didn't *expect* it to work", 960, 400, 72, "left", "b130:expect", "b131"),
    T("t5", "it *did*", 960, 560, 110, "slam", "b131:did", "b132"),
    T("t6", "the *shortcut*", 960, 300, 90, "top", "b132:shortcut", "b135"),
    T("t7", "no clever lines", 960, 500, 72, "left", "b133:clever", "b135"),
    K("k1", 960, 500, 560, "b133:lines", "b135"),
    T("t8", "one good *follow-up*", 960, 660, 90, "right", "b134:good", "b135"),
    T("t9", "what it adds up to", 960, 200, 64, "top", "b135:adds", "b141", weight=M),
    SLOT("s1", "1", "assume they *want to talk*", 440, 560, "b136:assume", "b136:talk", "b141"),
    SLOT("s2", "2", "assume they *like you*", 960, 560, "b138:assume", "b138:like", "b141"),
    SLOT("s3", "3", "pause? ask a *follow-up*", 1480, 560, "b140:pause", "b140:followup", "b141"),
    BUB("h1", "How are you?", 560, 380, 280, "b141:how", "b146", fontSize=46),
    ST("me", 1300, 680, "right", "b142:try", [["give", "b142:try"], ["happy", "b146:handed"]], [["smile", "b142:try"]], out="b147", flip=True, scale=0.85),
    BUB("h2", "Honestly? Tired, but good.", 1240, 260, 420, "b143:honestly", "b146", fontSize=44),
    I("gt", "note", 560, 720, 180, "pop", "b145:guitar", "b146"),
    T("t10", "“I just started learning *guitar*.”", 960, 900, 56, "bottom", "b145:guitar", "b146"),
    T("t11", "you just handed them a *follow-up*", 760, 300, 64, "top", "b146:handed"),
]})
# 9 · never the enemy, ending -----------------------------------------------------------------
scenes.append({"id": "end", "tail": 2.6, "beats": R(147, 161), "elements": [
    T("t0", "one last *surprise*", 960, 480, 100, "top", "b147:surprise", "b148"),
    CARD("card", "2018 · 486 PEOPLE", "Small talk, revisited", "Milek et al.", 960, 220, "b148:study", "b151"),
    BAR("bar1", 760, 340, "deep talk: happier", "accent", "b149:deep", "b152"),
    BAR("bar2", 1160, 20, "small talk: no effect", "muted", "b150:unhappy", "b152"),
    T("t1", "didn't help · didn't *hurt*", 960, 340, 60, "bottom", "b151:hurt", "b152", weight=M),
    T("t2", "never the !enemy!", 960, 480, 130, "slam", "b152:enemy", "b153", hero=True),
    I("door", "door", 1100, 560, 300, "pop", "b153:doorway", "b158"),
    T("t3", "it's the *doorway*", 960, 200, 90, "slam", "b153:doorway", "b155", hero=True),
    BUB("nw", "Nice weather.", 1560, 360, 260, "b154:nice", "b155", fontSize=42),
    T("t4", "a check: *safe to be real*?", 960, 880, 64, "bottom", "b154:safe", "b155"),
    T("t5", "they don't hate *people*", 960, 200, 72, "top", "b155:people", "b156"),
    T("t6", "they want to skip the *door*", 960, 200, 72, "top", "b156:skip", "b157"),
    ST("w", 600, 600, "left", "b157:walking", [["happy", "b157:walking"]], [["smile", "b157:walking"]], out="b158"),
    T("t7", "but you have to *walk through* it", 960, 940, 60, "bottom", "b157:walking", "b158"),
    I("chat", "chat", 960, 470, 260, "pop", "b158:hate"),
    T("t8", "do you *hate* small talk?", 960, 200, 72, "top", "b158:hate"),
    T("t9", "which habit *next*?", 960, 750, 80, "bottom", "b160:habit", hero=True),
    T("t10", "@darealwhy", 960, 880, 48, "bottom", "b161:comments", weight=M, color="muted"),
]})

(ROOT / "script").mkdir(exist_ok=True)
(ROOT / "script/script.json").write_text(json.dumps({"title": "The Psychology of People Who Hate Small Talk", "scenes": scenes}, indent=1, ensure_ascii=False))
print(sum(len(s["elements"]) for s in scenes), "elements,", len(S), "sentences")
