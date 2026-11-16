// 온보딩 임시 저장 (브라우저 localStorage). 실제 금융정보가 아니라 테스트용 가상 응답만 담아요.
// - 저장 시점: CTA(다음·확정·다음 칸 이동)를 누른 순간. CTA 전에 고르거나 입력한 값은 저장하지 않아요.
// - resume.step / resume.field: 다시 들어왔을 때 갈 화면과 입력 칸.
// - attempt_id: 이어하면 그대로, 새로 시작하면 새로 발급. test_id는 test-data.js가 따로 관리해요.

export const DRAFT_KEYS={study:'finda.study.v1.onboardingDraft',dev:'finda.dev.v1.onboardingDraft'};
// 참가자 링크(?mode=test)는 배포용 키, 그 외(검토·개발)는 개발용 키를 써요.
export const draftKey=participant=>participant?DRAFT_KEYS.study:DRAFT_KEYS.dev;

// 앱 state 키 → 저장·전송에 쓰는 이름
export const FIELD={affiliation:'affiliation',housing:'housing',ownership:'has_loan',count:'loan_count',principal:'loan_principal',monthly:'monthly_repayment',interest:'extra_loan',amount:'desired_amount',purpose:'loan_purpose'};
const STATE_KEY=Object.fromEntries(Object.entries(FIELD).map(([k,v])=>[v,k]));
const NUMBER_KEYS=['count','principal','monthly','amount'];
const LOAN_FIELDS=['count','principal','monthly'];
// 대출 보유 여부가 바뀌면 그 뒤 답은 다른 트랙이라 버려요.
const AFTER_OWNERSHIP=['count','principal','monthly','interest','amount','purpose'];

const safeGet=(storage,key)=>{try{return storage?.getItem(key)??null;}catch{return null;}};
const safeSet=(storage,key,value)=>{try{storage?.setItem(key,value);}catch{}};
const safeRemove=(storage,key)=>{try{storage?.removeItem(key);}catch{}};

export function readDraft(storage,key){
 try{
  const d=JSON.parse(safeGet(storage,key)||'null');
  return d&&typeof d==='object'&&typeof d.attempt_id==='string'&&d.answers&&d.resume?d:null;
 }catch{return null;}
}
export const writeDraft=(draft,storage,key)=>safeSet(storage,key,JSON.stringify(draft));
export const clearDraft=(storage,key)=>safeRemove(storage,key);
export const newDraft=(makeId=()=>crypto.randomUUID())=>({attempt_id:makeId(),answers:{},resume:{step:'03',field:null}});

const valueOf=(state,key)=>NUMBER_KEYS.includes(key)?Number(state[key]):state[key];
function withAnswers(draft,state,keys,resume){
 const answers={...draft.answers};
 for(const k of keys)answers[FIELD[k]]=valueOf(state,k);
 return {...draft,answers,resume,updated_at:new Date().toISOString()};
}

// CTA 한 번에 저장할 값과 다음 위치. 저장할 게 없으면 null.
// kind: 'next'(화면의 다음/확정·넘버패드 마지막 다음) | 'reveal'(06에서 다음 칸으로 포커스 이동, revealed는 이동 후 값)
export function saveStep(draft,state,kind){
 const s=state.screen;
 if(kind==='reveal'){
  if(s!=='06')return null;
  const confirmed=LOAN_FIELDS.slice(0,state.revealed-1);
  return withAnswers(draft,state,confirmed,{step:'06',field:FIELD[LOAN_FIELDS[state.revealed-1]]});
 }
 switch(s){
 case '03':return withAnswers(draft,state,['affiliation'],{step:'04',field:null});
 case '04':return withAnswers(draft,state,['housing'],{step:'05',field:null});
 case '05':{
  const base=draft.answers[FIELD.ownership]!==undefined&&draft.answers[FIELD.ownership]!==state.ownership
   ?{...draft,answers:Object.fromEntries(Object.entries(draft.answers).filter(([k])=>!AFTER_OWNERSHIP.map(x=>FIELD[x]).includes(k)))}:draft;
  return withAnswers(base,state,['ownership'],state.ownership?{step:'06',field:FIELD.count}:{step:'08',field:FIELD.amount});
 }
 case '06':return withAnswers(draft,state,LOAN_FIELDS,{step:'07',field:null});
 case '07':return withAnswers(draft,state,['interest'],{step:'10',field:null});
 case '08':return withAnswers(draft,state,['amount'],{step:'09',field:null});
 case '09':return withAnswers(draft,state,['purpose'],{step:'10',field:null});
 }
 return null;
}

export const trackOf=draft=>draft.answers[FIELD.ownership]===true?'has_loan':draft.answers[FIELD.ownership]===false?'no_loan':null;

// Supabase payload: attempt_id + 저장된 답 전체(펼쳐서) + 그 밖의 값
export const eventPayload=(draft,extra={})=>({attempt_id:draft.attempt_id,...draft.answers,...extra});

// 다시 들어올 때: 객관식은 선택 안 된 상태, 대출 정보는 저장된 칸만 채워요. focus는 커서를 둘 state 키.
export function restoreState(state,draft){
 const step=draft.resume?.step||'03';
 const a=draft.answers;
 const num=k=>a[FIELD[k]]===undefined?'':String(a[FIELD[k]]);
 const pastOwnership=['06','07','08','09'].includes(step);
 const next={...state,screen:step,homeState:'InOB_NoMD',tab:'Asset',review:false,result:null,
  affiliation:'',housing:'',interest:'',purpose:'',
  ownership:pastOwnership&&typeof a[FIELD.ownership]==='boolean'?a[FIELD.ownership]:null,
  count:num('count'),principal:num('principal'),monthly:num('monthly'),amount:num('amount'),revealed:1};
 let focus=null;
 if(step==='06'){
  const field=STATE_KEY[draft.resume.field];
  next.revealed=Math.max(1,LOAN_FIELDS.indexOf(field)+1);
  focus=LOAN_FIELDS[next.revealed-1];
 }else if(step==='07')next.revealed=3;
 else if(step==='08')focus='amount';
 return {state:next,focus};
}

// 건너뛰기 순간 커서가 있던 칸(대출 정보·희망 금액 화면만)
export const exitField=(screen,activeKey)=>['06','08'].includes(screen)&&FIELD[activeKey]?FIELD[activeKey]:null;
