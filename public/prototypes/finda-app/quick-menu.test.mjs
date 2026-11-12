import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import {MENUS,RECOMMENDED,SECTIONS,TOAST_FIXED,TOAST_MAX,toggleMenu,sheetButton,popupExtraSlots,savePicks,getSavedPicks} from './quick-menu-edit.js';

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
