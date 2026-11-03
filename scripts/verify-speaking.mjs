// Same Playwright/Chromium settings as verify-episodes.mjs. Speech callbacks are
// simulated so CI never needs microphone access or a remote recognition service.
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const base=process.env.BASE_URL||'http://127.0.0.1:4175/';
const browser=await chromium.launch({headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{})});
const keys=['ys-state','ys-state-s01e02'];
const errors=[];
async function setup(mode) {
  const ctx=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,locale:'ja-JP'});
  await ctx.addInitScript(mode=>{
    window.voiceCalls=[];
    class Recognition {
      start(){ window.lastRecognizer=this; window.voiceCalls.push('start'); this.onstart(); }
      stop(){ window.voiceCalls.push('stop'); }
      abort(){ window.voiceCalls.push('abort'); this.onend?.(); }
    }
    Object.defineProperty(window,'SpeechRecognition',{value:mode==='standard'?Recognition:undefined});
    Object.defineProperty(window,'webkitSpeechRecognition',{value:mode==='prefix'?Recognition:undefined});
    Object.defineProperty(window,'SpeechSynthesisUtterance',{value:class {constructor(t){this.text=t}}});
    Object.defineProperty(window,'speechSynthesis',{value:{
      cancel(){window.voiceCalls.push('cancel')},
      speak(u){window.voiceCalls.push(['play',u.text,u.lang,u.rate]);u.onend?.()}
    }});
  },mode);
  const page=await ctx.newPage();
  page.on('pageerror',e=>errors.push(e.message));
  page.on('response',r=>{if(r.status()>=400&&!r.url().endsWith('/favicon.ico')) errors.push(r.url())});
  return page;
}
const click=(p,id)=>p.locator('#spk-'+id).click();
const txt=(p,id)=>p.locator('#spk-'+id).innerText();
const value=(p,id)=>p.locator('#spk-'+id).inputValue();
const readKeys=p=>p.evaluate(names=>names.map(n=>localStorage.getItem(n)),keys);
const result=(p,transcript,isFinal=true)=>p.evaluate(([s,final])=>{
  const r=Object.assign([{transcript:s}],{isFinal:final});
  window.lastRecognizer.onresult({results:[r]});
},[transcript,isFinal]);
const noOverflow=p=>p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth);
try {
  const p=await setup('standard');
  await p.goto(base);
  await p.evaluate(names=>names.forEach((name,i)=>localStorage.setItem(name,JSON.stringify({
    mastery:{[i?'ignore':'adopted']:'苦手'},learned:[i?'ignore':'adopted'],wrong:[i?'ignore':'adopted'],
    unlockedSet:8,quizScope:'all',quizCount:20
  }))),keys);
  const initial=await readKeys(p);
  await p.reload();
  await click(p,'home');
  assert.equal(await p.locator('#spk-episode option').count(),22);
  assert.equal(await p.locator('#spk-line option').count(),86);
  assert.deepEqual(await p.evaluate(()=>window.voiceCalls.filter(v=>v==='start')),[]);
  for(let n=1;n<=22;n++) {
    await p.selectOption('#spk-episode',String(n));
    await p.waitForFunction(n=>document.querySelector('#spk-episode').value===String(n)&&document.querySelector('#speaking').classList.contains('active'),n);
    const total=n===2?80:n<=10?86:6;
    assert.equal(await p.locator('#spk-line option').count(),total);
    await p.selectOption('#spk-line',String(total-1));
    assert((await txt(p,'en')).trim()&&(await txt(p,'ja')).trim());
    assert(await p.locator('#spk-next').isDisabled());
    if(n<=10) {
      assert(await p.evaluate(()=>words.every((w,i)=>{
        const select=document.querySelector('#spk-line');select.selectedIndex=i;select.dispatchEvent(new Event('change'));
        return document.querySelector('#spk-en').textContent===w.e&&document.querySelector('#spk-ja').textContent===w.j;
      })));
    }
  }
  await p.selectOption('#spk-episode','21');
  await click(p,'listen');
  const phrase=await txt(p,'en');
  assert.equal(phrase,'Would you like to come over for dinner?');
  assert.deepEqual(await p.evaluate(()=>voiceCalls.at(-1)),['play',phrase,'en-US',0.8]);
  await click(p,'rate');await click(p,'listen');
  assert.equal(await p.evaluate(()=>voiceCalls.at(-1)[3]),1);
  await click(p,'mic');
  assert.equal(await p.evaluate(()=>lastRecognizer.lang),'en-US');
  assert(await p.locator('#spk-listen').isDisabled());
  await result(p,'partial',false);assert(await p.locator('#spk-result').isHidden());
  await click(p,'mic');assert(await p.locator('#spk-mic').isDisabled());
  await result(p,'Would you like to come for lunch?');
  assert.deepEqual(await p.locator('#spk-target mark').allTextContents(),['over','dinner']);
  assert.deepEqual(await p.locator('#spk-actual mark').allTextContents(),['lunch']);
  assert.equal(await txt(p,'result-label'),'認識された英文');
  const lineNumber=await value(p,'line');
  await click(p,'retry');
  assert.equal(await value(p,'line'),lineNumber); assert(await p.locator('#spk-result').isHidden());
  await click(p,'mic');await result(p,phrase.toUpperCase().replace('?','!'));
  assert.equal(await p.locator('#spk-result mark.spk-extra').count(),1); // legend only
  assert.equal(await txt(p,'summary'),'すべての単語が一致しました。');
  await click(p,'retry');await click(p,'mic');await click(p,'next');
  await result(p,'late result');assert(await p.locator('#spk-result').isHidden());
  assert((await txt(p,'en')).includes("I'd love to"));
  // Retry/permission/network handlers keep the same material and enable self-check.
  for(const error of ['not-allowed','network','no-speech','audio-capture']) {
    await click(p,'mic');
    await p.evaluate(e=>lastRecognizer.onerror({error:e}),error);
    assert(await p.locator('#spk-manual').evaluate(el=>el.open));
    assert(await p.locator('#spk-mic').isEnabled());
  }
  await click(p,'mic');await p.evaluate(()=>lastRecognizer.onend());
  assert((await txt(p,'status')).includes('認識結果がありません'));
  await click(p,'mic');await click(p,'back');
  assert.equal(await p.evaluate(()=>voiceCalls.at(-2)),'abort');
  assert.deepEqual(await readKeys(p),initial);
  await p.goto(new URL('v3.32/',base).href); await click(p,'home');
  assert.equal(await p.locator('#spk-line option').count(),86);
  await click(p,'back');
  await p.getByRole('button',{name:'WORDS',exact:true}).click();
  await p.locator('#wordList .list-item').nth(4).click();
  const before=await p.evaluate(()=>[currentLearnWord().w,currentLearnWord().e,idx,JSON.stringify(state)]);
  await p.getByRole('button',{name:'この例文で音読練習'}).click();
  assert.equal(await txt(p,'en'),before[1]);
  await click(p,'back');
  assert(await p.locator('#learn').isVisible());
  assert.deepEqual(await p.evaluate(()=>[currentLearnWord().w,currentLearnWord().e,idx,JSON.stringify(state)]),before);

  const fallback=await setup('none');await fallback.goto(base);await click(fallback,'home');
  await fallback.selectOption('#spk-episode','21');
  assert(await fallback.locator('#spk-mic').isDisabled());
  await click(fallback,'hide');assert(await fallback.locator('#spk-en').isHidden());
  await click(fallback,'hide');assert(await fallback.locator('#spk-en').isVisible());
  await fallback.fill('#spk-input','   ');await click(fallback,'compare');
  assert(await fallback.locator('#spk-result').isHidden());
  await fallback.fill('#spk-input','Would you like to come for lunch?');await click(fallback,'compare');
  assert.equal(await txt(fallback,'result-label'),'入力した英文');
  assert.deepEqual(await fallback.locator('#spk-target mark').allTextContents(),['over','dinner']);
  assert.deepEqual(await fallback.locator('#spk-actual mark').allTextContents(),['lunch']);
  await mkdir(new URL('../verification/',import.meta.url),{recursive:true});
  // Show the complete comparison at the top of the mobile viewport.
  await fallback.locator('#spk-result').evaluate(el=>el.scrollIntoView({block:'start'}));
  await fallback.locator('#spk-result').screenshot({path:new URL('../verification/speaking-result.png',import.meta.url).pathname});
  await click(fallback,'retry');assert.equal(await value(fallback,'input'),'');assert.equal(await value(fallback,'line'),'0');
  for(const width of [320,390,768,1280]) {
    await fallback.setViewportSize({width,height:844});assert(await noOverflow(fallback));
  }
  const prefix=await setup('prefix');await prefix.goto(new URL('episode-2/index.html#read-aloud',base).href);
  await click(prefix,'mic');await result(prefix,await txt(prefix,'en'));
  assert.equal(await txt(prefix,'summary'),'すべての単語が一致しました。');
  assert.deepEqual(errors,[]);
  console.log('PASS: 22 episodes, all 800 vocabulary card mappings, 126 new lines, TTS 0.8/1.0, both recognition APIs (simulated), stop/final/interim, alignment, retry, stale events, permission/network/silence/mic failures, no-mic practice, legacy storage, word-card return, v3.32, 320–1280px.');
} finally {await browser.close()}
