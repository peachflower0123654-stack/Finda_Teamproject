import test from 'node:test';
import assert from 'node:assert/strict';
import {getTestId,buildRow,readQueue,writeQueue,postRow,sendTestEvent,flushPendingTestEvents,isSecretKey,FLOW_VERSION} from './test-data.js';

const memory=()=>{const map=new Map();return {getItem:k=>map.has(k)?map.get(k):null,setItem:(k,v)=>map.set(k,String(v)),map};};
const ID='11111111-2222-4333-8444-555555555555';
const config={url:'https://demo.supabase.co/',publishableKey:'sb_publishable_test'};

test('test id is created once and reused',()=>{
 const storage=memory();
 assert.equal(getTestId(storage,()=>ID),ID);
 assert.equal(getTestId(storage,()=>'other'),ID);
});

test('rows carry test id, event, payload and flow version',()=>{
 const row=buildRow('quickmenu_done',{selected_menu_ids:['RateCut']},ID);
 assert.equal(row.test_id,ID);assert.equal(row.event,'quickmenu_done');assert.equal(row.flow_version,FLOW_VERSION);
 assert.deepEqual(row.payload.selected_menu_ids,['RateCut']);
 assert.throws(()=>buildRow('Bad Event',{},ID));
});

test('rows carry a unique event id',()=>{
 const a=buildRow('quickmenu_done',{},ID),b=buildRow('quickmenu_done',{},ID);
 assert.match(a.payload.event_id,/^[0-9a-f-]{36}$/);
 assert.notEqual(a.payload.event_id,b.payload.event_id);
 assert.equal(buildRow('quickmenu_done',{},ID,'fixed').payload.event_id,'fixed');
});

test('posts one row to the test_events REST endpoint with the publishable key only',async()=>{
 let call;
 const result=await postRow({a:1},config,async(url,init)=>{call={url,init};return {ok:true,status:201};});
 assert.equal(result,'ok');
 assert.equal(call.url,'https://demo.supabase.co/rest/v1/test_events');
 assert.equal(call.init.headers.apikey,'sb_publishable_test');
 assert.equal(call.init.headers.Prefer,'return=minimal');
 assert.equal(call.init.keepalive,true);
 assert.deepEqual(JSON.parse(call.init.body),{a:1});
 assert.equal(await postRow({a:1},config,async()=>({ok:false,status:409})),'duplicate');
 assert.equal(await postRow({a:1},config,async()=>({ok:false,status:500})),'fail');
 assert.equal(await postRow({a:1},config,async()=>{throw new Error('offline');}),'fail');
});

test('secret and service_role keys are refused',async()=>{
 const role=btoa(JSON.stringify({role:'service_role'})).replace(/=+$/,'');
 assert.equal(isSecretKey('sb_secret_abc'),true);
 assert.equal(isSecretKey(`x.${role}.y`),true);
 assert.equal(isSecretKey('sb_publishable_abc'),false);
 let called=false;
 const result=await postRow({a:1},{...config,publishableKey:'sb_secret_abc'},async()=>{called=true;return {ok:true};});
 assert.equal(result,'fail');assert.equal(called,false);
});

test('the event is queued before sending and removed only after success',async()=>{
 const storage=memory();
 let queuedDuringSend;
 const ok=await sendTestEvent('quickmenu_done',{n:1},{storage,config,makeId:()=>ID,makeEventId:()=>'e1',fetch:async()=>{queuedDuringSend=readQueue(storage).map(r=>r.payload.event_id);return {ok:true,status:201};}});
 assert.equal(ok,true);
 assert.deepEqual(queuedDuringSend,['e1']);
 assert.equal(readQueue(storage).length,0);
});

test('the queue is written synchronously, so leaving the screen right away cannot lose it',()=>{
 const storage=memory();
 sendTestEvent('onboarding_skip',{},{storage,config,makeId:()=>ID,makeEventId:()=>'s1',fetch:()=>new Promise(()=>{})});
 assert.deepEqual(readQueue(storage).map(r=>r.payload.event_id),['s1']);
});

test('failed sends stay queued and are resent on the next visit',async()=>{
 const storage=memory();
 assert.equal(await sendTestEvent('quickmenu_done',{n:1},{storage,config,makeId:()=>ID,makeEventId:()=>'e1',fetch:async()=>({ok:false,status:500})}),false);
 assert.equal(readQueue(storage).length,1);
 const sent=[];
 assert.deepEqual(await flushPendingTestEvents({storage,config,fetch:async(_,init)=>{sent.push(JSON.parse(init.body));return {ok:true,status:201};}}),['e1']);
 assert.deepEqual(sent.map(r=>r.payload.n),[1]);
 assert.equal(sent[0].payload.event_id,'e1');
 assert.equal(readQueue(storage).length,0);
});

test('a row the database already has (409) is cleared instead of resent forever',async()=>{
 const storage=memory();
 writeQueue([buildRow('quickmenu_done',{},ID,'dup')],storage);
 assert.deepEqual(await flushPendingTestEvents({storage,config,fetch:async()=>({ok:false,status:409})}),['dup']);
 assert.equal(readQueue(storage).length,0);
});

test('two sends at once do not post the same row twice',async()=>{
 const storage=memory();
 writeQueue([buildRow('quickmenu_done',{},ID,'old')],storage);
 const posted=[];
 const fetch=async(_,init)=>{posted.push(JSON.parse(init.body).payload.event_id);await new Promise(r=>setTimeout(r,5));return {ok:true,status:201};};
 await Promise.all([flushPendingTestEvents({storage,config,fetch}),sendTestEvent('onboarding_skip',{},{storage,config,makeId:()=>ID,makeEventId:()=>'new',fetch})]);
 assert.deepEqual(posted.sort(),['new','old']);
 assert.equal(readQueue(storage).length,0);
});

test('old queued rows without an event id get one before sending',async()=>{
 const storage=memory();
 writeQueue([{test_id:ID,event:'quickmenu_done',payload:{n:1},flow_version:FLOW_VERSION}],storage);
 let sent;
 await flushPendingTestEvents({storage,config,fetch:async(_,init)=>{sent=JSON.parse(init.body);return {ok:true,status:201};}});
 assert.match(sent.payload.event_id,/^[0-9a-f-]{36}$/);
});

test('without a config nothing is sent and the event waits in the queue',async()=>{
 const storage=memory();
 assert.equal(await sendTestEvent('quickmenu_done',{},{storage,config:null,makeId:()=>ID}),false);
 assert.equal(readQueue(storage).length,1);
 writeQueue(Array.from({length:80},(_,i)=>({i})),storage);
 assert.equal(readQueue(storage).length,50);
});
