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
  style.textContent='.memory-tip{margin-top:14px;padding:15px 16px;border-radius:16px;background:#fffaf0;border:1px solid #f3dfad;line-height:1.65}.memory-tip-head{font-size:13px;font-weight:850;color:#8a5a00;margin-bottom:6px}.memory-tip-body{font-size:14px;color:#374151}.memory-tip-body b{color:#111827}.today .version::after{content:" · SMART TIPS"}';
  document.head.appendChild(style);
  const oldRender=window.renderWord;
  if(typeof oldRender==='function')window.renderWord=function(){oldRender.apply(this,arguments);const b=ensureBox('learnRelated','learnMemoryTip');paint(b,currentLearnWord());};
})();