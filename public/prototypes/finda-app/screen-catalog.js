export const screenGroups=[
 ['온보딩',[
  ['onboarding:00','00 · 스플래시'],['onboarding:01','01 · 회원가입·로그인'],['onboarding:02','02 · 약관동의'],['onboarding:03','03 · 소속 선택'],['onboarding:04','04 · 주거형태 선택'],['onboarding:05','05 · 대출 보유 여부'],
  ['onboarding:06:1','06 · 대출 건수 입력'],['onboarding:06:2','06 · 총 원금 입력'],['onboarding:06:3','06 · 월 상환액 입력'],['onboarding:07','07 · 관심 대출 선택'],['onboarding:08','08 · 희망 금액 입력'],['onboarding:09','09 · 대출 목적 선택'],
 ]],
 ['결과',['HasLoanUnavailable','HasLoan','NoLoan'].map(value=>['result:'+value,'10 · '+value])],
 ['홈',['NoOB_NoMD','InOB_NoMD','OB_NoMD','OB_MD'].flatMap(value=>[['home:Asset:'+value,'11 · MY금융 · '+value],['home:Loan:'+value,'11 · '+(value==='OB_NoMD'?'대출 찾기':'핀다대출')+' · '+value]])],
 ['추가 화면',[['ai-rate:intro','finda_AIRate_Intro'],['ai-rate:consent','finda_AIRate_ConsentSheet'],['ai-rate:loading','finda_AIRate_Loading'],['ai-rate:rate','finda_AIRate_Result_LowRate'],['ai-rate:limit','finda_AIRate_Result_HighLimit'],['popup:quick-menu','메뉴 즐겨찾기 팝업'],['popup:quick-add','퀵메뉴 항목 추가']]],
];
export function screenKey(state){
 if(state.screen==='11')return `home:${state.tab}:${state.homeState}`;
 if(state.screen==='10')return 'result:'+state.result;
 if(state.screen==='ai-rate')return 'ai-rate:'+state.aiSort;
 if(state.screen.startsWith('ai-rate-'))return 'ai-rate:'+state.screen.slice(8);
 return 'onboarding:'+state.screen+(state.screen==='06'?':'+state.revealed:'');
}
export function screenSelector(state){const current=screenKey(state);return `<label for="screen-review">화면선택</label><select id="screen-review"><option value="">화면선택</option>${screenGroups.map(([group,items])=>`<optgroup label="${group}">${items.map(([value,label])=>`<option value="${value}" ${value===current?'selected':''}>${label}</option>`).join('')}</optgroup>`).join('')}</select>`;}
export function selectScreen(state,value){
 const [kind,item,detail]=value.split(':');
 if(kind==='onboarding')return {...state,screen:item,review:true,...(item==='06'?{revealed:Number(detail),ownership:true}:{}),...(item==='07'?{ownership:true}:{}),...(['08','09'].includes(item)?{ownership:false}:{})};
 if(kind==='result')return {...state,screen:'10',result:item,review:true};
 if(kind==='home')return {...state,screen:'11',tab:item,homeState:detail,review:true};
 if(kind==='ai-rate')return {...state,...(['rate','limit'].includes(item)?{screen:'ai-rate',aiSort:item}:{screen:'ai-rate-'+item,aiConsent:false,aiAutoAdvance:false}),homeState:'OB_NoMD',tab:'Loan',review:true};
 if(kind==='popup')return {...state,screen:'11',homeState:'OB_NoMD',review:true};
 return state;
}
