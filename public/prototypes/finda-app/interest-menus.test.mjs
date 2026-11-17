import test from 'node:test';
import assert from 'node:assert/strict';
import {toggleInterest,matchCount,interestPayload,interestView,interestSheetView,INTEREST_COUNT,INTEREST_TOAST} from './interest-menus.js';
import {MENUS,allMenuSections,recommendMenus,DEFAULT_PROFILE} from './quick-menu-edit.js';

test('picker lists every menu once, without marking the recommended 6',()=>{
 const ids=allMenuSections().flatMap(s=>s.items);
 assert.equal(new Set(ids).size,ids.length);
 assert.deepEqual([...ids].sort(),Object.keys(MENUS).sort());
 const html=interestView();
 assert.equal((html.match(/data-interest=/g)||[]).length,Object.keys(MENUS).length);
 assert.doesNotMatch(html,/맞춤 추천|data-fixed/);
});

test('select up to 6, tap again to remove, 7th shows a toast',()=>{
 let picks=[];
 const ids=Object.keys(MENUS);
 for(const id of ids.slice(0,INTEREST_COUNT))picks=toggleInterest(picks,id).picks;
 assert.equal(picks.length,INTEREST_COUNT);
 const full=toggleInterest(picks,ids[INTEREST_COUNT]);
 assert.deepEqual(full.picks,picks);
 assert.equal(full.toast,INTEREST_TOAST);
 assert.deepEqual(toggleInterest(picks,ids[0]).picks,ids.slice(1,INTEREST_COUNT));
 assert.deepEqual(toggleInterest([],'Unknown').picks,[]);
});

test('done is enabled only with exactly 6',()=>{
 assert.match(interestSheetView(['a','b']),/disabled>4개 더 골라 주세요</);
 assert.match(interestSheetView(['a','b','c','d','e','f']),/class="btn qm-done interest-done"[^>]*>완료</);
 assert.doesNotMatch(interestSheetView(['a','b','c','d','e','f']),/disabled/);
});

test('interest_menus payload carries both lists and the overlap',()=>{
 const recs=recommendMenus(DEFAULT_PROFILE);
 const picks=[recs[0],recs[1],'FAQ','Notice','AgeCalc','PhoneGuard'].filter((id,i,a)=>a.indexOf(id)===i);
 const expected=picks.filter(id=>recs.includes(id)).length;
 assert.equal(matchCount(picks,recs),expected);
 assert.deepEqual(interestPayload(picks,recs),{selected_menu_ids:picks,recommendation_ids:recs,match_count:expected});
});
