import test from 'node:test';
import assert from 'node:assert/strict';
import {getTestId,buildRow,readQueue,writeQueue,postRows,sendTestEvent,isSecretKey,FLOW_VERSION} from './test-data.js';

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

test('posts to the test_events REST endpoint with the publishable key only',async()=>{
 let call;
 const ok=await postRows([{a:1}],config,async(url,init)=>{call={url,init};return {ok:true};});
 assert.equal(ok,true);
 assert.equal(call.url,'https://demo.supabase.co/rest/v1/test_events');
 assert.equal(call.init.headers.apikey,'sb_publishable_test');
 assert.equal(call.init.headers.Prefer,'return=minimal');
});

test('secret and service_role keys are refused',async()=>{
 const role=btoa(JSON.stringify({role:'service_role'})).replace(/=+$/,'');
 assert.equal(isSecretKey('sb_secret_abc'),true);
 assert.equal(isSecretKey(`x.${role}.y`),true);
 assert.equal(isSecretKey('sb_publishable_abc'),false);
 let called=false;
 const ok=await postRows([{a:1}],{...config,publishableKey:'sb_secret_abc'},async()=>{called=true;return {ok:true};});
 assert.equal(ok,false);assert.equal(called,false);
});

test('failed sends are queued and flushed with the next event',async()=>{
 const storage=memory();
 assert.equal(await sendTestEvent('quickmenu_done',{n:1},{storage,config,makeId:()=>ID,fetch:async()=>({ok:false})}),false);
 assert.equal(readQueue(storage).length,1);
 let sent;
 assert.equal(await sendTestEvent('quickmenu_done',{n:2},{storage,config,makeId:()=>ID,fetch:async(_,init)=>{sent=JSON.parse(init.body);return {ok:true};}}),true);
 assert.deepEqual(sent.map(r=>r.payload.n),[1,2]);
 assert.equal(readQueue(storage).length,0);
});

test('without a config nothing is sent and the event waits in the queue',async()=>{
 const storage=memory();
 assert.equal(await sendTestEvent('quickmenu_done',{},{storage,config:null,makeId:()=>ID}),false);
 assert.equal(readQueue(storage).length,1);
 writeQueue(Array.from({length:80},(_,i)=>({i})),storage);
 assert.equal(readQueue(storage).length,50);
});
