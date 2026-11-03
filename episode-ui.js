/* Episode navigation shared by the main page and versioned entry points. */
(function(){
  const root=new URL('.',document.currentScript.src);
  // Previously cached entry pages did not include the season catalog.
  if(!window.YS_CATALOG?.[0]?.headwords){
    const script=document.createElement('script');
    script.src=new URL('episode-catalog.js?v=11',root).href;
    script.onload=init;document.head.append(script);
  }else init();
  function init(){
    const episode=window.YS_EPISODE?.number||1;
    const catalog=window.YS_CATALOG;
    const href=n=>new URL(n===1?'./':'episode-'+n+'/',root).href+'#sets';
    const current=document.querySelector('#home .episode');
    const nav=document.createDocumentFragment();
    for(const lesson of catalog){
      const n=lesson.number;
      if(n===episode){
        current.setAttribute('role','button');current.tabIndex=0;
        current.setAttribute('aria-label','第'+n+'話の単語セットを開く');
        current.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();openEpisode()}});
        nav.append(current);
        continue;
      }
      const link=document.createElement('a');link.className='episode episode-link';link.href=href(n);
      link.innerHTML='<div class="episode-num">'+n+'</div><div class="episode-info"><b>Episode '+n+'</b><span>'+lesson.title+'</span><span>'+lesson.topic+' · 80 words</span></div><span aria-hidden="true">›</span>';
      nav.append(link);
    }
    const season=document.querySelector('#home .season-title');
    season.textContent='SEASON 1 · 第1〜'+catalog.length+'話';
    season.after(nav);

    const home=document.getElementById('home');
    const badges=home.querySelectorAll('.episode-num');
    // A personalized link records only the learner's declared episode experience on this device.
    const reported=new Set(new URLSearchParams(location.hash.slice(1)).get('studied')?.split(',')||[]);
    if(reported.size){
      for(const {number} of catalog){
        if(reported.has(String(number)))localStorage.setItem('ys-studied-'+number,'1');
      }
      history.replaceState(null,'',location.pathname+location.search);
    }
    function renderEpisodeRings(){
      if(!home.classList.contains('active'))return;
      catalog.forEach(({number,headwords},index)=>{
        const key=number===1?'ys-state':'ys-state-s01e'+String(number).padStart(2,'0');
        let progress;
        try { progress=JSON.parse(localStorage.getItem(key)); } catch { /* Unreadable progress displays as unstudied. */ }
        const wrong=new Set(Array.isArray(progress?.wrong)?progress.wrong:[]);
        const levelOf=word=>progress?.mastery?.[word]||(wrong.has(word)?'苦手':'未学習');
        const read=new Set(Array.isArray(progress?.learned)?progress.learned:[]);
        const studied=localStorage.getItem('ys-studied-'+number)==='1'||
          headwords.some(word=>read.has(word)||['覚えた','ほぼ覚えた','うろ覚え','苦手'].includes(levelOf(word)));
        const badge=badges[index];
        const fill=studied?'#dbeafe':'white';
        badge.style.background='linear-gradient('+fill+','+fill+') padding-box, '+setRing(headwords,levelOf)+' border-box';
        badge.style.borderColor='transparent';
        badge.title=studied?'学習経験あり':'未学習';
        badge.closest('.episode').classList.toggle('episode-studied',studied);
      });
    }
    renderEpisodeRings();
    // A learner can return via HOME, browser Back, or another tab.
    new MutationObserver(renderEpisodeRings).observe(home,{attributes:true,attributeFilter:['class']});
    window.addEventListener('pageshow',renderEpisodeRings);
    window.addEventListener('storage',event=>{
      if(event.key===null||event.key.startsWith('ys-state')||event.key.startsWith('ys-studied-'))renderEpisodeRings();
    });
    const heading=document.querySelector('.home-status-title b');
    if(heading)heading.textContent='学習状況 · 第'+episode+'話';
    document.querySelectorAll('#setChoice .back, #setChoice .small').forEach(el=>{
      el.textContent=el.textContent.replace('Episode 1','Episode '+episode);
    });
    const style=document.createElement('style');
    style.textContent='.episode-studied .episode-num{color:#174a86}.episode-studied .episode-info b::after{content:"学習経験あり";display:inline-block;vertical-align:middle;font-size:11px;color:#174a86;background:#dbeafe;border-radius:20px;margin-left:8px;padding:2px 8px}.episode-link{color:inherit;text-decoration:none}.episode:focus-visible{outline:3px solid #2563eb;outline-offset:3px}.episode-info{min-width:0}.episode-info span{overflow-wrap:anywhere}.episode-source{font-size:12px;line-height:1.7}.episode-source a{color:#2563eb}.example-target{font-weight:850;color:#2563eb}';
    document.head.appendChild(style);
    if(location.hash==='#sets'){openEpisode();history.replaceState(null,'',location.pathname+location.search)}
    if(episode===1)return;
    const source=document.createElement('div');source.className='card episode-source';
    const lesson=catalog.find(entry=>entry.number===episode);
    source.innerHTML='<b>この回の学習内容</b><p>'+lesson.topic+'。CORE 40語、PLUS 20語、EXTRA 20語を10語ずつ学びます。</p><p>この回の公開台本で見出し語または活用形を照合しました。英文と和訳は学習用の例文です。</p>';
    const sourceLink=document.createElement('a');
    sourceLink.href=window.YS_EPISODE.source;sourceLink.target='_blank';sourceLink.rel='noopener noreferrer';
    sourceLink.textContent='単語の出典を確認する ↗';source.append(sourceLink);
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
  }
})();
