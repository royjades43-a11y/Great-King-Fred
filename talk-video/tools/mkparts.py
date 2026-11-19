import re, math, json
src = open('index.html').read()
divs = re.findall(r'(<div id="(\w+)" data-composition-id="\w+" data-composition-src="[^"]+" data-start="([\d.]+)" data-duration="([\d.]+)"[^>]*></div>)', src)
total = 545.397
starts = [float(d[2]) for d in divs]
F = [math.floor(s*30 + 1e-9) for s in starts] + [round(total*30)]
parts = []
for i,(full,sid,st,du) in enumerate(divs):
    off = float(st) - F[i]/30
    nd = (F[i+1]-F[i])/30
    div = full.replace(f'data-start="{st}"', f'data-start="{off:.6f}"')
    body = re.sub(r'<div id="play".*?<audio[^>]*></audio>', div, src, flags=re.S)
    body = body.replace('data-duration="545.397"', f'data-duration="{nd:.6f}"')
    open(f'part-{i}-{sid}.html','w').write(body)
    parts.append((f'part-{i}-{sid}.html', F[i+1]-F[i]))
json.dump(parts, open('.work/parts/parts.json','w'))
print(parts)
