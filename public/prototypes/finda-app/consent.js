export const consentItems=[
 {id:'service',label:'서비스 이용 약관 (필수)',required:true,detail:true},
 {id:'privacy',label:'필수 개인 정보 수집 및 이용 (필수)',required:true,detail:true},
 {id:'marketing',label:'마케팅 프로모션 알림 수신 동의 (선택)',required:false,detail:false},
];
export const emptyConsent=()=>Object.fromEntries(consentItems.map(item=>[item.id,false]));
// 필수 약관 2개에 모두 동의해야 다음 활성. 선택 약관은 진행 조건에 포함하지 않는다.
export const canContinueConsent=values=>consentItems.filter(item=>item.required).every(item=>values?.[item.id]===true);
export function toggleConsent(values,id){
 const checked=id==='all'?!consentItems.every(item=>values[item.id]):!values[id];
 return id==='all'?Object.fromEntries(consentItems.map(item=>[item.id,checked])):{...values,[id]:checked};
}
import {recommend,thumbStyle} from './post-personalization.js';
import {MENUS,recommendMenus} from './quick-menu-edit.js';
import {cohortCard,cohortView} from './cohort-card.js';

// 02 소개 + 약관 (11.18): 네이버지도 업데이트 안내처럼 위 미리보기 · 아래 제목/설명/버튼.
// 소개 3장(0~2). 3번째 장에서 [다음] → introSlide 3 = 뒤를 딤 처리하고 약관 바텀시트를 올려요.
// 미리보기는 실제 로직(포스트 추천·퀵메뉴 추천·코호트 카드)으로 그린 예시(직장인 · 전월세 · 대출 1건).
export const INTRO_SLIDES=4; // 소개 3장 + 약관 시트
const PAGES=3;
const EXAMPLE={a:1,h:0,n:1};
const SLIDES=[
 {t:'나에게 맞는 글은,<br>MY 칩에 먼저',d:'답해주신 상황으로 7개 주제 중 MY 3개를 골라요<br>관심 있을 글부터 홈에 먼저 보여드려요'},
 {t:'자주 쓸 메뉴,<br>홈 맨 위에 골라 둘게요',d:'내 상황에 맞는 메뉴 6개를 추천해요<br>2개는 직접 더 고를 수 있어요'},
 {t:'나와 비슷한 분들의<br>대출·자산을 보여드려요',d:'같은 상황인 분들의 공공 통계 평균이에요<br>내 숫자가 아니라 참고용이에요'},
];
function postPreview(){
 const {chips}=recommend(EXAMPLE.a,EXAMPLE.h,EXAMPLE.n);
 const chipRow=chips.slice(0,4).map((c,i)=>`<span class="intro-chip${i?'':' is-on'}">${c.name}</span>`).join('');
 const rows=chips[0].posts.map(p=>`<div class="intro-post"><span class="intro-thumb" style="${thumbStyle(p)}"></span><p>${p.t}</p></div>`).join('');
 return `<div class="intro-panel"><p class="intro-panel__title">요즘 인기있는 포스트예요</p><div class="intro-chips">${chipRow}</div>${rows}</div>`;
}
function menuPreview(){
 const items=recommendMenus(EXAMPLE).map(id=>MENUS[id]).map(m=>`<span class="intro-menu"><img src="${m.icon}" alt=""><span>${m.text.split('\n').join('<br>')}</span></span>`).join('');
 return `<div class="intro-panel"><p class="intro-panel__title">메뉴 즐겨찾기 <small>맞춤 추천 6개</small></p><div class="intro-menus">${items}</div></div>`;
}
const cohortPreview=()=>cohortView(cohortCard({stage:'done',answers:{affiliation:'직장인',housing:'전월세 세입자',has_loan:true,loan_count:1,extra_loan:'전월세 보증금'}}));

export function consentScreen(values,slide=0,enter=true){
 const all=consentItems.every(item=>values[item.id]);
 const row=(id,label,checked,detail=false)=>`<div class="consent-row"><label><input type="checkbox" data-consent="${id}" ${checked?'checked':''}><span class="consent-check" aria-hidden="true"><img class="consent-check__img consent-check__img--${checked?'on':'off'}" src="assets/ic-common-check-circle-${checked?'on':'off'}.svg" alt=""></span><span>${label}</span></label>${detail?`<button class="consent-detail" disabled aria-label="${label} 상세 보기"><img src="assets/ic-common-arrow-right.svg" alt=""></button>`:''}</div>`;
 const sheet=slide>=PAGES,page=Math.min(slide,PAGES-1),{t,d}=SLIDES[page];
 const bar=Array.from({length:PAGES},(_,i)=>`<span class="${i===page?'is-on':''}"></span>`).join('');
 const consent=sheet?`<button type="button" class="intro-dim${enter?' is-entering':''}" data-action="back" aria-label="약관 닫기"></button>
<section class="intro-sheet${enter?' is-entering':''}" role="dialog" aria-modal="true" aria-labelledby="intro-sheet-title"><h2 id="intro-sheet-title">몇 가지만 알려주시면<br>홈을 맞춰드릴게요</h2><p>1분이면 충분해요! 신용점수에 영향 없어요</p>
<div class="consent-rows">${row('all','모두 동의',all,false)}${consentItems.map(item=>row(item.id,item.label,values[item.id],false)).join('')}</div>
<button class="primary intro-sheet__cta" data-action="next" ${canContinueConsent(values)?'':'disabled'}>다음</button></section>`:'';
 return `<div class="screen consent intro" data-slide="${slide}">
<div class="intro-top"${sheet?' inert':''}><button class="cmp-navbar__back" data-action="back" aria-label="이전"><img src="assets/ic-common-arrow-left-24.svg" alt="" width="24" height="24"></button><button class="intro-close" data-action="consent-home" aria-label="닫고 홈으로">✕</button></div>
<div class="intro-bar" aria-label="${page+1} / ${PAGES}">${bar}</div>
<div class="intro-stage"><div class="intro-preview" aria-hidden="true">${[postPreview,menuPreview,cohortPreview][page]()}</div></div>
<div class="intro-copy"><h2>${t}</h2><p>${d}</p></div>
<button class="primary intro-cta" data-action="next"${sheet?' tabindex="-1" aria-hidden="true"':''}>다음</button>${consent}
</div>`;
}
