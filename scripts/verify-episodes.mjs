// Run against a local static server with Playwright installed.
// PLAYWRIGHT_MODULE may point at an existing Playwright installation.
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.BASE_URL || 'http://127.0.0.1:4175/';
const browser = await chromium.launch({headless:true,...(process.env.CHROME_PATH ? {executablePath:process.env.CHROME_PATH} : {})});
const context = await browser.newContext({viewport:{width:390,height:844}});
await context.addInitScript(()=>{if(window.speechSynthesis)window.speechSynthesis.speak=()=>{}});
const page = await context.newPage();
const errors=[];
page.on('pageerror',e=>errors.push(e.message));
page.on('response',r=>{if(r.status()>=400&&!r.url().endsWith('/favicon.ico'))errors.push(`${r.status()} ${r.url()}`)});
const go=path=>page.goto(new URL(path,base).href);
const nav=name=>page.locator('#mainNav').getByRole('button',{name,exact:true}).click();
const visible=async selector=>page.locator(selector).waitFor({state:'visible'});
try {
  await go('./');
  const legacy={mastery:{adopted:'覚えた',business:'苦手'},learned:['adopted','business'],wrong:['business'],quizCount:20,unlockedSet:8,quizScope:'all'};
  await page.evaluate(state=>localStorage.setItem('ys-state',JSON.stringify(state)),legacy);
  await page.reload();
  assert.equal(await page.locator('#knownStat').textContent(),'1');
  assert.equal(await page.locator('#weakStat').textContent(),'1');
  const original=await page.evaluate(()=>localStorage.getItem('ys-state'));
  assert.equal(await page.locator('#home .episode').count(),10);
  await page.getByRole('link',{name:/2 Episode 2/}).click();
  assert(page.url().includes('/episode-2/'));
  assert.equal(await page.locator('#knownStat').textContent(),'0');
  assert.equal(await page.locator('#weakStat').textContent(),'0');
  assert.equal(await page.evaluate(()=>words.length),80);
  const data=await page.evaluate(()=>({tiers:window.YS_EPISODE.tiers,words:words.map(x=>x.w),groups:window.YS_EPISODE.groups}));
  assert.deepEqual(Object.values(data.tiers).map(x=>x.length),[40,20,20]);
  assert.equal(new Set(data.words).size,80);
  assert.deepEqual(data.words,Object.values(data.tiers).flat());
  assert.equal(await page.locator('#home .today').isVisible(),false);
  await visible('#episode');
  assert.equal(await page.locator('#setList .set-row').count(),8);
  await page.locator('#setList .set-row').first().click();
  assert.equal(await page.locator('#setChoice .small').first().textContent(),'Episode 2');
  await page.getByRole('button',{name:'学習する',exact:true}).click();
  assert.equal(await page.locator('#word').textContent(),'ignore');
  assert.match(await page.locator('#example').textContent(),/学習用例文（オリジナル）/);
  await page.locator('#learnMasteryButtons').getByRole('button',{name:'苦手',exact:true}).click();
  await page.reload();
  assert.equal(await page.locator('#weakStat').textContent(),'1');
  assert.equal(await page.evaluate(()=>localStorage.getItem('ys-state')),original);
  await nav('TEST');
  await page.getByRole('button',{name:'苦手テストを始める',exact:true}).click();
  assert.equal(await page.locator('#quizWord').textContent(),'ignore');
  const meaning=await page.evaluate(()=>quizWords[qidx].m);
  // A wrong attempt followed by a correct answer must still clear a weak word.
  const wrong=page.locator('#options button').filter({hasNotText:meaning}).first();
  await wrong.click();
  assert.equal(await page.evaluate(()=>masteryOf('ignore')),'苦手');
  await page.locator('#options').getByRole('button',{name:meaning,exact:true}).click();
  assert.equal(await page.evaluate(()=>masteryOf('ignore')),'ほぼ覚えた');
  await page.locator('#quizNext').click();
  await visible('#weakClearMessage');
  assert.equal(await page.locator('#weakClearMessage').textContent(),'CLEAR');
  await nav('TEST');
  assert(await page.locator('#weakTestCard button').isDisabled());
  // Check normal tests include new words and respect mastery priority and scope.
  await page.evaluate(()=>{state.mastery={ignore:'覚えた',favor:'ほぼ覚えた',attention:'未学習',worried:'うろ覚え',fault:'苦手',solitude:'苦手'};state.wrong=['fault','solitude'];state.quizCount=40;save()});
  await page.getByRole('button',{name:'CORE 40',exact:true}).click();
  await page.getByRole('button',{name:'テストを始める',exact:true}).click();
  const core=await page.evaluate(()=>quizWords.map(x=>x.w));
  assert.equal(core.length,40);assert.equal(new Set(core).size,40);
  assert.equal(core[0],'fault');assert.equal(core[1],'worried');
  assert(!core.includes('solitude'));assert(core.includes('attention'));
  await page.getByRole('button',{name:'← 戻る',exact:true}).click();
  await page.getByRole('button',{name:'ALL 80',exact:true}).click();
  await page.getByRole('button',{name:'テストを始める',exact:true}).click();
  const all=await page.evaluate(()=>quizWords.map(x=>x.w));
  assert.equal(all.length,40);assert.equal(new Set(all).size,40);
  assert.deepEqual(all.slice(0,2),['fault','solitude']);
  // Every word must have four distinct, matching-part-of-speech answer choices.
  const choiceErrors=await page.evaluate(()=>{
    const groupOf=w=>Object.entries(window.YS_EPISODE.groups).find(([,list])=>list.includes(w))[0];
    const failures=[];
    for(const x of words){
      quizWords=[x];qidx=0;renderQuiz();
      const choices=[...document.querySelectorAll('#options button')].map(b=>b.textContent);
      if(choices.length!==4||new Set(choices).size!==4||!choices.includes(x.m)||choices.some(m=>groupOf(words.find(w=>w.m===m).w)!==groupOf(x.w)))failures.push(x.w);
    }
    return failures;
  });
  assert.deepEqual(choiceErrors,[]);
  await page.getByRole('button',{name:'← 戻る',exact:true}).click();
  await nav('HOME');
  await page.getByRole('button',{name:'第2話の単語セットを開く'}).click();
  await page.locator('#setList .set-row').last().click();
  await page.getByRole('button',{name:'学習する',exact:true}).click();
  assert.equal(await page.locator('#word').textContent(),data.words[70]);
  for(let i=0;i<10;i++)await page.locator('#nextBtn').click();
  await visible('#quiz');
  assert.equal(await page.evaluate(()=>quizWords.length),10);
  // Finish the complete SET test and open a review entry.
  for(let i=0;i<10;i++){
    const m=await page.evaluate(()=>quizWords[qidx].m);
    await page.locator('#options').getByRole('button',{name:m,exact:true}).click();
    await page.locator('#quizNext').click();
  }
  await visible('#review');
  assert.equal(await page.locator('#scoreStat').textContent(),'100%');
  await nav('WORDS');
  assert.equal(await page.locator('#wordList .list-item').count(),80);
  await page.locator('#wordList .list-item').last().click();
  assert.equal(await page.locator('#word').textContent(),'mining');
  await visible('#example .example-target');
  await mkdir(new URL('../verification/',import.meta.url),{recursive:true});
  await page.screenshot({path:new URL('../verification/episode-2-learn.png',import.meta.url).pathname,fullPage:true});
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await page.locator('#learn .back').click();await nav('HOME');
  await page.screenshot({path:new URL('../verification/episode-2-home.png',import.meta.url).pathname});
  await page.getByRole('link',{name:/1 Episode 1/}).click();
  assert.equal(await page.evaluate(()=>localStorage.getItem('ys-state')),original);
  assert.equal(await page.locator('#knownStat').textContent(),'1');
  assert.equal(await page.locator('#weakStat').textContent(),'1');
  await go('v3.32/');
  assert.equal(await page.locator('.home-status-title .version').textContent(),'v3.32');
  await page.getByRole('link',{name:/2 Episode 2/}).click();
  assert.equal(await page.locator('.home-status-title b').textContent(),'学習状況 · 第2話');
  await page.setViewportSize({width:1280,height:900});
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  assert.deepEqual(errors,[]);
  console.log('PASS: both episodes, legacy progress, 80 words, 8 SETs, CORE/ALL, unique priority quiz, 80 grammar-matched choice pools, weak CLEAR, full SET test, save/reload, mobile/desktop, release URL, no JS or HTTP errors.');
} finally {await browser.close()}
