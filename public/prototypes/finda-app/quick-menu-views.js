// 퀵메뉴 팝업·편집 화면 마크업. 상태는 quick-menu-edit.js, 이벤트는 quick-menu-dialog.js에 있어요.
import {MENUS,popupRecommended,sections,popupExtraSlots,sheetButton,MAX_PICKS} from './quick-menu-edit.js';

const lines=text=>text.split('\n').join('<br>');
const closeButton='<button class="quick-menu-close" type="button" aria-label="퀵메뉴 닫기"><span aria-hidden="true"></span></button>';
const emptyIcon='<span class="qm-empty-icon" aria-hidden="true"></span>';

// pop_Home_QuickMenu (Figma 4329:18315 / 4333:7944): 맞춤 추천 6개 + 추가 2칸 + [편집하기]
export function popupView(saved){
 const fixed=popupRecommended().map(([id,text])=>`<span class="quick-menu-item"><img src="${MENUS[id].icon}" alt=""><span>${lines(text)}</span></span>`);
 const extra=popupExtraSlots(saved).map(menu=>menu
  ?`<span class="quick-menu-item"><img src="${menu.icon}" alt=""><span>${lines(menu.text)}</span></span>`
  :`<button type="button" class="quick-menu-item is-empty quick-menu-add" aria-label="퀵메뉴 추가">${emptyIcon}<span>추가</span></button>`);
 const items=[...fixed,...extra];
 return `<section class="quick-menu-dialog" role="dialog" aria-modal="true" aria-label="메뉴 즐겨찾기">
<header><h2>메뉴 즐겨찾기</h2>${closeButton}</header>
<div class="quick-menu-grid">${items.slice(0,4).join('')}</div>
<div class="quick-menu-grid">${items.slice(4).join('')}</div>
<button type="button" class="btn quick-menu-edit" data-hierarchy="tertiary" data-size="medium">편집하기</button>
</section>`;
}

// pop_Home_QuickMenu/Default (Figma 4509:7660): 온보딩 전(NoOB·InOB)이라 맞춤 메뉴가 없을 때
export function noobPopupView(){
 return `<section class="quick-menu-dialog is-noob" role="dialog" aria-modal="true" aria-label="메뉴 즐겨찾기">
<header><h2>메뉴 즐겨찾기</h2>${closeButton}</header>
<div class="quick-menu-empty"><img src="assets/ic-quick-menu.svg" alt="" width="56" height="56"><h3>아직 맞춤 메뉴가 없어요</h3><p>몇 가지만 알려 주시면<br>자주 쓸 메뉴를 골라 드릴게요</p></div>
<div class="quick-menu-actions"><button type="button" class="btn quick-menu-start" data-hierarchy="primary" data-size="medium" data-action="start">1분 만에 맞춤 메뉴 받기</button><button type="button" class="quick-menu-browse">먼저 둘러볼게요</button></div>
</section>`;
}

const menuButton=(id,picks,fixed)=>{
 const menu=MENUS[id];
 const state=fixed?'data-fixed="true" aria-describedby="qm-fixed-note"':`aria-pressed="${picks.includes(id)}"`;
 return `<button type="button" class="qm-item" data-menu="${id}" aria-label="${menu.label}" ${state}><span class="qm-icon"><img src="${menu.icon}" alt=""></span><span class="qm-label">${lines(menu.text)}</span></button>`;
};

const sectionView=({title,note,fixed,items},picks)=>`<section class="qm-section">
<div class="qm-section-title"><h3>${title}</h3>${note?`<p id="qm-fixed-note">${note}</p>`:''}</div>
<div class="qm-row">${items.map(id=>menuButton(id,picks,fixed)).join('')}</div>
</section>`;

// 하단 바텀시트 "내가 고른 메뉴" (Figma cmp_Menu_SelectedSheet 4350:8146)
export function sheetView(picks){
 const slots=Array.from({length:MAX_PICKS},(_,i)=>{
  const menu=MENUS[picks[i]];
  return menu
   ?`<li class="qm-pick"><button type="button" class="qm-pick-remove" data-menu="${menu.id}" aria-label="${menu.label} 선택 해제"><span class="qm-icon"><img src="${menu.icon}" alt=""></span><span class="qm-label">${lines(menu.text)}</span></button></li>`
   :`<li class="qm-pick is-empty"><span class="qm-icon">${emptyIcon}</span><span class="qm-label">추가</span></li>`;
 }).join('');
 const button=sheetButton(picks);
 return `<div class="qm-sheet-title"><h3>내가 고른 메뉴</h3><p>${picks.length} / ${MAX_PICKS}</p></div>
<ul class="qm-picks">${slots}</ul>
<button type="button" class="btn qm-done" data-hierarchy="primary"${button.disabled?' disabled':''}>${button.label}</button>`;
}

// 퀵메뉴 편집_바텀시트형 (Figma 4329:16274)
export function editView(picks){
 return `<section class="qm-edit" role="dialog" aria-modal="true" aria-label="퀵메뉴 편집">
<header class="qm-topbar"><button type="button" class="qm-back" aria-label="뒤로가기"><svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true"><path d="M19 9l-7 7 7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button><h2>퀵메뉴 편집</h2></header>
<div class="qm-scroll">${sections().map(section=>sectionView(section,picks)).join('')}</div>
<div class="qm-sheet" role="region" aria-label="내가 고른 메뉴">${sheetView(picks)}</div>
<div class="qm-toast" role="status" aria-live="polite" hidden><svg width="28" height="28" viewBox="0 0 28 28" aria-hidden="true"><circle cx="14" cy="14" r="9.625" fill="var(--ds-primary)"/><rect x="13" y="8.75" width="2" height="7" rx="1" fill="#fff"/><circle cx="14" cy="18.6" r="1.2" fill="#fff"/></svg><p></p></div>
</section>`;
}
