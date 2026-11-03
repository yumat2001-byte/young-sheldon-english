"""Build the episode page from reviewed TSV; no external service is needed."""
from pathlib import Path
import csv
import json
import re

ROOT=Path(__file__).resolve().parents[1]
rows=list(csv.DictReader((ROOT/'data/episode-2.tsv').open(),delimiter='\t'))
assert len(rows)==80 and len({r['word'] for r in rows})==80
forms={
    'ignore':['ignoring'], 'adjust':['adjusting'], 'improvement':['improvements'],
    'realize':['realized'], 'assume':['assumed'], 'seek':['seeking','sought'],
    'satisfy':['satisfied'], 'fail':['failed'], 'invite':['invited'],
    'prepare':['prepared'], 'release':['released'], 'escape':['escaped'],
    'force':['forced','forces'], 'provide':['provides'], 'compliment':['complimented'],
    'citizen':['citizens'], 'initiate':['initiating','initiated'],
    'admire':['admired'], 'condemn':['condemned'], 'pressure':['pressured'],
    'praise':['praised'], 'encourage':['encouraged'], 'launch':['launching'],
}
words=[]
for r in rows:
    assert all(r.values()),r['word']
    words.append(dict(w=r['word'],p=r['pronunciation'],m=r['meaning'],d=r['meaning'],
        learn=[[r['relatedTag'],r['relatedWord'],r['relatedJa']]],
        u=[r['phrase'],r['phraseJa']],e=r['example'],j=r['exampleJa'],
        forms=forms.get(r['word'],[])))
data=dict(number=2,title='Rockets, Communists, and the Dewey Decimal System',
    words=words,tiers=dict(core=[x['w'] for x in words[:40]],plus=[x['w'] for x in words[40:60]],extra=[x['w'] for x in words[60:]]),
    groups={g:[r['word'] for r in rows if r['group']==g] for g in ['noun','verb','modifier']},
    # Keep reviewed priority order within each tier; no invented occurrence counts.
    hits={},source='https://www.springfieldspringfield.co.uk/view_episode_scripts.php?episode=s01e02&tv-show=young-sheldon-2017',
    exampleType='original',verifiedDate='2026-09-12')
(ROOT/'episode-2-data.js').write_text('/* Reviewed Episode 2 vocabulary. Examples are original, not dialogue. */\nwindow.YS_EPISODE = '+json.dumps(data,ensure_ascii=False,indent=2)+';\n')
# Publish the navigation list from the same catalog that defines the new decks.
catalog=json.loads((ROOT/'data/season-1.json').read_text())
assert [c['number'] for c in catalog]==list(range(1,11))
summary=[{k:c[k] for k in ('number','title','topic')} for c in catalog]
(ROOT/'episode-catalog.js').write_text('window.YS_CATALOG = '+json.dumps(summary,ensure_ascii=False,indent=2)+';\n')

def render_page(number,title,data_tag):
    html=(ROOT/'index.html').read_text()
    html=re.sub(r'const words=\[.*?\];const SET_SIZE=', 'const words=window.YS_EPISODE.words;const SET_SIZE=',html,flags=re.S)
    html=html.replace('<script>const W=',data_tag+'<script>const W=')
    html=html.replace("'ys-state'",f"'ys-state-s01e{number:02d}'")
    html=html.replace('Episode 1',f'Episode {number}').replace("Sheldon's First Day of High School",title)
    html=html.replace('class="episode-num">1</div>',f'class="episode-num">{number}</div>')
    html=html.replace('本編の実際のセリフ','学習用例文（オリジナル）')
    html=html.replace('<title>Young Sheldon English</title>',f'<title>Episode {number} · Young Sheldon English</title>')
    html=re.sub(r'<script src="scene-context.js[^"]*"></script>','',html)
    html=re.sub(r'src="(smart-tips|learning-plan|episode-catalog|episode-ui)\.js',r'src="../\1.js',html)
    html=html.replace('href="speaking/', 'href="../speaking/').replace('src="speaking/', 'src="../speaking/')
    html=html.replace('href="manifest.webmanifest"', 'href="../manifest.webmanifest"')
    folder=ROOT/f'episode-{number}'
    folder.mkdir(exist_ok=True)
    (folder/'index.html').write_text(html)

render_page(2,data['title'],'<script src="../episode-2-data.js?v=3.32"></script>')

with (ROOT/'data/episodes-3-10.tsv').open() as sheet:
    word_bank={r['word']:r for r in csv.DictReader(sheet,delimiter='\t')}
for lesson in catalog[2:]:
    number=lesson['number']
    attested=lesson['attested']
    assert len(attested)==80
    groups={k:[] for k in ('noun','verb','modifier')}
    cards=[]
    for word,observed in attested.items():
        row=word_bank[word]
        assert observed and all(row.values()),word
        groups[row['group']].append(word)
        other_forms=[form for form in observed if form!=word]
        cards.append(dict(w=word,p=row['pronunciation'],m=row['meaning'],d=row['meaning'],
            learn=[['語形',form,'この回で使われた形'] for form in other_forms],
            u=[row['phrase'],row['phraseJa']],e=row['example'],j=row['exampleJa'],forms=other_forms))
    assert min(map(len,groups.values()))>=4
    ordered=list(attested)
    deck=dict(number=number,title=lesson['title'],words=cards,
        tiers=dict(core=ordered[:40],plus=ordered[40:60],extra=ordered[60:]),groups=groups,hits={},
        source=f'https://www.springfieldspringfield.co.uk/view_episode_scripts.php?episode=s01e{number:02d}&tv-show=young-sheldon-2017',
        exampleType='original')
    # Embed this episode's data only; no fetch or asynchronous initialization.
    serialized=json.dumps(deck,ensure_ascii=False,separators=(',',':')).replace('<',r'\u003c')
    render_page(number,lesson['title'],'<script>window.YS_EPISODE='+serialized+';</script>')
# Keep the bookmarked v3.32 entry usable with the same shared assets.
version=(ROOT/'index.html').read_text()
version=re.sub(r'src="(smart-tips|learning-plan|scene-context|episode-catalog|episode-ui)\.js',r'src="../\1.js',version)
version=version.replace('href="speaking/', 'href="../speaking/').replace('src="speaking/', 'src="../speaking/')
version=version.replace('href="manifest.webmanifest"', 'href="../manifest.webmanifest"')
(ROOT/'v3.32').mkdir(exist_ok=True)
(ROOT/'v3.32/index.html').write_text(version)
print('Built Episodes 2–10, each with 80 words, 8 sets, CORE 40 / PLUS 20 / EXTRA 20')
