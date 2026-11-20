import {screenSelector,screenKey,selectScreen} from './screen-catalog.js';
import {isTestEntry,createTestNavigation} from './study/entry-navigation.mjs';
import {toBeRoute,toBeState} from './study/tobe-entry.mjs';
import {aiRateName,aiRateIntro,aiRateConsentSheet,aiRateLoading,aiRateScreen,wireAiRate} from './ai-rate.js';
import {quickMenuButton,wireQuickMenuButtons} from './quick-menu-button.js';
import {closeQuickMenu,openQuickMenu} from './quick-menu-dialog.js';
import {popupMode,setQuickMenuProfile,getRecommended,recommendMenus} from './quick-menu-edit.js';
import {showExploreDone,atScrollEnd,EXIT_POINTS,isExitPost,postClickPayload,MY_CHIP,homeViewPayload} from './explore-done.js';
import {existingScreen,existingScreenName,wireExistingScreen} from './existing-screens.js';
import {showTestScopeNotice} from './test-scope-notice.js';
import {cohortCard,cohortView} from './cohort-card.js';
import {openCohortSheet,sourceSheetView,ageSheetView,editSheetView,AGE_AFF} from './cohort-sheet.js';
import {mountStudyControls,isComparisonStudy} from './study/participant.js';
import {homeDesigns} from './home-design.js';
import {applyPrototypeContent} from './prototype-content.js';
import {consentScreen,toggleConsent} from './consent.js';
import {initial,next,back,reveal,selectOwnership,filled,skipOnboarding,consentHome,openMainTab,openExistingDetail,openAiRate,aiRateHome,toggleAiRateConsent,shouldAutoAdvanceAiRate,toggleNoPlan} from './flow.mjs';
import {AFFILIATIONS,HOUSINGS,LOAN_COUNTS,PRESETS} from './post-data.js';
import {recommend,defaultFeed,profileFromAnswers,thumbStyle} from './post-personalization.js';
import {categoryChips,wireChipGroup} from './chip-group.js';
import {bottomBar,applyBottomBar,wireBottomBars} from './bottom-bar.js';
import {sendTestEvent,flushPendingTestEvents} from './test-data.js';
import {draftKey,readDraft,writeDraft,clearDraft,newDraft,saveStep,trackOf,eventPayload,restoreState,exitField} from './onboarding-draft.js';
let state=initial(),bottomBarSelection='home';
let testNavigation=null;
let lastIntroSlide=-1;
let keypadOpen=true,keypadScreen=''; // 06·08 키패드 열림 상태(화면이 바뀌면 다시 열림) // 02 약관 시트는 처음 열릴 때만 올라오는 애니메이션
let homeScroll={Asset:0,Loan:0},existingScroll={point:0,all:0};
const app=document.querySelector('#app'),panel=document.querySelector('#preview');
const isolatedEntry=isTestEntry('tobe');
const participantMode=isolatedEntry||new URLSearchParams(location.search).get('mode')==='test';
const reviewMode=!participantMode&&new URLSearchParams(location.search).get('mode')==='review';
document.body.dataset.mode=participantMode?'test':'review';
document.body.dataset.review=String(reviewMode);
panel.hidden=!reviewMode;
// 온보딩 임시 저장: 참가자 링크는 finda.study.v1, 그 외는 finda.dev.v1 키를 써요.
const DRAFT_KEY=draftKey(participantMode),store=(()=>{try{return localStorage;}catch{return null;}})();
const loadDraft=()=>readDraft(store,DRAFT_KEY);
const ONBOARDING_SCREENS=['03','04','05','06','07','08','09'];
// CTA를 누른 순간에만 저장하고, 정해진 지점에서 Supabase로 보내요. 뒤로 가기·이전은 보내지 않아요.
function commitStep(kind){
 if(!ONBOARDING_SCREENS.includes(state.screen))return;
 const draft=saveStep(loadDraft()||newDraft(),state,kind);
 if(!draft)return;
 if(state.screen==='05')sendTestEvent('onboarding_loan_confirmed',eventPayload(draft,{track:trackOf(draft)}));
 if(state.screen==='07'||state.screen==='09'||(state.screen==='08'&&state.noPlan)){sendTestEvent('onboarding_done',eventPayload(draft,{track:trackOf(draft)}));clearDraft(store,DRAFT_KEY);return;}
 writeDraft(draft,store,DRAFT_KEY);
}
// 화면의 [다음]·[확정]·넘버패드 마지막 [다음]. 실제로 다음 화면으로 넘어갈 때만 저장해요.
function goNext(){const after=next(state);if(after.screen!==state.screen)commitStep('next');
 // 온보딩 시작: 약관(02) [다음]으로 소속(03)에 들어간 순간. 완료율·이탈률의 분모예요.
 if(state.screen==='02'&&after.screen==='03')sendTestEvent('onboarding_start',{});
 state=after;render();}
