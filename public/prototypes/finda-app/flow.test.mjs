import test from 'node:test';import assert from 'node:assert/strict';import {initial,next,back,reveal,selectOwnership,skipOnboarding,consentHome,openMainTab,openExistingDetail,openAiRate,toggleAiRateConsent,canConfirmAiRate,shouldAutoAdvanceAiRate,toggleNoPlan} from './flow.mjs';import {aiRateConsentSheet,aiRateName} from './ai-rate.js';import {selectScreen,screenGroups,screenKey} from './screen-catalog.js';

test('All opens the existing loan screen and Back preserves the To-be profile',()=>{
 const all={...initial(),screen:'all',homeState:'OB_NoMD',tab:'Loan',count:'3',postProfile:{a:1,h:2,n:2}};
 const loan=openExistingDetail(all,'find-loan');
 assert.deepEqual(loan,{...all,screen:'find-loan',existingReturnTo:'all'});assert.deepEqual(back(loan),all);
 assert.equal(screenKey(loan),'existing:find-loan');assert.equal(next(loan).screen,'find-loan');
 assert.deepEqual(openMainTab(loan,'home'),{...all,screen:'11'});
 assert.equal(selectScreen(all,'existing:find-loan').screen,'find-loan');
 assert.strictEqual(openExistingDetail(all,'unknown'),all);
});

test('home loan card returns to its original home without leaking the previous All origin',()=>{
 for(const homeState of ['NoOB_NoMD','OB_NoMD']){
  const home={...initial(),screen:'11',homeState,tab:'Loan',postProfile:{a:1,h:2,n:2},postChip:'대출'};
  const loan=openExistingDetail(home,'find-loan');
  assert.equal(loan.existingReturnTo,'11');assert.deepEqual(back(loan),home);
  const all=openMainTab(loan,'all');assert.ok(!('existingReturnTo' in all));
  assert.deepEqual(back(openExistingDetail(all,'find-loan')),all);
  assert.deepEqual(openMainTab(loan,'home'),home);
 }
});

test('refinance preview and home card keep their own return path without advancing',()=>{
 for(const homeState of ['NoOB_NoMD','OB_NoMD']){
  const home={...initial(),screen:'11',homeState,tab:'Loan',postProfile:{a:2,h:1,n:2}};
  const refinance=openExistingDetail(home,'refinance');
  assert.equal(screenKey(refinance),'existing:refinance');assert.equal(next(refinance).screen,'refinance');
  assert.deepEqual(back(refinance),home);assert.deepEqual(openMainTab(refinance,'home'),home);
 }
 const reviewed=selectScreen(initial(),'existing:refinance');
 assert.equal(reviewed.screen,'refinance');assert.equal(back(reviewed).screen,'all');
});

test('home, point and all keep onboarding answers and the selected home tab',()=>{
 for(const homeState of ['NoOB_NoMD','InOB_NoMD','OB_NoMD','OB_MD'])for(const tab of ['Asset','Loan']){
  const home={...initial(),screen:'11',homeState,tab,count:'3',principal:'100',postProfile:{a:1,h:2,n:2},postChip:'대출'};
  const point=openMainTab(home,'point'),all=openMainTab(point,'all');
  assert.deepEqual(point,{...home,screen:'point'});assert.deepEqual(all,{...home,screen:'all'});
  assert.deepEqual(openMainTab(all,'home'),home);assert.deepEqual(back(all),home);assert.deepEqual(back(point),home);
  assert.strictEqual(openMainTab(home,'unknown'),home);assert.deepEqual(home.postProfile,{a:1,h:2,n:2});
 }
});

