import test from 'node:test';import assert from 'node:assert/strict';import {POSTS,CATS,PRESETS} from './post-data.js';import {chipOrder,scorePost,recommend,profileFromAnswers} from './post-personalization.js';
const combos=[];for(let a=0;a<5;a++)for(let h=0;h<4;h++)for(let n=0;n<3;n++)combos.push([a,h,n]);
test('POSTS 350개를 V4.0에서 그대로 옮겼다',()=>{assert.equal(POSTS.length,350);assert.equal(POSTS[0].id,'P-001');assert.equal(POSTS.at(-1).id,'P-350');assert.ok(POSTS.every(p=>CATS.includes(p.c)&&p.s10.length===11));});
test('60개 조합 모두 MY + 7개 칩, 칩마다 3개, 홈 24칸에 같은 글이 없다',()=>{for(const [a,h,n] of combos){const {chips}=recommend(a,h,n);assert.deepEqual(chips.map(c=>c.name).slice(1).sort(),[...CATS].sort());assert.equal(chips[0].name,'MY');assert.ok(chips.every(c=>c.posts.length===3));const ids=chips.flatMap(c=>c.posts.map(p=>p.id));assert.equal(new Set(ids).size,24,`${a},${h},${n}`);}});
test('칩 순서는 주거 → 대출 건수 → 소속 → 비즈니스 순서, 금융사고는 맨 끝',()=>{assert.deepEqual(chipOrder(1,0,1),['부동산','대출','사용팁','생활','신용점수','정책','금융사고']);assert.deepEqual(chipOrder(...PRESETS[1].slice(1)),['사용팁','정책','생활','대출','부동산','신용점수','금융사고']);assert.deepEqual(chipOrder(...PRESETS[2].slice(1)),['부동산','신용점수','대출','정책','생활','사용팁','금융사고']);});
test('점수 = 해당 칸 평균, 공통 정보 상한 6, 시기 지남 상한 3',()=>{const p={s10:[7,7,7,7,7,7,7,7,7,7,7],st:'',ur:'',bm:0,fo:0};assert.equal(scorePost(p,0,0,0).score,6);assert.equal(scorePost({...p,s10:[9,0,0,0,0,6,0,0,3,0,0]},0,0,0).score,6);assert.equal(scorePost({...p,s10:[10,0,0,0,0,9,0,0,9,0,0],st:'2025'},0,0,0).score,3);assert.equal(scorePost({...p,s10:[10,0,0,0,0,9,0,0,9,0,0]},0,3,0).raw,23);});
test('온보딩 답을 소속·주거·대출 건수로 바꾼다',()=>{assert.deepEqual(profileFromAnswers({affiliation:'직장인',housing:'전월세 세입자',ownership:false,count:''}),{a:1,h:0,n:0});assert.deepEqual(profileFromAnswers({affiliation:'직장인',housing:'부모.가족과 함께',ownership:true,count:'2'}),{a:1,h:1,n:1});assert.deepEqual(profileFromAnswers({affiliation:'',housing:'',ownership:true,count:'5'}),{a:1,h:0,n:2});assert.deepEqual(profileFromAnswers({affiliation:'',housing:'',ownership:null,count:''}),{a:1,h:0,n:1});});

test('no-onboarding feed follows Finda default order with a policy chip and no MY',async()=>{
 const {defaultFeed,DEFAULT_CHIP_ORDER}=await import('./post-personalization.js');
 const {POSTS}=await import('./post-data.js');
 const {order,chips}=defaultFeed();
 assert.deepEqual(order,['사용팁','대출','신용점수','부동산','생활','정책','금융사고']);
 assert.ok(!chips.some(c=>c.name==='MY'));
 for(const c of chips){
  assert.equal(c.posts.length,3,c.name);
  const expected=POSTS.filter(p=>p.c===c.name).sort((x,y)=>x.fo-y.fo).slice(0,3).map(p=>p.id);
  assert.deepEqual(c.posts.map(p=>p.id),expected,c.name);
 }
 assert.equal(chips[0].posts[0].t,'[팩트체크] 대출조회만 해도 신용점수가 떨어질까?');
 assert.equal(DEFAULT_CHIP_ORDER.length,7);
});
