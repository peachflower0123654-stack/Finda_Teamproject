// 코호트 프리뷰 v6 최종안 (Downloads/cohort_v6.html, 11/16) — 홈 핀다대출 탭 맨 위 카드.
// 원칙: 판정하지 않기 · 교차 통계 없음(한 줄 = 조건 하나) · 사람마다 1~2줄 · 다른 나이대 비교 없음.
// 상태: ① 온보딩 전 / ②③③-1③-2⑥ 이탈(임시 저장 위치) / ③-3 계획 없음 / ④~⑪ 완료.
const AFF=['학생·취업준비·무직','직장인','자영업자·사업자·프리랜서','액티브시니어','은퇴정착층'];
const SHORT={'학생·취업준비·무직':'학생·취업준비·무직','직장인':'직장인','자영업자·사업자·프리랜서':'자영업자·사업자·프리랜서','액티브시니어':'액티브시니어','은퇴정착층':'은퇴정착층'};
const HOUSE_SHORT=h=>h?.startsWith('전월세')?'전월세':h?.startsWith('부모')?'부모·가족과 함께':h||'';
// 소속만으로 낼 수 있는 통계 1줄(이탈·대출 없음 카드)
const AFF_STAT={
 '학생·취업준비·무직':['29세 이하 가구 · 가운데 순자산','5,000만 원'],
 '직장인':['직장인(상용근로자) 가구 · 평균 자산','6억 1,918만 원'],
 '자영업자·사업자·프리랜서':['개인사업자 · 평균 대출잔액 · 사업자대출 포함','1억 7,892만 원'],
 '액티브시니어':['60세 이상 가구 · 가운데 순자산','2억 5,000만 원'],
 '은퇴정착층':['60세 이상 가구 · 가운데 순자산','2억 5,000만 원'],
};
const SENIOR_ROWS=[['가운데 순자산','2억 5,000만 원'],['평균 자산','6억 95만 원']];
const LOAN_BAL={1:'7,206만 원',2:'1억 1,317만 원',3:'1억 2,545만 원'};
export const COHORT_BUTTONS={rate:'내 신용대출 예상 금리 확인하기',rent:'내게 맞는 전월세대출 추천받기',manage:'내 대출 한눈에 정리하기',start:'내 상황 알려주기',resume:'이어서 입력하기',loanInfo:'대출 정보 입력하기'};

