import test from 'node:test';
import assert from 'node:assert/strict';
import {createExploreTrigger,CLICK_LIMIT,DWELL_LIMIT_SEC} from './explore-trigger.js';

const clicks=(t,n,kind='other')=>{let last;for(let i=0;i<n;i++)last=t.click(kind);return last;};

test('기준은 누름 5번, 체류 60초',()=>{assert.equal(CLICK_LIMIT,5);assert.equal(DWELL_LIMIT_SEC,60);});

test('일반 요소로 5번째 누르면 바로 종료, 그 전에는 계속',()=>{
 const t=createExploreTrigger();
 assert.equal(clicks(t,4),null);
 assert.equal(t.click('other'),'end');
 assert.deepEqual(t.stats(),{click_count:5,dwell_sec:0});
});

test('5번째가 포스트 칩·글이면 대기: 포스트 안에서는 계속, 포스트 밖을 누르면 종료',()=>{
 const t=createExploreTrigger();
 clicks(t,4);
 assert.equal(t.click('post'),'wait');
 assert.equal(t.click('post'),null);
 assert.equal(t.click('post'),null);
 assert.equal(t.click('other'),'end');
 assert.equal(t.clicks,8);
});

test('5번째가 퀵메뉴 열기면 대기: 편집 안 하고 닫으면 종료',()=>{
 const t=createExploreTrigger();
 clicks(t,4);
 assert.equal(t.click('quickmenu'),'wait');
 assert.equal(t.quickMenuClosed({edited:false}),'end');
});

test('퀵메뉴 편집에 들어갔다 그냥 나오면 계속 탐색, 다음 일반 누름에 종료',()=>{
 const t=createExploreTrigger();
 clicks(t,4);t.click('quickmenu');
 assert.equal(t.quickMenuClosed({edited:true}),null);
 assert.equal(t.pending,null);
 assert.equal(t.click('other'),'end');
});

test('퀵메뉴 편집 [완료]는 기존 종료 지점이 맡아서 여기서는 종료하지 않아요',()=>{
 const t=createExploreTrigger();
 clicks(t,4);t.click('quickmenu');
 assert.equal(t.quickMenuClosed({edited:true,completed:true}),null);
});

test('5번 전에 연 퀵메뉴를 닫는 건 아무 영향 없어요',()=>{
 const t=createExploreTrigger();
 t.click('quickmenu');
 assert.equal(t.quickMenuClosed({edited:false}),null);
});

test('끝까지 스크롤 종료는 60초 이상 머물렀거나 5번 이상 눌렀을 때만',()=>{
 const t=createExploreTrigger();
 assert.equal(t.scrollEndReady(),false);
 t.tick(59);assert.equal(t.scrollEndReady(),false);
 t.tick(1);assert.equal(t.scrollEndReady(),true);
 const u=createExploreTrigger();clicks(u,4,'post');u.click('post');
 assert.equal(u.scrollEndReady(),true);
});