function skipNow(){
 const draft=loadDraft()||newDraft();
 if(ONBOARDING_SCREENS.includes(state.screen))sendTestEvent('onboarding_skip',eventPayload(draft,{exit_step:state.screen,exit_field:exitField(state.screen,currentField()),resume_step:draft.resume.step,resume_field:draft.resume.field}));
 writeDraft(draft,store,DRAFT_KEY);
 state=skipOnboarding(state);render();
}
function resumeOnboarding(){const restored=restoreState(state,loadDraft()||newDraft());state=restored.state;if(restored.focus)activeField=restored.focus;render(restored.focus);}
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const titles={'00':'Splash_Default','02':'Consent_Default','03':'Affiliation_Default','04':'Housing_Default','05':'LoanOwnership_Default','06':'LoanInfo_HasLoan_'+['Count','TotalPrincipal','MonthlyRepayment'][state.revealed-1],'07':'LoanInterest_HasLoan','08':'DesiredAmount_NoLoan','09':'LoanPurpose_NoLoan'};
const posts=['대환대출, 언제 갈아타야 유리할까?','첫 대출 전 꼭 확인해야 할 3가지','내 신용점수 올리는 습관 5가지'];
const unavailable=['추가 대출 어려운 이유','수익 대비, 대출이 가능한 범위','추가대출에 대한 정부 정책'];
const affiliation=[['학생·취업준비·무직','대학(원)생·취업준비생이거나 지금은 소득이 없어요'],['직장인','연차와 상관없이 회사에 다니고 있어요'],['자영업자·사업자·프리랜서','사업체를 운영하거나 프리랜서로 일하고 있어요'],['액티브시니어','은퇴했지만 지금도 소득이 있어요'],['은퇴정착층','은퇴 후 경제활동을 하지 않고 있어요']];
const housing=[['전월세 세입자','원룸·오피스텔·아파트에서 전세나 월세로 살아요'],['부모·가족과 함께','부모님이나 가족 집에서 함께 살아요'],['자가보유','내 이름으로 된 집이 있어요'],['기타','기숙사·사택 등에서 살고 있어요']];
const purposes=[['전월세 보증금','전세·월세 보증금을 마련하거나 늘리고 싶어요'],['생활·비상자금·목돈 마련','생활비·비상금이나 결혼·이사 같은 목돈이 필요해요'],['사업자금','창업하거나 사업을 운영할 돈이 필요해요'],['기타','위에 없거나 아직 정하지 않았어요']];
function options(items,key,allowed,cls=''){return `<div class="options${cls?' '+cls:''}">${items.map(([title,desc])=>`<button class="option" data-select="${key}" data-value="${esc(title)}" aria-pressed="${state[key]===title}" ><strong>${esc(title)}</strong><small>${esc(desc)}</small></button>`).join('')}</div>`;}
function top(skip=false){return `<div class="top"><button class="back" data-action="back" aria-label="이전 화면">‹</button>${skip?'<button class="skip" data-action="skip">건너뛰기</button>':''}</div>`;}
/* 06~09 헤더(A안): 03과 같은 NavBar(‹ 뒤로 + 건너뛰기) 아래에 단계 표시(N/total + 진행 막대). 건너뛰기는 NavBar에만 둔다. */
function progress(step,total){return `<div class="ob-stephead">${navBar(true)}<div class="ob-step"><strong>${step}/${total}</strong><div class="progress">${Array.from({length:total},(_,i)=>`<span class="${i<step?'done':''}"></span>`).join('')}</div></div></div>`;}
/* Onboarding/NavBar: keep the 52px header and 36px touch target; use the native Figma arrow. */
function navBar(skip=false){return `<div class="cmp-navbar"><button class="cmp-navbar__back" data-action="back" aria-label="이전 화면"><img src="assets/ob05-arrow.svg" alt="" width="8" height="14"></button>${skip?'<button class="skip" data-action="skip">건너뛰기</button>':''}</div>`;}
/* 온보딩 질문 머리(11.17 참고 화면): 타이틀 + 캡션(추가 설명). 타이틀→캡션 8px, 캡션→아래 내용 24px. */function qhead(title,caption){return `<div class="ob-qhead"><h2 class="cmp-qtitle">${title}</h2>${caption?`<p class="ob-caption">${caption}</p>`:''}</div>`;}
const QHEAD={
 '03':['현재의 나와 가장 가까운<br>상황을 선택해주세요','정확히 맞지 않아도 괜찮아요<br>가장 가까운 상황을 골라 주세요'],
 '04':['지금 살고 계신 집은<br>어떤 형태인가요?','주거 형태에 맞는 대출·정책 정보를 준비해 드려요'],
 '05':['현재 대출을<br>가지고 계신가요?','대출이 있든 없든, 지금 상황에 가까운 답을 골라주세요.'],
 count:['대출이 몇 건인가요?','신용대출·담보대출 모두 합쳐서 세면 돼요<br>정확하지 않아도 괜찮아요'],
 principal:[null,'아직 갚지 않고 남은 금액이면 돼요<br>정확하지 않아도 괜찮아요'],
 monthly:['매달 상환하는 총 금액이<br>어떻게 되나요?','원금과 이자를 합친 금액이면 돼요<br>정확하지 않아도 괜찮아요'],
 '07':['더 받고 싶은<br>대출이 있으신가요?','목적에 맞는 정보를 준비해드려요<br>승인·한도와는 무관해요'],
 '08':['얼마 정도가 필요하세요?','희망하는 금액을 입력해주세요<br>입력하신 금액은 실제 승인·한도와 무관해요'],
 '09':['어떤 일로<br>대출을 생각하세요?','목적에 맞는 정보를 준비해드려요<br>승인·한도와는 무관해요'],
};
// 06은 지금 입력 중인 칸에 맞춰 타이틀·캡션이 바뀌어요.
function loanQhead(field){const [t,c]=QHEAD[field];return qhead(field==='principal'?`${esc(state.count)}건의 총 대출 원금 합계가<br>어떻게 되나요?`:t,c);}
function actions(enabled=true,prev=true,label='다음'){return `<div class="actions">${prev?'<button class="secondary" data-action="back">이전</button>':''}<button class="primary" data-action="next" ${enabled?'':'disabled'}>${label}</button></div>`;}
function field(key,label,unit,hint){return `<label class="field"><span>${label}</span><div class="inputrow"><input data-field="${key}" aria-label="${label}" inputmode="numeric" autocomplete="off" value="${esc(state[key])}" placeholder="0"><span>${unit}</span></div><small>${hint}</small></label>`;}
const commas=v=>String(v).replace(/\B(?=(\d{3})+(?!\d))/g,',');
/* cmp_Common_Input (Figma 3839:947). 상태는 CSS가 data 속성으로 구분: data-active=Typing, data-filled=Done, 그 외 Default, data-state="error"=Error. */
// 커스텀 키패드가 값을 갱신한다. 포커스·클릭은 유지하고 OS 키보드 편집만 막는다.
function inputField(key,label,unit,hint,active){const v=state[key];return `<label class="cmp-input" ${active?'data-active':''} data-filled="${filled(v)}"><span class="cmp-input__label">${label}</span><span class="cmp-input__field"><input class="cmp-input__value" data-field="${key}" ${unit==='원'?'data-money':''} aria-label="${label}" inputmode="none" readonly autocomplete="off" value="${esc(unit==='원'?commas(v):v)}" placeholder="0"><span class="cmp-input__unit">${unit}</span></span><small class="cmp-input__caption">${hint}</small></label>`;}
/* 06 화면: 입력을 마치면 새 입력창이 맨 위에 나타나고, 입력한 값(Done)은 아래로 밀려난다(Figma 3845:38299). */
function inputFields(){const defs={count:['대출 건수','건'],principal:['총 대출 원금 합계','원'],monthly:['월 상환액 합계','원']};const active=currentField();return ['count','principal','monthly'].slice(0,state.revealed).reverse().map(k=>inputField(k,defs[k][0],defs[k][1],'',k===active)).join('');}
/* cmp_Common_Keypad (Figma 2638:18273): 퀵 버튼 줄(금액일 때만) + 3×4 숫자 격자 + 다음 버튼(ButtonPair, 이전 없음) + 하단 48px 여백. action은 'enter'(다음 입력창 열기) 또는 'next'(다음 화면). *//* 06·08: 입력창 밖을 누르면 키패드를 내리고 하단에 [다음]만 남겨요. 입력창을 누르면 다시 올라와요. */
function keypadArea(money,action,enabled){return keypadOpen?keypad(money,action,enabled):`<div class="cmp-keypad-cta"><div class="actions cmp-keypad__action"><button class="primary" data-action="${action}" ${enabled?'':'disabled'}>다음</button></div></div>`;}
function keypadDismissArea(){return keypadOpen&&!(state.screen==='08'&&state.noPlan)?'<button type="button" class="cmp-keypad-dismiss" data-keypad-dismiss aria-label="키패드 닫기"></button>':'';}
function keypadQuick(money=true){
 if(!money||currentField()==='count')return '';
 const amounts=currentField()==='monthly'?[[10000000,'+1000만'],[1000000,'+100만'],[500000,'+50만'],[100000,'+10만']]:[[100000000,'+1억'],[10000000,'+1000만'],[5000000,'+500만'],[1000000,'+100만']];
 return `<div class="cmp-keypad__quick">${amounts.map(([value,label])=>`<button type="button" class="cmp-keypad__chip" data-add="${value}">${label}</button>`).join('')}</div>`;
}
function keypad(money=true,action='enter',enabled=true){const quick=keypadQuick(money);const keys=['1','2','3','4','5','6','7','8','9','00','0'].map(n=>`<button type="button" class="cmp-keypad__key" data-key="${n}"><span>${n}</span></button>`).join('')+`<button type="button" class="cmp-keypad__key" data-key="delete" aria-label="한 자리 지우기"><img src="assets/ic-keypad-delete.svg" alt=""></button>`;return `<div class="cmp-keypad">${quick}<div class="cmp-keypad__body"><div class="cmp-keypad__keys">${keys}</div><div class="actions cmp-keypad__action"><button class="primary" data-action="${action}" ${enabled?'':'disabled'}>다음</button></div></div></div>`;}/* 지금 입력창이 채워졌는지 → 넘버패드의 다음 버튼 활성 여부 */function keypadReady(){if(state.screen==='08')return filled(state.amount);if(state.revealed===3)return [state.count,state.principal,state.monthly].every(filled);return filled(state[['count','principal','monthly'][state.revealed-1]]);}/* 08 희망 금액 (Figma 4631:23506 기본 / 4631:23507 '지금은 계획 없음' 선택). 체크는 cmp_Common_CheckCircle(4631:23500), 약관과 같은 에셋. *//* cmp_Common_Toast/Alert (Figma 4634:23961): '지금은 계획 없음'을 고른 순간 잠깐 띄워요. [다음] 버튼 위 12px, 2.5초. */let noPlanToastTimer=0;function showNoPlanToast(){clearTimeout(noPlanToastTimer);app.querySelector(':scope > .no-plan-toast')?.remove();const t=document.createElement('div');t.className='no-plan-toast';t.setAttribute('role','status');t.setAttribute('aria-live','polite');t.innerHTML='<span class="no-plan-toast__icon" aria-hidden="true"><img src="assets/ic-common-check-circle-on.svg" alt=""></span><p>대출을 희망하지 않으시군요<br>지금 상황에 맞는 정보부터 보여 드릴게요</p>';app.append(t);noPlanToastTimer=setTimeout(()=>t.remove(),2500);}
function desiredAmountScreen(){const off=state.noPlan;const check=`<label class="no-plan-check"><input type="checkbox" data-no-plan ${off?'checked':''}><span class="no-plan-check__icon" data-check-state="${off?'on':'off'}" aria-hidden="true"><img class="no-plan-check__img--${off?'on':'off'}" src="assets/no-plan-check-${off?'on':'off'}.svg" alt=""></span><span class="no-plan-check__label">지금은 계획 없음</span></label>`;const input=off?`<div class="cmp-input" data-disabled><span class="cmp-input__label">대출 희망 금액</span><span class="cmp-input__field"><input class="cmp-input__value" aria-label="대출 희망 금액" value="" disabled><span class="cmp-input__unit">원</span></span></div>`:inputField('amount','대출 희망 금액','원','',true);return `<div class="screen cmp-keypad-screen no-plan-screen">${keypadDismissArea()}<div class="cmp-keypad-screen__scroll">${off?progress(1,1):progress(1,2)}${qhead(...QHEAD['08'])}<div class="no-plan-wrap">${input}${check}</div></div>${off?actions(true,false):keypadArea(true,'enter',keypadReady())}</div>`;}function renderPosts(items){return `<div class="posts">${items.map(t=>`<div class="post"><span>${t}</span><span aria-hidden="true">›</span></div>`).join('')}</div>`;}
function home(){if(state.homeState==='OB_MD')return '<div class="blank" aria-label="온보딩 완료·데이터 연결 완료"></div>';// 온보딩 전(NoOB)과 중간에 나간(InOB) 홈은 같은 Figma 디자인을 써요(11.18).
if(state.homeState==='NoOB_NoMD'||state.homeState==='InOB_NoMD'||state.homeState==='OB_NoMD'){const design=homeDesigns[(state.homeState==='OB_NoMD'?'OB_':'')+state.tab];return `<div class="figma-home-shell"><div class="figma-home-viewport"><div class="figma-home-canvas" style="height:${design.height}px">${design.html}</div></div></div>`;}const done=state.homeState.startsWith('OB_');return `<div class="screen home"><header><img src="assets/00623.svg" alt="finda"><div class="home-nav-icons">${quickMenuButton()}<img src="assets/0d970.svg" alt="보안"><img src="assets/7faef.svg" alt="알림"></div></header><div role="tablist" class="tabs"><button role="tab" data-tab="Asset" aria-selected="${state.tab==='Asset'}">MY금융</button><button role="tab" data-tab="Loan" aria-selected="${state.tab==='Loan'}">핀다대출</button></div>${state.tab==='Asset'?homeBannerHTML():''}${state.tab==='Asset'?`<section><h3>상환일정</h3><div class="card"><div class="calendar">${['일','월','화','수','목','금','토'].map(d=>`<span>${d}<br>00</span>`).join('')}</div><p class="tiny">마이데이터를 연동하고 상환일정을 관리해요　›</p></div></section><section><h3>신용점수 확인하기</h3><div class="card"><div class="scores"><div class="score">KCB<br>???점</div><div class="score">NICE<br>???점</div></div><button class="wide" disabled title="연결 절차 미정">신용점수 올리기</button></div></section>`:`<section><h3>내 대출</h3><div class="card loan-card"><p>총 대출 원금 합계</p><strong>${done&&state.ownership&&state.principal?Number(state.principal).toLocaleString()+'원':'—'}</strong><p class="sub">${done&&state.ownership&&state.monthly?'월 상환액 '+Number(state.monthly).toLocaleString()+'원':''}</p><button class="wide" disabled title="기존 화면 미구현">내 예상 금리 더 정확하게 보기</button></div></section>`}<section><h3>회원님께는 아래의 정보가 유용해보여요</h3><div class="card">${renderPosts(state.result==='HasLoanUnavailable'?unavailable:posts)}</div></section><section><h3>내 자산을 한눈에 보고싶다면?</h3><div class="card amounts"><p>7월 카드 사용금액　**** 원</p><p>입출금·예적금 잔액　**** 원</p><button class="wide" disabled title="MyData 연결 절차 미정">연결하기</button></div></section>${bottomBar(bottomBarSelection)}</div>`;}
// scr_05 — Figma 4760:32076. Existing data-own actions keep the ownership branches.
function loanOwnershipScreen(){
 const benefits=[
  ['ob05-grid.svg','맞춤 퀵메뉴','자주 쓸 메뉴 6개를 홈 맨 위에 골라 둬요'],
  ['ob05-post.svg','맞춤 포스트','관심 있을 주제의 글부터 먼저 보여드려요'],
  ['ob05-users.svg','비슷한 분들의 통계','같은 상황인 분들의 대출·자산을 보여드려요'],
 ];
 return `<div class="screen ob05">${navBar(true)}${qhead(...QHEAD['05'])}<section class="ob05-card" aria-label="알려주시면 바뀌는 것"><h3>알려주실수록,<br><span>홈을 회원님께 맞춰드려요</span></h3><ul>${benefits.map(([icon,title,caption])=>`<li><i aria-hidden="true"><img src="assets/${icon}" alt=""></i><span><b>${title}</b><small>${caption}</small></span></li>`).join('')}</ul></section><div class="ob05-notice"><span class="ob05-notice__icon" aria-hidden="true"><img src="assets/ob05-notice.svg" alt=""></span><p>지금은 대략의 방향만 잡아드려요.<br>정확한 금리·조건은 나중에 대출·대환비교를<br>연동하면 확인할 수 있어요.</p></div><div class="actions ob05-pair">${[true,false].map(value=>`<button class="secondary" data-own="${value}" aria-pressed="${state.ownership===value}">${value?'있어요':'없어요'}</button>`).join('')}</div></div>`;
}