test('existing screens can be reviewed without replacing To-be home state',()=>{
 const home={...initial(),screen:'11',homeState:'OB_NoMD',tab:'Loan'};
 for(const screen of ['point','all']){
  const selected=selectScreen(home,'existing:'+screen);
  assert.equal(screenKey(selected),'existing:'+screen);assert.equal(next(selected).screen,screen);
  assert.deepEqual(back(selected),{...home,review:true});
 }
});
test('splash goes directly to consent and back never opens the removed login screen',()=>{
 const consent=next(initial());assert.equal(consent.screen,'02');assert.equal(consent.homeState,'NoOB_NoMD');
 const splash=back(consent);assert.equal(splash.screen,'00');assert.equal(next(splash).screen,'02');
 assert.equal(next({...consent,consent:{...consent.consent,service:true,privacy:true}}).screen,'03');
 assert.ok(!screenGroups.some(([,items])=>items.some(([key])=>key==='onboarding:01')));
});
test('NO route reaches NoLoan then OB_NoMD home',()=>{let s={...initial(),screen:'05'};s=next(selectOwnership(s,false));assert.equal(s.screen,'08');s=next({...s,amount:'50000000'});assert.equal(s.screen,'09');s=next({...s,purpose:'전월세 보증금'});assert.equal(s.result,'NoLoan');s=next(s);assert.equal(s.screen,'11');assert.equal(s.homeState,'OB_NoMD');});
test('YES expands one screen then follows explicit draft result route without calculating approval',()=>{let s=next(selectOwnership({...initial(),screen:'05'},true));assert.equal(s.screen,'06');assert.equal(reveal(s).revealed,1);s=reveal({...s,count:'2'});assert.equal(s.screen,'06');assert.equal(s.revealed,2);s=reveal({...s,principal:'30000000'});assert.equal(s.revealed,3);s=next({...s,monthly:'450000'});assert.equal(s.screen,'07');assert.equal(next(s).screen,'07');for(const count of ['1','99']){const t=next({...s,count,interest:'전월세 보증금'});assert.equal(t.screen,'10');assert.equal(t.result,'HasLoanUnavailable');}});
test('switching ownership clears stale branch values',()=>{const s=selectOwnership({...initial(),ownership:true,count:'2',principal:'3',monthly:'4',interest:'전월세 보증금'},false);assert.equal(s.count,'');assert.equal(s.interest,'');assert.equal(s.result,null);});
test('every result card is onboarding complete: home goes to OB_NoMD Asset, also when opened from the screen selector',()=>{for(const result of ['HasLoan','HasLoanUnavailable','NoLoan'])for(const review of [false,true]){const s=next({...initial(),screen:'10',result,review});assert.equal(s.screen,'11');assert.equal(s.homeState,'OB_NoMD');assert.equal(s.tab,'Asset');}});
test('skip on 05 goes to InOB_NoMD asset home and keeps inputs',()=>{const s=skipOnboarding({...initial(),screen:'05',homeState:'InOB_NoMD',affiliation:'직장인',housing:'전월세 세입자'});assert.equal(s.screen,'11');assert.equal(s.homeState,'InOB_NoMD');assert.equal(s.tab,'Asset');assert.equal(s.affiliation,'직장인');assert.equal(s.housing,'전월세 세입자');});
test('home from 02 consent goes to NoOB_NoMD',()=>{const s=consentHome({...initial(),screen:'02'});assert.equal(s.screen,'11');assert.equal(s.homeState,'NoOB_NoMD');assert.equal(s.tab,'Asset');});
const aiHome={...initial(),screen:'11',homeState:'OB_NoMD',tab:'Loan'};
const confirmDisabled=html=>/data-action="next" disabled>확인/.test(html);
test('AI rate flows Intro → ConsentSheet → Loading → Result',()=>{let s=openAiRate(aiHome);assert.equal(aiRateName(s),'finda_AIRate_Intro');s=next(s);assert.equal(aiRateName(s),'finda_AIRate_ConsentSheet');assert.equal(next(s).screen,'ai-rate-consent');s=next(toggleAiRateConsent(s));assert.equal(aiRateName(s),'finda_AIRate_Loading');s=next(s);assert.equal(s.screen,'ai-rate');assert.equal(aiRateName(s),'finda_AIRate_Result_LowRate');assert.equal(aiRateName({...s,aiSort:'limit'}),'finda_AIRate_Result_HighLimit');});
test('AI rate consent sheet opens unchecked with confirm disabled',()=>{const s=next(openAiRate(aiHome));assert.equal(s.aiConsent,false);assert.equal(canConfirmAiRate(s),false);assert.ok(confirmDisabled(aiRateConsentSheet(s.aiConsent)));assert.match(aiRateConsentSheet(s.aiConsent),/aria-checked="false" data-ai-consent="all"/);});
test('checking AI rate consent enables confirm and all-agree toggles together',()=>{const s=toggleAiRateConsent(next(openAiRate(aiHome)));assert.equal(canConfirmAiRate(s),true);const html=aiRateConsentSheet(s.aiConsent);assert.ok(!confirmDisabled(html));assert.match(html,/aria-checked="true" data-ai-consent="all"/);assert.match(html,/aria-checked="true" data-ai-consent="prediction"/);assert.equal(canConfirmAiRate(toggleAiRateConsent(s)),false);});
test('AI rate back navigation',()=>{const home=s=>{assert.equal(s.screen,'11');assert.equal(s.homeState,'OB_NoMD');assert.equal(s.tab,'Loan');};const intro=openAiRate(aiHome);home(back(intro));const sheet=next(intro);assert.equal(back(sheet).screen,'ai-rate-intro');const loading=next(toggleAiRateConsent(sheet));home(back(loading));home(back(next(loading)));});
test('AI rate loading auto-advances only when entered from the consent sheet',()=>{const loading=next(toggleAiRateConsent(next(openAiRate(aiHome))));assert.equal(shouldAutoAdvanceAiRate(loading),true);const picked=selectScreen(loading,'ai-rate:loading');assert.equal(picked.screen,'ai-rate-loading');assert.equal(shouldAutoAdvanceAiRate(picked),false);assert.equal(shouldAutoAdvanceAiRate(selectScreen(aiHome,'ai-rate:loading')),false);assert.equal(shouldAutoAdvanceAiRate(next(loading)),false);});
test('home state follows onboarding progress: NoOB (never started) → InOB (left midway) → OB (completed)',()=>{
 assert.equal(consentHome({...initial(),screen:'02'}).homeState,'NoOB_NoMD');
 for(const screen of ['05','06','07','08','09'])assert.equal(skipOnboarding({...initial(),screen}).homeState,'InOB_NoMD',screen+' 건너뛰기는 InOB');
 for(const result of ['HasLoan','HasLoanUnavailable','NoLoan'])assert.equal(next({...initial(),screen:'10',result}).homeState,'OB_NoMD',result+' 완료는 OB');
});
test('option screens 03·04·07·09 move on with any selected value, and stay put with none',()=>{
 for(const [screen,key,to,values] of [['03','affiliation','04',['학생·취업준비·무직','직장인','자영업자·사업자·프리랜서','액티브시니어','은퇴정착층']],['04','housing','05',['전월세 세입자','부모·가족과 함께','자가보유','기타']],['07','interest','10',['전월세 보증금','생활·비상자금·목돈 마련','사업자금','기타','없다']],['09','purpose','10',['전월세 보증금','생활·비상자금·목돈 마련','사업자금','기타']]]){
  assert.equal(next({...initial(),screen,[key]:''}).screen,screen,screen+' 선택 없으면 이동 안 함');
  for(const v of values)assert.equal(next({...initial(),screen,[key]:v}).screen,to,screen+' '+v);
 }
});
import {emptyConsent,toggleConsent,canContinueConsent,consentItems,consentScreen} from './consent.js';
test('02 약관동의: 필수 2개 모두 동의해야 다음 활성, 선택 약관은 무관',()=>{
 const empty=emptyConsent();assert.ok(Object.values(empty).every(v=>v===false));
 assert.equal(canContinueConsent(empty),false);assert.equal(next({...initial(),screen:'02',consent:empty}).screen,'02');
 for(const service of [false,true])for(const privacy of [false,true])for(const marketing of [false,true]){
  const consent={service,privacy,marketing},enabled=service&&privacy;
  const label=JSON.stringify(consent);
  assert.equal(canContinueConsent(consent),enabled,label);
  assert.equal(next({...initial(),screen:'02',consent}).screen,enabled?'03':'02',label);
  assert.equal(/data-action="next" disabled/.test(consentScreen(consent)),!enabled,label);
 }
 const all=toggleConsent(empty,'all');assert.ok(consentItems.every(i=>all[i.id]));assert.equal(canContinueConsent(all),true);
 const partial=toggleConsent(all,'marketing');assert.equal(partial.marketing,false);assert.equal(canContinueConsent(partial),true);
 for(const item of consentItems.filter(item=>item.required))assert.equal(canContinueConsent(toggleConsent(all,item.id)),false,item.label+' 해제');
 const none=toggleConsent(all,'all');assert.ok(Object.values(none).every(v=>v===false));assert.equal(canContinueConsent(none),false);
});
test('onboarding back: 06 steps back one field at a time, then to the previous screen',()=>{
 const base={...initial(),ownership:true,count:'2',principal:'100',monthly:'5'};
 const at=(screen,extra={})=>({...base,screen,...extra});
 const monthly=back(at('06',{revealed:3}));
 assert.equal(monthly.screen,'06');assert.equal(monthly.revealed,2);
 assert.equal(monthly.monthly,'5');assert.equal(monthly.principal,'100');
 assert.equal(back(at('06',{revealed:2})).revealed,1);
 assert.equal(back(at('06',{revealed:1})).screen,'05');
 assert.deepEqual([back(at('07',{revealed:3})).screen,back(at('07',{revealed:3})).revealed],['06',3]);
 assert.equal(back(at('08',{ownership:false})).screen,'05');
 assert.equal(back(at('09',{ownership:false})).screen,'08');
});

test("08 '지금은 계획 없음' skips the purpose question and goes to the NoLoan result",()=>{
 let s={...initial(),screen:'08',ownership:false,amount:'3000'};
 s=toggleNoPlan(s,true);
 assert.equal(s.amount,'');
 const after=next(s);
 assert.equal(after.screen,'10');assert.equal(after.result,'NoLoan');
 assert.equal(back(after).screen,'08');
 assert.equal(next(toggleNoPlan(s,false)).screen,'08');
 assert.equal(selectOwnership({...s,ownership:false},true).noPlan,false);
});
