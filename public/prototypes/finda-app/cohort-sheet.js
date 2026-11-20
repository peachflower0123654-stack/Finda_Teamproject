// 코호트 프리뷰 v6 바텀시트 (Downloads/cohort_v6.html 5·5-1, 11/16 최종안).
// ① 수정 시트: 소속·주거·대출은 줄을 누르면 칩이 펼쳐지고 누르는 즉시 저장(펼친 상태는 유지, 줄을 다시 눌러 닫음). 나이대는 직장인·자영업자만.
// ② ⓘ 출처 시트(통계 줄마다)  ③ 나이대 선택 시트. (대출 확인 팝업·온보딩 연결은 하지 않아요)
// 뷰는 문자열만 만들고, 열고 닫는 건 openCohortSheet가 해요. 상태 저장·화면 이동은 app.js가 해요.
import {AFFILIATIONS,HOUSINGS} from './post-data.js';

// 나이대: 소속이 나이를 정하지 않는 직장인·자영업자만 고를 수 있어요.
export const AGE_AFF=['직장인','자영업자·사업자·프리랜서'];
export const AGE_OPTIONS=[['20','20대','29세 이하 통계'],['30','30대'],['40','40대'],['50','50대'],['','선택 안 함']];
export const AGE_ROWS={
 '20':['29세 이하 가구 · 가운데 순자산','5,000만 원'],
 '30':['30대 가구 · 가운데 순자산','1억 5,585만 원'],
 '40':['40대 가구 · 가운데 순자산','2억 8,384만 원'],
 '50':['50대 가구 · 가운데 순자산','3억 1,685만 원'],
};
export const ageLabel=v=>AGE_OPTIONS.find(([k])=>k===v)?.[1]||'선택 안 함';

// ⓘ 출처: 카드 숫자 → 출처 (cohort_v6.html 7. 원문 대조 결과)
const NOT_MINE='내 대출 금액이나 받을 수 있는 금액과는 관계없어요.';
const WAGE=['국가데이터처<br>2024년 일자리행정통계 임금근로자 부채','2024년 12월 말 잔액','개인 (가구 아님)','평균 · 전체 대출잔액 ÷ 사람 수'];
const SURVEY='국가데이터처<br>2025년 가계금융복지조사';
const wage=(name,who)=>({name,kv:[['출처',WAGE[0]],['기준',WAGE[1]],['단위',WAGE[2]],['계산',WAGE[3]]],explain:`${who} 전체의 평균이에요. ${NOT_MINE}`});
const median=(name,median,mean,max,maxLabel)=>({name,line:{median,mean,max,maxLabel},explain:`가구를 순자산 순서로 세웠을 때 한가운데가 ${man(median*10000)} 원이에요. 순자산이 아주 큰 일부 가구가 평균을 끌어올려서 평균이 더 커요.`});
const survey=(name,unit,calc,explain)=>({name,kv:[['출처',SURVEY],['기준','2025년 3월 31일'],['단위',unit],['계산',calc]],explain});
export const SOURCES={
 '7,206만 원':wage('대출 1건인 직장인 평균 대출잔액','대출이 1건인 직장인'),
 '1억 1,317만 원':wage('대출 2건인 직장인 평균 대출잔액','대출이 2건인 직장인'),
 '1억 2,545만 원':wage('대출 3건 이상 직장인 평균 대출잔액','대출이 3건 이상인 직장인'),
 '1억 7,892만 원':{name:'개인사업자 평균 대출잔액',kv:[['출처','국가데이터처<br>2024년 일자리행정통계 개인사업자 부채(잠정)'],['대상','<b>사업자등록을 한 개인사업자 기준</b><br><small>사업자등록을 하지 않은 프리랜서는 포함되지 않아요</small>'],['기준','2024년 12월 말 잔액'],['계산','평균 · 가계대출과 사업자대출을 합한 금액']],explain:`사업자등록을 한 개인사업자 전체의 평균이에요. ${NOT_MINE}`},
 '6억 1,918만 원':survey('직장인(상용근로자) 가구 평균 자산','가구 (가구주가 상용근로자)','평균 · 전체 자산 ÷ 가구 수','가구주가 직장인(상용근로자)인 가구 전체의 평균이에요. 내 자산이나 받을 수 있는 금액과는 관계없어요.'),
 '6억 95만 원':survey('60세 이상 가구 평균 자산','가구 (가구주가 60세 이상)','평균 · 전체 자산 ÷ 가구 수','가구주가 60세 이상인 가구 전체의 평균이에요. 내 자산이나 받을 수 있는 금액과는 관계없어요.'),
 '5,000만 원':median('29세 이하 가구 가운데 순자산',5000,10796,12000,'1억 2,000만'),
 '2억 5,000만 원':median('60세 이상 가구 가운데 순자산',25000,53591,60000,'6억'),
 '1억 5,585만 원':median('30대 가구 가운데 순자산',15585,25060,30000,'3억'),
 '2억 8,384만 원':survey('40대 가구 가운데 순자산','가구 (가구주가 40~49세)','가운데 값 · 순자산(자산 − 부채) 순서로 세운 한가운데',`가구를 순자산 순서로 세웠을 때 한가운데 값이에요. ${NOT_MINE}`),
 '3억 1,685만 원':survey('50대 가구 가운데 순자산','가구 (가구주가 50~59세)','가운데 값 · 순자산(자산 − 부채) 순서로 세운 한가운데',`가구를 순자산 순서로 세웠을 때 한가운데 값이에요. ${NOT_MINE}`),
};
// 카드의 통계 줄 → 출처 목록 (자리 표시 줄·출처 없는 줄은 빼요)
export const cardSources=card=>card.rows.filter(([,num,ph])=>!ph&&SOURCES[num]).map(([,num])=>({num,...SOURCES[num]}));