function onboardingResultScreen(){
 const title=state.result==='NoLoan'?'현재 보증금을 준비하고<br>계시는군요':'대출을 갚아나가고 계시는군요';
 const items=state.result==='HasLoanUnavailable'?unavailable:posts;
 return `<div class="screen result onboarding-result"><div class="onboarding-result__body">${navBar(false)}<section class="onboarding-result__intro"><div class="onboarding-result__celebration" aria-hidden="true"><img src="assets/result-4682-75b1a.svg" alt=""></div><h2>테스터님, 환영해요</h2><div class="onboarding-result__caption"><p class="onboarding-result__status">${title.replaceAll('<br>',' ')}</p><p class="onboarding-result__help">도움이 될 정보를 홈에서 모아 보여드릴게요</p></div></section><aside class="onboarding-result__notice"><span aria-hidden="true"><img src="assets/result-4682-7b749.svg" alt=""></span><p>대출·대환비교에서 연동하면<br>내 조건에 맞는 대출을 정확히 볼 수 있어요</p></aside><section class="onboarding-result__card"><div class="onboarding-result__card-heading"><h3>회원님께는 아래의 정보가 유용해보여요</h3><p>＊해당 콘텐츠는 홈 화면에서도 확인할 수 있어요</p></div><div class="onboarding-result__benefits">${items.map((text,index)=>`<div class="onboarding-result__benefit"><span class="onboarding-result__benefit-icon ${index===0?'is-primary':''}" aria-hidden="true"><img src="assets/result-4682-${index===0?'f2201':'9b884'}.svg" alt=""></span><p>${esc(text)}</p><span class="onboarding-result__arrow" aria-hidden="true"><img src="assets/result-4682-22d74.svg" alt=""></span></div>`).join('')}</div></section></div>${actions(true,false,'홈으로 가기')}</div>`;
}

