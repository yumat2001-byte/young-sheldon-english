/* v3.19 dialogue context: no scene summaries, no misleading fragment-as-sentence display. */
(function(){
  const VERSION='v3.19';
  const sourceUrl='https://transcripts.foreverdreaming.org/viewtopic.php?t=32113';

  /* Verified complete spoken lines only. */
  const verifiedFullLines={
    adopted:{en:"He's adopted.",ja:'彼は養子だ'},
    allergy:{en:'Are you crying or having an allergy attack?',ja:'泣いてるの？ それともアレルギー発作？'}
  };

  if(typeof words!=='undefined'){
    words.forEach(x=>{
      const full=verifiedFullLines[x.w];
      if(full){x.e=full.en;x.j=full.ja;x._fullDialogue=true}
    });
  }

  const style=document.createElement('style');
  style.textContent='.episode-source-row{margin-top:12px;padding-top:10px;border-top:1px solid var(--line)}.episode-source{display:inline-block;color:#475569;font-size:12px;font-weight:750;text-decoration:none}.episode-source:after{content:" ↗"}';
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

  function cleanOldSceneBoxes(){
    document.querySelectorAll('.episode-context').forEach(el=>el.remove());
  }

  function updateVersion(){
    document.querySelectorAll('.version').forEach(el=>{el.textContent=VERSION});
  }

  function enrich(example){
    if(!example)return;
    const word=wordFromExample(example);
    if(!word)return;
    const x=(typeof words!=='undefined')?words.find(v=>v.w===word):null;

    /* Never label a stored fragment as a full dialogue sentence. */
    const label=example.querySelector('.small');
    if(label) label.textContent=x&&x._fullDialogue?'本編のセリフ（全文）':'本編で使われた表現';

    if(example.querySelector('.episode-source-row'))return;
    const row=document.createElement('div');
    row.className='episode-source-row';
    row.innerHTML='<a class="episode-source" href="'+sourceUrl+'" target="_blank" rel="noopener">前後のセリフを確認</a>';
    example.appendChild(row);
  }

  function scan(){
    updateVersion();
    cleanOldSceneBoxes();
    document.querySelectorAll('.example:not(.hidden)').forEach(enrich);
  }

  const mo=new MutationObserver(()=>scan());
  mo.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
  scan();
})();
