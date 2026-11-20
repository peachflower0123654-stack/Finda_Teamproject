import test from 'node:test';
import assert from 'node:assert/strict';
import {viewportSize,watchViewport} from './viewport-fit.mjs';

test('visible mobile dimensions win over an inflated layout viewport',()=>{
 assert.deepEqual(viewportSize({innerWidth:360,innerHeight:639,visualViewport:{width:320,height:568,scale:1}}),{width:320,height:568});
});
test('initial mobile page fitting and pinch magnification retain device CSS size',()=>{
 const initial=viewportSize({innerWidth:360,innerHeight:639,visualViewport:{width:360,height:639,scale:8/9}});
 assert.equal(initial.width,320);assert.equal(initial.height,568);
 assert.deepEqual(viewportSize({innerWidth:360,innerHeight:780,visualViewport:{width:180,height:390,scale:2}}),{width:360,height:780});
});
test('browsers without visualViewport retain the existing window dimensions',()=>{
 assert.deepEqual(viewportSize({innerWidth:412,innerHeight:915}),{width:412,height:915});
 assert.deepEqual(viewportSize({innerWidth:360,innerHeight:780,visualViewport:{width:0,height:0,scale:0}}),{width:360,height:780});
});
test('viewport changes coalesce until the next frame and unsubscribe cleanly',()=>{
 const events=new Map(),visualEvents=new Map(),frames=new Map();let id=0,updates=0;
 const host={addEventListener:(k,f)=>events.set(k,f),removeEventListener:k=>events.delete(k),requestAnimationFrame:f=>(frames.set(++id,f),id),cancelAnimationFrame:n=>frames.delete(n),visualViewport:{addEventListener:(k,f)=>visualEvents.set(k,f),removeEventListener:k=>visualEvents.delete(k)}};
 const stop=watchViewport(()=>updates++,host);
 events.get('resize')();visualEvents.get('resize')();assert.equal(frames.size,1);
 const first=frames.values().next().value;frames.clear();first();assert.equal(updates,1);
 events.get('orientationchange')();assert.equal(frames.size,1);stop();assert.equal(frames.size,0);assert.equal(events.size,0);assert.equal(visualEvents.size,0);
});