function screen(){if(existingScreenName(state.screen))return existingScreen(state.screen);switch(state.screen){case 'ai-rate-intro':return aiRateIntro();case 'ai-rate-consent':return aiRateConsentSheet(state.aiConsent);case 'ai-rate-loading':return aiRateLoading();case 'ai-rate':return aiRateScreen(state.aiSort);case '00':return '<div class="screen splash"><img src="assets/a4009.svg" alt="finda"></div>';case '02':{const slide=state.introSlide||0,enter=lastIntroSlide!==slide;lastIntroSlide=slide;return consentScreen(state.consent,slide,enter);}case '03':return `<div class="screen cmp-ob-screen">${navBar(true)}${qhead(...QHEAD['03'])}${options(affiliation,'affiliation','직장인','options--md')}${actions(!!state.affiliation)}</div>`;case '04':return `<div class="screen cmp-ob-screen">${navBar(true)}${qhead(...QHEAD['04'])}${options(housing,'housing','전월세 세입자','options--md')}${actions(!!state.housing)}</div>`;case '05':return loanOwnershipScreen();case '06':return `<div class="screen cmp-keypad-screen">${keypadDismissArea()}<div class="cmp-keypad-screen__scroll">${progress(state.revealed,4)}${loanQhead(currentField())}<div class="fields cmp-input-list">${inputFields()}</div></div>${keypadArea(state.revealed>1,state.revealed===3?'next':'enter',keypadReady())}</div>`;case '07':case '09':return `<div class="screen">${progress(state.screen==='07'?4:2,state.screen==='07'?4:2)}${qhead(...QHEAD[state.screen])}${options(state.screen==='07'?[...purposes,['없다','기타 혹은 아직 잘 모르겠어요']]:purposes,state.screen==='07'?'interest':'purpose','전월세 보증금')}${actions(!!(state.screen==='07'?state.interest:state.purpose),false)}</div>`;case '08':return desiredAmountScreen();case '10':return onboardingResultScreen();case '11':return home();}}
function name(){if(existingScreenName(state.screen))return existingScreenName(state.screen);if(state.screen.startsWith('ai-rate'))return aiRateName(state);if(state.screen==='11')return `scr_11_Home_${state.tab}_${state.homeState}`;if(state.screen==='10')return `scr_10_Onboarding_Result_${state.result}`;return `scr_${state.screen}_Onboarding_${state.screen==='06'?'LoanInfo_HasLoan_'+['Count','TotalPrincipal','MonthlyRepayment'][state.revealed-1]:titles[state.screen]}`;}
// 포스트 개인화 V4.0: 온보딩한 홈(OB)만. 미리보기 패널에서 고른 값이 있으면 그 값, 없으면 온보딩 답.
const postProfile=()=>state.postProfile||profileFromAnswers(state);
function postControls(){if(state.screen!=='11'||state.homeState!=='OB_NoMD')return '';const p=postProfile();const select=(key,label,list)=>`<label for="post-${key}">${label}</label><select id="post-${key}" data-post="${key}">${list.map((v,i)=>`<option value="${i}" ${p[key]===i?'selected':''}>${esc(v)}</option>`).join('')}</select>`;return `<label>포스트 개인화 V4.0 · 프리셋</label><div>${PRESETS.map(([n,a,h,c],i)=>`<button data-post-preset="${i}" aria-pressed="${p.a===a&&p.h===h&&p.n===c}">${esc(n)}</button>`).join('')}</div>${select('a','소속',AFFILIATIONS)}${select('h','주거',HOUSINGS)}${select('n','대출 건수',LOAN_COUNTS)}`;}
function navigateMainTab(tab,{attendance=false}={}){
 const current=state.screen==='11'?'home':state.screen;
 const scroller=app.querySelector(current==='home'?'.figma-home-viewport':'.existing-finda-scroll');
 if(current===tab){if(scroller)scroller.scrollTop=0;}else{
  if(scroller){if(current==='home')homeScroll[state.tab]=scroller.scrollTop;else if(current in existingScroll)existingScroll[current]=scroller.scrollTop;}
  state=openMainTab(state,tab);render();
 }
 app.querySelector(attendance?'[data-name="cmp_Point_Button"]':`[data-bottom-nav="${tab}"]`)?.focus({preventScroll:true});
}
function openExistingMenu(screen){
 const scroller=app.querySelector(state.screen==='11'?'.figma-home-viewport':'.existing-finda-scroll');
 if(scroller){if(state.screen==='11')homeScroll[state.tab]=scroller.scrollTop;else if(state.screen in existingScroll)existingScroll[state.screen]=scroller.scrollTop;}
 state=openExistingDetail(state,screen);render();
 app.querySelector('.existing-finda-detail-scroll,.asis-refinance')?.focus({preventScroll:true});
}
function backExistingMenu(){
 if(!['find-loan','refinance'].includes(state.screen)){navigateMainTab('home');return;}
 const refinance=state.screen==='refinance';
 state=back(state);render();
 const returnSelector=state.screen==='11'?`.figma-home-shell [aria-label="${refinance?'대환하기':'대출받기'}"]`:`[data-name="cmp_All_MenuRow"][aria-label="${refinance?'대출 갈아타기':'대출 받기'}"]`;
 app.querySelector(returnSelector)?.focus({preventScroll:true});
}
let splashTimer,aiRateTimer;
function render(focus){if(state.screen!==keypadScreen){keypadScreen=state.screen;keypadOpen=true;}
 if(['11','point','all'].includes(state.screen))bottomBarSelection=state.screen==='11'?'home':state.screen;
 closeQuickMenu(app);
 clearTimeout(splashTimer);clearTimeout(aiRateTimer);
 if(shouldAutoAdvanceAiRate(state))aiRateTimer=setTimeout(()=>{if(shouldAutoAdvanceAiRate(state)){state=next(state);render();}},2000);
 const introScroll=app.querySelector('.ai-rate-intro .ai-rate-scroll')?.scrollTop;
 if(state.screen==='00')splashTimer=setTimeout(()=>{if(state.screen==='00'){state=loadDraft()?{...state,screen:'11',homeState:'InOB_NoMD',tab:'Asset'}:next(state);render();}},1500); // 건너뛴 온보딩이 있으면 홈의 '이어서 입력하기'로 시작
 app.innerHTML=screen();app.dataset.screen=name();wireHomeDesign();wireExistingScreen(app,{screen:state.screen,onNavigate:navigateMainTab,onOpen:openExistingMenu,onBack:backExistingMenu,scrollTop:existingScroll[state.screen]||0});wireBottomBars(app,navigateMainTab);setQuickMenuProfile(postProfile());app.dataset.quickMenu=popupMode(state.homeState);app.dataset.homeState=state.screen==='11'?state.homeState:'';wireQuickMenuButtons(app);wireAiRate(app,sort=>{state={...state,aiSort:sort};syncPreviewName();});
 applyPrototypeContent(app,state.screen);
 const homeViewport=app.querySelector('.figma-home-viewport');if(homeViewport)homeViewport.scrollTop=homeScroll[state.tab]||0;
 if(introScroll){const scroller=app.querySelector('.ai-rate-intro .ai-rate-scroll');if(scroller)scroller.scrollTop=introScroll;}
 if(reviewMode){
 const afterNext=next(state),canNext=afterNext.screen!==state.screen||afterNext.introSlide!==state.introSlide; // 02 소개 장 넘김도 '다음'
 const selected=state.screen==='10'?'result:'+state.result:state.screen==='11'?'home:'+state.homeState:'';
 panel.innerHTML=`<code>${name()}</code><label for="state-review">상태선택</label><select id="state-review"><option value="">상태선택</option><optgroup label="결과">${['HasLoan','HasLoanUnavailable','NoLoan'].map(v=>'<option value="result:'+v+'" '+(selected==='result:'+v?'selected':'')+'>'+v+'</option>').join('')}</optgroup><optgroup label="홈">${['NoOB_NoMD','InOB_NoMD','OB_NoMD','OB_MD'].map(v=>'<option value="home:'+v+'" '+(selected==='home:'+v?'selected':'')+'>'+v+'</option>').join('')}</optgroup></select>${screenSelector(state)}<div class="preview-navigation"><button data-preview="back" ${(state.screen==='00'||(state.screen==='11'&&state.homeState!=='OB_MD'))?'disabled':''}>이전</button><button data-preview="continue" ${canNext?'':'disabled'}>다음</button></div><div><button data-preview="reset">처음부터</button></div>${postControls()}`;
 }
 if(focus)app.querySelector(`[data-field="${focus}"]`)?.focus();
 testNavigation?.record(state);
}

