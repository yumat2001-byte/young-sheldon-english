/* Vocabulary memory tips: contextual hooks only when useful. */
(function(){
  const trivia={
    harass:{title:'日本語につながる',html:'<b>harass → harassment</b><br>日本語の「ハラスメント」は harassment。<b>harass</b> はその動詞で「嫌がらせをする」。'},
    recruit:{title:'日本語につながる',html:'日本語の「リクルート」と同じ語。<b>recruit</b> = 人を募集する・採用する。'},
    backup:{title:'日本語につながる',html:'「バックアップ」と同じ。元のものが使えない時の<b>予備・代替</b>という感覚。'},
    professional:{title:'日本語につながる',html:'「プロフェッショナル」と同じ。<b>profession</b>（職業・専門職）からできた語。'},
    allergy:{title:'日本語につながる',html:'日本語の「アレルギー」と同じ語。形容詞は <b>allergic</b>（アレルギーの）。'},
    financial:{title:'日本語につながる',html:'「ファイナンシャルプランナー」の <b>financial</b>。お金・財務に関する、という意味。'},
    kinematics:{title:'スポーツにつながる',html:'スプリントの動作分析で使う <b>kinematic analysis</b> = 運動学的分析。位置・速度・加速度などから動きを見る。'},
    subsection:{title:'WORD PARTS',html:'<b>sub-</b> = 下・下位。<br>sub + section → section の下位区分 → <b>小節・小項目</b>。'},
    unbalanced:{title:'WORD PARTS',html:'<b>un-</b> = ～でない・反対。<br>un + balanced → バランスが取れていない → <b>不均衡な</b>。'},
    remarkably:{title:'WORD PARTS',html:'<b>-ly</b> は形容詞から副詞を作ることが多い。<br>remarkable → remarkably = <b>著しく・驚くほど</b>。'},
    maliciously:{title:'WORD PARTS',html:'<b>-ly</b> は副詞の目印になりやすい。<br>malicious（悪意のある）→ maliciously = <b>悪意をもって</b>。'},
    credentials:{title:'使われ方',html:'<b>credentials</b> は「能力や立場を証明するもの」。資格だけでなく、経歴・実績まで含めて使える。'},
    violation:{title:'WORD FAMILY',html:'<b>violate</b>（違反する・侵害する）→ <b>violation</b>（違反・侵害）。<b>-ion</b> は名詞を作る代表的な語尾。'}
  };
  const autoParts=[
    {re:/less$/i,label:'-less',text:'「～がない・～を欠いた」。必ず悪い意味になるわけではなく、fearless = 恐れがない → 恐れ知らず。'},
    {re:/ness$/i,label:'-ness',text:'形容詞などから「状態・性質」を表す名詞を作ることが多い。'},
    {re:/(tion|sion|ion)$/i,label:'-ion / -tion / -sion',text:'動詞などから名詞を作る代表的な語尾。'},
    {re:/ment$/i,label:'-ment',text:'動詞から名詞を作ることが多い。arrange → arrangement など。'},
    {re:/ly$/i,label:'-ly',text:'形容詞から副詞を作ることが多い語尾。'},
    {re:/ous$/i,label:'-ous',text:'「～の性質を持つ」形容詞を作ることが多い語尾。'},
    {re:/able$/i,label:'-able',text:'「～できる・～に適した」という形容詞を作ることが多い。'},
    {re:/^un/i,label:'un-',text:'「～でない・反対」などを表す代表的な接頭辞。'},
    {re:/^sub/i,label:'sub-',text:'「下・下位・副」を表すことが多い接頭辞。'}
  ];
  function tipFor(x){
    if(!x||!x.w)return null;
    if(trivia[x.w])return trivia[x.w];
    const p=autoParts.find(p=>p.re.test(x.w));
    return p?{title:'WORD PARTS · '+p.label,html:p.text}:null;
  }
  function ensureBox(afterId,boxId){
    let box=document.getElementById(boxId);
    if(box)return box;
    const anchor=document.getElementById(afterId);
    if(!anchor)return null;
    box=document.createElement('div'); box.id=boxId; box.className='memory-tip hidden';
    anchor.insertAdjacentElement('afterend',box); return box;
  }
  function paint(box,x){
    if(!box)return;
    const t=tipFor(x);
    if(!t){box.classList.add('hidden');box.innerHTML='';return;}
    box.innerHTML='<div class="memory-tip-head">💡 '+t.title+'</div><div class="memory-tip-body">'+t.html+'</div>';
    box.classList.remove('hidden');
  }
  const style=document.createElement('style');
  style.textContent='.memory-tip{margin-top:14px;padding:15px 16px;border-radius:16px;background:#fffaf0;border:1px solid #f3dfad;line-height:1.65}.memory-tip-head{font-size:13px;font-weight:850;color:#8a5a00;margin-bottom:6px}.memory-tip-body{font-size:14px;color:#374151}.memory-tip-body b{color:#111827}';
  document.head.appendChild(style);
  const oldRender=window.renderWord;
  if(typeof oldRender==='function')window.renderWord=function(){oldRender.apply(this,arguments);const b=ensureBox('learnRelated','learnMemoryTip');paint(b,currentLearnWord());};
})();

