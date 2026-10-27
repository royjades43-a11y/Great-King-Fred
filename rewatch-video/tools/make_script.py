"""Writes script/script.json for video 2 from timing/words.json (one beat per spoken sentence)
plus the hand-placed elements below. Cues are "bNN:word" = that word of sentence NN."""
import json, re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
W = json.loads((ROOT / "timing/words.json").read_text())["words"]
S, cur = [], []
for w in W:
    cur.append(w["text"])
    if re.search(r'[.?!…]["”]?$', w["text"]):
        S.append(" ".join(cur)); cur = []
if cur: S.append(" ".join(cur))
B = lambda i: {"id": f"b{i:02d}", "say": S[i]}
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

scenes = []
# 1 · hook ----------------------------------------------------------------------------
crowd = [ST(f"p{i}", 300 + i * 264, 680, "none" if i in (0, 5) else "bottom", "b00:start" if i in (0, 5) else "b00:adults",
            [["idle", "b00:start"]], [["neutral", "b00:start"]], out="b01", scale=0.62, tattoo=i in (1, 4),
            flip=i % 2 == 1, startAtZero=i in (0, 5), delay=0.07 * i) for i in range(6)]
scenes.append({"id": "hook", "beats": [B(i) for i in range(0, 9)], "elements": crowd + [
    T("t1", "almost !1 in 3! have one", 960, 200, 80, "top", "b00:third", "b01"),
    ST("a", 560, 620, "left", "b01:so", [["idle", "b01:so"], ["shrug", "b02:great"], ["idle", "b05:but"], ["point", "b06:mind"]],
       [["neutral", "b01:so"], ["o", "b01:why"], ["tight", "b03:i"], ["smile", "b06:mind"]]),
    {"t": "bubble", "id": "bub", "text": "why not?", "x": 980, "y": 300, "size": 340, "from": "pop", "at": "b01:why", "out": "b03"},
    T("t2", "“I just… never did.”", 1300, 470, 84, "right", "b03:i", "b05", perWord=True),
    T("t3", "not !random!", 1300, 420, 140, "slam", "b05:random", "b07", hero=True),
    I("brain", "brain", 1300, 640, 170, "pop", "b06:mind", "b07"),
    T("t4", "not what people *assume*", 1300, 500, 72, "right", "b07:assume"),
]})
# 2 · forever is a long time --------------------------------------------------------------
scenes.append({"id": "forever", "beats": [B(i) for i in range(9, 20)], "elements": [
    CH("01", "Forever is a *long time*", "b09:start", "b10:decision"),
    ST("a", 380, 640, "left", "b10:tattoo", [["idle", "b10:tattoo"], ["point", "b11:every"], ["idle", "b13:study"], ["armsCrossed", "b17:suspicion"], ["proud", "b19:sign"]],
       [["neutral", "b10:tattoo"], ["o", "b12:strange"], ["neutral", "b16:most"], ["smile", "b19:sign"]], out="b13"),
    T("t1", "not a decision about *today*", 960, 170, 64, "top", "b10:decision", "b11"),
    T("t2", "about every *future you*", 960, 170, 64, "top", "b11:every", "b13"),
    ST("f1", 820, 660, "right", "b11:version", [["idle", "b11:version"]], [["neutral", "b11:version"]], scale=0.9, out="b13"),
    ST("f2", 1180, 660, "right", "b11:comes", [["shrug", "b11:comes"]], [["o", "b11:comes"]], scale=0.9, out="b13"),
    ST("f3", 1540, 660, "right", "b11:today", [["armsCrossed", "b11:today"]], [["tight", "b11:today"]], scale=0.9, out="b13", delay=0.1),
    CARD("card", "STUDY · 2013", "End of history illusion", "Quoidbach, Gilbert & Wilson", 960, 210, "b13:study", "b16"),
    {"t": "bar", "id": "b1", "x": 760, "y": 860, "w": 150, "h": 360, "color": "accent", "label": "last 10 years", "from": "draw", "at": "b13:changed", "out": "b16"},
    {"t": "bar", "id": "b2", "x": 1160, "y": 860, "w": 150, "h": 110, "color": "muted", "label": "next 10 years", "from": "draw", "at": "b14:little", "out": "b16"},
    T("t3", "how much people !changed! vs !expect to!", 960, 420, 44, "bottom", "b14:expected", "b15", weight=M),
    T("t3b", "the *end of history* illusion", 960, 420, 56, "bottom", "b15:researchers", "b16"),
    ST("now", 560, 640, "left", "b16:believe", [["proud", "b16:most"], ["idle", "b17:people"], ["armsCrossed", "b18:future"]], [["smile", "b16:most"], ["neutral", "b17:people"]]),
    T("t4", "“this is me *forever*”", 1250, 300, 72, "right", "b16:always", "b17:suspicion"),
    I("q", "question", 1250, 420, 150, "pop", "b17:suspicion", "b19"),
    T("t5", "future you might !disagree!", 1250, 720, 64, "bottom", "b18:agree", "b19:sign"),
    I("doc", "contract", 1250, 470, 300, "draw", "b19:contract"),
    K("k1", 1250, 470, 330, "b19:behalf", delay=0.1),
    T("t6", "won't sign for *future you*", 1250, 720, 64, "bottom", "b19:sign"),
]})
# 3 · reversibility ------------------------------------------------------------------
scenes.append({"id": "reverse", "beats": [B(i) for i in range(20, 31)], "elements": [
    CH("02", "Not fear. *Reversibility.*", "b20:start", "b21", "right"),
    T("t1", "they commit to *plenty*", 960, 190, 72, "top", "b21:commit", "b25"),
    I("job", "briefcase", 520, 520, 200, "pop", "b22:jobs", "b25"),
    I("rel", "rings", 960, 520, 220, "pop", "b23:relationships", "b25"),
    I("big", "checklist", 1400, 520, 200, "pop", "b24:big", "b25"),
    T("l1", "jobs", 520, 680, 48, "bottom", "b22:jobs", "b25"),
    T("l2", "relationships", 960, 680, 48, "bottom", "b23:relationships", "b25"),
    T("l3", "big decisions", 1400, 680, 48, "bottom", "b24:big", "b25"),
    T("t2", "*REVERSIBILITY*", 960, 470, 150, "slam", "b25:reversibility", "b26", hero=True),
    I("r1", "rings", 520, 470, 200, "left", "b26:relationship", "b29"),
    I("r1b", "loop", 520, 470, 280, "draw", "b26:grow", "b29"),
    T("c1", "can *grow*", 520, 680, 52, "bottom", "b26:grow", "b29"),
    I("j1", "briefcase", 960, 470, 200, "top", "b27:job", "b29"),
    I("j1b", "door", 1060, 470, 160, "pop", "b27:left", "b29"),
    T("c2", "can be *left*", 960, 680, 52, "bottom", "b27:left", "b29"),
    I("n1", "needle", 1400, 470, 200, "right", "b28:tattoo", "b29"),
    I("n1b", "lock", 1480, 560, 110, "pop", "b28:same", "b29"),
    T("c3", "stays !the same!", 1400, 680, 52, "bottom", "b28:same", "b29"),
    T("t3", "the worry is *real*", 960, 200, 72, "top", "b29:worry", "b30"),
    CARD("card", "SURVEY · PEW RESEARCH 2023", "Tattoo regret", "people who have a tattoo", 960, 230, "b30:survey"),
    T("t4", "!1 in 4! regret one", 960, 560, 130, "slam", "b30:quarter", hero=True),
]})
# 4 · identity lives inside -------------------------------------------------------------------
scenes.append({"id": "inside", "beats": [B(i) for i in range(31, 42)], "elements": [
    CH("03", "It lives on the *inside*", "b31:start", "b32"),
    CARD("card", "STUDY · SWAMI ET AL. 2012", "With vs. without tattoos", "small differences, on average", 960, 230, "b32:research", "b35"),
    T("t0", "small but *consistent* differences", 960, 420, 52, "bottom", "b32:small", "b33:need", weight=M),
    T("t1", "need for *uniqueness*", 960, 520, 72, "left", "b33:people", "b35", perWord=True),
    T("t2", "seeking *new experiences*", 960, 640, 72, "right", "b34:seeking", "b35"),
    ST("a", 520, 640, "left", "b35:that", [["idle", "b35:that"], ["proud", "b36:sense"], ["happy", "b37:value"], ["shrug", "b39:simpler"]],
       [["neutral", "b35:that"], ["smile", "b36:outside"], ["neutral", "b39:simpler"]]),
    T("t3", "not !dull!", 1280, 300, 110, "slam", "b35:dull", "b36", hero=True),
    I("hrt", "heart", 520, 595, 70, "pop", "b36:sense", "b39", color="accent"),
    T("t4", "doesn't need to be *worn*", 1280, 300, 64, "right", "b36:worn", "b37"),
    T("v1", "what they *do*", 1280, 260, 64, "right", "b37:do", "b39"),
    T("v2", "what they *value*", 1280, 370, 64, "right", "b37:value", "b39"),
    T("v3", "who they're *loyal* to", 1280, 480, 64, "right", "b37:loyal", "b39"),
    T("v4", "invisible at a *glance*", 1280, 620, 52, "bottom", "b38:glance", "b39:simpler", weight=M, color="muted"),
    T("t5", "sometimes it's !simpler!", 1280, 260, 72, "top", "b39:simpler", "b41"),
    T("t6", "job · family · faith · culture · skin", 1280, 420, 46, "right", "b40:job", "b41", perWord=True),
    T("t7", "not every *no* is a statement", 1280, 470, 64, "bottom", "b41:not"),
]})
# 5 · the twist --------------------------------------------------------------------------
scenes.append({"id": "twist", "beats": [B(i) for i in range(42, 49)], "elements": [
    T("t0", "the part people !miss!", 960, 480, 130, "slam", "b42:part", "b43", hero=True),
    {"t": "balance", "id": "bal", "x": 960, "y": 600, "size": 600, "from": "bottom", "at": "b43:none", "out": "b44",
     "labels": ["INK", "NONE"], "tilt": [[0, "b43:none"], [8, "b43:impulsive"], [-8, "b43:wiser"], [0, "b43:wiser"]]},
    T("t1", "not impulsive. not wiser.", 960, 190, 64, "top", "b43:impulsive", "b44"),
    ST("b", 470, 640, "left", "b44:someone", [["give", "b44:someone"], ["sorry", "b44:carry"], ["happy", "b46:same"]],
       [["smile", "b44:someone"]], tattoo=True),
    ST("a", 1450, 640, "right", "b45:someone", [["idle", "b45:someone"], ["victory", "b45:free"], ["happy", "b46:same"]],
       [["smile", "b45:someone"]], flip=True),
    T("q1", "“carry this *moment*”", 600, 250, 60, "left", "b44:carry", "b46"),
    T("q2", "“stay *free* to change”", 1320, 250, 60, "right", "b45:free", "b46"),
    T("t2", "same question.", 960, 230, 72, "top", "b46:same", "b48"),
    T("t3", "*opposite* answers.", 960, 330, 72, "bottom", "b47:opposite", "b48"),
    I("glass", "hourglass", 960, 480, 180, "pop", "b48:keep"),
    T("t4", "how much of today do you *keep*?", 960, 200, 64, "top", "b48:how"),
]})
# 6 · ending ------------------------------------------------------------------------------
scenes.append({"id": "end", "tail": 2.6, "beats": [B(i) for i in range(49, 54)], "elements": [
    ST("a", 560, 640, "left", "b49:so", [["idle", "b49:so"], ["proud", "b50:future"], ["give", "b52:both"]], [["smile", "b49:so"]], out="b53"),
    ST("b", 1360, 640, "right", "b51:and", [["idle", "b51:and"], ["proud", "b51:past"], ["give", "b52:both"]], [["smile", "b51:and"]], flip=True, tattoo=True, out="b53"),
    T("t1", "not !boring!", 960, 200, 90, "top", "b49:boring", "b50", hero=True),
    T("l1", "takes the *future* seriously", 560, 250, 44, "top", "b50:future", "b52"),
    T("l2", "takes the *past* seriously", 1360, 250, 44, "top", "b51:past", "b52"),
    T("t2", "honest about *time*", 960, 200, 96, "slam", "b52:honest", "b53", hero=True),
    I("hrt", "heart", 960, 520, 120, "pop", "b52:both", "b53", color="accent"),
    I("like", "thumbsUp", 960, 430, 220, "pop", "b53:like"),
    T("t3", "tattoo or *no*?", 960, 680, 96, "bottom", "b53:tattoo", hero=True),
    T("t4", "@darealwhy", 960, 820, 48, "bottom", "b53:no", weight=M, color="muted", delay=0.4),
]})

(ROOT / "script").mkdir(exist_ok=True)
(ROOT / "script/script.json").write_text(json.dumps({"title": "The Psychology of People Who Don't Get Tattoos", "scenes": scenes}, indent=1, ensure_ascii=False))
print(sum(len(s["elements"]) for s in scenes), "elements,", len(S), "sentences")
