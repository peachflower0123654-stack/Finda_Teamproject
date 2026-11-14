import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import {MENUS,GROUPS,sections,getRecommended,setQuickMenuProfile,recommendMenus,DEFAULT_PROFILE,popupRecommended,TOAST_FIXED,TOAST_MAX,toggleMenu,sheetButton,popupExtraSlots,savePicks,getSavedPicks,popupMode} from './quick-menu-edit.js';
import {noobPopupView,popupView} from './quick-menu-views.js';

// 11/7 노션 퀵메뉴 로직 예시 3명과 같아야 해요.
const label=ids=>ids.map(id=>MENUS[id].label);
test('quick menu top 6 follows the 11/7 scores for 지수 · 민호 · 영자',()=>{
 assert.deepEqual(label(recommendMenus({a:1,h:0,n:1})),['전세대출','대출받기','대출 갈아타기','전월세대출 가이드','전세·월세 비교 계산기','금리인하 자동신청']);
 assert.deepEqual(label(recommendMenus({a:0,h:1,n:0})),['전월세대출 가이드','머니메이트','신용점수','예적금 비교','신용카드 찾기','전세·월세 비교 계산기']);
 assert.deepEqual(label(recommendMenus({a:4,h:2,n:2})),['내 자산','상환·결제 일정','주택담보대출','금융 스팸 차단','대출 갈아타기','신용점수']);
 const combos=new Set();
 for(let a=0;a<5;a++)for(let h=0;h<4;h++)for(let n=0;n<3;n++)combos.add(recommendMenus({a,h,n}).slice().sort().join());
 assert.equal(combos.size,50);
});

test('edit screen hides the top 6 from the groups and drops empty groups',()=>{
 setQuickMenuProfile({a:0,h:1,n:0});
 const list=sections();
 assert.equal(list[0].title,'맞춤 추천 6개');
 assert.equal(list[0].note,'내 정보에 맞춰 고정돼요');
 assert.deepEqual(list[0].items,getRecommended());
 assert.ok(!list.some(s=>s.title==='신용관리'),'민호는 신용점수가 추천으로 올라가 신용관리 그룹이 빠져요');
 const all=list.flatMap(s=>s.items);
 assert.equal(all.length,new Set(all).size,'한 메뉴는 한 번만');
 assert.equal(all.length,Object.keys(MENUS).length);
 for(const id of all){
  assert.ok(MENUS[id],id);
  assert.ok(existsSync(new URL(MENUS[id].icon,import.meta.url)),MENUS[id].icon);
 }
 for(const s of list.slice(1))assert.ok(GROUPS.includes(s.title),s.title);
 assert.equal(popupRecommended().length,6);
 setQuickMenuProfile(DEFAULT_PROFILE);
});

test('recommended menus cannot be picked and show a toast',()=>{
 const result=toggleMenu([],getRecommended()[0]);
 assert.deepEqual(result.picks,[]);
 assert.equal(result.toast,TOAST_FIXED);
});

test('other menus toggle on and off',()=>{
 let {picks,toast}=toggleMenu([],'AgeCalc');
 assert.deepEqual(picks,['AgeCalc']);assert.equal(toast,null);
 ({picks,toast}=toggleMenu(picks,'AgeCalc'));
 assert.deepEqual(picks,[]);assert.equal(toast,null);
});

test('a third pick is refused with the max toast',()=>{
 const result=toggleMenu(['AgeCalc','DepositCompare'],'FAQ');
 assert.deepEqual(result.picks,['AgeCalc','DepositCompare']);
 assert.equal(result.toast,TOAST_MAX);
 assert.deepEqual(toggleMenu(['AgeCalc','DepositCompare'],'AgeCalc').picks,['DepositCompare']);
});

test('sheet button follows the pick count',()=>{
 assert.deepEqual(sheetButton([]),{label:'추가하기',disabled:true});
 assert.deepEqual(sheetButton(['AgeCalc']),{label:'1개 추가하기',disabled:false});
 assert.deepEqual(sheetButton(['AgeCalc','FAQ']),{label:'완료',disabled:false});
});

test('saved picks fill the two popup slots in order',()=>{
 savePicks([]);
 assert.deepEqual(popupExtraSlots(getSavedPicks()),[null,null]);
 savePicks(['DepositCompare']);
 assert.deepEqual(popupExtraSlots(getSavedPicks()).map(m=>m?.id??null),['DepositCompare',null]);
 savePicks(['DepositCompare','AgeCalc','FAQ','LoanJeonse']);
 assert.deepEqual(getSavedPicks(),['DepositCompare','AgeCalc']);
 savePicks([]);
});

test('only onboarded homes get the personalized popup',()=>{
 assert.equal(popupMode('OB_NoMD'),'personal');
 assert.equal(popupMode('OB_MD'),'personal');
 assert.equal(popupMode('NoOB_NoMD'),'noob');
 assert.equal(popupMode('InOB_NoMD'),'noob');
 assert.equal(popupMode(undefined),'noob');
});

test('no-onboarding popup shows the empty state and sends users to onboarding',()=>{
 const html=noobPopupView();
 assert.match(html,/아직 맞춤 메뉴가 없어요/);
 assert.match(html,/data-action="start"[^>]*>1분 만에 맞춤 메뉴 받기/);
 assert.match(html,/class="quick-menu-browse"[^>]*>먼저 둘러볼게요/);
 assert.match(html,/class="quick-menu-close"/);
 assert.doesNotMatch(html,/quick-menu-item|편집하기/);
 assert.ok(existsSync(new URL('assets/ic-quick-menu.svg',import.meta.url)));
 assert.match(popupView([]),/편집하기/);
});
