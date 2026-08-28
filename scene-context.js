/* v3.23 dialogue context: bilingual sentence display on every vocabulary card. */
(function(){
  const VERSION='v3.23';

  /* Complete spoken line overrides that have been verified. */
  const verifiedFullLines={
    adopted:{en:"He's adopted.",ja:'彼は養子だ'},
    allergy:{en:'Are you crying or having an allergy attack?',ja:'泣いてるの？ それともアレルギー発作？'}
  };

  /* Surrounding dialogue available from user-provided context. Keep each sentence intact. */
  const dialogueContext={
    adopted:[
      {en:'I was exploring dimensional kinematics.',ja:'僕は次元運動学を調べていた。'},
      {en:"Admit it... He's adopted.",ja:'認めなよ……彼は養子でしょ。'},
      {en:'SHELDON: How can I be adopted when I have a twin sister?',ja:'シェルドン：双子の姉妹がいるのに、どうして僕が養子になれるの？'},
      {en:'Think, monkey, think.',ja:'考えろ、猿。考えろ。'}
    ],
    kinematics:[
      {en:'I was exploring dimensional kinematics.',ja:'僕は次元運動学を調べていた。'},
      {en:"Admit it... He's adopted.",ja:'認めなよ……彼は養子でしょ。'},
      {en:'SHELDON: How can I be adopted when I have a twin sister?',ja:'シェルドン：双子の姉妹がいるのに、どうして僕が養子になれるの？'},
      {en:'Think, monkey, think.',ja:'考えろ、猿。考えろ。'}
    ]
  };

  if(typeof words!=='undefined'){
    words.forEach(x=>{
      const full=verifiedFullLines[x.w];
      if(full){x.e=full.en;x.j=full.ja;x._fullDialogue=true}
    });
  }

  const style=document.createElement('style');
  style.textContent='.episode-dialogue-context{margin-top:12px;padding-top:12px;border-top:1px solid var(--line)}.episode-dialogue-context b{display:block;font-size:12px;color:var(--ink);margin-bottom:8px}.dialogue-pair+.dialogue-pair{margin-top:10px}.episode-dialogue-line{font-size:14px;line-height:1.6;color:#475569;white-space:normal}.episode-dialogue-ja{font-size:12px;line-height:1.55;color:#94a3b8;margin-top:2px}.dialogue-target-word{color:#2563eb;font-weight:850}';
  document.head.appendChild(style);

  function wordFromExample(example){
    if(example.id==='example'&&typeof currentLearnWord==='function'){
      const x=currentLearnWord(); return x&&x.w;
    }
    if(example.id==='feedback'&&typeof quizWords!=='undefined'&&typeof qidx!=='undefined'){
      const x=quizWords[qidx]; return x&&x.w;
    }
    const details=example.closest('.review-word-accordion');
    if(details){const w=details.querySelector('.list-word');return w&&w.textContent.trim()}
    return null;
  }

  function escapeHTML(s){
    return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }

  function escapeRegExp(s){
    return String(s).replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  }

  function highlightTarget(line,word){
    const safe=escapeHTML(line);
    if(!word)return safe;
    const re=new RegExp('('+escapeRegExp(escapeHTML(word))+')','gi');
    return safe.replace(re,'<span class="dialogue-target-word">$1</span>');
  }

  function updateVersion(){
    document.querySelectorAll('.version').forEach(el=>{
      if(el.textContent!==VERSION) el.textContent=VERSION;
    });
  }

  function removeLegacy(){
    document.querySelectorAll('.episode-context,.episode-source-row').forEach(el=>el.remove());
  }

  function contextFor(x){
    if(!x)return null;
    const full=dialogueContext[x.w];
    if(full)return {title:'前後のセリフ',pairs:full};
    if(x.e)return {title:'本編の使用箇所',pairs:[{en:x.e,ja:x.j||''}]};
    return null;
  }

  function enrich(example){
    if(!example)return;
    const word=wordFromExample(example);
    if(!word)return;
    const x=(typeof words!=='undefined')?words.find(v=>v.w===word):null;

    const label=example.querySelector('.small');
    const desiredLabel=x&&x._fullDialogue?'本編のセリフ（全文）':'本編で使われた表現';
    if(label&&label.textContent!==desiredLabel) label.textContent=desiredLabel;

    const context=contextFor(x);
    const old=example.querySelector('.episode-dialogue-context');
    if(!context){if(old)old.remove();return}
    if(old)old.remove();

    const box=document.createElement('div');
    box.className='episode-dialogue-context';
    box.innerHTML='<b>'+escapeHTML(context.title)+'</b>'+context.pairs.map(pair=>'<div class="dialogue-pair"><div class="episode-dialogue-line">'+highlightTarget(pair.en,word)+'</div>'+(pair.ja?'<div class="episode-dialogue-ja">'+escapeHTML(pair.ja)+'</div>':'')+'</div>').join('');
    example.appendChild(box);
  }

  function scan(){
    updateVersion();
    removeLegacy();
    document.querySelectorAll('.example:not(.hidden)').forEach(enrich);
  }

  let queued=false;
  const mo=new MutationObserver(()=>{
    if(queued)return;
    queued=true;
    requestAnimationFrame(()=>{queued=false;scan()});
  });
  mo.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
  scan();
})();