// 금액(원) → '5,000만' / '1억 2,000만'
export function man(v){const n=Math.round(Number(v)/10000);if(!n)return '';const eok=Math.floor(n/10000),rest=n%10000;return [eok?eok+'억':'',rest?rest.toLocaleString()+'만':''].filter(Boolean).join(' ');}

const head=(title,sub)=>`<span class="cohort-sheet__grab" aria-hidden="true"></span><h2 class="cohort-sheet__title" id="cohort-sheet-title">${title}</h2>${sub?`<p class="cohort-sheet__sub">${sub}</p>`:''}`;

function numberLine({median,mean,max,maxLabel}){
 const x=v=>16+288*v/max,mx=x(median),ax=x(mean);
 return `<svg class="cohort-sheet__line" viewBox="0 0 320 80" role="img" aria-label="가운데 값 ${man(median*10000)} 원, 평균 ${man(mean*10000)} 원"><line x1="16" x2="304" y1="56" y2="56" stroke="var(--ds-gray-030)" stroke-width="2"/>
<text x="16" y="74" font-size="10" fill="var(--ds-text-muted)">0</text><text x="304" y="74" font-size="10" fill="var(--ds-text-muted)" text-anchor="end">${maxLabel}</text>
<circle cx="${mx}" cy="56" r="6" fill="var(--ds-primary)" stroke="#fff" stroke-width="2"/><text x="${mx}" y="26" font-size="11" fill="var(--ds-text-muted)" text-anchor="middle">가운데 값</text><text x="${mx}" y="42" font-size="13" font-weight="700" fill="var(--ds-text-ink)" text-anchor="middle">${man(median*10000)} 원</text>
<circle cx="${ax}" cy="56" r="6" fill="var(--ds-gray-090,#4e5968)" stroke="#fff" stroke-width="2"/><text x="${Math.min(ax+6,312)}" y="26" font-size="11" fill="var(--ds-text-muted)" text-anchor="end">평균</text><text x="${Math.min(ax+6,312)}" y="42" font-size="13" font-weight="700" fill="var(--ds-text-ink)" text-anchor="end">${man(mean*10000)} 원</text></svg>`;
}

// num을 주면 그 숫자 하나의 출처만, 없으면 카드의 모든 줄.
export function sourceSheetView(card,num){
 const list=cardSources(card).filter(x=>!num||x.num===num);
 const body=list.map((s,i)=>`${i?'<div class="cohort-sheet__divider"></div>':''}<p class="cohort-sheet__sub${i?' is-next':''}">${s.name} · ${s.num}</p>${s.line?numberLine(s.line):`<dl class="cohort-sheet__kv">${s.kv.map(([k,v])=>`<dt>${k}</dt><dd>${v}</dd>`).join('')}</dl>`}<div class="cohort-sheet__explain">${s.explain}</div>`).join('');
 return `${head('이 숫자는 어디서 왔나요?')}${body}<button type="button" class="cohort-sheet__cta" data-cs="close">확인</button>`;
}

export function ageSheetView(age=''){
 return `${head('나이대를 골라주세요','고른 나이대의 자산 통계가 카드에 한 줄 생겨요')}<div class="cohort-sheet__opts" role="radiogroup" aria-labelledby="cohort-sheet-title">${AGE_OPTIONS.map(([v,label,note])=>`<button type="button" role="radio" class="cohort-sheet__opt" data-cs="age" data-value="${v}" aria-checked="${v===age}"><span>${label}${note?` <small>${note}</small>`:''}</span><span class="cohort-sheet__radio" aria-hidden="true"></span></button>`).join('')}</div><p class="cohort-sheet__cap">나이대는 이 카드에서만 써요 · 신용점수 영향 없음</p>`;
}