/* v3.6 interaction refinements: SET choice, independent shuffled tests, quiz back navigation. */
(function(){
  document.querySelectorAll('.version').forEach(v=>v.textContent='v3.30');

  const settings=document.getElementById('settings');
  if(settings&&!document.getElementById('setChoice')){
    const section=document.createElement('section');
    section.id='setChoice';
    section.className='screen';
    section.innerHTML='<button class="back" onclick="openEpisode()">← Episode 1</button><div class="card"><div class="small">Episode 1</div><h2 id="setChoiceTitle">SET 1</h2><p class="small" id="setChoiceProgress"></p><button onclick="studyChosenSet()">学習する</button><button class="secondary" onclick="testChosenSet()">テストする</button></div>';
    settings.insertAdjacentElement('beforebegin',section);
  }

  const quiz=document.getElementById('quiz');
  if(quiz&&!quiz.querySelector('.quiz-back')){
    const back=document.createElement('button');
    back.className='back quiz-back';
    back.textContent='← 戻る';
    back.onclick=()=>exitQuiz();
    quiz.insertAdjacentElement('afterbegin',back);
    const title=quiz.querySelector('.row b');
    if(title)title.textContent='TEST';
    const next=document.getElementById('quizNext');
    if(next){
      next.classList.remove('fixed-next');
      next.classList.add('quiz-next-inline');
      next.style.position='static';
      next.style.width='100%';
      next.style.minWidth='0';
      next.style.marginTop='18px';
      next.style.boxShadow='none';
    }
  }

  let chosenSet=1;
  let quizReturn='settings';

  function shuffledDifferent(items){
    const source=[...items],out=[...items];
    for(let i=out.length-1;i>0;i--){
      const j=Math.floor(Math.random()*(i+1));
      [out[i],out[j]]=[out[j],out[i]];
    }
    if(out.length>1&&out.every((x,i)=>x===source[i]))[out[0],out[1]]=[out[1],out[0]];
    return out;
  }

  window.openSet=function(n){
    chosenSet=n;
    const chunk=words.slice((n-1)*SET_SIZE,n*SET_SIZE);
    const done=chunk.filter(mastered).length;
    document.getElementById('setChoiceTitle').textContent='SET '+n;
    document.getElementById('setChoiceProgress').textContent=done+' / '+chunk.length+'語 習得';
    show('setChoice');
  };

  window.studyChosenSet=function(){beginSetStudy(chosenSet)};
  window.testChosenSet=function(){
    const chunk=words.slice((chosenSet-1)*SET_SIZE,chosenSet*SET_SIZE);
    startQuiz(chunk,'set','setChoice');
  };
  window.startSet=function(n){openSet(n)};

  window.openEpisode=function(){
    syncUnlock();
    const sets=Math.ceil(words.length/SET_SIZE),m=words.filter(mastered).length;
    document.getElementById('epWordCount').textContent=words.length+' words';
    document.getElementById('epProgress').style.width=(m/words.length*100)+'%';
    document.getElementById('epProgressText').textContent=m+' / '+words.length+'語 習得';
    let html='';
    for(let i=1;i<=sets;i++){
      const chunk=words.slice((i-1)*SET_SIZE,i*SET_SIZE),done=chunk.filter(mastered).length,ring=setRing(chunk);
      html+='<div class="set-row" onclick="openSet('+i+')"><div class="set-num" style="background:'+ring+'"><span>'+i+'</span></div><div class="set-info"><b>SET '+i+'</b><span>'+done+' / '+chunk.length+'語 習得</span></div><div class="set-state">'+(done===chunk.length?'✓':'›')+'</div></div>';
    }
    document.getElementById('setList').innerHTML=html;
    show('episode');
  };

  window.startQuiz=function(custom,mode,returnTo){
    quizMode=mode||'normal';
    quizReturn=returnTo||(custom?'episode':'settings');
    // Resolve at quiz start so learning-plan.js can supply the active
    // priority/scope-aware builder even though it loads after this file.
    const base=custom?[...custom]:window.buildQuiz();
    quizWords=shuffledDifferent(base);
    qidx=0;score=0;currentWrong=[];questionAnswered=false;
    show('quiz');
    renderQuiz();
  };

  window.exitQuiz=function(){
    if(quizReturn==='setChoice')openSet(chosenSet);
    else if(quizReturn==='review'){show('review');renderReviewLists()}
    else if(quizReturn==='episode')openEpisode();
    else show('settings');
  };

  window.startWrongRetest=function(){
    const retry=words.filter(x=>currentWrong.includes(x.w));
    if(!retry.length){alert('今回のテストで間違えた単語はありません');return}
    startQuiz(retry,'retest','review');
  };
})();

