/* v3.21 dialogue context: show short surrounding dialogue inline and highlight the target vocabulary. */
(function(){
  const VERSION='v3.21';

  /* Complete spoken line overrides that have been verified. */
  const verifiedFullLines={
    adopted:{en:"He's adopted.",ja:'彼は養子だ'},
    allergy:{en:'Are you crying or having an allergy attack?',ja:'泣いてるの？ それともアレルギー発作？'}
  };

  /* Short surrounding dialogue shown directly on the learning card. */
  const dialogueContext={
    adopted:[
      'I was exploring dimensional kinematics.',
      'Admit it... He\'s adopted.',
      'SHELDON: How can I be adopted',
      'when I have a twin sister?',
      'Think, monkey, think.'
    ],
    kinematics:[
      'I was exploring dimensional kinematics.',
      'Admit it... He\'s adopted.',
      'SHELDON: How can I be adopted',
      'when I have a twin sister?',
      'Think, monkey, think.'
    ]
  };

  if(typeof words!=='undefined'){
    words.forEach(x=>{
      const full=verifiedFullLines[x.w];
      if(full){x.e=full.en;x.j=full.ja;x._fullDialogue=true}
    });
  }

  const style=document.createElement('style');
  style.textContent='.episode-dialogue-context{margin-top:12px;padding-top:12px;border-top:1px solid var(--line)}.episode-dialogue-context b{display:block;font-size:12px;color:var(--ink);margin-bottom:7px}.episode-dialogue-line{font-size:14px;line-height:1.65;color:#475569;white-space:pre-wrap}.episode-dialogue-line+.episode-dialogue-line{margin-top:3px}.dialogue-target-word{color:#2563eb;font-weight:850}';
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

  function enrich(example){
    if(!example)return;
    const word=wordFromExample(example);
    if(!word)return;
    const x=(typeof words!=='undefined')?words.find(v=>v.w===word):null;

    const label=example.querySelector('.small');
    const desiredLabel=x&&x._fullDialogue?'本編のセリフ（全文）':'本編で使われた表現';
    if(label&&label.textContent!==desiredLabel) label.textContent=desiredLabel;

    const lines=dialogueContext[word];
    const old=example.querySelector('.episode-dialogue-context');
    if(!lines){if(old)old.remove();return}
    if(old)return;

    const box=document.createElement('div');
    box.className='episode-dialogue-context';
    box.innerHTML='<b>前後のセリフ</b>'+lines.map(line=>'<div class="episode-dialogue-line">'+highlightTarget(line,word)+'</div>').join('');
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
