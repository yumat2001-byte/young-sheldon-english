/* Young Sheldon English v3.18 — subtitle-free learning priorities */
(function(){
  const tiers={
    core:['business','backup','professional','principle','adopted','financial','reassuring','harass','torment','gullible','intimidated','exposed','thorough','allergy','despite','account','breach','pursue','recruit','reputation','uncertainty','assaulted','retaliate','extreme','argument','marriage','license','recognize','accuse','intelligence','principal','uniform','supplies','complicated','fired','deserve','afford','private','comforting','pregnant'],
    plus:['nourishment','revolting','credentials','violation','gifted','remarkably','arranged','theoretical','scientific','intellect','designated','hygiene','faculty','admirable','handbook','freshman','homeroom','grooming','musician','ordinary'],
    extra:['dimwitted','kinematics','unbalanced','maliciously','diaphanous','subsection','haven','prime','fad','ammonia','attire','blouse','sonata','calculus','Euclidean','geometry','pitch','grip','rat out','justice']
  };
  const labels={core:'CORE',plus:'PLUS',extra:'EXTRA'};
  const jp={core:'最優先',plus:'次に覚える',extra:'低優先'};
  const rank={core:0,plus:1,extra:2};
  const episodeHits={adopted:3,grooming:3,business:2,violation:2,intimidated:2,ammonia:2,sonata:2,Euclidean:2,fired:2,allergy:2};
  const tierByWord={}; Object.entries(tiers).forEach(([k,a])=>a.forEach(w=>tierByWord[w]=k));
  const tierOf=w=>tierByWord[w]||'extra';
  const originalOrder=new Map(words.map((x,i)=>[x.w,i]));
  words.sort((a,b)=>rank[tierOf(a.w)]-rank[tierOf(b.w)] || (episodeHits[b.w]||1)-(episodeHits[a.w]||1) || originalOrder.get(a.w)-originalOrder.get(b.w));

  state.quizScope=state.quizScope||'core';
  function scopeWords(){return state.quizScope==='all'?words:words.filter(x=>tierOf(x.w)==='core')}
  window.setQuizScope=function(scope){state.quizScope=scope;save();renderScope()};
  function renderScope(){
    const box=document.getElementById('priorityScope'); if(!box)return;
    box.querySelectorAll('button').forEach(b=>b.classList.toggle('active',b.dataset.scope===state.quizScope));
  }

  const oldQuizPool=quizPool;
  quizPool=function(){
    syncUnlock();
    let base=scopeWords();
    let learned=base.filter(x=>state.learned.includes(x.w)||masteryOf(x.w)!=='未学習');
    return learned.length>=4?learned:base;
  };
  buildQuiz=function(){
    let base=quizPool(),pool=[...base].sort((a,b)=>rank[tierOf(a.w)]-rank[tierOf(b.w)]||rankMastery(a)-rankMastery(b)||(episodeHits[b.w]||1)-(episodeHits[a.w]||1)),out=[];
    while(out.length<state.quizCount){out.push(...pool);pool=[...base].sort(()=>Math.random()-.5)}
    return out.slice(0,state.quizCount)
  };
  function rankMastery(x){return {'苦手':0,'うろ覚え':1,'未学習':2,'ほぼ覚えた':3,'覚えた':4}[masteryOf(x.w)]}

  todayWords=function(){
    const done=x=>masteryOf(x.w)==='覚えた'?1:0;
    return [...words].sort((a,b)=>done(a)-done(b)||rank[tierOf(a.w)]-rank[tierOf(b.w)]||rankMastery(a)-rankMastery(b)||(episodeHits[b.w]||1)-(episodeHits[a.w]||1)).slice(0,Math.min(10,words.length));
  };

  const oldOpenEpisode=openEpisode;
  openEpisode=function(){oldOpenEpisode();decorateEpisode()};
  function decorateEpisode(){
    document.querySelectorAll('#setList .set-row').forEach((row,i)=>{
      const tier=i<4?'core':i<6?'plus':'extra';
      const info=row.querySelector('.set-info');
      if(info&&!info.querySelector('.priority-mini')){
        const el=document.createElement('span'); el.className='priority-mini '+tier; el.textContent=labels[tier]+' · '+jp[tier]; info.appendChild(el);
      }
    });
    const cards=document.querySelectorAll('#episode > .card');
    if(cards.length&&!document.getElementById('priorityGuide')){
      const guide=document.createElement('div'); guide.className='card'; guide.id='priorityGuide';
      guide.innerHTML='<b>字幕なしに向けた優先度</b><p class="small">まずCORE 40語。余裕があればPLUS 20語。EXTRA 20語は本編理解に必要なときだけ。</p><div class="priority-summary"><div><b>40</b><span>CORE</span></div><div><b>20</b><span>PLUS</span></div><div><b>20</b><span>EXTRA</span></div></div>';
      cards[0].insertAdjacentElement('afterend',guide);
    }
    if(cards.length&&!document.getElementById('viewPlan')){
      const plan=document.createElement('div'); plan.className='card'; plan.id='viewPlan';
      plan.innerHTML='<div class="row"><b>字幕なしチャレンジ</b><span class="pill" id="viewProgress"></span></div><p class="small">同じEpisodeを段階的に字幕なしへ。</p><div id="viewSteps"></div>';
      document.getElementById('priorityGuide').insertAdjacentElement('afterend',plan); renderViewPlan();
    }
  }

  const VIEW_KEY='ys-view-plan-s1e1';
  const steps=['内容を理解（必要なら日本語字幕）','英語字幕で音と単語を一致','同じ場面を字幕なし','全話を字幕なし'];
  function getView(){try{return JSON.parse(localStorage.getItem(VIEW_KEY)||'[]')}catch(e){return[]}}
  window.toggleViewStep=function(i){let a=getView();a[i]=!a[i];localStorage.setItem(VIEW_KEY,JSON.stringify(a));renderViewPlan()};
  function renderViewPlan(){
    const wrap=document.getElementById('viewSteps');if(!wrap)return;const a=getView();
    wrap.innerHTML=steps.map((s,i)=>'<button class="view-step '+(a[i]?'done':'')+'" onclick="toggleViewStep('+i+')"><span>'+(a[i]?'✓':'○')+'</span>'+s+'</button>').join('');
    const n=steps.filter((_,i)=>a[i]).length; const p=document.getElementById('viewProgress'); if(p)p.textContent=n+' / 4';
  }

  const oldRenderWord=renderWord;
  renderWord=function(){oldRenderWord();let x=currentLearnWord();let badge=document.getElementById('learnPriority');if(!badge){badge=document.createElement('span');badge.id='learnPriority';badge.className='pill priority-badge';counter.insertAdjacentElement('afterend',badge)}let t=tierOf(x.w);badge.textContent=labels[t]+' · '+jp[t];badge.dataset.tier=t};

  const oldShowList=showList;
  showList=function(){oldShowList();document.querySelectorAll('#wordList .list-item').forEach((el,i)=>{let x=words[i],w=el.querySelector('.list-word');if(w&&!w.querySelector('.priority-inline')){let b=document.createElement('span');b.className='priority-inline '+tierOf(x.w);b.textContent=labels[tierOf(x.w)];w.appendChild(b)}})};

  function addSettingsScope(){
    const count=document.getElementById('countChoices');if(!count||document.getElementById('priorityScope'))return;
    const box=document.createElement('div');box.id='priorityScope';box.innerHTML='<div class="detail-label">出題範囲</div><div class="choice-grid"><button data-scope="core" onclick="setQuizScope(\'core\')">CORE 40</button><button data-scope="all" onclick="setQuizScope(\'all\')">ALL 80</button></div><p class="small">字幕なしが目標なら、まずCORE 40語を優先。</p>';
    count.insertAdjacentElement('afterend',box);renderScope();
  }

  const style=document.createElement('style');
  style.textContent='.priority-mini{margin-top:5px!important;font-size:11px!important;font-weight:800!important}.priority-mini.core,.priority-inline.core{color:#166534!important}.priority-mini.plus,.priority-inline.plus{color:#1d4ed8!important}.priority-mini.extra,.priority-inline.extra{color:#6b7280!important}.priority-summary{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:12px}.priority-summary div{background:#f8fafc;border-radius:14px;padding:12px;text-align:center}.priority-summary b{display:block;font-size:20px}.priority-summary span{font-size:11px;color:#6b7280;font-weight:800}.view-step{background:#f8fafc;color:#111827;text-align:left;margin-top:8px;padding:12px 14px}.view-step span{display:inline-block;width:28px}.view-step.done{background:#f0fdf4;color:#166534}.priority-badge[data-tier="core"]{color:#166534}.priority-badge[data-tier="plus"]{color:#1d4ed8}.priority-badge[data-tier="extra"]{color:#6b7280}.priority-inline{font-size:10px;margin-left:7px;vertical-align:middle;padding:3px 6px;background:#f3f4f6;border-radius:999px}';
  document.head.appendChild(style);
  addSettingsScope();updateStats();
})();