/* v3.30: high-contrast SET progress rings */
(function(){
  window.setRing=function(chunk){
    const colors={'苦手':'#EF4444','うろ覚え':'#F59E0B','ほぼ覚えた':'#3B82F6','覚えた':'#22C55E','未学習':'#D1D5DB'};
    const order=['覚えた','ほぼ覚えた','うろ覚え','苦手','未学習'];
    const total=chunk.length;let start=0;const parts=[];
    order.forEach(level=>{const n=chunk.filter(x=>masteryOf(x.w)===level).length;if(!n)return;const end=start+n/total*360;parts.push(colors[level]+' '+start+'deg '+end+'deg');start=end});
    return 'conic-gradient('+parts.join(',')+')';
  };

  const setList=document.getElementById('setList');
  if(setList&&!document.getElementById('setRingLegend')){
    const legend=document.createElement('div');legend.id='setRingLegend';legend.className='set-ring-legend';
    legend.innerHTML='<span><i class="known"></i>覚えた</span><span><i class="almost"></i>ほぼ</span><span><i class="fuzzy"></i>うろ覚え</span><span><i class="weak"></i>苦手</span>';
    setList.insertAdjacentElement('beforebegin',legend);
  }
  const style=document.createElement('style');
  style.textContent='.set-ring-legend{display:flex;flex-wrap:wrap;gap:8px 12px;margin:10px 0 3px;color:#64748b;font-size:11px;font-weight:700}.set-ring-legend span{display:flex;align-items:center;gap:5px}.set-ring-legend i{width:9px;height:9px;border-radius:50%}.set-ring-legend .known{background:#22C55E}.set-ring-legend .almost{background:#3B82F6}.set-ring-legend .fuzzy{background:#F59E0B}.set-ring-legend .weak{background:#EF4444}';
  document.head.appendChild(style);
})();
/* v3.8 result-page word accordion */
(function(){
  const style=document.createElement('style');
  style.textContent='.review-word-accordion{border-bottom:1px solid var(--line)}.review-word-accordion summary{list-style:none;cursor:pointer;padding:15px 0}.review-word-accordion summary::-webkit-details-marker{display:none}.review-word-summary{display:flex;align-items:center;justify-content:space-between;gap:12px}.review-word-main{display:block;min-width:0}.review-word-main .list-word,.review-word-main .list-meaning{display:block}.review-chevron{flex:none;width:32px;height:32px;border-radius:10px;background:#f3f4f6;display:grid;place-items:center;font-size:17px;transition:transform .18s ease}.review-word-accordion[open] .review-chevron{transform:rotate(180deg)}.review-word-panel{background:#f8fafc;border-radius:16px;padding:15px;margin:0 0 15px}.review-word-panel .detail-label{margin-top:16px;padding-top:14px}.review-word-top{display:flex;align-items:center;justify-content:space-between;gap:12px}.review-speak{width:auto;margin:0;padding:9px 12px;font-size:13px;background:#eef2f7;color:var(--ink)}';
  document.head.appendChild(style);

  function uniqueByWord(items){
    const seen=new Set();
    return items.filter(x=>!seen.has(x.w)&&seen.add(x.w));
  }

  function accordionRow(w){
    const safeWord=w.w.replace(/'/g,"\\'");
    const safeExample=w.e.replace(/'/g,"\\'");
    return '<details class="review-word-accordion"><summary><span class="review-word-summary"><span class="review-word-main"><span class="list-word">'+w.w+'</span><span class="list-meaning">'+w.m+'</span></span><span class="review-chevron">⌄</span></span></summary><div class="review-word-panel"><div class="review-word-top"><div><div class="pron">'+w.p+'</div><div class="meaning">'+w.m+'</div></div><button class="review-speak" onclick="event.preventDefault();event.stopPropagation();speakText(\''+safeWord+'\')">🔊 発音</button></div>'+relatedHTML(w)+'<div class="example" onclick="speakText(\''+safeExample+'\')"><div class="small">本編の実際のセリフ</div><div class="example-text">'+w.e+'</div><div class="example-ja">'+w.j+'</div></div></div></details>';
  }

  window.renderReviewLists=function(){
    const box=document.getElementById('reviewWordLists');
    if(!box)return;
    const wrong=uniqueByWord(quizWords.filter(x=>currentWrong.includes(x.w)));
    const correct=uniqueByWord(quizWords.filter(x=>!currentWrong.includes(x.w)));
    box.innerHTML=(wrong.length?'<div class="detail-label">間違えた単語　'+wrong.length+'語</div>'+wrong.map(accordionRow).join(''):'')+(correct.length?'<details class="review-details"><summary>正解した'+correct.length+'語を見る</summary>'+correct.map(accordionRow).join('')+'</details>':'');
  };
})();

/* v3.9 fixed bottom action bars */
(function(){
  const style=document.createElement('style');
  style.textContent='.fixed-action-bar{position:fixed;z-index:30;left:50%;transform:translateX(-50%);bottom:max(10px,env(safe-area-inset-bottom));width:min(calc(100% - 32px),688px);padding:7px;background:rgba(255,255,255,.95);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border:1px solid var(--line);border-radius:18px}.fixed-action-bar button{width:100%;margin:0;padding:15px 16px;border-radius:13px}.screen.action-screen{padding-bottom:88px}';
  document.head.appendChild(style);
  function wrapActionButton(btn,id){
    if(!btn)return null;
    let bar=document.getElementById(id);
    if(!bar){
      bar=document.createElement('div');
      bar.id=id;
      bar.className='fixed-action-bar';
      btn.parentNode.insertBefore(bar,btn);
      bar.appendChild(btn);
    }
    btn.classList.remove('fixed-next','quiz-next-inline');
    btn.style.position='';
    btn.style.width='';
    btn.style.minWidth='';
    btn.style.marginTop='';
    btn.style.boxShadow='';
    return bar;
  }
  const learn=document.getElementById('learn');
  const quiz=document.getElementById('quiz');
  if(learn)learn.classList.add('action-screen');
  if(quiz)quiz.classList.add('action-screen');
  wrapActionButton(document.getElementById('nextBtn'),'learnActionBar');
  const quizBtn=document.getElementById('quizNext');
  const quizBar=wrapActionButton(quizBtn,'quizActionBar');
  if(quizBtn&&quizBar){
    const sync=()=>quizBar.classList.toggle('hidden',quizBtn.classList.contains('hidden'));
    sync();
    new MutationObserver(sync).observe(quizBtn,{attributes:true,attributeFilter:['class']});
  }
})();


/* v3.10 quiz feedback related info */
(function(){
  const style=document.createElement('style');
  style.textContent='.quiz-related{margin-top:10px;color:var(--ink)}.quiz-related .learn-row{font-size:14px;margin:7px 0}.quiz-related .usage{margin-top:10px;background:rgba(255,255,255,.7)}';
  document.head.appendChild(style);
})();

/* v3.29: grammar-matched quiz choices */
(function(){
  const groups={
    noun:['nourishment','credentials','violation','business','backup','principle','kinematics','intellect','allergy','account','subsection','breach','hygiene','faculty','reputation','uncertainty','haven','handbook','argument','marriage','freshman','license','fad','ammonia','homeroom','attire','grooming','blouse','intelligence','sonata','calculus','geometry','pitch','musician','principal','uniform','supplies','grip','justice'],
    verb:['harass','torment','pursue','recruit','retaliate','recognize','accuse','rat out','deserve','afford'],
    modifier:['revolting','gifted','dimwitted','remarkably','arranged','theoretical','professional','unbalanced','scientific','adopted','financial','reassuring','maliciously','gullible','intimidated','exposed','thorough','despite','designated','diaphanous','assaulted','admirable','extreme','prime','Euclidean','ordinary','complicated','fired','private','comforting','pregnant']
  };
  const labels={noun:'名詞',verb:'動詞',modifier:'修飾語'};
  const byWord={};Object.entries(groups).forEach(([group,list])=>list.forEach(w=>byWord[w]=group));
  const groupOf=w=>byWord[w]||'noun';
  const shuffle=list=>{
    const out=[...list];
    for(let i=out.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[out[i],out[j]]=[out[j],out[i]]}
    return out;
  };

  window.renderQuiz=function(){
    questionAnswered=false;
    const x=quizWords[qidx],group=groupOf(x.w);
    quizCount.textContent=(qidx+1)+' / '+quizWords.length;
    quizWord.textContent=x.w;
    answerNote.className='answer-note hidden';feedback.classList.add('hidden');quizNext.classList.add('hidden');
    let badge=document.getElementById('quizPartOfSpeech');
    if(!badge){badge=document.createElement('div');badge.id='quizPartOfSpeech';badge.className='quiz-pos';quizWord.insertAdjacentElement('afterend',badge)}
    badge.textContent=labels[group]||'同じ品詞';
    let candidates=shuffle(words.filter(w=>w.w!==x.w&&groupOf(w.w)===group&&w.m!==x.m));
    if(candidates.length<3)candidates.push(...shuffle(words.filter(w=>w.w!==x.w&&!candidates.includes(w)&&w.m!==x.m)));
    const pool=shuffle([x,...candidates.slice(0,3)]);
    options.innerHTML='';
    pool.forEach(w=>{const b=document.createElement('button');b.className='option';b.textContent=w.m;b.onclick=()=>answer(b,w,x);options.appendChild(b)});
  };

  const style=document.createElement('style');
  style.textContent='.quiz-pos{display:inline-block;margin:0 0 5px;padding:5px 9px;border-radius:999px;background:#eef2f7;color:#64748b;font-size:12px;font-weight:800}';
  document.head.appendChild(style);
})();
