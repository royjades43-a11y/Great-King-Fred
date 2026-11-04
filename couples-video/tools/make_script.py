"""Writes script/script.json for video 7 from timing/words.json (one beat per spoken sentence)
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
# 1 · hook ------------------------------------------------------------------------------
scenes.append({"id": "hook", "beats": R(0, 11), "elements": [
    I("win", "window", 1500, 420, 300, "none", "b00:start", "b05", startAtZero=True),
    *couple("c", "b00:partner", "b05", [["idle", "b00:partner"], ["point", "b01:look"]], [["idle", "b00:partner"]], xa=760, xb=1040),
    I("bird", "bird", 1500, 400, 150, "pop", "b01:bird", "b05"),
    BUB("q", "Look at that bird.", 640, 300, 300, "b01:look", "b03", fontSize=46),
    T("t1", "nothing *important*", 640, 200, 64, "top", "b03:nothing", "b04"),
    T("t2", "might matter more than your last *big fight*", 960, 200, 56, "top", "b04:fight", "b05"),
    I("q2", "question", 960, 540, 220, "pop", "b05:strange", "b06"),
    T("t3", "communicate better? fight less?", 960, 400, 72, "top", "b06:communicate", "b08"),
    T("t4", "not what the !cameras! showed", 960, 560, 72, "bottom", "b07:cameras", "b08"),
    I("cam", "camera", 700, 560, 240, "left", "b08:cameras", "b10"),
    I("hb", "heartbeat", 1240, 560, 260, "right", "b08:heart", "b10"),
    T("t5", "decades of *watching couples*", 960, 220, 64, "top", "b08:decades", "b09"),
    T("t6", "couples who last !still fight!", 960, 220, 72, "top", "b09:never", "b10"),
    T("t7", "so what do they do *instead*?", 960, 480, 90, "top", "b10:instead", "b11"),
    T("t8", "THE 10-SECOND HABIT", 960, 480, 120, "slam", "b11:habit", hero=True),
]})
# 2 · the Love Lab -------------------------------------------------------------------------
scenes.append({"id": "lab", "beats": R(12, 32), "elements": [
    CH("01", "The Love *Lab*", "b12:start", "b12:psychologists"),
    CARD("card", "PSYCHOLOGISTS · 1980s–90s", "Gottman & Levenson", "watching couples, for years", 960, 220, "b12:gottman", "b14"),
    T("t1", "like biologists *watching animals*", 960, 560, 72, "bottom", "b13:biologists", "b15"),
    I("couch", "couch", 960, 700, 520, "bottom", "b15:couples", "b19"),
    ST("la", 820, 668, "top", "b15:couples", [["idle", "b15:couples"], ["shrug", "b15:fought"]], [["smile", "b15:day"], ["tight", "b15:fought"]], out="b19", scale=0.8, sit=True),
    ST("lb", 1100, 668, "top", "b15:lab", [["idle", "b15:lab"], ["armsCrossed", "b15:fought"]], [["smile", "b15:day"], ["frown", "b15:fought"]], out="b19", scale=0.8, sit=True, flip=True, variant="bow"),
    I("cam", "camera", 380, 420, 200, "left", "b16:recorded", "b19"),
    I("hb", "heartbeat", 1560, 420, 200, "right", "b16:heart", "b19"),
    T("t2", "every *word*, *face* and *heartbeat*", 960, 200, 60, "top", "b16:word", "b17"),
    T("t3", "a lab like a small *apartment*", 960, 200, 64, "top", "b17:apartment", "b18"),
    T("t4", "a whole *day*, just living", 960, 200, 64, "top", "b18:day", "b19"),
    T("t4i", "then: the *important* part", 960, 480, 72, "bottom", "b19:then", "b20"),
    I("hg", "hourglass", 960, 520, 260, "pop", "b20:waited", "b24:ninety"),
    T("t5", "they *waited*. for *years*.", 960, 820, 72, "bottom", "b20:waited", "b22"),
    T("t6", "who was still *together*?", 960, 820, 72, "bottom", "b22:together", "b24:ninety"),
    T("t7", "!90%+! accuracy, they reported", 960, 400, 96, "slam", "b24:ninety", "b27", hero=True),
    T("t8", "critics: the models were *fitted* to data they already had", 960, 600, 44, "bottom", "b25:argued", "b27", weight=M, color="muted"),
    T("t9", "but the *patterns* held up", 960, 480, 90, "top", "b27:patterns", "b28"),
    I("sw", "stopwatch", 960, 560, 260, "pop", "b28:first", "b29"),
    T("t10", "the first *3 minutes*", 960, 830, 72, "bottom", "b28:three", "b29"),
    CARD("card2", "STUDY · 1999", "124 newlywed couples, one argument", "Carrère & Gottman", 960, 260, "b29:study", "b31"),
    I("pp", "people", 960, 470, 180, "pop", "b29:newlywed", "b30"),
    T("t11", "first minutes → married *6 years* later?", 960, 600, 64, "bottom", "b30:predicted", "b31"),
    T("t12", "how it *starts* = how it *ends*", 960, 480, 100, "slam", "b31:starts", "b32"),
    T("t13", "what *else*?", 960, 480, 100, "top", "b32:else"),
]})
# 3 · the magic ratio ----------------------------------------------------------------------
scenes.append({"id": "ratio", "beats": R(33, 48), "elements": [
    T("t0", "a *number*", 960, 480, 100, "top", "b33:number", "b34"),
    T("t1", "they didn't *avoid* negativity", 960, 200, 64, "top", "b34:avoid", "b35"),
    {"t": "balance", "id": "bal", "x": 960, "y": 620, "size": 600, "from": "bottom", "at": "b35:balanced", "out": "b41",
     "labels": ["1 BAD", "5 GOOD"], "tilt": [[0, "b35:balanced"], [-10, "b36:five"], [0, "b36:five"]]},
    T("t2", "they *balanced* it", 960, 200, 72, "top", "b35:balanced", "b36"),
    T("t3", "1 negative : *5 positive*", 960, 200, 72, "top", "b36:five", "b37"),
    T("p1", "a *touch*", 480, 200, 56, "left", "b37:touch", "b41"),
    T("p2", "a *joke*", 800, 200, 56, "top", "b38:joke", "b41"),
    T("p3", "“you're *right*”", 1120, 200, 56, "top", "b39:right", "b41"),
    T("p4", "a *smile*", 1440, 200, 56, "right", "b40:smile", "b41"),
    T("t4", "5 : 1", 960, 480, 220, "slam", "b41:five", "b42", hero=True),
    BAR("bar1", 760, 360, "stable: 5 : 1", "accent", "b42:couples", "b44:fights"),
    BAR("bar2", 1160, 72, "divorcing: ~1 : 1", "muted", "b42:one", "b44:fights"),
    T("t5", "sometimes *less*", 960, 300, 64, "bottom", "b43:less", "b44:fights", weight=M),
    T("t6", "plenty of *fights*", 960, 400, 80, "left", "b44:fights", "b46"),
    T("t7", "and *more of everything else*", 960, 540, 80, "right", "b45:everything", "b46"),
    T("t8", "not *whether* you fight", 960, 400, 80, "top", "b46:whether", "b48"),
    T("t9", "but what *else* happens", 960, 540, 80, "bottom", "b47:else", "b48"),
    T("t10", "some moments are more !dangerous!", 960, 480, 90, "slam", "b48:dangerous"),
]})
# 4 · the Four Horsemen ---------------------------------------------------------------------
scenes.append({"id": "horsemen", "beats": R(49, 84), "elements": [
    CH("02", "The Four *Horsemen*", "b49:start", "b51"),
    T("h1", "1 · CRITICISM", 960, 200, 90, "slam", "b51:criticism", "b56", hero=True),
    T("t1", "not what you *did* — who you *are*", 960, 340, 60, "bottom", "b52:complaining", "b54"),
    BUB("c1", "The trash is still here.", 600, 560, 320, "b54:complaint", "b56", fontSize=44),
    T("c1l", "complaint", 600, 820, 52, "bottom", "b54:complaint", "b56"),
    BUB("c2", "You never think about anyone but yourself.", 1320, 560, 380, "b55:criticism", "b56", fontSize=40),
    T("c2l", "!criticism!", 1320, 820, 52, "bottom", "b55:criticism", "b56"),
    T("h2", "2 · DEFENSIVENESS", 960, 200, 90, "slam", "b56:defensiveness", "b59", hero=True),
    ST("d", 960, 660, "bottom", "b57:answering", [["armsCrossed", "b57:answering"], ["point", "b58:well"]], [["tight", "b57:answering"]], out="b59"),
    T("t2", "an *excuse* or a *counter-attack*", 960, 960, 56, "bottom", "b57:excuse", "b58"),
    BUB("d1", "Well, YOU'RE the one who...", 1400, 400, 320, "b58:well", "b59", fontSize=42),
    T("h3", "3 · STONEWALLING", 960, 200, 90, "slam", "b59:stonewalling", "b66", hero=True),
    ST("s", 760, 660, "left", "b60:shutting", [["headDown", "b60:shutting"]], [["neutral", "b60:shutting"]], out="b66"),
    I("wall", "wall", 1200, 600, 320, "right", "b62:wall", "b66"),
    T("t3", "shut down · go silent · *a wall*", 960, 920, 56, "bottom", "b60:shutting", "b62"),
    T("t4", "see our video: *people who go quiet in a fight*", 960, 920, 48, "bottom", "b63:watched", "b64", weight=M),
    T("t5", "an *overwhelmed body*, not a cold heart", 960, 920, 52, "bottom", "b64:overwhelmed", "b66"),
    T("h4", "4 · CONTEMPT", 960, 200, 110, "slam", "b66:contempt", "b72", hero=True),
    ST("ct", 960, 660, "bottom", "b66:contempt", [["armsCrossed", "b66:contempt"], ["proud", "b71:better"]], [["tight", "b66:contempt"]], out="b72"),
    T("m1", "mockery", 480, 480, 60, "left", "b67:mockery", "b71"),
    T("m2", "sarcasm", 480, 640, 60, "left", "b68:sarcasm", "b71"),
    T("m3", "eye-rolling", 1440, 480, 60, "right", "b69:eyerolling", "b71"),
    T("m4", "talking down", 1440, 640, 60, "right", "b70:talking", "b71"),
    BUB("ctb", "I'm better than you.", 1280, 470, 280, "b71:better", "b72", fontSize=44),
    T("t6", "the #1 predictor of !divorce!", 960, 440, 90, "slam", "b72:predictor", "b74", hero=True),
    I("hb", "heartbeat", 960, 560, 240, "pop", "b73:body", "b75"),
    T("t7", "more *infections*, over 4 years", 960, 820, 64, "bottom", "b74:infectious", "b75"),
    T("t8", "each one has an *antidote*", 960, 200, 72, "top", "b75:antidote", "b83"),
    T("a1", "criticism → *start gently*", 960, 340, 56, "left", "b76:gently", "b83"),
    T("a1q", "“I feel stressed when the dishes pile up”", 960, 420, 44, "left", "b77:stressed", "b83", weight=M, color="muted"),
    T("a2", "defensiveness → *take responsibility*", 960, 520, 56, "right", "b78:responsibility", "b83"),
    T("a3", "stonewalling → *a real break* (20 min)", 960, 620, 56, "left", "b79:break", "b83"),
    T("a4", "contempt → *appreciation*", 960, 720, 56, "right", "b81:appreciation", "b83"),
    T("t9", "not the *whole story*", 960, 480, 100, "top", "b83:story", "b84"),
    T("t10", "the part nobody !expects!", 960, 480, 90, "slam", "b84:expects"),
]})
# 5 · most fights never end -----------------------------------------------------------------
scenes.append({"id": "perpetual", "beats": R(85, 97), "elements": [
    T("t0", "happy couples don't *solve* most problems", 960, 220, 64, "top", "b85:solve", "b86"),
    T("t1", "!69%! never go away", 960, 460, 130, "slam", "b86:sixty", "b88", hero=True),
    I("i1", "money", 520, 560, 220, "left", "b88:money", "b91"),
    I("i2", "house", 960, 560, 220, "top", "b89:kitchen", "b91"),
    I("i3", "calendar", 1400, 560, 220, "right", "b90:holidays", "b91"),
    T("i1l", "money", 520, 800, 52, "bottom", "b88:money", "b91"),
    T("i2l", "the kitchen", 960, 800, 52, "bottom", "b89:kitchen", "b91"),
    T("i3l", "the holidays", 1400, 800, 52, "bottom", "b90:holidays", "b91"),
    T("t2", "real *personality* differences", 960, 480, 80, "top", "b91:personality", "b92"),
    T("t3", "a partner = a *set of problems* for years", 960, 480, 72, "slam", "b92:problems", "b93"),
    T("t4", "they don't *win*", 960, 360, 80, "left", "b93:win", "b96"),
    T("t5", "humor · no contempt · *understanding*", 960, 520, 64, "right", "b95:understand", "b96"),
    T("t6", "so what *is* it about?", 960, 480, 100, "top", "b96:about", "b97"),
    I("bird", "bird", 960, 500, 260, "pop", "b97:bird"),
    T("t7", "the !bird!", 960, 800, 100, "slam", "b97:bird", hero=True),
]})
# 6 · the bird ------------------------------------------------------------------------------
scenes.append({"id": "bids", "beats": R(98, 126), "elements": [
    T("t0", "BIDS", 960, 220, 120, "slam", "b98:bids", "b100", hero=True),
    T("t1", "small attempts to *connect*", 960, 360, 64, "bottom", "b99:connect", "b100"),
    T("t2", "all day long · mostly *tiny*", 960, 220, 64, "top", "b100:tiny", "b101"),
    BUB("b1", "Look at that bird.", 480, 520, 280, "b101:look", "b105", fontSize=44),
    BUB("b2", "Guess what happened at work.", 1000, 400, 320, "b102:guess", "b105", fontSize=40),
    T("b3", "a *sigh*", 1460, 560, 64, "right", "b103:sigh", "b105"),
    T("b4", "a hand on your *shoulder*", 960, 820, 60, "bottom", "b104:hand", "b105"),
    T("t3", "every bid: *three* answers", 960, 220, 72, "top", "b105:three", "b112"),
    *couple("r", "b106:toward", "b112", [["idle", "b106:toward"], ["point", "b106:toward"], ["headDown", "b108:away"], ["armsCrossed", "b110:against"]],
            [["happy", "b106:toward"], ["idle", "b108:away"], ["shrug", "b110:against"]]),
    T("r1", "1 · turn *toward*", 520, 360, 56, "left", "b106:toward", "b112"),
    BUB("r1b", "Oh wow, what kind is it?", 520, 560, 330, "b107:wow", "b108", fontSize=40),
    T("r2", "2 · turn *away*", 960, 360, 56, "top", "b108:away", "b112"),
    T("r3", "3 · turn !against!", 1400, 360, 56, "right", "b110:against", "b112"),
    BUB("r3b", "Can't you see I'm busy?", 1400, 560, 280, "b111:busy", "b112", fontSize=40),
    T("t4", "turning away feels *harmless*", 960, 400, 72, "top", "b112:harmless", "b114"),
    T("t5", "silence sounds like !“you don't matter”!", 960, 560, 64, "bottom", "b114:matter", "b115"),
    CARD("card", "NEWLYWEDS · 6 YEARS", "Who turned toward bids?", "Gottman", 960, 220, "b115:newlywed", "b119"),
    BAR("bar1", 760, 344, "still married: 86%", "accent", "b116:eighty", "b119"),
    BAR("bar2", 1160, 132, "divorced: 33%", "muted", "b118:thirty", "b119"),
    T("t6", "the *10-second habit*", 960, 220, 80, "top", "b119:habit", "b122"),
    T("t7", "not grand *gestures*", 960, 400, 72, "left", "b120:grand", "b122"),
    T("t8", "not perfect *communication*", 960, 540, 72, "right", "b121:perfect", "b122"),
    I("bird", "bird", 960, 520, 260, "pop", "b122:bird", "b126"),
    T("t9", "just looking at the !bird!", 960, 820, 80, "slam", "b122:looking", "b123", hero=True),
    T("t10", "“I'm here. *You matter.*”", 960, 820, 72, "bottom", "b123:here", "b125"),
    T("t11", "turn away: a little *trust* leaks out", 960, 820, 60, "bottom", "b125:trust", "b126"),
    T("t12", "but it wasn't over yet", 960, 480, 100, "slam", "b126:over", hero=True),
]})
# 7 · the good news test and novelty ---------------------------------------------------------
scenes.append({"id": "goodnews", "beats": R(127, 146), "elements": [
    T("t0", "when things go *right*", 960, 480, 90, "top", "b128:wrong", "b129"),
    CARD("card", "STUDY · 2004", "When things go right", "Shelly Gable et al.", 960, 220, "b129:gable", "b130"),
    ST("a", 520, 660, "left", "b130:home", [["victory", "b130:promotion"], ["headDown", "b131:nice"], ["shrug", "b132:longer"], ["victory", "b133:light"]],
       [["smile", "b130:home"], ["frown", "b131:nice"], ["tight", "b132:longer"], ["smile", "b133:light"]], out="b136"),
    BUB("p", "I got the promotion!", 520, 300, 300, "b130:promotion", "b131", fontSize=46),
    BUB("r1", "Nice.", 1300, 300, 240, "b131:nice", "b132", fontSize=60),
    BUB("r2", "Won't that mean longer hours?", 1300, 300, 340, "b132:longer", "b133", fontSize=40),
    BUB("r3", "Tell me everything!", 1300, 300, 300, "b133:everything", "b135", fontSize=46),
    I("h", "heart", 1300, 640, 180, "pop", "b135:trust", "b136", color="accent"),
    T("t1", "*trust* · *intimacy* · *satisfaction*", 1300, 860, 52, "bottom", "b135:trust", "b136"),
    T("t2", "celebrating is a *skill*", 960, 400, 80, "top", "b136:skill", "b138"),
    T("t3", "most of us are a bit !lazy! at it", 960, 540, 72, "bottom", "b137:lazy", "b138"),
    T("t4", "the best news *all week*?", 960, 480, 90, "top", "b138:best", "b139"),
    T("t5", "BOREDOM", 960, 480, 140, "slam", "b139:boredom", "b140", hero=True),
    CARD("card2", "STUDY · 2000", "A strange task for couples", "Arthur Aron et al.", 960, 220, "b140:aron", "b141"),
    ST("ta", 860, 660, "left", "b141:tied", [["victory", "b141:tied"], ["happy", "b141:course"]], [["smile", "b141:tied"]], out="b143"),
    ST("tb", 1060, 660, "right", "b141:wrist", [["victory", "b141:wrist"], ["happy", "b141:course"]], [["smile", "b141:wrist"]], out="b143", flip=True, variant="bow"),
    T("t6", "tied at wrist & ankle · obstacle course · *a pillow*", 960, 220, 48, "top", "b141:pillow", "b143"),
    T("t7", "7 MINUTES", 960, 440, 150, "slam", "b143:seven", "b144", hero=True),
    T("t8", "→ felt *better* about the relationship", 960, 620, 60, "bottom", "b143:better", "b144"),
    I("sun", "sun", 960, 520, 220, "pop", "b144:spark", "b146"),
    T("t9", "novelty brings back the *spark*", 960, 800, 64, "bottom", "b144:spark", "b145"),
    T("t10", "not the usual restaurant: something *new*", 960, 800, 56, "bottom", "b146:new", "b146:end"),
]})
# 8 · what to do with this ---------------------------------------------------------------------
scenes.append({"id": "todo", "beats": R(147, 163), "elements": [
    T("t0", "what to do *tomorrow*", 960, 180, 72, "top", "b147:tomorrow"),
    I("cl", "checklist", 360, 560, 300, "left", "b148:start"),
    T("l1", "start hard talks *gently*", 1100, 300, 52, "right", "b148:gently"),
    T("l2", "turn toward the *bids*", 1100, 390, 52, "right", "b150:bids"),
    T("l3", "*5 good* for every bad", 1100, 480, 52, "right", "b152:five"),
    T("l4", "contempt → *appreciation*", 1100, 570, 52, "right", "b153:appreciation"),
    T("l5", "*celebrate* good news", 1100, 660, 52, "right", "b155:celebrate"),
    T("l6", "try something *new*", 1100, 750, 52, "right", "b156:new"),
    T("l7", "get help *early*", 1100, 840, 52, "right", "b159:help"),
    T("t1", "the average couple waits *6 years*", 1100, 940, 44, "bottom", "b160:six", weight=M, color="muted"),
    I("cal", "calendar", 360, 900, 140, "pop", "b160:average"),
]})
# 9 · the twist and the ending -------------------------------------------------------------------
scenes.append({"id": "end", "tail": 2.6, "beats": R(164, 178), "elements": [
    T("t0", "the !twist!", 960, 480, 130, "slam", "b164:twist", "b165", hero=True),
    T("t1", "couples who last *still fight*", 960, 220, 72, "top", "b165:fight", "b167"),
    T("t2", "the difference is *tiny*", 960, 220, 72, "top", "b167:tiny", "b168"),
    I("win", "window", 1500, 420, 300, "right", "b168:notice", "b172"),
    I("bird", "bird", 1500, 400, 150, "pop", "b168:reaches", "b172"),
    ST("a", 780, 660, "left", "b168:notice", [["point", "b168:reaches"], ["happy", "b169:back"]], [["smile", "b168:notice"]], out="b172"),
    ST("b", 1080, 660, "left", "b168:other", [["idle", "b168:other"], ["point", "b169:back"]], [["smile", "b169:back"]], out="b172", variant="bow"),
    T("t3", "they notice · they *reach back*", 960, 220, 72, "top", "b168:notice", "b170"),
    T("t4", "love fades when nobody looks at the !bird!", 960, 220, 60, "top", "b171:fades", "b172"),
    I("eye", "check", 960, 520, 200, "pop", "b173:look", "b175"),
    T("t4b", "your *challenge* for this week", 960, 220, 64, "top", "b172:challenge", "b175"),
    T("t5", "this week: when they say “look” — *look*", 960, 820, 60, "bottom", "b173:look", "b175"),
    T("t6", "do *you* look?", 960, 200, 90, "top", "b175:look"),
    I("bird2", "bird", 960, 480, 220, "pop", "b175:partner"),
    T("t7", "which habit *next*?", 960, 760, 80, "bottom", "b177:habit", hero=True),
    T("t8", "@darealwhy", 960, 880, 48, "bottom", "b178:comments", weight=M, color="muted"),
]})

(ROOT / "script").mkdir(exist_ok=True)
(ROOT / "script/script.json").write_text(json.dumps({"title": "The Psychology of Couples Who Last", "scenes": scenes}, indent=1, ensure_ascii=False))
print(sum(len(s["elements"]) for s in scenes), "elements,", len(S), "sentences")
