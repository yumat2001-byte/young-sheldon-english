(() => {
  const root = new URL('../', document.currentScript.src);
  const currentEpisode = window.YS_EPISODE?.number || 1;
  const existing = words.map(x => ({english:x.e, japanese:x.j, label:x.w}));
  const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const micAvailable = !!Recognition && window.isSecureContext;
  const canListen = !!window.speechSynthesis && !!window.SpeechSynthesisUtterance;
  const $ = id => document.getElementById(id);
  const home = document.createElement('button');
  home.id = 'spk-home';
  home.className = 'spk-banner';
  home.innerHTML = '<img alt="" width="70" height="70"><span><span class="spk-kicker">SPEAKING LAB · SEASON 01</span><b>音読練習</b><small>お手本を聞いて、声に出す</small></span><i aria-hidden="true">›</i>';
  home.querySelector('img').src = new URL('speaking/icons/sheldon-180.png', root);
  $('home').prepend(home);

  const wordButton = document.createElement('button');
  wordButton.textContent = 'この例文で音読練習';
  wordButton.className = 'secondary';
  $('example').after(wordButton);
  const screen = document.createElement('section');
  screen.id = 'speaking';
  screen.className = 'screen';
  screen.setAttribute('aria-labelledby','spk-title');
  screen.innerHTML = `
    <button id="spk-back" class="back">← 戻る</button>
    <h1 id="spk-title" tabindex="-1">音読練習</h1>
    <div class="spk-pickers"><label>練習する話<select id="spk-episode"></select></label>
    <label>練習する英文<select id="spk-line"></select></label></div>
    <div class="spk-lesson"><div id="spk-meta" class="spk-kicker"></div>
      <p id="spk-en" lang="en"></p><p id="spk-ja"></p>
      <div class="spk-pair"><button id="spk-listen">① お手本を聞く</button><button id="spk-rate" aria-label="読み上げ速度を切り替える">ゆっくり · 0.8倍</button></div>
    </div>
    <div class="card"><h2>② 声に出す</h2>
      <p class="small">「マイクで話す」を押すとマイクを使います。ブラウザによっては音声が外部の認識サービスに送られます。アプリは音声や認識文を保存しません。</p>
      <button id="spk-mic">マイクで話す</button>
      <p id="spk-status" role="status"></p>
      <details id="spk-manual"><summary>マイクを使わずに練習</summary>
        <p class="small">英文を隠し、日本語を見て声に出してみましょう。あとでお手本を表示して確認できます。</p>
        <button id="spk-hide" class="secondary">英文を隠す</button>
        <label for="spk-input">話した英文を入力して比較する</label>
        <textarea id="spk-input" lang="en" maxlength="500" autocapitalize="sentences" placeholder="英語を入力"></textarea>
        <button id="spk-compare">入力した英文を比較</button>
      </details>
    </div>
    <div class="card" id="spk-result" hidden tabindex="-1"><h2>③ 結果を確認</h2>
      <p id="spk-summary" role="status"></p>
      <b class="spk-label">お手本</b><p id="spk-target" class="spk-line" lang="en"></p>
      <b class="spk-label" id="spk-result-label"></b><p id="spk-actual" class="spk-line" lang="en"></p>
      <p class="small"><mark class="spk-missing">実線</mark> はお手本にだけある語、<mark class="spk-extra">点線</mark> は結果にだけある語です。文字の一致を比べています。発音の採点は行いません。</p>
      <button id="spk-retry">同じ英文に再挑戦</button>
    </div>
    <div class="spk-pair"><button class="secondary" id="spk-prev">← 前の英文</button><button class="secondary" id="spk-next">次の英文 →</button></div>
    <p class="spk-source" id="spk-source"></p>`;
  $('mainNav').before(screen);
  const episodeSelect = $('spk-episode'), lineSelect = $('spk-line');
  const status = message => { $('spk-status').textContent = message; };
  const mic = $('spk-mic'), listen = $('spk-listen');
  let lines = [], index = 0, returnTo = 'home', slow = true;
  let session = null, utterance = null, timer = null, manualResult = false;

  for (let n=1; n<=22; n++) {
    const topic = n <= 2 ? '単語教材' : window.seasonSpeaking[n][0];
    episodeSelect.add(new Option('第'+n+'話 · '+topic, String(n)));
  }
  function stopAudio() {
    clearTimeout(timer);
    const previous = session;
    session = null;
    if (previous) { try { previous.abort(); } catch {} }
    if (canListen) {
      utterance = null;
      speechSynthesis.cancel();
    }
    mic.textContent = 'マイクで話す';
    mic.disabled = !micAvailable;
    listen.disabled = !canListen;
  }
  function reveal(showEnglish) {
    $('spk-en').hidden = !showEnglish;
    $('spk-hide').textContent = showEnglish ? '英文を隠す' : 'お手本を表示';
  }
  function displayLine(i) {
    stopAudio();
    index = i;
    lineSelect.selectedIndex = i;
    const line = lines[i];
    $('spk-meta').textContent = 'EPISODE '+episodeSelect.value.padStart(2,'0')+'　/　'+(i+1)+' OF '+lines.length;
    $('spk-en').textContent = line.english;
    $('spk-ja').textContent = line.japanese;
    $('spk-result').hidden = true;
    $('spk-input').value = '';
    $('spk-prev').disabled = i===0;
    $('spk-next').disabled = i===lines.length-1;
    $('spk-manual').open = !micAvailable;
    reveal(true);
    status(!micAvailable ? (!window.isSecureContext ? 'マイクを使うには HTTPS または localhost で開いてください。' : 'このブラウザは音声認識に対応していません。')+'マイクなしで練習できます。' : '');
    listen.textContent = canListen ? '① お手本を聞く' : '読み上げ非対応';
    $('spk-rate').disabled = !canListen;
  }
  function selectEpisode(n, start = 0) {
    if (n<=2 && n!==currentEpisode) {
      stopAudio();
      location.assign(new URL(n===1?'index.html#read-aloud':'episode-2/index.html#read-aloud', root));
      return;
    }
    episodeSelect.value = String(n);
    lines = n===currentEpisode ? [...existing] : [];
    if (window.seasonSpeaking[n]) {
      window.seasonSpeaking[n][1].forEach(([english,japanese], i) =>
        lines.push({english,japanese,label:'会話 '+(Math.floor(i/2)+1)+(i%2?'・応答':'・呼びかけ')}));
    }
    const source = $('spk-source');
    source.textContent = n===1 ? '第1話の単語カードの英文・語句と、初登校をテーマにした追加会話。' :
      n===2 ? '第2話の単語カードに収録されている学習用例文。' : 'テーマ「'+window.seasonSpeaking[n][0]+'」の学習用オリジナル会話。';
    if (n!==2) {
      const link = document.createElement('a');
      link.textContent='各話のあらすじ ↗';
      link.href='https://www.tvguide.com/tvshows/young-sheldon/episodes-season-1/1030448875/';
      link.target='_blank'; link.rel='noopener noreferrer'; source.append(' ',link);
    }
    lineSelect.replaceChildren(...lines.map((line,i)=>new Option((i+1)+'. '+line.label,String(i))));
    displayLine(start);
  }
  function openPractice(from, start=0) {
    returnTo = from;
    $('spk-back').textContent = from==='learn'?'← 単語カードへ':'← ホームへ';
    show('speaking');
    $('mainNav').classList.add('hidden');
    selectEpisode(currentEpisode,start);
    $('spk-title').focus();
  }
  home.onclick = () => openPractice('home');
  wordButton.onclick = () => openPractice('learn', words.indexOf(currentLearnWord()));
  $('spk-back').onclick = () => {
    stopAudio();
    // Remove the cross-episode entry marker so a refresh returns to HOME.
    if (location.hash==='#read-aloud') history.replaceState(null,'',location.pathname+location.search);
    show(returnTo);
    (returnTo==='learn'?wordButton:home).focus();
  };
  episodeSelect.onchange = () => selectEpisode(Number(episodeSelect.value));
  lineSelect.onchange = () => displayLine(lineSelect.selectedIndex);
  $('spk-prev').onclick = () => displayLine(index-1);
  $('spk-next').onclick = () => displayLine(index+1);
  $('spk-hide').onclick = () => reveal($('spk-en').hidden);
  $('spk-rate').onclick = () => {
    slow = !slow;
    $('spk-rate').textContent = slow?'ゆっくり · 0.8倍':'標準 · 1.0倍';
  };
  listen.onclick = () => {
    stopAudio();
    const speech = new SpeechSynthesisUtterance(lines[index].english);
    utterance = speech;
    speech.lang='en-US'; speech.rate=slow ? 0.8 : 1;
    status('お手本を再生中…');
    speech.onend = () => { if (speech===utterance) { utterance=null; status('次は声に出してみましょう。'); } };
    speech.onerror = () => { if (speech===utterance) { utterance=null; status('お手本を再生できませんでした。英文を見て練習できます。'); } };
    try { speechSynthesis.speak(speech); } catch { speech.onerror(); }
  };

  // Align whole words in order. Keeping a longest common subsequence means a
  // single omitted or inserted word does not mark the rest of the line wrong.
  function tokens(text) {
    return [...text.matchAll(/[A-Za-z0-9]+(?:['’][A-Za-z0-9]+)*/g)].map(m=>({
      start:m.index,end:m.index+m[0].length,key:m[0].toLowerCase().replace(/’/g,"'"),matched:false
    }));
  }
  function align(a,b) {
    const lengths=Array.from({length:a.length+1},()=>new Uint16Array(b.length+1));
    for(let i=a.length-1;i>=0;i--) for(let j=b.length-1;j>=0;j--) {
      lengths[i][j]=a[i].key===b[j].key ? 1+lengths[i+1][j+1] : Math.max(lengths[i+1][j],lengths[i][j+1]);
    }
    let i=0,j=0;
    while(i<a.length && j<b.length) {
      if(a[i].key===b[j].key) { a[i++].matched=b[j++].matched=true; }
      else if(lengths[i+1][j]>=lengths[i][j+1]) i++;
      else j++;
    }
    return lengths[0][0];
  }
  function paintLine(box,text,parts,css) {
    let offset=0;
    box.replaceChildren();
    for(const part of parts.filter(p=>!p.matched)) {
      const mark=document.createElement('mark');
      mark.className=css; mark.textContent=text.slice(part.start,part.end);
      box.append(text.slice(offset,part.start),mark); offset=part.end;
    }
    box.append(text.slice(offset));
  }
  function compare(actual, manual) {
    const target=lines[index].english, a=tokens(target), b=tokens(actual);
    if(!b.length) { status(manual?'比較する英文を入力してください。':'英語を認識できませんでした。もう一度お試しください。'); return; }
    manualResult=manual;
    const count=align(a,b);
    paintLine($('spk-target'),target,a,'spk-missing');
    paintLine($('spk-actual'),actual,b,'spk-extra');
    $('spk-result-label').textContent=manual?'入力した英文':'認識された英文';
    $('spk-summary').textContent=(count===a.length && count===b.length ? 'すべての単語が一致しました。' : '一致した語 '+count+' / '+a.length+' ・ 結果にだけある語 '+(b.length-count));
    $('spk-result').hidden=false;
    status('');
    $('spk-result').focus();
  }
  $('spk-compare').onclick = () => { stopAudio(); $('spk-result').hidden=true; compare($('spk-input').value.trim(),true); };
  $('spk-retry').onclick = () => {
    displayLine(index);
    if(manualResult) $('spk-manual').open=true;
    (manualResult || !micAvailable ? $('spk-hide') : mic).focus();
  };
  $('spk-manual').ontoggle = () => {
    if($('spk-manual').open && session) { stopAudio(); status('マイクを停止しました。'); }
  };

  const errors={
    'not-allowed':'マイクの許可がありません。','service-not-allowed':'音声認識サービスを利用できません。',
    'no-speech':'声を検出できませんでした。','audio-capture':'マイクを利用できません。','network':'音声認識サービスに接続できません。',
    'language-not-supported':'この環境では英語の音声認識を利用できません。'
  };
  function fail(message) {
    stopAudio(); status(message+' マイクなしでも練習できます。'); $('spk-manual').open=true;
  }
  mic.onclick = () => {
    if(session) {
      try { session.stop(); mic.disabled=true; status('結果を待っています…'); }
      catch { fail('音声認識を終了できませんでした。'); }
      return;
    }
    stopAudio();
    $('spk-result').hidden=true;
    $('spk-manual').open=false;
    try {
      const active=new Recognition();
      session=active; active.lang='en-US'; active.continuous=false; active.interimResults=false;
      mic.textContent='終了して確認'; listen.disabled=true;
      status('マイクを準備中…');
      active.onstart=()=>{ if(session===active) status('聞き取り中です。英文を話してください。'); };
      active.onresult=event=>{
        if(session!==active) return;
        const actual=Array.from(event.results).filter(r=>r.isFinal).map(r=>r[0].transcript).join(' ').trim();
        if(actual) { stopAudio(); compare(actual,false); }
      };
      active.onerror=event=>{ if(session===active) fail(errors[event.error]||'音声認識を利用できませんでした。'); };
      active.onend=()=>{ if(session===active) fail('認識結果がありません。もう一度お試しください。'); };
      active.onnomatch=()=>{ if(session===active) fail('英語を認識できませんでした。'); };
      timer=setTimeout(()=>{ if(session===active) fail('音声認識がタイムアウトしました。'); },45000);
      active.start();
    } catch { fail('マイクを開始できませんでした。'); }
  };
  function pausePractice() {
    if(!screen.classList.contains('active')) return;
    const interrupted=session || utterance;
    stopAudio();
    if(interrupted) status('音声を停止しました。');
  }
  document.addEventListener('visibilitychange',()=>{ if(document.hidden) pausePractice(); });
  window.addEventListener('pagehide',pausePractice);
  if(location.hash==='#read-aloud') openPractice('home');
})();
