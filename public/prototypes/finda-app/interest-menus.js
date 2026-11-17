// 관심 메뉴 6개 고르기 (11/12 딥톡 일치율 테스트, B안: Maze 대신 앱 안에서 받아요).
// 탐색 완료 모달 [메뉴 고르기] 뒤에 떠요. 고른 6개를 그 사람의 맞춤 퀵메뉴 6개와 같은 test_id로 저장해서 일치율을 바로 계산해요.
// 맞춤 추천이 어떤 메뉴인지 드러나지 않게, 전체 메뉴를 핀다 그룹 순서대로 같은 모양으로 보여 줘요.
// 화면은 퀵메뉴 편집(Figma 4329:16274)의 섹션·아이콘·하단 시트 구조를 그대로 써요.
import {MENUS,allMenuSections} from './quick-menu-edit.js';

export const INTEREST_COUNT=6;
export const INTEREST_TOAST='6개까지 고를 수 있어요\n다른 메뉴를 빼고 골라 주세요';

// 누르면 고르기, 한 번 더 누르면 해제. 6개가 차면 더 고를 수 없고 안내 문구를 돌려줘요.
export function toggleInterest(picks,id){
 if(!MENUS[id])return {picks};
 if(picks.includes(id))return {picks:picks.filter(x=>x!==id)};
 if(picks.length>=INTEREST_COUNT)return {picks,toast:INTEREST_TOAST};
 return {picks:[...picks,id]};
}
export const matchCount=(picks,recommended)=>picks.filter(id=>recommended.includes(id)).length;
// interest_menus payload. match_count는 확인용이고, 분석은 두 목록으로 다시 계산할 수 있어요.
export const interestPayload=(picks,recommended)=>({selected_menu_ids:[...picks],recommendation_ids:[...recommended],match_count:matchCount(picks,recommended)});

const lines=text=>text.split('\n').join('<br>');
const menuButton=(id,picks)=>`<button type="button" class="qm-item" data-interest="${id}" aria-label="${MENUS[id].label}" aria-pressed="${picks.includes(id)}"><span class="qm-icon"><img src="${MENUS[id].icon}" alt=""></span><span class="qm-label">${lines(MENUS[id].text)}</span></button>`;

export function interestSheetView(picks){
 const left=INTEREST_COUNT-picks.length;
 return `<div class="qm-sheet-title"><h3>고른 메뉴</h3><p>${picks.length} / ${INTEREST_COUNT}</p></div>
<button type="button" class="btn qm-done interest-done" data-hierarchy="primary"${left?' disabled':''}>${left?`${left}개 더 골라 주세요`:'완료'}</button>`;
}

export function interestView(picks=[]){
 return `<section class="qm-edit interest-menus" role="dialog" aria-modal="true" aria-labelledby="interest-title" aria-describedby="interest-guide">
<header class="qm-topbar"><h2 id="interest-title">관심 메뉴 고르기</h2></header>
<p class="interest-guide" id="interest-guide">핀다에서 자주 쓸 것 같은 메뉴를<br>${INTEREST_COUNT}개 골라 주세요.</p>
<div class="qm-scroll">${allMenuSections().map(({title,items})=>`<section class="qm-section"><div class="qm-section-title"><h3>${title}</h3></div><div class="qm-row">${items.map(id=>menuButton(id,picks)).join('')}</div></section>`).join('')}</div>
<div class="qm-sheet interest-sheet" role="region" aria-label="고른 메뉴">${interestSheetView(picks)}</div>
<div class="qm-toast" role="status" aria-live="polite" hidden><svg width="28" height="28" viewBox="0 0 28 28" aria-hidden="true"><circle cx="14" cy="14" r="9.625" fill="var(--ds-primary)"/><rect x="13" y="8.75" width="2" height="7" rx="1" fill="#fff"/><circle cx="14" cy="18.6" r="1.2" fill="#fff"/></svg><p></p></div>
</section>`;
}