// 입력: {stage:'none'|'draft'|'done', answers:{affiliation,housing,has_loan,loan_count,desired_amount,extra_loan,loan_purpose,no_loan_plan}, resumeStep}
export function cohortCard({stage,answers:a={},resumeStep}){
 const aff=a.affiliation,stat=AFF_STAT[aff]||AFF_STAT['직장인'];
 const eb=(...parts)=>parts.filter(Boolean).join(' · ');
 if(stage==='none'||(stage==='draft'&&!aff))return {id:'①',eb:'아직 알려주신 상황이 없어요',t:'나와 비슷한 분들은<br>대출이 얼마나 될까요?',rows:[['나와 같은 소속 · 대출 건수인 분들','○억 ○,○○○만 원',true]],btn:stage==='none'?'start':'resume',cap:'입력한 값은 홈을 맞추는 데만 써요 · 신용점수 영향 없음',info:false};
 const base=eb(SHORT[aff],HOUSE_SHORT(a.housing));
 if(stage==='draft'){
  const loan=a.has_loan===true?'대출 있음':a.has_loan===false?'대출 없음':'';
  if(resumeStep==='06')return {id:'③',eb:eb(base,loan),prog:'3/5',t:'대출 정보를 알려주면<br>비슷한 분들이 보여요',rows:[stat],btn:'loanInfo',cap:'건수·원금·월 상환액은 끝까지 입력해야 저장돼요'};
  if(resumeStep==='08')return {id:'③-1',eb:eb(base,loan),prog:'3/5',t:'필요한 금액을 알려주면<br>맞는 대출로 안내해요',rows:[stat],btn:'resume'};
  if(resumeStep==='09')return {id:'③-2',eb:eb(base,loan,a.desired_amount?`희망 ${money(a.desired_amount)}`:''),prog:'4/5',t:'대출 목적만 알려주면<br>맞는 대출로 안내해요',rows:[stat],btn:'resume',cap:'목적에 따라 신용대출 금리 확인 또는 전월세대출 추천으로 이어져요'};
  if(resumeStep==='07')return {...loanCard(a,aff),id:'⑥',btn:'manage',link:null};
  return {id:'②',eb:base,prog:'2/5',t:'대출만 알려주면<br>비슷한 분들이 보여요',rows:[stat],btn:'resume'};
 }
 // 완료
 if(a.has_loan===false&&a.no_loan_plan)return {id:'③-3',eb:eb(base,'대출 없음 · 계획 없음'),t:`${AFF_TITLE[aff]||'비슷한 분들의'}<br>${statTitle(aff)}`,rows:[stat],btn:'rate',edit:true};
 if(a.has_loan===false){
  const rent=a.loan_purpose==='전월세 보증금';
  return {id:aff==='학생·취업준비·무직'?'⑨':'완료·대출 없음',eb:eb(base,'대출 없음',a.desired_amount?`희망 ${money(a.desired_amount)}`:''),t:`${AFF_TITLE[aff]||'비슷한 분들의'}<br>${statTitle(aff)}`,rows:[stat],btn:rent?'rent':'rate',cap:rent?'희망 금액 · 대출 없음은 미리 채워 둘게요':'',edit:true};
 }
 return {...loanCard(a,aff),edit:true};
}
const AFF_TITLE={'학생·취업준비·무직':'29세 이하 가구의','직장인':'직장인 가구의','자영업자·사업자·프리랜서':'개인사업자 분들의','액티브시니어':'60세 이상 가구의','은퇴정착층':'60세 이상 가구의'};
const statTitle=aff=>aff==='학생·취업준비·무직'?'순자산이에요':aff==='직장인'?'평균 자산이에요':aff==='자영업자·사업자·프리랜서'?'평균 대출잔액이에요':'자산이에요';
function money(v){const n=Math.round(Number(v)/10000);if(!n)return '';const eok=Math.floor(n/10000),man=n%10000;return (eok?eok+'억 ':'')+(man?man.toLocaleString()+'만':'')+'원';}
// 대출 있음 카드(④⑤⑦⑧⑩⑪). 추가대출 관심이 없거나 모르면, 3건 이상이면 금리 대신 상환 관리(추가대출 권유 피하기).
function loanCard(a,aff){
 const n=Number(a.loan_count)||1,bucket=n>=3?3:n,cnt=n>=3?'대출 3건 이상':`대출 ${n}건`;
 const wantsMore=a.extra_loan&&a.extra_loan!=='없다';
 const rateOk=n<3&&wantsMore;
 if(aff==='은퇴정착층')return {id:'⑩',eb:eb2('은퇴정착층 기준'),t:'60세 이상 가구의<br>자산이에요',rows:SENIOR_ROWS,btn:'manage'};
 if(aff==='액티브시니어')return {id:'⑪',eb:eb2(`액티브시니어 · ${cnt} 기준`),t:'60세 이상 가구의<br>자산이에요',rows:SENIOR_ROWS,btn:rateOk?'rate':'manage'};
 if(aff==='자영업자·사업자·프리랜서')return {id:'⑧',eb:eb2('자영업자·사업자·프리랜서 기준'),t:'개인사업자 분들의<br>평균 대출잔액이에요',rows:[['평균 대출잔액 · 사업자대출 포함','1억 7,892만 원']],btn:rateOk?'rate':'manage',link:true};
 if(aff==='학생·취업준비·무직')return {id:'⑨-대출',eb:eb2(`학생·취업준비·무직 · ${cnt} 기준`),t:'29세 이하 가구의<br>순자산이에요',rows:[['가운데 순자산','5,000만 원']],btn:rateOk?'rate':'manage'};
 const label=n>=3?'대출 3건 이상 직장인의':`대출 ${n}건인 직장인의`;
 return {id:n>=3?'⑦':'⑤',eb:eb2(`직장인 · ${cnt} 기준`),t:`${label}<br>평균 대출잔액이에요`,rows:[['평균 대출잔액',LOAN_BAL[bucket]]],btn:rateOk?'rate':'manage',link:n<3};
}
const eb2=s=>s;

export function cohortView(c){
 const rows=c.rows.map(([lbl,num,ph],i)=>`${i?'<div class="cohort-card__hr"></div>':''}<div><p class="cohort-card__lbl">${lbl}</p><p class="cohort-card__num${ph?' is-placeholder':''}">${num}</p></div>`).join('');
 const right=c.prog?`<span class="cohort-card__prog">${c.prog}</span>`:c.edit?'<button type="button" class="cohort-card__edit" data-cohort="edit">수정 ›</button>':'';
 return `<section class="cohort-card" data-cohort-case="${c.id}" aria-label="나와 비슷한 분들 통계">
<div class="cohort-card__eyebrow"><span>${c.eb}</span>${right}</div>
<h3 class="cohort-card__title">${c.t}</h3>
<div class="cohort-card__box">${c.info===false?'':'<button type="button" class="cohort-card__info" data-cohort="info" aria-label="통계 출처 보기">ⓘ</button>'}${rows}${c.link?'<div class="cohort-card__hr"></div><button type="button" class="cohort-card__link" data-cohort="age">내 나이대 고르고 자산도 보기 ›</button>':''}</div>
<button type="button" class="cohort-card__btn" data-cohort="${c.btn}">${COHORT_BUTTONS[c.btn]}</button>${c.cap?`<p class="cohort-card__cap">${c.cap}</p>`:''}
</section>`;
}
