import {emptyConsent,canContinueConsent} from './consent.js';
// Append the third draft result once its screen is supplied. No approval rules.
export const draftLoanResults=['HasLoanUnavailable','HasLoan'];
export const initial=()=>({screen:'00',consent:emptyConsent(),affiliation:'',housing:'',ownership:null,count:'',principal:'',monthly:'',amount:'',interest:'',purpose:'',revealed:1,result:null,draftResultIndex:0,homeState:'NoOB_NoMD',tab:'Asset',review:false,aiConsent:false,aiSort:'rate',aiAutoAdvance:false});
export const filled=v=>/^\d+$/.test(v);
export const skipOnboarding=s=>({...s,screen:'11',homeState:'NoOB_NoMD',tab:'Asset',result:null,review:false});
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
 case '00':t.screen='01';break;
 case '01':t.screen='02';break;
 case '02':if(canContinueConsent(s.consent)){t.screen='03';t.homeState='InOB_NoMD';}break;
 case '03':if(s.affiliation==='직장인')t.screen='04';break;
 case '04':if(s.housing==='전월세 세입자')t.screen='05';break;
 case '05':if(s.ownership!==null){t.screen=s.ownership?'06':'08';t.homeState='InOB_NoMD';}break;
 case '06':if([s.count,s.principal,s.monthly].every(filled)&&s.revealed===3)t.screen='07';break;
 case '07':if(s.interest==='전월세 보증금'){t.screen='10';t.result=draftLoanResults[s.draftResultIndex%draftLoanResults.length];t.draftResultIndex=s.draftResultIndex+1;}break; // Temporary preview rotation only.
 case '08':if(filled(s.amount))t.screen='09';break;
 case '09':if(s.purpose==='전월세 보증금'){t.screen='10';t.result='NoLoan';}break;
 case 'ai-rate-intro':t.screen='ai-rate-consent';t.aiConsent=false;break;
 case 'ai-rate-consent':if(canConfirmAiRate(s)){t.screen='ai-rate-loading';t.aiAutoAdvance=true;}break;
 case 'ai-rate-loading':t.screen='ai-rate';t.aiSort='rate';t.aiAutoAdvance=false;break;
 case '10':t.screen='11';t.tab='Asset';if(!s.review)t.homeState='OB_NoMD';break;
 }
 return t;
}
export function reveal(s){if(s.screen!=='06')return s;const fields=['count','principal','monthly'];return filled(s[fields[s.revealed-1]])?{...s,revealed:Math.min(3,s.revealed+1)}:s;}
export function selectOwnership(s,value){return {...s,ownership:value,...(s.ownership!==value?{count:'',principal:'',monthly:'',amount:'',interest:'',purpose:'',revealed:1,result:null}: {})};}
export function back(s){if(s.screen==='11'&&s.homeState==='OB_MD')return {...s,homeState:'OB_NoMD'};if(['ai-rate-intro','ai-rate-loading','ai-rate'].includes(s.screen))return aiRateHome(s);if(s.screen==='ai-rate-consent')return {...s,screen:'ai-rate-intro'};const map={'02':'01','03':'02','04':'03','05':'04','06':'05','07':'06','08':'05','09':'08','10':s.result==='NoLoan'?'09':'07'};return {...s,screen:map[s.screen]||s.screen};}
