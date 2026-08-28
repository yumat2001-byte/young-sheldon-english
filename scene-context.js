/* v3.17 episode-scene context: keep authentic short excerpt, add scene context and source access. */
(function(){
  const sourceUrl='https://transcripts.foreverdreaming.org/viewtopic.php?t=32113';
  const scene={
    nourishment:'家族で夕食前の祈りをしている場面。食事によって体が養われることへの感謝として使われる。',
    theoretical:'成人したSheldonが、理論物理学者になれなかった場合の進路を回想する場面。',
    backup:'成人したSheldonが、自分の「予備の進路」を語る場面。',
    professional:'成人したSheldonが、予備案として切符係の仕事を挙げる場面。',
    unbalanced:'Sheldonがニュートンの運動法則を説明し、不均衡な力について語る場面。',
    kinematics:'家の外で何をしていたのか聞かれ、Sheldonが自分の行動を説明する場面。',
    dimwitted:'科学の原理の面白さについてSheldonが強い言い方で語る場面。',
    scientific:'Sheldonが、科学の原理は人を笑顔にするはずだと語る場面。',
    principle:'Sheldonが科学の基本原理について話している場面。',
    adopted:'家族の夕食中、Sheldonが養子かどうかをめぐって冗談を言い合う場面。',
    arranged:'養子の話の流れで、家族が冗談として「まだ手配できる」と返す場面。',
    business:'夕食中に質問されたGeorgieが「あなたには関係ない」と返す場面。',
    gifted:'高校でSheldonが紹介され、年齢に比べ非常に才能がある生徒だと説明される場面。',
    remarkably:'Sheldonの才能の高さを強調して紹介する場面。',
    designated:'初登校の教室でSheldonが服装規定を読み上げ、指定区域外の服装を指摘する場面。',
    diaphanous:'初登校の教室でSheldonが服装規定を指摘し、女子生徒のブラウスが透けていると説明する場面。',
    blouse:'Sheldonが女子生徒のブラウスについて服装規定上の問題を指摘する場面。',
    account:'Sheldonの指摘に対して、先生が「考慮する」と返す場面。',
    violation:'Sheldonが教師の身だしなみについて、規定違反だと指摘する場面。',
    grooming:'Sheldonが学校の身だしなみ規定を根拠に指摘を続ける場面。',
    subsection:'Sheldonが規定のページ・条項・小項目まで具体的に示す場面。',
    credentials:'数学教師が、Sheldonに自分の資格・経歴を疑問視されたと校長へ不満を訴える場面。',
    breach:'数学教師が、Sheldonから衛生規定違反を指摘されたと話す場面。',
    hygiene:'Sheldonが教師の衛生状態を学校規定に結びつけて指摘する場面。',
    intimidated:'教師が、Sheldonから「自分の知性に威圧されている」と言われたことを説明する場面。',
    intelligence:'Sheldonの高い知能について教師が話す場面。',
    recruit:'Georgeが以前の仕事を失った理由を説明し、高校生の勧誘ルールについて話す場面。',
    complicated:'Georgeが、以前のフットボールチームで起きた事情をSheldonに説明する場面。',
    justice:'Sheldonが、規則を破った人には正義が下ったのかと父に確認する場面。',
    fired:'Georgeが、規則違反を告発した結果として自分が解雇されたとSheldonに話す場面。',
    reputation:'Georgeが、解雇後に悪い評判までついたと説明する場面。',
    comforting:'Sheldonが、不確実な世界の中で変わらない場所があることを安心材料として語る場面。',
    uncertainty:'Sheldonが、世の中には不確実なことが多いと語る場面。',
    attire:'Sheldonが学校の服装規定を読み上げ、スポーツ用の服装について指摘する場面。',
    principal:'学校内で校長に関係する場面で使われる語。',
    freshman:'高校生活の学年について話す場面で使われる語。',
    calculus:'数学の内容について話す場面で使われる語。',
    geometry:'数学の内容について話す場面で使われる語。',
    Euclidean:'ユークリッド幾何学について話す場面で使われる語。',
    pitch:'音楽の能力について話す場面で使われる語。',
    sonata:'ピアノとソナタについて会話する場面で使われる語。',
    musician:'音楽家について話す場面で使われる語。',
    private:'Sheldonの教育先について私立学校の費用を話す場面。',
    afford:'家族が私立学校の費用を負担できないことを話す場面。',
    pregnant:'学校で女子生徒について話す場面で使われる語。'
  };
  const style=document.createElement('style');
  style.textContent='.episode-context{margin-top:12px;padding-top:12px;border-top:1px solid var(--line);font-size:13px;line-height:1.7;color:var(--muted)}.episode-context b{display:block;color:var(--ink);font-size:12px;margin-bottom:4px}.episode-source{display:inline-block;margin-top:8px;color:#475569;font-size:12px;font-weight:750;text-decoration:none}.episode-source:after{content:" ↗"}';
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
    if(!example||example.querySelector('.episode-context'))return;
    const word=wordFromExample(example);
    if(!word)return;
    const x=(typeof words!=='undefined')?words.find(v=>v.w===word):null;
    const txt=scene[word]||('Episode 1で「'+(x?x.e:word)+'」という形で実際に使われる。短い抜粋と前後の場面をセットで覚えるための表示。');
    const box=document.createElement('div');
    box.className='episode-context';
    box.innerHTML='<b>この場面</b>'+txt+'<br><a class="episode-source" href="'+sourceUrl+'" target="_blank" rel="noopener">S1E1の前後を確認</a>';
    example.appendChild(box);
  }
  function scan(){document.querySelectorAll('.example:not(.hidden)').forEach(enrich)}
  const mo=new MutationObserver(()=>scan());
  mo.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
  scan();
})();
