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
html=(ROOT/'index.html').read_text()
html=re.sub(r'const words=\[.*?\];const SET_SIZE=', 'const words=window.YS_EPISODE.words;const SET_SIZE=',html,flags=re.S)
html=html.replace('<script>const W=', '<script src="../episode-2-data.js?v=3.32"></script><script>const W=')
html=html.replace("'ys-state'","'ys-state-s01e02'")
html=html.replace('Episode 1','Episode 2').replace("Sheldon's First Day of High School",data['title'])
html=html.replace('class="episode-num">1</div>','class="episode-num">2</div>')
html=html.replace('本編の実際のセリフ','学習用例文（オリジナル）')
html=html.replace('<title>Young Sheldon English</title>','<title>Episode 2 · Young Sheldon English</title>')
html=re.sub(r'<script src="scene-context.js[^\"]*"></script>','',html)
html=re.sub(r'src="(smart-tips|learning-plan|episode-ui)\.js',r'src="../\1.js',html)
(ROOT/'episode-2').mkdir(exist_ok=True)
(ROOT/'episode-2/index.html').write_text(html)
# A stable release URL avoids old cached entry pages without duplicating assets.
(ROOT/'v3.32').mkdir(exist_ok=True)
version=(ROOT/'index.html').read_text()
version=re.sub(r'src="(smart-tips|learning-plan|scene-context|episode-ui)\.js',r'src="../\1.js',version)
(ROOT/'v3.32/index.html').write_text(version)
print('Built Episode 2: 80 words, 8 sets, CORE 40 / PLUS 20 / EXTRA 20')
