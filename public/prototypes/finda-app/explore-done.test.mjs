import test from 'node:test';
import assert from 'node:assert/strict';
import {EXPLORE_DONE,exploreDoneView,showExploreDone} from './explore-done.js';

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
