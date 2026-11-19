// To-be-specific screen mapping; the As-is PR does not need this adapter.
const details=new Set(['point','all','find-loan','refinance']);
const onboarding=new Set(['00','02','03','04','05','06','07','08','09']);
const aiScreens=new Set(['ai-rate-intro','ai-rate-consent','ai-rate-loading']);
const results=new Set(['HasLoanUnavailable','HasLoan','NoLoan']);

export function toBeRoute(state){
 if(state.screen==='11')return state.tab==='Loan'?'home-loan':'home';
 if(state.screen==='10'&&results.has(state.result))return 'result-'+state.result;
 if(onboarding.has(state.screen))return 'onboarding-'+state.screen;
 if(details.has(state.screen)||aiScreens.has(state.screen))return state.screen;
 if(state.screen==='ai-rate')return state.aiSort==='limit'?'ai-rate-limit':'ai-rate-rate';
 return null;
}

export function toBeState(route,home){
 const state={...home,review:false};
 if(route==='home'||route==='home-loan')return {...state,screen:'11',tab:route==='home'?'Asset':'Loan'};
 if(details.has(route))return {...state,screen:route,...(['find-loan','refinance'].includes(route)?{existingReturnTo:'all'}:{})};
 const step=route.replace(/^onboarding-/,'');
 if(route.startsWith('onboarding-')&&onboarding.has(step))return {...state,screen:step,
  ...(['06','07'].includes(step)?{ownership:true,revealed:step==='07'?3:1}:{}),
  ...(['08','09'].includes(step)?{ownership:false}:{}),
 };
 const result=route.replace(/^result-/,'');
 if(route.startsWith('result-')&&results.has(result))return {...state,screen:'10',result};
 if(aiScreens.has(route))return {...state,screen:route,aiAutoAdvance:false};
 if(route==='ai-rate-rate'||route==='ai-rate-limit')return {...state,screen:'ai-rate',aiSort:route.slice(8)};
 return {...state,screen:'11',tab:'Asset'};
}
