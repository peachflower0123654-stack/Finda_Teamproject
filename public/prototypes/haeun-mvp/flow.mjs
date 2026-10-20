import {emptyConsent,canContinueConsent} from './consent.js';
// Append the third draft result once its screen is supplied. No approval rules.
export const draftLoanResults=['HasLoanUnavailable','HasLoan'];
export const initial=()=>({screen:'00',consent:emptyConsent(),affiliation:'',housing:'',ownership:null,count:'',principal:'',monthly:'',amount:'',interest:'',purpose:'',revealed:1,result:null,draftResultIndex:0,homeState:'NoOB_NoMD',tab:'Asset',review:false});
export const filled=v=>/^\d+$/.test(v);
// 05~09 건너뛰기: 입력값은 유지해 '이어서 입력하기'에서 재사용한다.
export const skipOnboarding=s=>({...s,screen:'11',homeState:'InOB_NoMD',tab:'Asset',result:null,review:false});
export const consentHome=s=>({...s,screen:'11',homeState:'NoOB_NoMD',tab:'Asset'});
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
 case '10':t.screen='11';t.tab='Asset';if(!s.review)t.homeState='OB_NoMD';break;
 }
 return t;
}
export function reveal(s){if(s.screen!=='06')return s;const fields=['count','principal','monthly'];return filled(s[fields[s.revealed-1]])?{...s,revealed:Math.min(3,s.revealed+1)}:s;}
export function selectOwnership(s,value){return {...s,ownership:value,...(s.ownership!==value?{count:'',principal:'',monthly:'',amount:'',interest:'',purpose:'',revealed:1,result:null}: {})};}
export function back(s){if(s.screen==='11'&&s.homeState==='OB_MD')return {...s,homeState:'OB_NoMD'};const map={'ai-rate':'11','02':'01','03':'02','04':'03','05':'04','06':'05','07':'06','08':'05','09':'08','10':s.result==='NoLoan'?'09':'07'};return {...s,screen:map[s.screen]||s.screen};}