let activeField='count';
function currentField(){if(state.screen==='08')return 'amount';const visible=['count','principal','monthly'].slice(0,state.revealed);return visible.includes(activeField)?activeField:visible.at(-1);}
function enter(){if(state.screen==='06'){const before=state.revealed;state=reveal(state);if(state.revealed>before){activeField=['count','principal','monthly'][state.revealed-1];commitStep('reveal');}render(activeField);}else if(state.screen==='08'){goNext();}}
function hideKeypad(){if(!keypadOpen||!['06','08'].includes(state.screen)||state.noPlan&&state.screen==='08')return;keypadOpen=false;render();}
app.addEventListener('click',e=>{
 if(state.screen!=='06'&&state.screen!=='08')return;
 const field=e.target.closest('[data-field],.cmp-input');
 if(field&&!keypadOpen&&!(state.screen==='08'&&state.noPlan)){keypadOpen=true;const key=field.querySelector?.('[data-field]')?.dataset.field||field.dataset.field;if(key)activeField=key;render(key||currentField());return;}
 if(e.target.closest('[data-keypad-dismiss]')||!field&&!e.target.closest('.cmp-keypad,.cmp-keypad-cta,button,label,input,a'))hideKeypad();
});
document.addEventListener('click',e=>{const path=e.composedPath();if(!path.includes(app)&&!path.includes(panel))hideKeypad();});
document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b||b.disabled)return;if(b.dataset.action==='ai-rate-back'){state=aiRateHome(state);render();}else if(b.dataset.action==='ai-rate-close'){closeAiRateSheet();}else if(b.dataset.aiConsent){state=toggleAiRateConsent(state);render();app.querySelector('[data-ai-consent="'+b.dataset.aiConsent+'"]')?.focus();}else if(state.screen==='ai-rate-intro'&&b.dataset.action==='next'){state=next(state);render();app.querySelector('[data-ai-consent="all"]')?.focus();}else if(b.dataset.action==='skip'){skipNow();}else if(b.dataset.action==='resume'){resumeOnboarding();}else if(b.dataset.action==='consent-home'){state=consentHome(state);render();}else if(b.dataset.select){state={...state,[b.dataset.select]:state[b.dataset.select]===b.dataset.value?'':b.dataset.value};render();}else if(b.dataset.own){state=selectOwnership(state,b.dataset.own==='true');goNext();}else if(b.dataset.tab){state.tab=b.dataset.tab;render();}else if(b.dataset.action==='enter'){enter();}else if(b.dataset.action==='next'){goNext();}else if(b.dataset.action==='back'||b.dataset.preview==='back'){if(existingScreenName(state.screen))backExistingMenu();else{const before=state;state=back(state);if(before.screen==='06'&&state.screen==='06'){activeField=['count','principal','monthly'][state.revealed-1];render(activeField);}else render();}}else if(b.dataset.postPreset){const [,a,h,n]=PRESETS[b.dataset.postPreset];state={...state,postProfile:{a,h,n}};render();}else if(b.dataset.preview==='reset'){homeScroll={Asset:0,Loan:0};existingScroll={point:0,all:0};bottomBarSelection='home';clearDraft(store,DRAFT_KEY);state={...initial(),draftResultIndex:state.draftResultIndex};activeField='count';render();}else if(b.dataset.preview==='continue'){goNext();}else if(b.dataset.preview==='start'){state.screen='02';render();}else if(b.dataset.action==='start'){clearDraft(store,DRAFT_KEY);state.screen='02';state.review=false;render();}else if(b.dataset.result){state={...state,screen:'10',result:b.dataset.result,review:false};render();}else if(b.dataset.key||b.dataset.add){const key=currentField();let v=state[key];if(b.dataset.add)v=(BigInt(v||'0')+BigInt(b.dataset.add)).toString();else v=b.dataset.key==='delete'?v.slice(0,-1):(v+b.dataset.key).replace(/^0+(?=\d)/,'');state[key]=v;render(key);}});
app.addEventListener('focusin',e=>{if(!e.target.dataset.field)return;activeField=e.target.dataset.field;if(!keypadOpen&&['06','08'].includes(state.screen)&&!e.target.disabled){keypadOpen=true;render(activeField);return;}const keypadRoot=app.querySelector('.cmp-keypad');if(keypadRoot){keypadRoot.querySelector('.cmp-keypad__quick')?.remove();keypadRoot.insertAdjacentHTML('afterbegin',keypadQuick());}if(state.screen==='06'){const head=app.querySelector('.ob-qhead');if(head)head.outerHTML=loanQhead(activeField);}app.querySelectorAll('.cmp-input').forEach(el=>{el.toggleAttribute('data-active',el.contains(e.target));el.dataset.filled=String(/\d/.test(el.querySelector('input').value));});});
app.addEventListener('input',e=>{if(!e.target.dataset.field)return;const v=e.target.value.replace(/\D/g,'');state[e.target.dataset.field]=v;e.target.value=e.target.hasAttribute('data-money')?commas(v):v;const kb=app.querySelector('.cmp-keypad .primary');if(kb)kb.disabled=!keypadReady();});
app.addEventListener('keydown',e=>{if(e.key==='Escape'&&keypadOpen&&['06','08'].includes(state.screen)){e.preventDefault();hideKeypad();return;}if(e.key==='Enter'&&e.target.dataset.field){e.preventDefault();enter();}});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&state.screen==='ai-rate-consent'){e.preventDefault();closeAiRateSheet();}});
function closeAiRateSheet(){state=back(state);render();app.querySelector('.ai-rate-intro .ai-rate-footer .primary')?.focus();}
function syncPreviewName(){app.dataset.screen=name();const frame=panel.querySelector('code');if(frame)frame.textContent=name();const selector=panel.querySelector('#screen-review');if(selector)selector.value=screenKey(state);}
panel.addEventListener('change',e=>{if(e.target.dataset.post){state={...state,postProfile:{...postProfile(),[e.target.dataset.post]:Number(e.target.value)}};render();panel.querySelector('#post-'+e.target.dataset.post)?.focus();}});
panel.addEventListener('change',e=>{if(e.target.id==='state-review'&&e.target.value){const [kind,value]=e.target.value.split(':');state=kind==='home'?{...state,screen:'11',homeState:value,tab:'Asset',review:true}:{...state,screen:'10',result:value,review:!(state.screen==='07'&&state.interest)};render();}});
app.addEventListener('change',e=>{if(e.target.hasAttribute('data-no-plan')){state=toggleNoPlan(state,e.target.checked);render(state.noPlan?null:'amount');if(state.noPlan)showNoPlanToast();else app.querySelector(':scope > .no-plan-toast')?.remove();app.querySelector('[data-no-plan]')?.focus();return;}if(e.target.dataset.consent){state={...state,consent:toggleConsent(state.consent,e.target.dataset.consent)};render();app.querySelector('[data-consent="'+e.target.dataset.consent+'"]')?.focus();}});

