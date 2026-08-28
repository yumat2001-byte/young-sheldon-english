/* v3.25: actual surrounding dialogue only; no scene-description filler. */
(function(){
  const VERSION='v3.25';

  /* Dialogue text supplied in the conversation. */
  const actualDialogue={
    adopted:[
      {en:'I was exploring dimensional kinematics.',ja:'僕は次元運動学について調べていた。'},
      {en:"Admit it... He's adopted.",ja:'認めなよ……彼、養子でしょ。'},
      {en:'SHELDON: How can I be adopted when I have a twin sister?',ja:'シェルドン：双子の姉妹がいるのに、どうして僕が養子になれるの？'},
      {en:'Think, monkey, think.',ja:'考えろ、猿。考えろ。'}
    ],
    kinematics:[
      {en:'I was exploring dimensional kinematics.',ja:'僕は次元運動学について調べていた。'},
      {en:"Admit it... He's adopted.",ja:'認めなよ……彼、養子でしょ。'},
      {en:'SHELDON: How can I be adopted when I have a twin sister?',ja:'シェルドン：双子の姉妹がいるのに、どうして僕が養子になれるの？'},
      {en:'Think, monkey, think.',ja:'考えろ、猿。考えろ。'}
    ]
  };

  const full={
    adopted:{en:"He's adopted.",ja:'彼は養子だ'},
    allergy:{en:'Are you crying or having an allergy attack?',ja:'泣いてるの？ それともアレルギー発作？'}
  };
  if(typeof words!=='undefined')words.forEach(x=>{const f=full[x.w];if(f){x.e=f.en;x.j=f.ja;x._fullDialogue=true}});

  const style=document.createElement('style');
  style.textContent='.episode-dialogue-context{margin-top:12px;padding-top:12px;border-top:1px solid var(--line)}.episode-dialogue-context>b{display:block;font-size:12px;margin-bottom:9px}.dialogue-pair+.dialogue-pair{margin-top:10px}.episode-dialogue-line{font-size:14px;line-height:1.6;color:#475569}.episode-dialogue-ja{font-size:12px;line-height:1.55;color:#94a3b8;margin-top:2px}.dialogue-target-word{color:#2563eb;font-weight:850}';
  document.head.appendChild(style);

  function wordFromExample(example){
    if(example.id==='example'&&typeof currentLearnWord==='function')return currentLearnWord()?.w;
    if(example.id==='feedback'&&typeof quizWords!=='undefined'&&typeof qidx!=='undefined')return quizWords[qidx]?.w;
    const d=example.closest('.review-word-accordion');const w=d&&d.querySelector('.list-word');return w&&w.textContent.trim();
  }
  function esc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
  function reEsc(s){return String(s).replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}
  function highlight(s,w){const safe=esc(s);if(!w)return safe;return safe.replace(new RegExp('('+reEsc(esc(w))+')','gi'),'<span class="dialogue-target-word">$1</span>')}
  function updateVersion(){document.querySelectorAll('.version').forEach(e=>{if(e.textContent!==VERSION)e.textContent=VERSION})}
  function removeLegacy(){document.querySelectorAll('.episode-context,.episode-source-row').forEach(e=>e.remove())}

  function enrich(example){
    const w=wordFromExample(example);if(!w)return;
    const x=typeof words!=='undefined'?words.find(v=>v.w===w):null;
    const label=example.querySelector('.small');
    const desired=x&&x._fullDialogue?'本編のセリフ（全文）':'本編で使われた表現';
    if(label&&label.textContent!==desired)label.textContent=desired;

    const old=example.querySelector('.episode-dialogue-context');if(old)old.remove();
    const pairs=actualDialogue[w];if(!pairs)return;
    const box=document.createElement('div');box.className='episode-dialogue-context';
    box.innerHTML='<b>前後のセリフ</b>'+pairs.map(p=>'<div class="dialogue-pair"><div class="episode-dialogue-line">'+highlight(p.en,w)+'</div><div class="episode-dialogue-ja">'+esc(p.ja)+'</div></div>').join('');
    example.appendChild(box);
  }
  function scan(){updateVersion();removeLegacy();document.querySelectorAll('.example:not(.hidden)').forEach(enrich)}
  let queued=false;const mo=new MutationObserver(()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;scan()})});
  mo.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});scan();
})();