// 수정 시트. a = {affiliation,housing,has_loan,loan_count,principal,monthly,desired_amount,no_loan_plan,age}, open = 'aff'|'house'|'loan'|null
export function editSheetView(a,open=null){
 const row=(key,label,value,sub='')=>`<button type="button" class="cohort-sheet__row${open===key?' is-open':''}" data-cs="row" data-row="${key}" aria-expanded="${open===key}"><span class="cohort-sheet__k">${label}</span><span class="cohort-sheet__v">${value} <i aria-hidden="true">${open===key?'⌃':'⌄'}</i>${sub?`<small>${sub}</small>`:''}</span></button>`;
 const chips=(key,list,current)=>open===key?`<div class="cohort-sheet__chips">${list.map(v=>`<button type="button" class="cohort-sheet__chip" data-cs="pick" data-row="${key}" data-value="${v}" aria-pressed="${v===current}">${v}</button>`).join('')}</div>`:'';
 const loan=a.has_loan?(Number(a.loan_count)>=3?'3건 이상':`${Number(a.loan_count)||1}건`):'없음';
 const loanSub=a.has_loan?[a.principal&&`원금 ${man(a.principal)}`,a.monthly&&`월 ${man(a.monthly)} 원`].filter(Boolean).join(' · '):!a.no_loan_plan&&a.desired_amount?`희망 ${man(a.desired_amount)} 원`:'';
 const ageRow=AGE_AFF.includes(a.affiliation)?`<button type="button" class="cohort-sheet__row" data-cs="row" data-row="age"><span class="cohort-sheet__k">나이대</span><span class="cohort-sheet__v">${ageLabel(a.age||'')} <i aria-hidden="true">›</i></span></button>`:'';
 return `${head('내 상황 수정',"바꾸면 '비슷한 분들' 통계도 같이 바뀌어요")}<div class="cohort-sheet__rows">
${row('aff','소속',a.affiliation)}${chips('aff',AFFILIATIONS,a.affiliation)}
${row('house','주거',a.housing)}${chips('house',HOUSINGS,a.housing)}
${row('loan','대출',loan,loanSub)}${chips('loan',['있음','없음'],a.has_loan?'있음':'없음')}
${ageRow}</div>`;
}


// 시트 열기: #app 위에 딤 + 아래에서 올라오는 시트(또는 가운데 팝업). 같은 오버레이 안에서 내용만 바꿀 수 있어요.
// onAction(button, api) — api = {show(html,{popup}), close()}. 딤·Esc·[data-cs="close"]는 닫기.
export function openCohortSheet(root,html,{trigger,onAction,onClose}={}){
 root.querySelector(':scope > .cohort-sheet-overlay')?.remove();
 const overlay=document.createElement('div');overlay.className='cohort-sheet-overlay';
 const screen=root.querySelector('.screen,.figma-home-shell');if(screen)screen.inert=true;
 overlay.innerHTML='<button type="button" class="cohort-sheet-dim" data-cs="close" aria-label="닫기" tabindex="-1"></button><section class="cohort-sheet is-entering" role="dialog" aria-modal="true" aria-labelledby="cohort-sheet-title"></section>';
 const panel=overlay.querySelector('section');
 const api={
  show(next,{popup=false,focus}={}){
   panel.className='cohort-sheet'+(popup?' is-popup':'');panel.setAttribute('role',popup?'alertdialog':'dialog');panel.innerHTML=next;
   (focus&&panel.querySelector(focus)||panel.querySelector('button')).focus({preventScroll:true});
  },
  close(){document.removeEventListener('keydown',onKey,true);overlay.remove();if(screen)screen.inert=false;if(trigger?.isConnected)trigger.focus({preventScroll:true});onClose?.();},
 };
 const onKey=e=>{
  if(e.key==='Escape'){e.preventDefault();api.close();}
  else if(e.key==='Tab'){const b=[...panel.querySelectorAll('button:not(:disabled)')];const first=b[0],last=b.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}
 };
 overlay.addEventListener('click',e=>{
  e.stopPropagation();// app.js의 전역 버튼 처리(data-action 등)와 섞이지 않게
  const b=e.target.closest('[data-cs]');if(!b)return;
  if(b.dataset.cs==='close'){api.close();return;}
  onAction?.(b,api);
 });
 document.addEventListener('keydown',onKey,true);
 root.append(overlay);
 panel.innerHTML=html;panel.querySelector('button')?.focus({preventScroll:true});
 panel.addEventListener('animationend',()=>panel.classList.remove('is-entering'),{once:true});
 return api;
}
