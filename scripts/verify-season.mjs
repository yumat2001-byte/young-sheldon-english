// Use the same BASE_URL, CHROME_PATH and PLAYWRIGHT_MODULE as verify-episodes.mjs.
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const base=process.env.BASE_URL||'http://127.0.0.1:4175/';
const catalog=JSON.parse(await readFile(new URL('../data/season-1.json',import.meta.url),'utf8'));
const browser=await chromium.launch({headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{})});
try {
  const context=await browser.newContext({viewport:{width:390,height:844}});
  const page=await context.newPage();
  const errors=[];
  page.on('pageerror',err=>errors.push(err.message));
  await page.goto(base);
  const keys=catalog.map(({number:n})=>n===1?'ys-state':'ys-state-s01e'+String(n).padStart(2,'0'));
  const history=()=>page.evaluate(keys=>keys.map(key=>localStorage.getItem(key)),keys);
  const labels=()=>page.locator('#home .episode-info b').allTextContents();
  const expectedLabels=catalog.map(c=>'Episode '+c.number);
  assert.deepEqual(await labels(),expectedLabels);
  for(const {number:n,attested} of catalog.slice(2)){
    const before=await history();
    await page.locator('#home a.episode').filter({has:page.getByText('Episode '+n,{exact:true})}).click();
    await page.locator('#episode.active').waitFor();
    assert.deepEqual(await labels(),expectedLabels);
    assert.equal(await page.locator('#setList .set-row').count(),8);
    assert(await page.locator('#episode .episode-source a').getAttribute('href').then(u=>u.includes('s01e'+String(n).padStart(2,'0'))));
    const options=await page.evaluate(()=>{
      const deck=window.YS_EPISODE;
      const groupOf=w=>Object.keys(deck.groups).find(key=>deck.groups[key].includes(w));
      const meanings=new Map(words.map(w=>[w.m,w.w]));
      for(const x of words){
        quizWords=[x];qidx=0;renderQuiz();
        const choices=[...document.querySelectorAll('#options button')].map(b=>b.textContent);
        if(new Set(choices).size!==4||!choices.includes(x.m)||choices.some(m=>groupOf(meanings.get(m))!==groupOf(x.w)))throw Error('Invalid quiz: '+x.w);
      }
      return {words:words.map(w=>w.w),tiers:Object.values(deck.tiers).map(list=>list.length)};
    });
    assert.deepEqual(options.words,Object.keys(attested));
    assert.deepEqual(options.tiers,[40,20,20]);
    await page.locator('#setList .set-row').first().click();
    await page.getByRole('button',{name:'学習する',exact:true}).click();
    const word=await page.locator('#word').textContent();
    assert.equal(word,Object.keys(attested)[0]);
    await page.getByRole('button',{name:'この例文で音読練習'}).click();
    assert.equal(await page.locator('#spk-en').textContent(),await page.evaluate(()=>currentLearnWord().e));
    await page.locator('#spk-back').click();
    await page.locator('#learnMasteryButtons').getByRole('button',{name:'苦手',exact:true}).click();
    const after=await history();
    assert.equal(JSON.parse(after[n-1]).mastery[word],'苦手');
    after.forEach((value,i)=>{if(i!==n-1)assert.equal(value,before[i])});
    await page.reload();
    assert.equal(await page.locator('#weakStat').textContent(),'1');
    await page.locator('#mainNav').getByRole('button',{name:'TEST',exact:true}).click();
    await page.getByRole('button',{name:'苦手テストを始める'}).click();
    const meaning=await page.evaluate(()=>quizWords[0].m);
    await page.locator('#options').getByRole('button',{name:meaning,exact:true}).click();
    await page.locator('#quizNext').click();
    assert.equal(await page.locator('#weakClearMessage').textContent(),'CLEAR');
    await page.locator('#mainNav').getByRole('button',{name:'HOME'}).click();
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  }
  assert.deepEqual(errors,[]);
  console.log('PASS: 10 ordered HOME entries; direct navigation, 640 grammar-matched quizzes, 8 isolated histories, card-to-speaking, weak quiz CLEAR, mobile width.');
} finally {await browser.close()}
