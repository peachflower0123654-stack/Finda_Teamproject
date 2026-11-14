import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import {MENUS,RECOMMENDED,SECTIONS,TOAST_FIXED,TOAST_MAX,toggleMenu,sheetButton,popupExtraSlots,savePicks,getSavedPicks,popupMode} from './quick-menu-edit.js';
import {noobPopupView,popupView} from './quick-menu-views.js';

test('edit screen has seven sections and every menu has an icon file',()=>{
 assert.deepEqual(SECTIONS.map(s=>s.title),['맞춤 추천 6개','대출','카드','나의 금융 정보','사업자','부가 서비스','소식']);
 assert.equal(SECTIONS[0].note,'내 정보에 맞춰 고정돼요');
 assert.equal(RECOMMENDED.length,6);
 for(const id of SECTIONS.flatMap(s=>s.items)){
  assert.ok(MENUS[id],id);
  assert.ok(existsSync(new URL(MENUS[id].icon,import.meta.url)),MENUS[id].icon);
 }
});

test('recommended menus cannot be picked and show a toast',()=>{
 const result=toggleMenu([],'CreditScore');
 assert.deepEqual(result.picks,[]);
 assert.equal(result.toast,TOAST_FIXED);
});

test('other menus toggle on and off',()=>{
 let {picks,toast}=toggleMenu([],'RateCut');
 assert.deepEqual(picks,['RateCut']);assert.equal(toast,null);
 ({picks,toast}=toggleMenu(picks,'RateCut'));
 assert.deepEqual(picks,[]);assert.equal(toast,null);
});

test('a third pick is refused with the max toast',()=>{
 const result=toggleMenu(['RateCut','DepositCompare'],'FAQ');
 assert.deepEqual(result.picks,['RateCut','DepositCompare']);
 assert.equal(result.toast,TOAST_MAX);
 assert.deepEqual(toggleMenu(['RateCut','DepositCompare'],'RateCut').picks,['DepositCompare']);
});

test('sheet button follows the pick count',()=>{
 assert.deepEqual(sheetButton([]),{label:'추가하기',disabled:true});
 assert.deepEqual(sheetButton(['RateCut']),{label:'1개 추가하기',disabled:false});
 assert.deepEqual(sheetButton(['RateCut','FAQ']),{label:'완료',disabled:false});
});

test('saved picks fill the two popup slots in order',()=>{
 savePicks([]);
 assert.deepEqual(popupExtraSlots(getSavedPicks()),[null,null]);
 savePicks(['DepositCompare']);
 assert.deepEqual(popupExtraSlots(getSavedPicks()).map(m=>m?.id??null),['DepositCompare',null]);
 savePicks(['DepositCompare','RateCut','FAQ','LoanJeonse']);
 assert.deepEqual(getSavedPicks(),['DepositCompare','RateCut']);
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