// cmp_Home_Banner(Figma 3172:19812, "OOO님, 대출이 있는데 안보이나요?")는 모든 홈의 MY금융 탭에서만 내용 맨 위에 보여요(11.18).
// 원본은 온보딩 전 핀다대출 탭 디자인에 들어 있어서, 거기서 한 번 꺼내 MY금융 디자인 맨 앞에 넣고 핀다대출 탭에서는 빼요.
const HOME_BANNER_ID='3172:19812',HOME_BANNER_SPACE=281+32; // 배너 높이 281 + 목록 간격 32
const HOME_ASSET_COLUMNS='[data-node-id="3172:19610"],[data-node-id="3172:21240"]'; // MY금융 내용 목록(온보딩 전 / 후)
let homeBannerCache=null;
function homeBannerHTML(){if(homeBannerCache===null){const t=document.createElement('template');t.innerHTML=homeDesigns.Loan.html;homeBannerCache=t.content.querySelector(`[data-node-id="${HOME_BANNER_ID}"]`)?.outerHTML||'';}return homeBannerCache;}
function placeHomeBanner(shell){
 const canvas=shell.querySelector('.figma-home-canvas'),banner=shell.querySelector(`[data-node-id="${HOME_BANNER_ID}"]`);
 const resize=d=>{if(canvas)canvas.style.height=(parseFloat(canvas.style.height)+d)+'px';};
 if(state.tab!=='Asset'){if(banner){banner.remove();resize(-HOME_BANNER_SPACE);}return;}
 const column=shell.querySelector(HOME_ASSET_COLUMNS);
 if(!banner&&column){column.insertAdjacentHTML('afterbegin',homeBannerHTML());resize(HOME_BANNER_SPACE);}
}
// 홈 맨 위의 질문 영역은 모든 홈에서 빼요(11.18).
// MY금융: Title Section·정보 입력 버튼(온보딩 전) / Title Section(온보딩 후). 핀다대출(온보딩 후): 타이틀·CohortPreview·AI 금리 버튼.
const HOME_TITLE_BLOCKS={Asset:['3172:19611','3172:19621','3172:21241'],Loan:['3172:21106','3172:21111','3172:21117']};
function stripHomeTitle(shell){
 const canvas=shell.querySelector('.figma-home-canvas');let removed=0;
 for(const id of HOME_TITLE_BLOCKS[state.tab]||[]){const el=shell.querySelector(`[data-node-id="${id}"]`);if(!el)continue;const gap=parseFloat(getComputedStyle(el.parentElement).rowGap)||0;removed+=el.offsetHeight+gap;el.remove();}
 if(canvas&&removed)canvas.style.height=(parseFloat(canvas.style.height)-removed)+'px';
}
// 코호트 프리뷰 v6(cohort-card.js): 모든 홈의 핀다대출 탭 맨 위. 온보딩 전 = ①, 중간 이탈 = 임시 저장 위치별, 완료 = 답 기준.
function cohortInput(){
 if(state.homeState==='NoOB_NoMD')return {stage:'none'};
 if(state.homeState==='InOB_NoMD'){const d=loadDraft();return {stage:'draft',answers:d?.answers||{},resumeStep:d?.resume?.step};}
 const p=postProfile();
 return {stage:'done',age:state.cohortAge,answers:{affiliation:state.affiliation||AFFILIATIONS[p.a],housing:state.housing||HOUSINGS[p.h],has_loan:state.ownership??p.n>0,loan_count:state.count||(p.n===2?3:1),extra_loan:state.interest,loan_purpose:state.purpose,no_loan_plan:state.noPlan,desired_amount:state.amount}};
}
function placeCohortCard(shell){
 if(state.tab!=='Loan')return;
 const anchor=shell.querySelector('[data-node-id="3172:21110"]'),column=shell.querySelector('[data-node-id="3172:19811"]');
 const holder=document.createElement('div');holder.innerHTML=cohortView(cohortCard(cohortInput()));const card=holder.firstElementChild;
 if(anchor)anchor.before(card);else if(column)column.prepend(card);else return;
 const canvas=shell.querySelector('.figma-home-canvas');const gap=parseFloat(getComputedStyle(card.parentElement).rowGap)||0;
 if(canvas)canvas.style.height=(parseFloat(canvas.style.height)+card.offsetHeight+gap)+'px';
 card.addEventListener('click',e=>{const b=e.target.closest('[data-cohort]');if(!b)return;const k=b.dataset.cohort;
  if(k==='start'){state.screen='02';state.review=false;render();}
  else if(k==='resume'||k==='loanInfo')resumeOnboarding();
  else if(k==='rate'){state=openAiRate(state);render();}
  else if(k==='info')openCohortSheet(app,sourceSheetView(cohortCard(cohortInput()),b.dataset.num),{trigger:b});
  else if(k==='age')openAgeSheet(b);
  else if(k==='edit')openEditSheet(b);
  else showTestScopeNotice(app);});
}
// 코호트 바텀시트(cohort-sheet.js). 시트를 닫을 때 홈을 다시 그려 카드에 바뀐 값을 반영해요(스크롤 위치는 그대로).
function rerenderHome(){const v=app.querySelector('.figma-home-viewport');if(v)homeScroll[state.tab]=v.scrollTop;render();}
function openAgeSheet(trigger){
 openCohortSheet(app,ageSheetView(state.cohortAge||''),{trigger,onClose:rerenderHome,onAction:(b,api)=>{if(b.dataset.cs!=='age')return;state={...state,cohortAge:b.dataset.value};api.close();}});
}
function editAnswers(){const {answers:a}=cohortInput();return {...a,principal:state.principal,monthly:state.monthly,age:state.cohortAge||''};}
function openEditSheet(trigger){
 let open=null;
 const view=()=>editSheetView(editAnswers(),open);
 const sheet=openCohortSheet(app,view(),{trigger,onAction:b=>handlers[b.dataset.cs]?.(b),onClose:rerenderHome});
 const redraw=focus=>sheet.show(view(),{focus});
 // 소속·주거·대출 모두 칩을 누르는 즉시 저장하고 펼친 상태는 유지해요(줄을 다시 눌러 닫음). 온보딩 화면으로는 보내지 않아요.
 const handlers={
  row(b){const r=b.dataset.row;if(r==='age'){handlers.age=x=>{state={...state,cohortAge:x.dataset.value};open=null;redraw('[data-row="age"]');};sheet.show(ageSheetView(state.cohortAge||''),{focus:'[aria-checked="true"]'});return;}open=open===r?null:r;redraw(`[data-row="${r}"]`);},
  pick(b){const r=b.dataset.row,v=b.dataset.value,pp=state.postProfile;
   if(r==='aff'){const i=AFFILIATIONS.indexOf(v);state={...state,affiliation:v,postProfile:pp?{...pp,a:i}:null,cohortAge:AGE_AFF.includes(v)?state.cohortAge:''};}
   else if(r==='house'){const i=HOUSINGS.indexOf(v);state={...state,housing:v,postProfile:pp?{...pp,h:i}:null};}
   else if(r==='loan'){const has=v==='있음';if(has!==editAnswers().has_loan)state={...selectOwnership(state,has),postProfile:pp?{...pp,n:has?(pp.n||1):0}:null};}
   redraw(`[data-cs="pick"][data-row="${r}"][aria-pressed="true"]`);},
 };
}
function wireHomeDesign(){
 // 간단한 HTML 홈(InOB 등)의 배너 버튼도 테스트 범위 안내로 연결해요.
 for(const button of app.querySelectorAll('.screen.home .home-anonymous-banner button'))button.addEventListener('click',()=>showTestScopeNotice(app));
 const shell=app.querySelector('.figma-home-shell');if(!shell)return;
 stripHomeTitle(shell);placeHomeBanner(shell);placeCohortCard(shell);
 const starSlot=shell.querySelector('[data-name="material-symbols:star"]')?.parentElement;
 if(starSlot)starSlot.innerHTML=quickMenuButton();
 const makeButton=(element,label,action)=>{if(!element)return;element.setAttribute('role','button');element.setAttribute('tabindex','0');element.setAttribute('aria-label',label);element.classList.add('home-design-action');element.addEventListener('click',action);element.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();action();}});};
 const pick=id=>shell.querySelector('[data-node-id="'+id+'"]');
 // Figma 3663:26780 / cmp_card_loans 4562:15557의 대출받기 카드.
 const loanCard=shell.querySelector('[data-name="ic_home_loan_money"]')?.closest('[data-name="PrimaryButton"]');
 makeButton(loanCard,'대출받기',()=>openExistingMenu('find-loan'));
 const refinanceCard=shell.querySelector('[data-name="ic_home_loan_refinance"]')?.closest('[data-name="PrimaryButton"],[data-name="menu2"]');
 makeButton(refinanceCard,'대환하기',()=>openExistingMenu('refinance'));
 makeButton(pick('3172:21117'),'내 예상 금리 더 정확하게 보기',()=>{state=openAiRate(state);render();});
 makeButton(pick('3172:19621'),'정보 입력하기',()=>{state.screen='02';state.review=false;render();});
 const tabRoot=shell.querySelector('[data-name="Home:tab"], [data-node-id="2393:5554"], [data-node-id="2393:5555"]');
 if(tabRoot){for(const el of tabRoot.children){const tab=el.textContent.includes('MY금융')?'Asset':'Loan';el.setAttribute('role','tab');el.setAttribute('aria-selected',String(state.tab===tab));makeButton(el,tab==='Asset'?'MY금융':'핀다대출',()=>{state.tab=tab;render();});el.setAttribute('role','tab');}tabRoot.setAttribute('role','tablist');}

 const nestedTabs=pick('3172:21104');
 if(nestedTabs){const spacer=document.createElement('div');spacer.style.height='60px';spacer.style.flexShrink='0';nestedTabs.replaceWith(spacer);nestedTabs.classList.add('home-ob-loan-tabs');shell.append(nestedTabs);}
 const root=shell.querySelector('.figma-home-canvas').firstElementChild;
 for(const child of [...root.children]){const id=child.dataset.nodeId;if(id==='2303:701'){applyBottomBar(child,bottomBarSelection);child.classList.add('home-pinned-bottom');shell.append(child);}if(id==='1991:4029'||id==='3172:19808'||id==='3172:19933'||id==='3172:21425'||id==='3288:16052'){child.classList.add('home-pinned-top');shell.append(child);}}
 if(state.homeState==='OB_NoMD'){
  const postCard=shell.querySelector('[data-name="PostCard"]');
  wirePostCard(postCard,makeButton,{onPost:onObPost});
  // MY 클릭률 분모: MY 3칸이 보이는 개인화 홈에 처음 들어온 순간 한 번 보내요.
  // 퀵메뉴 추천은 이 함수 뒤에 갱신되니, 지금 프로필로 직접 계산해요.
  if(postCard){const profile=postProfile(),{a,h,n}=profile;const view=homeViewPayload(recommend(a,h,n).chips.find(c=>c.name===MY_CHIP)?.posts.map(p=>p.id)||[],recommendMenus(profile));if(view)sendTestEvent('home_ob_view',view);}
 }
 // 온보딩 전 홈: 핀다 기본 순서 피드. 글 상세는 미구현 안내를 표시합니다.
 if(state.homeState==='NoOB_NoMD'||state.homeState==='InOB_NoMD')wirePostCard(shell.querySelector('[data-name="PostCard"]'),makeButton,{feed:defaultFeed,chipKey:'noobPostChip',rowIndex:0,onPost:()=>showTestScopeNotice(app)});
 // 종료 지점 ① 홈 끝까지 스크롤 (OB_NoMD만, 모달은 한 번만)
 if(state.homeState==='OB_NoMD'){const viewport=shell.querySelector('.figma-home-viewport');viewport?.addEventListener('scroll',()=>{if(atScrollEnd(viewport)&&showExploreDone(app))sendExploreDone(EXIT_POINTS.scrollEnd);},{passive:true});}
 for(const group of shell.querySelectorAll('[data-name="PostCard"] [data-name="Chips"], [data-name="PostCard"] [data-name="cmp_Common_ChipGroup"]'))wireChipGroup(group);
 const unavailableCard=element=>{
  if(!element||element.matches('[role="button"],button,a[href]')||element.querySelector('[role="button"],button,a[href],[role="tab"]'))return;
  const label=element.textContent.trim().replace(/\s+/g,' ')||'메뉴 안내';
  makeButton(element,label,()=>showTestScopeNotice(app));element.dataset.testScope='true';
 };
 for(const card of shell.querySelectorAll('[data-name="contents card"],[data-name="Card/Ad/M"],[data-name="card_home"],[data-name="card_home_RepaymentSchedule"],[data-name="cmp_Home_Card"],[data-name="cmp_Home_Banner"]'))unavailableCard(card);
 for(const icon of shell.querySelectorAll('[data-name^="ic_home_loan_"]'))if(!['ic_home_loan_money','ic_home_loan_refinance'].includes(icon.dataset.name))unavailableCard(icon.parentElement);
 unavailableCard(pick('3172:19812'));
 for(const button of shell.querySelectorAll('.home-anonymous-banner button'))button.addEventListener('click',()=>showTestScopeNotice(app));
}

