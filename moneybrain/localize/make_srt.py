import json,re,textwrap
W=json.load(open('tools/words.json'))
PARTS=[("part1",133.068),("part2",105.091),("part3",85.159),("part4",85.708)]
off=0; words=[]
for pid,d in PARTS:
    for w in W[pid]: words.append([w['w'],off+w['s'],off+w['e']])
    off+=d+0.6
# merge whisper splits like "$172" ",000."
m=[]
for w in words:
    if m and re.match(r'^[,.%]', w[0]) : m[-1][0]+=w[0]; m[-1][2]=w[2]
    elif m and re.match(r'^-', w[0]): m[-1][0]+=w[0]; m[-1][2]=w[2]
    else: m.append(w)
sents=[];cur=[]
for w in m:
    cur.append(w)
    if re.search(r'[.?!]$',w[0]): sents.append(cur);cur=[]
if cur: sents.append(cur)
L=lambda c: len(' '.join(x[0] for x in c))
def split(c):
    if L(c)<=84: return [c]
    n=len(c); best=None
    for k in range(2,n-1):
        a,b=c[:k],c[k:]
        score=abs(L(a)-L(b)) - (25 if c[k-1][0].endswith(',') else 0)
        if best is None or score<best[0]: best=(score,k)
    k=best[1]; return split(c[:k])+split(c[k:])
cues=[x for s_ in sents for x in split(s_)]
def ts(t):
    return f"{int(t//3600):02d}:{int(t%3600//60):02d}:{int(t%60):02d},{int(round((t%1)*1000))%1000:03d}"
fix={"$1.00 and $6.00.":"one dollar in six.","$1.00":"","401k":"401(k)","US":"U.S."}
texts=[]
for i,c in enumerate(cues):
    t=' '.join(x[0] for x in c)
    t=t.replace("$1.00 and $6.00.","one dollar in six.").replace(" 401k "," 401(k) ").replace(" US "," U.S. ")
    texts.append(t)
json.dump([{"s":c[0][1],"e":c[-1][2],"t":t} for c,t in zip(cues,texts)], open('localize/cues.json','w'), indent=0)
def write(path, lines):
    out=[]
    for i,(c,t) in enumerate(zip(cues,lines)):
        s=c[0][1]; e=c[-1][2]+0.25
        if i+1<len(cues): e=min(e, cues[i+1][0][1]-0.02)
        out.append(f"{i+1}\n{ts(s)} --> {ts(e)}\n"+"\n".join(textwrap.wrap(t, max(42, len(t)//2 + 8)))+"\n")
    open(path,'w').write("\n".join(out))
if __name__=="__main__":
    write('localize/en.srt',texts); print(len(cues))
    for i,t in enumerate(texts): print(i,t)
