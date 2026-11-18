import {emptyConsent,canContinueConsent,INTRO_SLIDES} from './consent.js';
// Append the third draft result once its screen is supplied. No approval rules.
export const draftLoanResults=['HasLoanUnavailable','HasLoan'];
export const initial=()=>({screen:'00',consent:emptyConsent(),affiliation:'',housing:'',ownership:null,count:'',principal:'',monthly:'',amount:'',noPlan:false,introSlide:0,interest:'',purpose:'',revealed:1,result:null,draftResultIndex:0,homeState:'NoOB_NoMD',tab:'Asset',review:false,aiConsent:false,aiSort:'rate',aiAutoAdvance:false,postProfile:null,postChip:'MY'});
// 하단 메뉴는 온보딩 답과 홈의 개인화 상태를 그대로 유지합니다.
export function openMainTab(s,tab){
 if(!['home','point','all'].includes(tab))return s;
 const {existingReturnTo,...rest}=s;
 return {...rest,screen:tab==='home'?'11':tab};
}
export const openExistingDetail=(s,screen)=>['find-loan','refinance'].includes(screen)?{...s,screen,existingReturnTo:s.screen==='11'?'11':'all'}:s;
export const filled=v=>/^\d+$/.test(v);
// 05~09 건너뛰기: 입력값은 유지해 '이어서 입력하기'에서 재사용한다.
export const skipOnboarding=s=>({...s,screen:'11',homeState:'InOB_NoMD',tab:'Asset',result:null,review:false});
export const consentHome=s=>({...s,screen:'11',homeState:'NoOB_NoMD',tab:'Asset'});
// AI 예상 금리: Intro → ConsentSheet → Loading → Result(금리 낮은 순 / 한도 높은 순)
export const openAiRate=s=>({...s,screen:'ai-rate-intro',aiConsent:false,aiSort:'rate'});
export const aiRateHome=s=>({...s,screen:'11',homeState:'OB_NoMD',tab:'Loan'});
// 바텀시트 [확인]으로 들어온 Loading만 2초 뒤 결과로 넘어간다. 화면선택으로 연 Loading은 멈춰 있다.
export const shouldAutoAdvanceAiRate=s=>s.screen==='ai-rate-loading'&&s.aiAutoAdvance===true;
export const canConfirmAiRate=s=>s.aiConsent===true;
// 동의 항목이 하나뿐이라 [약관 전체 동의]와 개별 항목이 같은 값을 공유한다.
export const toggleAiRateConsent=s=>({...s,aiConsent:!s.aiConsent});
export function next(s){
 const t={...s};
 switch(s.screen){
 case '00':t.screen='02';t.introSlide=0;break;
 case '02':if((s.introSlide||0)<INTRO_SLIDES-1)t.introSlide=(s.introSlide||0)+1;else if(canContinueConsent(s.consent)){t.screen='03';t.homeState='InOB_NoMD';}break; // 02: 소개 장을 넘기고 마지막 장에서 약관 동의
 case '03':if(s.affiliation)t.screen='04';break;
 case '04':if(s.housing)t.screen='05';break;
 case '05':if(s.ownership!==null){t.screen=s.ownership?'06':'08';t.homeState='InOB_NoMD';}break;
 case '06':if([s.count,s.principal,s.monthly].every(filled)&&s.revealed===3)t.screen='07';break;
 case '07':if(s.interest){t.screen='10';t.result=draftLoanResults[s.draftResultIndex%draftLoanResults.length];t.draftResultIndex=s.draftResultIndex+1;}break; // Temporary preview rotation only.
 case '08':if(s.noPlan){t.screen='10';t.result='NoLoan';}else if(filled(s.amount))t.screen='09';break; // '지금은 계획 없음'이면 목적(09) 없이 결과로
 case '09':if(s.purpose){t.screen='10';t.result='NoLoan';}break;
 case 'ai-rate-intro':t.screen='ai-rate-consent';t.aiConsent=false;break;
 case 'ai-rate-consent':if(canConfirmAiRate(s)){t.screen='ai-rate-loading';t.aiAutoAdvance=true;}break;
 case 'ai-rate-loading':t.screen='ai-rate';t.aiSort='rate';t.aiAutoAdvance=false;break;
 case '10':t.screen='11';t.tab='Asset';t.homeState='OB_NoMD';break; // 결과 카드가 나왔다는 건 온보딩 완료 → 항상 scr_11_Home_Asset_OB_NoMD. 화면선택(review)으로 연 결과도 같다.
 }
 return t;
}
export function reveal(s){if(s.screen!=='06')return s;const fields=['count','principal','monthly'];return filled(s[fields[s.revealed-1]])?{...s,revealed:Math.min(3,s.revealed+1)}:s;}
export function selectOwnership(s,value){return {...s,ownership:value,...(s.ownership!==value?{count:'',principal:'',monthly:'',amount:'',noPlan:false,interest:'',purpose:'',revealed:1,result:null}: {})};}
export function back(s){if(s.screen==='06'&&s.revealed>1)return {...s,revealed:s.revealed-1};if(s.screen==='02'&&(s.introSlide||0)>0)return {...s,introSlide:s.introSlide-1}; // 02 소개 장은 한 장씩 뒤로
 // 06 안에서는 한 칸씩 뒤로(입력값은 유지)
 if(['find-loan','refinance'].includes(s.screen)){const {existingReturnTo,...rest}=s;return {...rest,screen:existingReturnTo||'all'};}if(['point','all'].includes(s.screen))return openMainTab(s,'home');if(s.screen==='11'&&s.homeState==='OB_MD')return {...s,homeState:'OB_NoMD'};if(['ai-rate-intro','ai-rate-loading','ai-rate'].includes(s.screen))return aiRateHome(s);if(s.screen==='ai-rate-consent')return {...s,screen:'ai-rate-intro'};const map={'02':'00','03':'02','04':'03','05':'04','06':'05','07':'06','08':'05','09':'08','10':s.result==='NoLoan'?(s.noPlan?'08':'09'):'07'};return {...s,screen:map[s.screen]||s.screen};}
// 희망 금액(08)의 '지금은 계획 없음' 체크. 체크하면 입력한 금액은 지워요.
export const toggleNoPlan=(s,checked)=>({...s,noPlan:checked,amount:checked?'':s.amount});
