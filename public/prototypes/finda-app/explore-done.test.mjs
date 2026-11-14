import test from 'node:test';
import assert from 'node:assert/strict';
import {EXPLORE_DONE,exploreDoneView,showExploreDone,atScrollEnd} from './explore-done.js';

test('explore-done modal tells testers to go back to Maze',()=>{
 const html=exploreDoneView();
 assert.match(html,/role="alertdialog"/);
 assert.match(html,new RegExp(EXPLORE_DONE.title));
 assert.match(html,/Maze 창으로 돌아가<br>\[다음\]을 눌러 주세요\./);
 assert.match(html,/class="btn explore-done-ok"[^>]*>확인</);
});

test('showExploreDone does nothing without a root',()=>{
 assert.equal(showExploreDone(null),false);
});

test('modal only opens on the onboarded home (OB_NoMD)',()=>{
 for(const homeState of ['NoOB_NoMD','InOB_NoMD','OB_MD','']){
  const root={dataset:{homeState},querySelector:()=>null};
  assert.equal(showExploreDone(root),false,homeState);
 }
});

test('scroll end is the bottom of a scrollable home',()=>{
 assert.equal(atScrollEnd({scrollTop:1196,clientHeight:780,scrollHeight:1980}),true);
 assert.equal(atScrollEnd({scrollTop:1000,clientHeight:780,scrollHeight:1980}),false);
 assert.equal(atScrollEnd({scrollTop:0,clientHeight:780,scrollHeight:780}),false);
});
