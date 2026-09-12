/* Episode navigation shared by the main page and versioned entry points. */
(function(){
  const root=new URL('.',document.currentScript.src);
  const episode=window.YS_EPISODE?.number||1;
  const titles={1:"Sheldon's First Day of High School",2:'Rockets, Communists, and the Dewey Decimal System'};
  const href=n=>new URL(n===1?'./':'episode-2/',root).href;
  const current=document.querySelector('#home .episode');
  current.setAttribute('role','button');current.tabIndex=0;
  current.setAttribute('aria-label','第'+episode+'話の単語セットを開く');
  current.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();openEpisode()}});
  const other=episode===1?2:1;
  const link=document.createElement('a');link.className='episode episode-link';link.href=href(other);
  link.innerHTML='<div class="episode-num">'+other+'</div><div class="episode-info"><b>Episode '+other+'</b><span>'+titles[other]+'</span><span>80 words · CORE 40 / PLUS 20 / EXTRA 20</span></div><span aria-hidden="true">›</span>';
  if(other===1)current.before(link);else current.after(link);
  const heading=document.querySelector('.home-status-title b');
  if(heading)heading.textContent='学習状況 · 第'+episode+'話';
  document.querySelectorAll('#setChoice .back, #setChoice .small').forEach(el=>{
    el.textContent=el.textContent.replace('Episode 1','Episode '+episode);
  });
  const style=document.createElement('style');
  style.textContent='.episode-link{color:inherit;text-decoration:none}.episode:focus-visible{outline:3px solid #2563eb;outline-offset:3px}.episode-info{min-width:0}.episode-info span{overflow-wrap:anywhere}.episode-source{font-size:12px;line-height:1.7}.episode-source a{color:#2563eb}.example-target{font-weight:850;color:#2563eb}';
  document.head.appendChild(style);
  if(episode!==2)return;
  const source=document.createElement('div');source.className='card episode-source';
  source.innerHTML='<b>この回の学習内容</b><p>友達づくり・学校生活・科学の話題から80語。COREから順に、10語ずつ学べます。</p><p>公開テキストで登場を確認した語を収録しています。英語例文と和訳は学習用に作成したもので、本編のセリフの引用ではありません。</p><a href="https://www.springfieldspringfield.co.uk/view_episode_scripts.php?episode=s01e02&amp;tv-show=young-sheldon-2017" target="_blank" rel="noopener noreferrer">語彙の出典を確認する ↗</a>';
  document.querySelector('#episode').appendChild(source);
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function paint(){
    document.querySelectorAll('.example:not(.hidden)').forEach(box=>{
      const label=box.querySelector('.small');
      if(label&&label.textContent!=='学習用例文（オリジナル）')label.textContent='学習用例文（オリジナル）';
      let x;
      if(box.id==='example')x=currentLearnWord();
      else if(box.id==='feedback')x=quizWords[qidx];
      const en=box.querySelector('.example-text');
      // renderWord replaces this child, even when it renders the same word again.
      if(!x||!en||en.dataset.exampleKey===x.w+'|'+x.e)return;
      if(en){
        const forms=[x.w,...(x.forms||[])].sort((a,b)=>b.length-a.length).map(w=>w.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'));
        en.innerHTML=esc(x.e).replace(new RegExp('\\b('+forms.join('|')+')\\b','gi'),'<span class="example-target">$1</span>');
      }
      en.dataset.exampleKey=x.w+'|'+x.e;
    });
  }
  let queued=false;
  new MutationObserver(()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;paint()})}).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
  paint();
})();