// Figma PostCard의 칩·글 줄을 복제해 V4.0 추천 결과로 채운다. 칩을 눌러도 홈 스크롤이 유지되도록 카드만 다시 그린다.
// 종료 이벤트: 모달이 뜬 순간 한 번. 그때의 맞춤 퀵메뉴 6개를 함께 보내 일치율 계산에 써요.
const sendExploreDone=(exit_point,extra={})=>sendTestEvent('explore_done',{exit_point,recommendation_ids:getRecommended(),...extra});
// 개인화 홈 포스트 클릭: 모든 칩의 클릭을 post_click으로 남기고, MY 칩 글일 때만 종료 지점 ②(모달)로 처리해요.
function onObPost(post,position,chip,chips){
 const myPostIds=chips.find(c=>c.name===MY_CHIP)?.posts.map(p=>p.id)||[];
 sendTestEvent('post_click',postClickPayload({chip:chip.name,post,position,myPostIds}));
 if(isExitPost(chip.name)&&showExploreDone(app)){sendExploreDone(EXIT_POINTS.myPost,{post_id:post.id,position});return;}
 showTestScopeNotice(app);
}
function wirePostCard(card,makeButton,{feed=()=>{const {a,h,n}=postProfile();return recommend(a,h,n);},chipKey='postChip',rowIndex=2,onPost=null}={}){
 if(!card)return;
 const slot=card.querySelector('[data-name="Slot"]'),list=card.children[1];
 const [selectedChip,chip]=slot.children,row=list.children[rowIndex];
 row.querySelectorAll('p')[1]?.remove();row.querySelector('img')?.remove();
 const fill=()=>{
  const chips=categoryChips(feed().chips);
  const current=chips.find(c=>c.name===state[chipKey])||chips[0];
  const group=slot.parentElement,left=group.scrollLeft;
  slot.replaceChildren(...chips.map(c=>{const el=(c===current?selectedChip:chip).cloneNode(true);el.querySelector('p').textContent=c.name;makeButton(el,c.name+' 포스트',()=>{state[chipKey]=c.name;fill();slot.querySelector('[aria-pressed="true"]')?.focus({preventScroll:true});});el.setAttribute('aria-pressed',String(c===current));return el;}));
  group.scrollLeft=left;
  // 글 상세 화면은 없어요. onPost(글, 칸 순서 1~3, 지금 칩, 전체 칩)로 처리를 맡겨요.
  list.replaceChildren(...current.posts.map((p,i)=>{const el=row.cloneNode(true);el.firstElementChild.setAttribute('style',thumbStyle(p));el.querySelector('p').textContent=p.t;if(onPost)makeButton(el,p.t,()=>onPost(p,i+1,current,chips));return el;}));
 };
 fill();
}

