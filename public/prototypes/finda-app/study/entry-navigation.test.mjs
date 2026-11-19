import test from 'node:test';
import assert from 'node:assert/strict';
import {createTestNavigation,isTestEntry} from './entry-navigation.mjs';

function fakeBrowser(href){
 const entries=[{href,state:{maze:'preserve'}}],listeners=new Set();let cursor=0;
 const browser={get location(){return new URL(entries[cursor].href);},
  addEventListener(type,listener){if(type==='popstate')listeners.add(listener);},
  removeEventListener(type,listener){listeners.delete(listener);},
 };
 const go=offset=>{cursor+=offset;for(const listener of listeners)listener({state:entries[cursor].state});};
 browser.history={get state(){return structuredClone(entries[cursor].state);},
  replaceState(state,unused,url){entries[cursor]={href:url,state:structuredClone(state)};},
  pushState(state,unused,url){entries.splice(++cursor);entries.push({href:url,state:structuredClone(state)});},
  back(){go(-1);},forward(){go(1);},get length(){return entries.length;},
 };
 return browser;
}
const home={screen:'home'};
const allowed=new Set(['home','all','find-loan']);
const routeOf=state=>allowed.has(state.screen)?state.screen:null;
const stateFor=route=>({...home,screen:allowed.has(route)?route:'home'});

test('As-is starts onboarding by default and retains progress on Reload and Back/Forward',()=>{
 const browser=fakeBrowser('https://example.github.io/Finda_Teamproject/asis/?lwt=true');
 const screens=new Set(['splash','intro','security','home']);
 let navigation,state;
 const options={variant:'asis',defaultRoute:'splash',browser,
  routeOf:s=>screens.has(s.screen)?s.screen:null,
  stateFor:screen=>({screen:screens.has(screen)?screen:'home',history:[],review:false}),
  onRestore:s=>{state=s;navigation.record(s);},
 };
 navigation=createTestNavigation(options);state=navigation.initial();
 assert.equal(state.screen,'splash');
 assert.equal(browser.location.searchParams.get('lwt'),'true');
 state={screen:'intro',history:['splash'],review:false};navigation.record(state);
 navigation.record({screen:'security',history:['splash','intro'],review:false});
 browser.history.back();assert.equal(state.screen,'intro');
 browser.history.forward();assert.equal(state.screen,'security');
 navigation.destroy();navigation=createTestNavigation(options);
 assert.deepEqual(navigation.initial(),{screen:'security',history:['splash','intro'],review:false});
 const direct=fakeBrowser('https://example.test/asis/?screen=home');
 const explicit=createTestNavigation({...options,browser:direct});
 assert.equal(explicit.initial().screen,'home');
});

test('direct screen URLs stay in the entry and preserve Maze query parameters',()=>{
 const browser=fakeBrowser('https://example.github.io/Finda_Teamproject/tobe/?lwt=true&screen=all');
 const navigation=createTestNavigation({variant:'tobe',routeOf,stateFor,onRestore(){},browser});
 assert.equal(navigation.initial().screen,'all');
 navigation.record({...home,screen:'find-loan',existingReturnTo:'all'});
 assert.equal(browser.location.pathname,'/Finda_Teamproject/tobe/');
 assert.equal(browser.location.searchParams.get('lwt'),'true');
 assert.equal(browser.location.searchParams.get('screen'),'find-loan');
 assert.equal(browser.history.state.maze,'preserve');
});

test('Back, Forward and Reload retain answers and detail return origin without new localStorage writes',()=>{
 const browser=fakeBrowser('https://example.test/tobe/');
 let navigation,state;
 const options={variant:'tobe',routeOf,stateFor,browser,onRestore:s=>{state=s;navigation.record(state);}};
 navigation=createTestNavigation(options);state=navigation.initial();
 const answered={...home,homeState:'OB_NoMD',affiliation:'selected',count:'2',principal:'1234567'};
 navigation.record(answered);navigation.record({...answered,screen:'all'});
 navigation.record({...answered,screen:'find-loan',existingReturnTo:'all'});
 browser.history.back();assert.equal(state.screen,'all');assert.equal(state.count,'2');
 browser.history.forward();assert.equal(state.screen,'find-loan');assert.equal(state.existingReturnTo,'all');
 navigation.destroy();navigation=createTestNavigation(options);state=navigation.initial();
 assert.equal(state.principal,'1234567');assert.equal(state.existingReturnTo,'all');
 assert.equal(browser.history.length,3);
 assert.equal(browser.location.href.includes('1234567'),false);
});

test('a snapshot from the other variant or an invalid URL cannot replace the entry home',()=>{
 const browser=fakeBrowser('https://example.test/tobe/?screen=home');
 browser.history.replaceState({findaTestEntry:{version:1,variant:'asis',route:'home',state:{screen:'home'}}},'',browser.location.href);
 const navigation=createTestNavigation({variant:'tobe',routeOf,stateFor,onRestore(){},browser});
 assert.equal(navigation.initial().screen,'home');
 const invalid=fakeBrowser('https://example.test/tobe/?screen=https://elsewhere.test');
 const safe=createTestNavigation({variant:'tobe',routeOf,stateFor,onRestore(){},browser:invalid});
 assert.equal(safe.initial().screen,'home');assert.equal(invalid.location.searchParams.get('screen'),'home');
 assert.equal(invalid.location.origin,'https://example.test');
});

test('the opt-in marker identifies only the requested independent entry',()=>{
 assert.equal(isTestEntry('asis',{dataset:{testVariant:'asis'}}),true);
 assert.equal(isTestEntry('tobe',{dataset:{testVariant:'asis'}}),false);
 assert.equal(isTestEntry('tobe',{dataset:{}}),false);
});
