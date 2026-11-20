import test from 'node:test';
import assert from 'node:assert/strict';
import {EXPLORE_DONE,EXPLORE_FINISH,exploreDoneView,exploreFinishView,showExploreDone,atScrollEnd,EXIT_POINTS,isExitPost,postClickPayload,homeViewPayload,resetHomeView} from './explore-done.js';

test('explore-done modal asks for 6 menus, then the finish modal sends testers back to Maze',()=>{
 const intro=exploreDoneView();
 assert.match(intro,/role="alertdialog"/);
 assert.match(intro,new RegExp(EXPLORE_DONE.title));
 assert.match(intro,/메뉴 6개를 골라 주세요/);
 assert.match(intro,/class="btn explore-done-ok"[^>]*>메뉴 고르기</);
 const finish=exploreFinishView();
 assert.match(finish,new RegExp(EXPLORE_FINISH.title));
 assert.match(finish,/Maze 창으로 돌아가<br>\[다음\]을 눌러 주세요\./);
 assert.match(finish,/class="btn explore-done-ok"[^>]*>확인</);
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

test('only MY chip posts are exit point ②; other chips are logged only',()=>{
 assert.equal(isExitPost('MY'),true);
 for(const chip of ['정책','대출','부동산','생활','신용점수','사용팁','금융사고'])assert.equal(isExitPost(chip),false,chip);
});

test('exit point names match the Supabase event contract',()=>{
 assert.deepEqual(EXIT_POINTS,{scrollEnd:'scroll_end',myPost:'my_post_click',quickMenu:'quickmenu_done',clickCount:'click_count'});
 for(const name of Object.values(EXIT_POINTS))assert.match(name,/^[a-z0-9_]{1,64}$/);
});

test('post_click payload records chip, post, position and the MY 3 slots',()=>{
 const myPostIds=[11,22,33];
 const payload=postClickPayload({chip:'정책',post:{id:42,c:'정책',t:'제목'},position:2,myPostIds});
 assert.deepEqual(payload,{chip:'정책',post_id:42,post_category:'정책',position:2,my_post_ids:[11,22,33]});
 assert.notEqual(payload.my_post_ids,myPostIds);
 assert.equal(postClickPayload({chip:'MY',post:{id:7},position:1}).post_category,null);
});

test('home_ob_view is sent once per MY set, again when MY changes',()=>{
 resetHomeView();
 const recs=['A','B','C','D','E','F'];
 assert.deepEqual(homeViewPayload(['P-1','P-2','P-3'],recs),{my_post_ids:['P-1','P-2','P-3'],recommendation_ids:recs});
 assert.equal(homeViewPayload(['P-1','P-2','P-3'],recs),null);
 assert.ok(homeViewPayload(['P-4','P-2','P-3'],recs));
 assert.equal(homeViewPayload([],recs),null);
});