panel.addEventListener('change',e=>{
 if(e.target.id!=='screen-review'||!e.target.value)return;
 const value=e.target.value;
 state=selectScreen(state,value);
 if(state.screen==='06')activeField=['count','principal','monthly'][state.revealed-1];
 render();
 if(value==='popup:explore-done')showExploreDone(app,{force:true});
 else if(value.startsWith('popup:'))openQuickMenu(app,app.querySelector('.quick-menu-button'),value==='popup:quick-add');
});
app.addEventListener('quick-menu-view',e=>{
 const selector=panel.querySelector('#screen-review');if(selector)selector.value=e.detail||screenKey(state);
 const frame=panel.querySelector('code');if(frame)frame.textContent=e.detail==='popup:quick-add'?'퀵메뉴 편집':e.detail==='popup:quick-menu'?'메뉴 즐겨찾기':name();
});

// Initialize after the home helpers/constants above: the independent entry starts at home.
const requestedScreen=new URLSearchParams(location.search).get('screen');
if(!participantMode&&['existing:point','existing:all','existing:find-loan','existing:refinance','home:Loan:NoOB_NoMD','home:Loan:OB_NoMD'].includes(requestedScreen))state=selectScreen(state,requestedScreen);
if(isolatedEntry){
 const home={...initial(),screen:'11',homeState:loadDraft()?'InOB_NoMD':'NoOB_NoMD',tab:'Asset'};
 testNavigation=createTestNavigation({variant:'tobe',routeOf:toBeRoute,stateFor:route=>toBeState(route,home),onRestore:s=>{
  state=s;if(state.screen==='06')activeField=['count','principal','monthly'][state.revealed-1];render();
 }});
 state=testNavigation.initial();
}
mountStudyControls('tobe');
render();
// Existing collection contract: only To-be sends session_start, with the same payload.
if(participantMode){const params=new URLSearchParams(location.search);sendTestEvent('session_start',{variant:'tobe',study:isComparisonStudy(),first:params.get('first')});}
else flushPendingTestEvents();
