"""Writes script/script.json for video 5 from timing/words.json (one beat per spoken sentence)
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
# 1 · hook ------------------------------------------------------------------------------
scenes.append({"id": "hook", "beats": R(0, 11), "elements": [
    I("ph", "phone", 560, 560, 300, "none", "b00:start", "b03", startAtZero=True),
    BUB("msg", "I'll be there in 5 minutes.", 1180, 420, 300, "b00:start", "b03", fontSize=46),
    T("t1", "you've sent this. maybe *today*.", 1180, 760, 60, "bottom", "b01:sent", "b03"),
    ST("f", 1150, 650, "right", "b03:someone", [["headDown", "b03:someone"], ["idle", "b03:watching"]], [["frown", "b03:someone"]], out="b05", scale=0.75, sit=True),
    I("tb", "table", 1200, 700, 300, "right", "b03:someone", "b05"),
    I("door", "door", 420, 600, 260, "left", "b03:door", "b05"),
    T("t2", "+20 minutes", 960, 200, 80, "slam", "b03:twenty", "b04", hero=True),
    T("t3", "the *strange* part", 960, 200, 80, "top", "b04:strange", "b05"),
    T("t4", "you weren't !lying!", 960, 440, 96, "slam", "b05:lying", "b06"),
    T("t5", "you *believed* five minutes", 960, 440, 80, "top", "b06:believed", "b07"),
    I("md", "medal", 600, 560, 260, "left", "b07:nobel", "b09"),
    T("m1", "a *Nobel* winner", 600, 820, 60, "bottom", "b07:nobel", "b09"),
    I("op", "opera", 1320, 560, 300, "right", "b08:country", "b09"),
    T("m2", "a whole *country*, 10 years", 1320, 820, 60, "bottom", "b08:country", "b09"),
    T("t6", "why your brain gets *time* wrong", 960, 380, 72, "top", "b09:time", "b11"),
    I("q", "question", 960, 640, 200, "pop", "b10:question", "b11"),
    T("t7", "+ the *one question* that fixes it", 960, 860, 56, "bottom", "b10:question", "b11"),
    T("t8", "where do *15 minutes* go?", 960, 480, 100, "slam", "b11:fifteen", hero=True),
]})
# 2 · a whole country, ten years late ---------------------------------------------------------
scenes.append({"id": "opera", "beats": R(12, 24), "elements": [
    CH("01", "Ten years *late*", "b12:start", "b13:nineteen"),
    I("op", "opera", 960, 560, 440, "bottom", "b13:opera", "b17"),
    T("t1", "Sydney · *1957*", 960, 200, 72, "top", "b13:sydney", "b14"),
    T("t2", "plan: *1963* · *$7 million*", 960, 200, 72, "top", "b14:plan", "b15"),
    T("t3", "opened: !1973!", 960, 200, 90, "slam", "b15:opened", "b16"),
    T("t4", "10 YEARS LATE", 960, 200, 110, "slam", "b16:ten", "b17", hero=True),
    BAR("bar1", 760, 30, "planned $7M", "muted", "b17:bill", "b19", y=880),
    BAR("bar2", 1160, 420, "actual $102M", "accent", "b17:hundred", "b19", y=880),
    T("t5", "!14×! the price", 960, 200, 100, "slam", "b18:fourteen", "b19", hero=True),
    CARD("card", "ARCHITECT", "Jørn Utzon", "never saw it finished", 960, 220, "b19:architect", "b21"),
    ST("u", 960, 600, "top", "b19:utzon", [["headDown", "b19:never"], ["give", "b20:quit"]], [["frown", "b19:never"]], out="b21"),
    I("bc", "briefcase", 1240, 760, 140, "pop", "b20:home", "b21"),
    T("t6", "quit *1966* · went home to Denmark", 960, 900, 56, "bottom", "b20:quit", "b21"),
    I("tv", "tvOff", 960, 560, 300, "pop", "b21:queen", "b22"),
    T("t7", "the opening, 1973: *not watching*", 960, 840, 60, "bottom", "b21:watching", "b22"),
    T("t8", "only *giant* projects?", 960, 440, 90, "top", "b22:giant", "b23"),
    T("t9", "!NO!", 960, 440, 200, "slam", "b23:doesn't", "b24", hero=True),
    T("t10", "the man who *explained* it", 960, 420, 72, "left", "b24:explained", "b25"),
    T("t11", "made the *same mistake*", 960, 560, 72, "right", "b24:mistake", "b25"),
]})
# 3 · the Nobel winner who was late -------------------------------------------------------------
scenes.append({"id": "kahneman", "beats": R(25, 50), "elements": [
    CARD("card", "PSYCHOLOGIST · NOBEL PRIZE 2002", "Daniel Kahneman", "Israel, early 1970s", 960, 220, "b25:kahneman", "b27"),
] + [ST(f"tm{i}", 520 + i * 220, 680, "bottom", "b26:team", [["idle", "b26:team"], ["shrug", "b28:long"], ["happy", "b30:two"]],
        [["neutral", "b26:team"], ["smile", "b30:two"]], scale=0.6, out="b33", flip=i % 2 == 1, delay=0.05 * i) for i in range(5)] + [
    I("bk", "book", 1680, 640, 200, "right", "b26:textbook", "b33"),
    BUB("q1", "How long until we're done?", 960, 260, 380, "b28:long", "b29", fontSize=42),
    T("t1", "everyone: about *2 years*", 960, 220, 72, "top", "b30:two", "b31"),
    BUB("q2", "How long did OTHER teams take?", 960, 260, 400, "b32:other", "b33", fontSize=40),
    ST("ex", 960, 640, "top", "b33:expert", [["headDown", "b33:quiet"], ["shrug", "b34:admitted"], ["give", "b38:below"]],
       [["tight", "b33:quiet"], ["o", "b34:admitted"], ["smile", "b38:below"]], out="b40"),
    T("t2", "the expert went *quiet*", 960, 220, 72, "top", "b33:quiet", "b34"),
    T("t3", "!40%! never finished", 960, 220, 96, "slam", "b35:forty", "b36", hero=True),
    T("t4", "the rest: *7–10 years*", 960, 220, 80, "top", "b36:seven", "b37"),
    BUB("q3", "Below average… but not by much.", 1440, 300, 380, "b38:below", "b40", fontSize=40),
    T("t5", "nobody *quit*", 960, 360, 80, "left", "b40:quit", "b42"),
    T("t6", "nobody changed the *plan*", 960, 500, 80, "right", "b41:plan", "b42"),
    T("t7", "it took !8 YEARS!", 960, 460, 130, "slam", "b42:eight", "b43", hero=True),
    T("t8", "“we should have *quit* that day”", 960, 460, 72, "top", "b43:quit", "b44"),
    CARD("card2", "1979 · KAHNEMAN & TVERSKY", "The planning fallacy", "a name for the mistake", 960, 260, "b44:nineteen", "b47"),
    I("brn", "brain", 960, 560, 200, "pop", "b44:mistake", "b45"),
    T("t9", "we plan for the *best case*", 960, 560, 72, "left", "b45:best", "b47"),
    T("t10", "then the !real one! shows up", 960, 700, 72, "right", "b46:real", "b47"),
    CARD("card3", "1979 · DOUGLAS HOFSTADTER", "Hofstadter's Law", "a joke that became famous", 960, 220, "b47:hofstadter", "b51"),
    BUB("q4", "It always takes longer than you expect…", 960, 560, 420, "b48:always", "b49", fontSize=42),
    T("t11", "…even when you expect *that*.", 960, 860, 56, "bottom", "b48:even", "b49"),
    T("t12", "a *joke*", 960, 520, 90, "left", "b49:joke", "b51"),
    T("t13", "and painfully !accurate!", 960, 660, 80, "right", "b50:accurate", "b51"),
]})
# 4 · over budget, over time ---------------------------------------------------------------------
scenes.append({"id": "data", "beats": R(51, 63), "elements": [
    T("t0", "the *numbers*", 960, 480, 100, "slam", "b51:numbers", "b52"),
    CARD("card", "ECONOMIST · BENT FLYVBJERG", "16,000+ big projects", "in 100+ countries", 960, 220, "b52:economist", "b53"),
    I("grid", "grid", 960, 600, 300, "pop", "b52:projects", "b53"),
    T("t1", "!8.5%! on time and on budget", 960, 420, 96, "slam", "b53:eight", "b54", hero=True),
    T("t2", "*0.5%* delivered what they promised", 960, 600, 64, "bottom", "b54:half", "b55"),
    T("w1", "over *budget*", 960, 300, 80, "left", "b55:budget", "b56"),
    T("w2", "over *time*", 960, 440, 80, "right", "b55:time", "b56"),
    T("w3", "over and over !again!", 960, 580, 80, "left", "b55:again", "b56"),
    I("tn", "tunnel", 960, 560, 300, "bottom", "b56:tunnel", "b58"),
    T("t3", "Boston's *Big Dig*: $2.8 billion", 960, 220, 64, "top", "b56:budgeted", "b57"),
    T("t4", "final: !$14.6 billion! · 2007", 960, 220, 72, "slam", "b57:fourteen", "b58"),
    I("pl", "plane", 960, 560, 280, "right", "b58:airlines", "b60"),
    T("t5", "airlines *pad* their schedules", 960, 220, 72, "top", "b59:pad", "b60"),
    ST("me", 960, 650, "bottom", "b60:thinking", [["shrug", "b60:thinking"], ["happy", "b61:brunch"]], [["o", "b60:thinking"], ["smile", "b61:brunch"]], out="b62"),
    T("t6", "“I'm just late for *brunch*”", 960, 220, 72, "top", "b61:brunch", "b62"),
    T("t7", "one *student*, one *deadline*", 960, 480, 90, "slam", "b63:student"),
]})
# 5 · later than the worst case ---------------------------------------------------------------------
scenes.append({"id": "thesis", "beats": R(64, 83), "elements": [
    CH("02", "Later than the *worst case*", "b64:start", "b64:canadian", "right"),
    CARD("card", "STUDY · 1994 · CANADA", "37 students, one thesis", "Buehler, Griffin & Ross", 960, 220, "b64:researchers", "b65"),
    ST("s", 440, 660, "left", "b64:students", [["idle", "b64:students"], ["point", "b67:average"], ["shrug", "b70:worst"], ["holdHead", "b72:fifty"]],
       [["neutral", "b64:students"], ["smile", "b67:average"], ["o", "b72:fifty"]], out="b77"),
    BUB("q1", "When will you finish?", 1240, 380, 300, "b65:finish", "b67", fontSize=44),
    BAR("bar1", 960, 247, "best guess: 34", "muted", "b67:thirty", "b77"),
    BUB("q2", "What if everything goes badly?", 1240, 300, 360, "b69:badly", "b70", fontSize=40),
    BAR("bar2", 1240, 356, "worst case: 49", "muted", "b70:forty", "b77"),
    BAR("bar3", 1520, 400, "actual: 55", "accent", "b72:fifty", "b77"),
    T("t1", "how long did it *really* take?", 1240, 220, 60, "top", "b71:really", "b72"),
    T("t2", "later than the !worst case!", 1240, 220, 64, "top", "b73:later", "b75"),
    T("t3", "reality was *worse than the disaster*", 1240, 220, 52, "top", "b75:worse", "b76"),
    T("t4", "only *30%* on time", 1240, 220, 72, "top", "b76:thirty", "b77"),
    BUB("q3", "This time will be different.", 960, 300, 360, "b78:this", "b79", fontSize=44),
    ST("s2", 960, 660, "bottom", "b77:knew", [["happy", "b77:knew"]], [["smile", "b77:knew"]], out="b79"),
    T("t5", "the *inside view*", 960, 460, 110, "slam", "b79:inside", "b80", hero=True),
    T("t6", "*this* task, *this* week, going smoothly", 960, 220, 60, "top", "b80:task", "b81"),
    I("i1", "paper", 520, 560, 220, "left", "b81:printer", "b82"),
    I("i2", "phone", 960, 560, 220, "top", "b81:friend", "b82"),
    I("i3", "train", 1400, 560, 240, "right", "b81:bus", "b82"),
    T("i1l", "printer jam", 520, 800, 52, "bottom", "b81:printer", "b82"),
    T("i2l", "a call", 960, 800, 52, "bottom", "b81:friend", "b82"),
    T("i3l", "the bus", 1400, 800, 52, "bottom", "b81:bus", "b82"),
    T("t7", "why don't we *learn*?", 960, 480, 100, "top", "b82:learn", "b83"),
    I("br", "brain", 960, 540, 260, "pop", "b83:brain"),
    T("t8", "your brain is !lying! to you", 960, 830, 72, "bottom", "b83:lying"),
]})
# 6 · three lies ---------------------------------------------------------------------------------
scenes.append({"id": "lies", "beats": R(84, 117), "elements": [
    T("l1", "LIE #1: YOUR MEMORY", 960, 480, 110, "slam", "b84:lie", "b85", hero=True),
    CARD("card", "REVIEW · 2005", "Memory bias", "Roy, Christenfeld & McKenzie", 960, 220, "b85:psychologists", "b87"),
    T("t1", "we remember tasks as *shorter*", 960, 220, 72, "top", "b87:shorter", "b88"),
    I("c1", "clock", 600, 560, 260, "left", "b86:before", "b92"),
    T("c1l", "real: *40 min*", 600, 820, 60, "bottom", "b88:forty", "b92"),
    BUB("c2", "25 min", 1300, 480, 260, "b89:memory", "b92", fontSize=60),
    T("c2l", "your memory", 1300, 820, 60, "bottom", "b89:memory", "b92"),
    T("t2", "every. single. !day.!", 960, 220, 72, "top", "b91:every", "b92"),
    T("t2b", "2007: they *tested* it", 960, 480, 90, "top", "b92:tested", "b93"),
    T("t3", "shortest memories → *worst* guesses", 960, 480, 72, "top", "b93:shortest", "b94"),
    T("l2", "LIE #2: A MINUTE", 960, 480, 110, "slam", "b94:lie", "b95", hero=True),
    I("sw", "stopwatch", 960, 560, 260, "pop", "b95:minute", "b96"),
    T("t4", "guess when *one minute* has passed", 960, 840, 60, "bottom", "b95:guess", "b96"),
    BAR("bar1", 760, 290, "Type A: 58 s", "muted", "b96:fifty", "b100"),
    BAR("bar2", 1160, 385, "Type B: 77 s", "accent", "b97:seventy", "b100"),
    T("t5", "*~20 seconds* apart, in one minute", 960, 220, 60, "top", "b98:twenty", "b99"),
    T("t5b", "one says “time!” · the other has *20 s* left", 960, 220, 56, "top", "b99:up", "b100"),
    I("sw2", "stopwatch", 960, 520, 300, "pop", "b100:try", "b104"),
    T("t6", "PAUSE AND TRY IT", 960, 200, 90, "slam", "b100:try", "b102", hero=True),
    T("t7", "close your eyes · count *one minute*", 960, 860, 56, "bottom", "b101:count", "b102"),
    T("t8", "most people are *off*", 960, 200, 80, "top", "b102:off", "b104"),
    T("t9", "5 minutes ≠ 5 minutes", 960, 480, 110, "slam", "b104:literally", "b105", hero=True),
    T("l3", "LIE #3: ONE MORE THING", 960, 200, 90, "slam", "b105:lie", "b110", hero=True),
    ST("d", 360, 660, "left", "b105:thing", [["point", "b106:email"], ["shrug", "b109:time"], ["holdHead", "b110:late"]],
       [["smile", "b106:email"], ["o", "b110:late"]], out="b111"),
    I("o1", "laptop", 760, 560, 200, "pop", "b106:email", "b110"),
    I("o2", "tv", 1120, 560, 200, "pop", "b107:episode", "b110"),
    I("o3", "keys", 1480, 560, 200, "pop", "b108:keys", "b110"),
    T("o1l", "email", 760, 780, 52, "bottom", "b106:email", "b110"),
    T("o2l", "episode", 1120, 780, 52, "bottom", "b107:episode", "b110"),
    T("o3l", "keys", 1480, 780, 52, "bottom", "b108:keys", "b110"),
    T("t10", "!+15 minutes!", 1120, 480, 130, "slam", "b110:fifteen", "b111", hero=True),
    I("gl", "globe", 960, 560, 280, "pop", "b111:culture", "b114"),
    CARD("card2", "PACE OF LIFE · 31 COUNTRIES", "Robert Levine", "walking · post offices · clocks", 960, 220, "b112:levine", "b114"),
    I("sw", "stopwatch", 1500, 620, 160, "pop", "b113:timed", "b114"),
    T("t11", "*Switzerland*: the fastest", 960, 480, 100, "slam", "b114:switzerland", "b115"),
    T("t12", "5 minutes late = *nothing*", 960, 400, 72, "left", "b115:nothing", "b117"),
    T("t13", "5 minutes late = !an insult!", 960, 540, 72, "right", "b116:insult", "b117"),
    I("cl", "clock", 960, 540, 260, "pop", "b117:clock"),
    T("t14", "your clock was set *before you could read*", 960, 830, 56, "bottom", "b117:read"),
]})
# 7 · the friend at the table --------------------------------------------------------------------
scenes.append({"id": "table", "beats": R(118, 129), "elements": [
    ST("f", 930, 655, "top", "b118:friend", [["headDown", "b118:friend"], ["idle", "b120:see"], ["headDown", "b127:crawl"]],
       [["frown", "b118:friend"], ["tight", "b120:see"], ["frown", "b127:crawl"]], out="b128", scale=0.8, sit=True),
    I("tb", "table", 1000, 720, 340, "bottom", "b118:restaurant", "b128"),
    I("cl", "clock", 1460, 420, 180, "pop", "b119:minute", "b127"),
    T("t1", "they see: *five minutes*", 960, 200, 72, "top", "b120:see", "b121"),
    T("t2", "10 min × 3 a week × 52", 960, 200, 64, "top", "b121:ten", "b121:twenty", weight=M),
    T("t3", "!26 HOURS! a year", 960, 200, 96, "slam", "b121:twenty", "b122", hero=True),
    T("t4", "a whole *day* of their life", 960, 200, 72, "top", "b122:day", "b123"),
    T("t5", "it feels *longer* for them", 960, 200, 72, "top", "b123:longer", "b124"),
    CARD("card", "1985 · DAVID MAISTER", "The psychology of waiting", "empty time feels longer", 960, 220, "b124:maister", "b125"),
    T("t5b", "empty time > *busy* time", 960, 220, 72, "top", "b125:empty", "b126"),
    T("t6", "your 10 minutes *fly*", 480, 300, 64, "left", "b126:fly", "b128"),
    T("t7", "theirs !crawl!", 1440, 300, 72, "right", "b127:crawl", "b128"),
    T("t8", "it sounds *hopeless*", 960, 480, 90, "top", "b128:hopeless", "b129"),
    T("t9", "but it wasn't over yet", 960, 480, 100, "slam", "b129:over", hero=True),
]})
# 8 · the fix ----------------------------------------------------------------------------------
scenes.append({"id": "fix", "beats": R(130, 155), "elements": [
    CH("03", "The *fix*", "b130:start", "b130:doomed"),
    T("t0", "late forever?", 960, 400, 90, "top", "b130:forever", "b132"),
    T("t1", "!NO!", 960, 560, 150, "slam", "b131:no", "b132", hero=True),
    T("t2", "trying harder", 960, 480, 100, "top", "b132:harder", "b134"),
    K("k1", 960, 480, 700, "b132:harder", "b134", delay=0.3),
    T("t3", "change how you *plan*", 960, 480, 100, "slam", "b134:plan", "b135"),
    T("f1", "FIX 1: BREAK IT DOWN", 960, 200, 90, "slam", "b135:fix", "b144", hero=True),
    CARD("card", "STUDY · 2004", "If you don't want to be late, enumerate", "Kruger & Evans", 960, 420, "b136:study", "b137:enumerate"),
    I("cl", "checklist", 600, 600, 300, "left", "b138:shower", "b144"),
    T("s1", "shower", 1200, 380, 52, "right", "b138:shower", "b144"),
    T("s2", "get dressed", 1200, 470, 52, "right", "b139:dressed", "b144"),
    T("s3", "find keys", 1200, 560, 52, "right", "b140:keys", "b144"),
    T("s4", "walk to the car", 1200, 650, 52, "right", "b141:walk", "b144"),
    T("s5", "find *parking*", 1200, 740, 52, "right", "b142:parking", "b144"),
    T("t4", "every step = one your brain *skipped*", 960, 900, 56, "bottom", "b143:skipped", "b144"),
    T("f2", "FIX 2: PLAN BACKWARDS", 960, 200, 90, "slam", "b144:fix", "b147", hero=True),
    I("cal", "calendar", 960, 560, 260, "pop", "b145:deadline", "b147"),
    T("t5", "“in my seat at *9*” → walk it *back*", 960, 860, 60, "bottom", "b146:nine", "b147"),
    T("f3", "FIX 3: THE QUESTION", 960, 200, 90, "slam", "b147:fix", "b155", hero=True),
    T("t5c", "the one Kahneman's *expert* answered", 960, 480, 72, "top", "b148:expert", "b149"),
    T("t6", "“How long *will* this take?”", 960, 440, 72, "left", "b149:will", "b151"),
    K("k2", 960, 440, 900, "b150:ask", "b151"),
    T("t7", "“How long !did! this take last time?”", 960, 600, 72, "right", "b150:did", "b151"),
    I("sw", "stopwatch", 960, 560, 260, "pop", "b151:stopwatch", "b154"),
    T("t8", "alarm → front door", 960, 830, 64, "bottom", "b151:alarm", "b152"),
    T("t9", "plan with *that* number", 960, 830, 64, "bottom", "b153:plan", "b154"),
    T("t10", "+1 “one more thing”", 960, 480, 100, "slam", "b154:one", "b155"),
    I("cal2", "calendar", 960, 560, 240, "pop", "b155:calendar"),
    T("t11", "calendar: when to *leave*, not arrive", 960, 830, 60, "bottom", "b155:leave"),
]})
# 9 · the twist and the ending -------------------------------------------------------------------
scenes.append({"id": "end", "tail": 2.6, "beats": R(156, 170), "elements": [
    T("t0", "the !twist!", 960, 480, 130, "slam", "b156:twist", "b157", hero=True),
    I("sun", "sun", 960, 520, 240, "pop", "b158:optimists", "b161"),
    T("t1", "not careless", 960, 200, 72, "top", "b157:careless", "b158"),
    T("t2", "*optimists*", 960, 200, 110, "slam", "b158:optimists", "b160", hero=True),
    T("t3", "a pretty *nice* mistake", 960, 830, 64, "bottom", "b160:nice", "b161"),
    I("op", "opera", 960, 560, 400, "bottom", "b161:utzon", "b164"),
    T("t4", "1999: Utzon asked *back*", 960, 200, 72, "top", "b161:nineteen", "b162"),
    T("t5", "2007: *World Heritage*", 960, 200, 80, "top", "b162:world", "b164"),
    T("t6", "nobody remembers the *10 years*", 960, 200, 64, "top", "b164:nobody", "b165"),
    ST("f", 890, 660, "top", "b165:friend", [["headDown", "b165:friend"]], [["frown", "b165:friend"]], out="b167", scale=0.75, sit=True),
    I("tb", "table", 960, 720, 320, "bottom", "b165:restaurant", "b167"),
    T("t7", "they'll remember the *20 minutes*", 960, 200, 64, "top", "b165:twenty", "b166"),
    T("t8", "*your* 5 minutes ≠ *their* 5 minutes", 960, 200, 64, "top", "b166:never", "b167"),
    I("cl", "clock", 960, 460, 220, "pop", "b167:always"),
    T("t9", "always *late*, or always *waiting*?", 960, 200, 72, "top", "b167:late"),
    T("t10", "which habit *next*?", 960, 750, 80, "bottom", "b169:habit", hero=True),
    T("t11", "@darealwhy", 960, 880, 48, "bottom", "b170:comments", weight=M, color="muted"),
]})

(ROOT / "script").mkdir(exist_ok=True)
(ROOT / "script/script.json").write_text(json.dumps({"title": "The Psychology of People Who Are Always Late", "scenes": scenes}, indent=1, ensure_ascii=False))
print(sum(len(s["elements"]) for s in scenes), "elements,", len(S), "sentences")
