/* v3.19 dialogue context: remove scene summaries; prefer complete spoken lines. */
(function(){
  const sourceUrl='https://transcripts.foreverdreaming.org/viewtopic.php?t=32113';

  /* Only replace an excerpt when we have verified the complete spoken line. */
  const verifiedFullLines={
    adopted:{en:"He's adopted.",ja:'彼は養子だ'},
    allergy:{en:'Are you crying or having an allergy attack?',ja:'泣いてるの？ それともアレルギー発作？'}
  };

  if(typeof words!=='undefined'){
    words.forEach(x=>{
      const full=verifiedFullLines[x.w];
      if(full){x.e=full.en;x.j=full.ja}
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

  function enrich(example){
    if(!example||example.querySelector('.episode-source-row'))return;
    const word=wordFromExample(example);
    if(!word)return;
    const row=document.createElement('div');
    row.className='episode-source-row';
    row.innerHTML='<a class="episode-source" href="'+sourceUrl+'" target="_blank" rel="noopener">前後のセリフを確認</a>';
    example.appendChild(row);
  }

  function scan(){document.querySelectorAll('.example:not(.hidden)').forEach(enrich)}
  const mo=new MutationObserver(()=>scan());
  mo.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
  scan();
})();
