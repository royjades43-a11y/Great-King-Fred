"""Writes script/script.json for video 3 from timing/words.json (one beat per spoken sentence)
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

scenes = []
# 1 · hook ------------------------------------------------------------------------------
scenes.append({"id": "hook", "beats": R(0, 6), "elements": [
    I("tv", "tv", 960, 640, 380, "none", "b00:start", "b03", startAtZero=True),
    T("t1", "!57 billion! minutes", 960, 230, 110, "slam", "b00:fifty", "b01", hero=True),
    T("t2", "not *new*", 960, 230, 90, "top", "b01:new", "b02"),
    T("t3", "*The Office* · ended 7 years earlier", 960, 230, 64, "top", "b02:office", "b03"),
    I("paper", "paper", 560, 620, 260, "left", "b03:paper", "b05"),
    T("t4", "a show about *paper*", 960, 210, 72, "top", "b03:paper", "b04"),
    ST("a", 1340, 640, "right", "b04:people", [["headDown", "b04:people"]], [["neutral", "b04:people"], ["frown", "b04:bored"]], out="b05"),
    T("t5", "people *bored* at work", 960, 210, 72, "top", "b04:bored", "b05"),
] + [ST(f"p{i}", 360 + i * 300, 680, "bottom", "b05:millions", [["idle", "b05:millions"], ["happy", "b05:again"]], [["smile", "b05:millions"]],
        out="b06", scale=0.6, flip=i % 2 == 1, delay=0.06 * i) for i in range(5)] + [
    T("t6", "again and *again*", 960, 230, 90, "top", "b05:again", "b06"),
    I("rep", "tvReplay", 960, 560, 360, "pop", "b06:brain"),
    T("t7", "why your brain hits *replay*", 960, 860, 72, "bottom", "b06:replay"),
]})
# 2 · homesick soldiers ------------------------------------------------------------------
soldiers = [ST(f"s{i}", 360 + i * 230, 650, "left", "b08:soldiers", [["idle", "b08:soldiers"], ["headDown", "b10:stopped"]],
               [["neutral", "b08:soldiers"], ["frown", "b10:stopped"]], out="b13", scale=0.82, hat=True, delay=0.08 * i) for i in range(3)]
scenes.append({"id": "origins", "beats": R(7, 28), "elements": [
    CH("01", "It starts with *soldiers*", "b07:start", "b08:sixteen"),
    T("t1", "!1688!", 960, 470, 220, "slam", "b08:sixteen", "b08:soldiers", hero=True),
    I("mt", "mountain", 1460, 330, 260, "right", "b08:homesick", "b13"),
    *soldiers,
    CARD("card", "SWITZERLAND · 1688", "Johannes Hofer", "a medical student", 1400, 640, "b09:student", "b10"),
    T("e1", "stopped *eating*", 1400, 600, 64, "right", "b10:eating", "b13"),
    T("e2", "couldn't *sleep*", 1400, 700, 64, "right", "b11:sleep", "b13"),
    T("e3", "so !weak! doctors feared", 1400, 800, 52, "bottom", "b12:weak", "b13", weight=M),
    T("t2", "NOSTALGIA", 960, 330, 170, "slam", "b13:nostalgia", "b15", hero=True),
    T("g1", "nostos · *homecoming*", 600, 600, 60, "left", "b14:homecoming", "b15"),
    T("g2", "algos · !pain!", 1320, 600, 60, "right", "b14:pain", "b15"),
    I("brain", "brain", 960, 560, 300, "pop", "b15:disease", "b16"),
    T("t3", "a disease of the !brain!", 960, 860, 72, "bottom", "b15:brain", "b16"),
    T("t4", "other *theories*", 960, 200, 72, "top", "b16:theories", "b19"),
    I("bell", "bell", 600, 540, 260, "left", "b17:cowbells", "b19"),
    T("l1", "*cowbells*", 600, 800, 60, "bottom", "b17:cowbells", "b19"),
    I("mt2", "mountain", 1320, 540, 280, "right", "b18:pressure", "b19"),
    T("l2", "*air pressure*", 1320, 800, 60, "bottom", "b18:pressure", "b19"),
    T("t5", "the *cures*", 960, 200, 80, "top", "b19:cures", "b23"),
    I("c1", "leech", 460, 540, 240, "left", "b20:leeches", "b23"),
    I("c2", "bottle", 960, 540, 240, "top", "b21:opium", "b23"),
    I("c3", "ticket", 1460, 540, 260, "right", "b22:ticket", "b23"),
    T("c1l", "leeches", 460, 780, 56, "bottom", "b20:leeches", "b23"),
    T("c2l", "opium", 960, 780, 56, "bottom", "b21:opium", "b23"),
    T("c3l", "a trip *home*", 1460, 780, 56, "bottom", "b22:ticket", "b23"),
    T("t6", "legend says…", 960, 200, 60, "top", "b23:legend", "b24", weight=M, color="muted"),
    I("note", "note", 960, 520, 280, "pop", "b23:song", "b24"),
    K("k1", 960, 520, 330, "b23:banned", "b24"),
    T("t7", "a song, !banned!", 960, 800, 72, "bottom", "b23:banned", "b24"),
    I("glass", "hourglass", 960, 520, 240, "pop", "b24:years", "b25"),
    T("t8", "*200 years* as an illness", 960, 820, 72, "bottom", "b24:hundred", "b25"),
    CARD("card2", "AMERICAN CIVIL WAR", "Diagnosis: nostalgia", "thousands of soldiers", 960, 300, "b25:civil", "b27"),
    *[ST(f"cw{i}", 560 + i * 400, 760, "bottom", "b25:soldiers", [["headDown", "b25:soldiers"]], [["frown", "b25:soldiers"]], out="b26",
         scale=0.5, hat=True, delay=0.08 * i) for i in range(3)],
    T("t9", "even a cause of !death!", 960, 660, 72, "bottom", "b26:death", "b27"),
    T("t10", "remember that", 960, 330, 80, "top", "b27:remember"),
    I("money", "money", 960, 600, 260, "pop", "b28:valuable"),
    T("t11", "today: one of the most *valuable* feelings", 960, 860, 60, "bottom", "b28:valuable"),
]})
# 3 · the birth of the rerun --------------------------------------------------------------
scenes.append({"id": "lucy", "beats": R(29, 49), "elements": [
    CH("02", "The birth of the *rerun*", "b29:start", "b30:married", "right"),
    T("t0", "!1951! · Hollywood", 960, 200, 80, "top", "b30:couple", "b31"),
    ST("lu", 760, 650, "left", "b30:couple", [["idle", "b30:couple"], ["happy", "b31:sitcom"], ["idle", "b32:network"]],
       [["smile", "b30:couple"]], out="b34", variant="bow"),
    ST("de", 1160, 650, "right", "b30:couple", [["idle", "b30:couple"], ["happy", "b31:sitcom"], ["armsCrossed", "b33:said"]],
       [["smile", "b30:couple"], ["tight", "b33:said"]], out="b34", flip=True),
    T("t1", "*Lucille Ball* & *Desi Arnaz*", 960, 200, 72, "top", "b31:lucille", "b32"),
    T("t2", "CBS: perform it *live*", 960, 200, 72, "top", "b32:live", "b33"),
    T("no", "!NO!", 1500, 300, 150, "slam", "b33:no", "b34", hero=True),
    T("t3", "real *film*, *three cameras*", 960, 200, 72, "top", "b34:film", "b35"),
    I("cam1", "camera", 520, 560, 240, "left", "b34:real", "b35"),
    I("cam2", "camera", 960, 560, 240, "bottom", "b34:three", "b35"),
    I("cam3", "camera", 1400, 560, 240, "right", "b34:cameras", "b35"),
    T("t4", "costs !more!", 960, 470, 130, "slam", "b35:money", "b36", hero=True),
    T("t5", "the *deal*", 960, 200, 80, "top", "b36:deal", "b39"),
    T("d1", "Desilu pays the *extra*", 960, 450, 72, "left", "b37:cover", "b39"),
    T("d2", "Desilu *owns the films*", 960, 580, 72, "right", "b38:own", "b39"),
    I("reel0", "reel", 960, 790, 160, "pop", "b38:films", "b39"),
    T("t6", "CBS: *agreed*", 960, 200, 80, "top", "b39:agreed", "b40"),
    T("t7", "worst deal in TV !history!", 960, 500, 96, "slam", "b40:worst", "b41", hero=True),
    I("r1", "reel", 480, 520, 240, "left", "b41:shown", "b44"),
    I("r2", "reel", 960, 520, 240, "top", "b42:again", "b44"),
    I("r3", "reel", 1440, 520, 240, "right", "b43:again", "b44"),
    T("t8", "shown *again*", 960, 820, 72, "bottom", "b41:again", "b44"),
    I("rep", "tvReplay", 960, 560, 320, "pop", "b44:love", "b45"),
    T("t9", "the blueprint for the *rerun*", 960, 220, 72, "top", "b44:blueprint", "b45"),
    T("t10", "a *human* detail", 960, 220, 80, "top", "b45:human", "b46"),
    ST("lu2", 560, 650, "left", "b46:lucille", [["idle", "b46:lucille"], ["shrug", "b46:say"], ["happy", "b48:son"]],
       [["smile", "b46:lucille"], ["o", "b46:say"], ["smile", "b48:son"]], variant="bow", out="b49"),
    T("w1", "!“pregnant”!", 1260, 420, 110, "right", "b46:pregnant#2", "b48"),
    K("k1", 1260, 420, 560, "b46:air", "b48"),
    T("w2", "*“expecting”*", 1260, 600, 110, "bottom", "b47:expecting", "b48"),
    I("baby", "baby", 1080, 560, 240, "pop", "b48:son", "b49"),
    I("tvb", "tv", 1500, 560, 260, "right", "b48:baby", "b49"),
    T("t11", "real son · TV baby · *same day*", 1200, 840, 56, "bottom", "b48:same", "b49"),
    T("t12", "!44 million! watched", 960, 420, 110, "slam", "b49:forty", hero=True),
    T("t13", "more than *Eisenhower's inauguration*", 960, 640, 64, "bottom", "b49:eisenhower"),
]})
# 4 · familiar feels safe ------------------------------------------------------------------
scenes.append({"id": "exposure", "beats": R(50, 69), "elements": [
    I("q", "question", 960, 520, 260, "pop", "b50:why", "b51"),
    T("t0", "why watch it *twice*?", 960, 820, 80, "bottom", "b50:twice", "b51"),
    CARD("card", "PSYCHOLOGY · 1968", "Robert Zajonc", "made-up words & symbols", 960, 230, "b51:psychologist", "b53"),
    T("m1", "IKTITAF", 520, 600, 72, "left", "b52:made", "b53", weight=M),
    T("m2", "AFWORBU", 960, 700, 72, "bottom", "b52:words", "b53", weight=M),
    T("m3", "CIVADRA", 1400, 600, 72, "right", "b52:symbols", "b53", weight=M),
    T("lk", "how much people *liked* it", 960, 200, 64, "top", "b53:once", "b57"),
    BAR("bar1", 760, 90, "seen once", "muted", "b53:once", "b57"),
    BAR("bar2", 1160, 380, "seen 25 times", "accent", "b54:twenty", "b57"),
    T("t1", "liked it *more*", 960, 300, 64, "bottom", "b55:liked", "b56", weight=M),
    T("t2", "even !nonsense!", 960, 300, 64, "bottom", "b56:nonsense", "b57"),
    T("t3", "the *mere exposure* effect", 960, 470, 96, "slam", "b57:mere", "b58", hero=True),
    I("sh", "shield", 680, 520, 260, "left", "b58:familiar", "b60"),
    T("f1", "familiar = *safe*", 680, 790, 64, "bottom", "b58:safe", "b60"),
    I("hr", "heart", 1240, 520, 220, "right", "b59:good", "b60", color="accent"),
    T("f2", "safe = *good*", 1240, 790, 64, "bottom", "b59:good", "b60"),
    I("loop", "loop", 960, 540, 260, "pop", "b60:repetition", "b61"),
    T("t4", "a show built on *repetition*?", 960, 820, 72, "bottom", "b60:repetition", "b61"),
    CARD("card2", "KIDS' TV · 1996", "Blue's Clues", "the same episode, 5 days in a row", 960, 300, "b61:called", "b63"),
    I("cal", "calendar", 960, 640, 240, "bottom", "b62:five", "b64"),
    T("t5", "MON → FRI", 960, 870, 72, "bottom", "b63:monday", "b64"),
    I("x1", "paw", 480, 520, 220, "left", "b64:dog", "b67"),
    I("x2", "question", 960, 520, 220, "top", "b65:clues", "b67"),
    I("x3", "check", 1440, 520, 220, "right", "b66:answers", "b67"),
    T("x1l", "same *dog*", 480, 760, 56, "bottom", "b64:dog", "b67"),
    T("x2l", "same *clues*", 960, 760, 56, "bottom", "b65:clues", "b67"),
    T("x3l", "same *answers*", 1440, 760, 56, "bottom", "b66:answers", "b67"),
    ST("ad", 460, 640, "left", "b67:adults", [["armsCrossed", "b67:adults"], ["shrug", "b68:didn't"]], [["tight", "b67:adults"], ["o", "b68:didn't"]]),
    T("t6", "“kids will get *bored*”", 1180, 220, 64, "right", "b67:bored", "b68"),
] + [ST(f"k{i}", 980 + i * 260, 700, "bottom", "b68:didn't", [["victory", "b68:didn't"], ["happy", "b69:understood"], ["victory", "b69:joined"]],
        [["smile", "b68:didn't"]], scale=0.55, delay=0.07 * i) for i in range(3)] + [
    T("t7", "!they didn't!", 1240, 220, 96, "slam", "b68:didn't", "b69", hero=True),
    T("t8", "understood *more* each time", 1240, 200, 60, "top", "b69:understood"),
    T("t9", "joined in *more*", 1240, 300, 60, "top", "b69:joined"),
]})
# 5 · the money ---------------------------------------------------------------------------
scenes.append({"id": "money", "beats": R(70, 79), "elements": [
    I("mo", "money", 960, 560, 300, "pop", "b70:money", "b71"),
    T("t0", "then came the *money*", 960, 830, 80, "bottom", "b70:money", "b71"),
    T("t1", "!52 million! watched the finale", 960, 230, 80, "slam", "b71:fifty", "b72", hero=True),
    I("tv", "tv", 960, 600, 300, "bottom", "b71:final", "b72"),
] + [ST(f"f{i}", 330 + i * 252, 680, "bottom", "b72:six", [["idle", "b72:six"], ["happy", "b75:friends"]], [["smile", "b72:six"]],
        out="b76", scale=0.55, flip=i % 2 == 1, delay=0.05 * i) for i in range(6)] + [
    T("t2", "*$1 million* each, per episode", 960, 220, 72, "top", "b72:million", "b73"),
    T("t3", "a lot for one *goodbye*", 960, 220, 72, "top", "b73:goodbye", "b74"),
    T("t4", "it never !happened!", 960, 220, 72, "top", "b74:never", "b75"),
    I("cup", "coffee", 960, 330, 200, "pop", "b75:coffee", "b76"),
    T("t5", "same coffee shop, for *decades*", 960, 900, 64, "bottom", "b75:decades", "b76"),
    T("t6", "!$3 billion!", 960, 380, 190, "slam", "b76:three", "b78", hero=True),
    T("t7", "*Seinfeld*: a show about nothing", 960, 640, 64, "bottom", "b76:nothing", "b77"),
    T("t8", "one of TV's biggest *money machines*", 960, 640, 64, "bottom", "b77:money", "b78"),
    T("t9", "paying for the *jokes*?", 960, 300, 80, "top", "b78:jokes"),
    I("br", "heart", 960, 580, 200, "pop", "b79:deeper", color="accent"),
    T("t10", "or something !deeper!?", 960, 830, 80, "bottom", "b79:deeper"),
]})
# 6 · too many choices, loneliness ---------------------------------------------------------
scenes.append({"id": "choice", "beats": R(80, 107), "elements": [
    CH("03", "Too many *choices*", "b80:start", "b81:year"),
    CARD("card", "STUDY · 2000", "The jam experiment", "Iyengar & Lepper", 960, 220, "b81:researchers", "b84"),
    I("j0", "jar", 960, 620, 220, "pop", "b81:jamtasting", "b82"),
    T("j0l", "a *jam-tasting* table", 960, 860, 56, "bottom", "b81:table", "b82"),
    I("j1", "jar", 600, 600, 240, "left", "b82:twenty", "b85"),
    T("j1l", "*24* jams", 600, 830, 64, "bottom", "b82:flavours", "b84"),
    I("j2", "jar", 1320, 600, 200, "right", "b83:six", "b85"),
    T("j2l", "*6* jams", 1320, 830, 64, "bottom", "b83:six", "b84"),
    T("t1", "the big table: more *shoppers*", 960, 220, 64, "top", "b84:shoppers", "b85"),
    T("t1b", "how many *bought* a jar", 960, 220, 64, "top", "b85:bought", "b87"),
    BAR("bar1", 760, 36, "3% bought", "muted", "b85:three", "b87"),
    BAR("bar2", 1160, 360, "30% bought", "accent", "b86:thirty", "b87"),
    T("t2", "too many options: people !froze!", 960, 500, 80, "slam", "b87:froze", "b89", hero=True),
    T("t3", "later studies: not always this strong", 960, 680, 44, "bottom", "b88:later", "b89", weight=M, color="muted"),
    T("t4", "but you've *felt it*", 960, 500, 90, "top", "b89:felt", "b90"),
    I("grid", "grid", 960, 560, 340, "pop", "b90:streaming", "b93"),
    T("t5", "thousands of *titles*", 960, 200, 72, "top", "b91:thousands", "b92"),
    T("t6", "endless *rows*", 960, 200, 72, "top", "b92:endless", "b93"),
    ST("sc", 520, 650, "left", "b93:nights", [["headDown", "b93:nights"], ["point", "b93:seen"]], [["neutral", "b93:nights"], ["smile", "b93:seen"]], out="b97"),
    T("t7", "20 minutes of *scrolling*", 1260, 220, 60, "top", "b93:scrolled", "b94"),
    I("rep", "tvReplay", 1300, 560, 320, "right", "b93:seen", "b97"),
    BUB("bub", "still watching?", 1300, 240, 380, "b94:still", "b95", fontSize=46),
    T("t8", "*yes*", 1300, 880, 90, "bottom", "b95:yes", "b97"),
    T("t9", "for the !4th! time this year", 1260, 220, 60, "top", "b96:fourth", "b97"),
    T("t10", "LONELINESS", 960, 500, 160, "slam", "b97:loneliness", "b98", hero=True),
    CARD("card2", "U.S. SURGEON GENERAL · 2023", "Loneliness: an epidemic", "national advisory", 960, 280, "b98:surgeon", "b100"),
] + [ST(f"pp{i}", 600 + i * 240, 770, "bottom", "b99:one", [["headDown" if i % 2 == 0 else "idle", "b99:one"]],
        [["frown" if i % 2 == 0 else "neutral", "b99:one"]], out="b100", scale=0.5, delay=0.05 * i) for i in range(4)] + [
    T("t11", "!1 in 2! adults", 960, 470, 100, "slam", "b99:one", "b100", hero=True),
    T("t12", "a strange kind of *relief*", 960, 500, 80, "top", "b100:relief", "b101"),
    CARD("card3", "STUDY · 2009", "Your favourite show", "Derrick, Gabriel & Hugenberg", 960, 230, "b101:derrick", "b104"),
    ST("v", 560, 660, "left", "b101:write", [["idle", "b101:write"], ["happy", "b102:less"], ["headDown", "b103:rejected"], ["happy", "b103:recover"]],
       [["neutral", "b101:write"], ["smile", "b102:less"], ["frown", "b103:rejected"], ["smile", "b103:recover"]], out="b108"),
    I("tv", "tv", 1320, 600, 300, "right", "b101:show", "b108"),
    T("t13", "felt *less lonely*", 1320, 860, 64, "bottom", "b102:less", "b103"),
    T("t14", "felt *better* after rejection", 1320, 860, 56, "bottom", "b103:recover", "b104"),
    T("t15", "SOCIAL SURROGACY", 960, 230, 110, "slam", "b104:surrogacy", "b105", hero=True),
    T("t16", "stand-in *friends*", 1320, 220, 72, "top", "b105:stand", "b108"),
    ST("c1", 1090, 690, "bottom", "b105:characters", [["happy", "b105:characters"]], [["smile", "b105:characters"]], scale=0.42, out="b108"),
    ST("c2", 1550, 690, "bottom", "b105:friends", [["proud", "b105:friends"]], [["smile", "b105:friends"]], scale=0.42, out="b108", flip=True),
    T("t17", "not real…", 1320, 930, 56, "bottom", "b106:real", "b107", weight=M, color="muted"),
    T("t18", "your brain doesn't !care!", 1320, 930, 64, "bottom", "b107:care", "b108"),
]})
# 7 · the shelter cracks --------------------------------------------------------------------
scenes.append({"id": "crack", "beats": R(108, 127), "elements": [
    I("home", "house", 960, 560, 320, "pop", "b108:shelter", "b110"),
    T("t0", "a *shelter*", 960, 220, 80, "top", "b108:shelter", "b109"),
    I("bolt", "bolt", 960, 560, 220, "pop", "b109:crack", "b110"),
    T("t1", "then it began to !crack!", 960, 220, 80, "top", "b109:crack", "b110"),
    CARD("card", "DECEMBER 2018", "Friends might leave Netflix", "fans found out", 960, 300, "b110:learned", "b111"),
    T("t2", "!$100 million!", 960, 420, 160, "slam", "b111:hundred", "b113", hero=True),
    T("t3", "for *one more year*", 960, 620, 72, "bottom", "b111:year", "b112"),
    T("t4", "for a show that ended in *2004*", 960, 620, 64, "bottom", "b112:ended", "b113"),
    I("off", "tvOff", 960, 540, 300, "pop", "b113:left", "b114"),
    T("t5", "Jan 1, 2020: *gone*", 960, 830, 72, "bottom", "b113:left", "b114"),
    I("gl", "globe", 960, 540, 300, "pop", "b114:world", "b115"),
    T("t6", "the world !shut down!", 960, 830, 80, "bottom", "b114:shut", "b115"),
    I("n1", "lock", 480, 540, 220, "left", "b115:lockdowns", "b118"),
    I("n2", "alarm", 960, 540, 220, "top", "b116:fear", "b118"),
    I("n3", "news", 1440, 540, 220, "right", "b117:news", "b118"),
    T("n1l", "lockdowns", 480, 780, 56, "bottom", "b115:lockdowns", "b118"),
    T("n2l", "fear", 960, 780, 56, "bottom", "b116:fear", "b118"),
    T("n3l", "nonstop news", 1440, 780, 56, "bottom", "b117:news", "b118"),
    T("t7", "comfort, needed *more than ever*", 960, 500, 80, "top", "b118:needed", "b119"),
    I("g1", "grid", 520, 520, 220, "left", "b119:scattering", "b122"),
    I("g2", "grid", 960, 520, 220, "top", "b119:apps", "b122"),
    I("g3", "grid", 1400, 520, 220, "right", "b119:monthly", "b122"),
    T("t8", "new apps, new *monthly price*", 960, 230, 64, "top", "b119:apps", "b120"),
    T("t9", "comfort became a *product*", 960, 230, 64, "top", "b120:product", "b121"),
    T("t10", "and it got !expensive!", 960, 800, 72, "bottom", "b121:expensive", "b122"),
    I("q", "question", 960, 520, 240, "pop", "b122:control", "b123"),
    T("t11", "the world out of *control*?", 960, 820, 72, "bottom", "b122:control", "b123"),
    I("rep", "tvReplay", 960, 540, 300, "pop", "b123:reach", "b124"),
    T("t12", "reach for what never *changes*", 960, 830, 72, "bottom", "b123:changes", "b124"),
    I("couch", "couch", 960, 690, 520, "bottom", "b124:couch", "b127"),
    ST("v", 960, 668, "top", "b124:people", [["idle", "b124:people"], ["shrug", "b125:not"], ["headDown", "b126:much"]],
       [["smile", "b124:people"], ["neutral", "b125:not"], ["tight", "b126:much"]], out="b127", scale=0.8, sit=True),
    T("t13", "characters known for *20 years*", 960, 200, 64, "top", "b124:twenty", "b125"),
    T("t14", "not *nothing* to watch", 960, 200, 64, "top", "b125:nothing", "b126"),
    T("t15", "new felt like !too much!", 960, 200, 72, "top", "b126:much", "b127"),
    T("t16", "but it wasn't over yet", 960, 520, 100, "slam", "b127:over", hero=True),
]})
# 8 · the streaming wars --------------------------------------------------------------------
scenes.append({"id": "wars", "beats": R(128, 139), "elements": [
    CH("04", "The streaming *wars*", "b128:start", "b129:main", "right"),
    T("t0", "the weapons: *old sitcoms*", 960, 220, 72, "top", "b129:weapons", "b130"),
    I("tv1", "tv", 960, 580, 300, "pop", "b129:sitcoms", "b130"),
    T("a1", "!$425 million!", 500, 460, 84, "slam", "b130:four", "b132", hero=True),
    T("a1l", "*Friends* · 5 years", 500, 600, 56, "bottom", "b130:friends", "b132"),
    T("a2", "!$500 million!", 1420, 460, 84, "slam", "b131:five", "b132", hero=True),
    T("a2l", "*The Office*", 1420, 600, 56, "bottom", "b131:office", "b132"),
    T("t1", "half a billion dollars", 960, 380, 110, "slam", "b132:half", "b134", hero=True),
    I("pap", "paper", 960, 640, 220, "pop", "b133:paper", "b134"),
    T("t2", "for a show about *paper*", 960, 880, 64, "bottom", "b133:paper", "b134"),
    CARD("card", "2021", "The reunion special", "on a copy of the original set", 960, 240, "b134:reunion", "b137"),
    T("t3", "no new *story*", 600, 520, 72, "left", "b135:story", "b137"),
    T("t4", "no new *jokes*", 1320, 520, 72, "right", "b136:jokes", "b137"),
] + [ST(f"f{i}", 330 + i * 252, 680, "bottom", "b137:six", [["idle", "b137:six"], ["happy", "b138:millions"]], [["smile", "b137:six"]],
        out="b139", scale=0.55, flip=i % 2 == 1, delay=0.05 * i) for i in range(6)] + [
    T("t5", "six older people, *remembering*", 960, 220, 64, "top", "b137:remembering", "b138"),
    T("t6", "millions watched them *rewatch*", 960, 220, 64, "top", "b138:rewatch", "b139"),
    T("t7", "2020: !57 billion! minutes", 960, 380, 100, "slam", "b139:fifty", hero=True),
    T("t8", "*The Office*, the most-streamed show", 960, 600, 60, "bottom", "b139:show"),
]})
# 9 · three answers: effort and control -------------------------------------------------------
scenes.append({"id": "answers", "beats": R(140, 161), "elements": [
    T("t0", "what are we *buying*?", 960, 400, 90, "top", "b140:buying", "b141"),
    T("t1", "3 answers", 960, 520, 160, "slam", "b141:three", "b142", hero=True),
    T("a1", "1 · *effort*", 960, 500, 150, "slam", "b142:effort", "b143", hero=True),
    T("t2", "a new show asks a *lot*", 960, 220, 72, "top", "b143:lot", "b145"),
    I("q1", "question", 560, 560, 200, "left", "b144:names", "b145"),
    I("q2", "question", 960, 560, 200, "top", "b144:faces", "b145"),
    I("q3", "question", 1360, 560, 200, "right", "b144:story", "b145"),
    T("t3", "new names · new faces · new story", 960, 820, 56, "bottom", "b144:names", "b145"),
    T("t4", "a known show asks *nothing*", 960, 500, 90, "top", "b145:nothing", "b146"),
    T("t5", "PROCESSING FLUENCY", 960, 440, 110, "slam", "b146:fluency", "b148", hero=True),
    T("t6", "easy to take in = *feels good*", 960, 640, 64, "bottom", "b147:good", "b148"),
    I("nt", "note", 960, 540, 260, "pop", "b148:song", "b149"),
    T("t7", "like your *favourite song*", 960, 830, 72, "bottom", "b148:favourite", "b149"),
    I("pz", "puzzle", 600, 560, 240, "left", "b149:puzzle", "b151"),
    K("k1", 600, 560, 300, "b149:puzzle", "b151", delay=0.3),
    T("t8", "no *puzzle*", 600, 820, 64, "bottom", "b149:puzzle", "b151"),
    ST("tired", 1320, 650, "right", "b150:wants", [["headDown", "b150:wants"]], [["smile", "b150:wants"]], out="b151"),
    T("t9", "eyes *half closed*", 1320, 200, 64, "top", "b150:half", "b151"),
    T("a2", "2 · *control*", 960, 500, 150, "slam", "b151:control", "b152", hero=True),
    I("hs", "house", 960, 540, 280, "pop", "b152:story", "b153"),
    T("t10", "a known ending: a small *safe room*", 960, 830, 64, "bottom", "b152:safe", "b153"),
    T("t11", "knowing the ending doesn't !spoil! it", 960, 500, 72, "top", "b153:spoil", "b154"),
    CARD("card", "STUDY · 2011 · UC SAN DIEGO", "Spoilers don't spoil stories", "Leavitt & Christenfeld", 960, 230, "b154:researchers", "b155"),
    I("bk", "book", 960, 620, 260, "bottom", "b154:dozen", "b155"),
    T("t12", "how much they *enjoyed* it", 960, 200, 64, "top", "b155:readers", "b158"),
    BAR("bar1", 760, 220, "no spoiler", "muted", "b155:told", "b158"),
    BAR("bar2", 1160, 300, "spoiler first", "accent", "b156:more", "b158"),
    T("t13", "enjoyed it *more*", 960, 310, 60, "bottom", "b156:more", "b157", weight=M),
    T("t14", "the spoiler made it *better*", 960, 310, 60, "bottom", "b157:better", "b158", weight=M),
    I("moon", "moon", 1400, 300, 180, "pop", "b158:bedtime", "b161"),
    I("bk2", "book", 1180, 640, 220, "right", "b158:story", "b161"),
    ST("kid", 640, 680, "left", "b158:kid", [["happy", "b158:kid"], ["point", "b159:ends"], ["victory", "b160:point"], ["happy", "b161:relax"]],
       [["smile", "b158:kid"]], scale=0.7),
    T("t15", "the same *bedtime story*", 960, 180, 64, "top", "b158:bedtime", "b159"),
    T("t16", "they know how it *ends*", 960, 180, 64, "top", "b159:ends", "b160"),
    T("t17", "!that's the point!", 960, 180, 72, "top", "b160:point", "b161"),
    T("t18", "*relax*, don't brace", 960, 180, 72, "top", "b161:relax"),
]})
# 10 · nostalgia -----------------------------------------------------------------------------
scenes.append({"id": "nostalgia", "beats": R(162, 173), "elements": [
    T("a3", "3 · *nostalgia*", 960, 500, 150, "slam", "b162:nostalgia", "b163", hero=True),
    I("le", "leech", 960, 540, 260, "pop", "b163:disease", "b164"),
    T("t0", "yes, the old *disease*", 960, 820, 72, "bottom", "b163:disease", "b164"),
    CARD("card", "RESEARCH · 2006", "Nostalgia, studied properly", "Sedikides, Wildschut et al.", 960, 230, "b164:researchers", "b166"),
    I("pp0", "people", 960, 600, 220, "bottom", "b164:studied", "b165"),
    I("cal", "calendar", 960, 580, 240, "bottom", "b165:week", "b166"),
    T("t1", "at least *once a week*", 960, 840, 72, "bottom", "b165:once", "b166"),
    T("t2", "and not *sick*", 960, 500, 100, "top", "b166:sick", "b167"),
    I("pp", "people", 600, 520, 240, "left", "b167:connected", "b168"),
    T("c1", "more *connected*", 600, 780, 64, "bottom", "b167:connected", "b168"),
    I("hr", "heart", 1320, 520, 200, "right", "b167:meaning", "b168", color="accent"),
    T("c2", "more *meaning*", 1320, 780, 64, "bottom", "b167:meaning", "b168"),
    I("le2", "leech", 600, 540, 240, "left", "b168:leeches", "b169"),
    K("k1", 600, 540, 280, "b168:turned", "b169"),
    I("hr2", "heart", 1320, 540, 220, "right", "b168:emotional", "b169", color="accent"),
    T("t3", "*emotional first aid*", 1320, 800, 64, "bottom", "b168:first", "b169"),
    T("t4", "a fair *question*", 960, 500, 90, "top", "b169:question", "b170"),
    T("t5", "if it helps, why does it !hurt!?", 960, 500, 90, "slam", "b170:hurt", "b171"),
    T("t6", "BITTERSWEET", 960, 500, 170, "slam", "b171:bittersweet", "b172", hero=True),
    T("t7", "something good *happened*", 960, 440, 80, "left", "b172:happened", "b173"),
    T("t8", "and it's !gone!", 960, 580, 80, "right", "b172:gone", "b173"),
    I("couch", "couch", 960, 690, 480, "bottom", "b173:comfort"),
    ST("v", 960, 675, "top", "b173:comfort", [["happy", "b173:comfort"]], [["smile", "b173:comfort"]], scale=0.75, sit=True),
    T("t9", "the *sweet* part, not the bitter", 960, 200, 64, "top", "b173:sweet"),
]})
# 11 · how fast the story moved ------------------------------------------------------------------
years = [("1688", "a disease", "leech", "b176:sixteen", "b176:disease"), ("1951", "a rerun", "camera", "b177:nineteen", "b177:reerun"),
         ("1968", "a lab result", "flask", "b178:nineteen", "b178:lab"), ("1996", "a teaching tool", "book", "b179:nineteen", "b179:teaching"),
         ("2020", "a $500M asset", "money", "b180:twenty", "b180:asset")]
tl = []
for i, (yr, what, ic, cy, cw) in enumerate(years):
    x = 300 + i * 330
    tl += [I(f"i{i}", ic, x, 470, 180, "bottom", cw, "b181"), T(f"y{i}", yr, x, 650, 72, "top", cy, "b181", hero=True),
           T(f"w{i}", what, x, 740, 40, "bottom", cw, "b181", weight=M)]
scenes.append({"id": "timeline", "beats": R(174, 181), "elements": [
    I("q", "question", 960, 520, 240, "pop", "b174:stuck", "b175"),
    T("t0", "stuck in the *past*?", 960, 820, 80, "bottom", "b174:past", "b175"),
    T("t1", "look how *fast* it moved", 960, 220, 72, "top", "b175:fast", "b181"),
    *tl,
    I("couch", "couch", 960, 690, 520, "bottom", "b181:couch"),
    ST("v", 960, 668, "top", "b181:random", [["happy", "b181:random"], ["proud", "b181:episode"]], [["smile", "b181:random"]], scale=0.8, sit=True),
    T("t2", "a random *Tuesday night*", 960, 200, 64, "top", "b181:tuesday", "b181:couch"),
    T("t3", "your couch · your blanket · *your episode*", 960, 200, 56, "top", "b181:couch"),
]})
# 12 · the mirror, ending -----------------------------------------------------------------------
scenes.append({"id": "mirror", "tail": 2.6, "beats": R(182, 198), "elements": [
    T("t0", "the last *piece*", 960, 500, 100, "top", "b182:piece", "b183"),
    CARD("card", "STUDY · 2012", "Why we go back", "Russell & Levy", 960, 230, "b183:interviewed", "b185"),
    I("i1", "book", 520, 620, 200, "left", "b183:books", "b185"),
    I("i2", "reel", 960, 620, 200, "bottom", "b183:films", "b185"),
    I("i3", "house", 1400, 620, 200, "right", "b183:places", "b185"),
    T("t1", "one reason, *again and again*", 960, 860, 56, "bottom", "b184:reason", "b185"),
    T("t2", "to see how *they* had changed", 960, 500, 80, "top", "b185:changed", "b186"),
    I("tv", "tv", 960, 540, 300, "pop", "b186:show", "b187"),
    T("t3", "the show stays the *same*", 960, 840, 72, "bottom", "b186:same", "b187"),
    I("mi", "mirror", 960, 540, 340, "pop", "b187:mirror", "b192"),
    T("t4", "so it's a !mirror!", 960, 200, 80, "top", "b187:mirror", "b188"),
    ST("y", 520, 660, "left", "b188:joke", [["shrug", "b188:joke"], ["happy", "b188:lands"]], [["o", "b188:joke"], ["smile", "b188:lands"]], scale=0.75, out="b192"),
    ST("o", 1400, 640, "right", "b188:twenty", [["happy", "b188:twenty"], ["point", "b189:you"], ["proud", "b190:honest"], ["headDown", "b191:sad"]],
       [["smile", "b188:twenty"], ["o", "b189:you"], ["smile", "b190:honest"], ["neutral", "b191:sad"]], flip=True, out="b192"),
    T("t5", "the joke at *15* lands at *25*", 960, 200, 64, "top", "b188:lands", "b189"),
    T("t6", "the boss looks a little like *you*", 960, 200, 64, "top", "b189:you", "b190"),
    T("t7", "the annoying one was the most *honest*", 960, 200, 60, "top", "b190:honest", "b191"),
    T("t8", "a sad moment you've now *lived*", 960, 200, 64, "top", "b191:lived", "b192"),
    T("t9", "here's the !twist!", 960, 500, 130, "slam", "b192:twist", "b193", hero=True),
    T("t10", "you've never watched the same show *twice*", 960, 500, 72, "blur", "b193:twice", "b194"),
    T("t11", "the episode didn't change.", 960, 420, 80, "top", "b194:episode", "b196"),
    T("t12", "*you* did.", 960, 580, 150, "slam", "b195:person", "b196", hero=True),
    I("rep", "tvReplay", 960, 470, 280, "pop", "b196:show"),
    T("t13", "which show have you *rewatched most*?", 960, 200, 64, "top", "b196:rewatched"),
    T("t14", "which habit *next*?", 960, 750, 80, "bottom", "b197:habit", hero=True),
    T("t15", "@darealwhy", 960, 880, 48, "bottom", "b198:comments", weight=M, color="muted"),
]})

(ROOT / "script").mkdir(exist_ok=True)
(ROOT / "script/script.json").write_text(json.dumps({"title": "The Psychology of People Who Rewatch the Same Shows", "scenes": scenes}, indent=1, ensure_ascii=False))
print(sum(len(s["elements"]) for s in scenes), "elements,", len(S), "sentences")
