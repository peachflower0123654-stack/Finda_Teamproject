// Only /asis/ and /tobe/ opt into browser navigation.
// URLs contain screen identifiers only. Existing event/localStorage APIs are untouched.
export const isTestEntry=(variant,body=globalThis.document?.body)=>body?.dataset?.testVariant===variant;

// history.state keeps this tab's answers and return origin across Back/Forward/Reload.
// It is namespaced by variant and never writes answers to the URL or localStorage.
export function createTestNavigation({variant,routeOf,stateFor,onRestore,defaultRoute='home',browser=globalThis.window}){
 if(!['asis','tobe'].includes(variant))throw new TypeError('Unknown test variant');
 let activeRoute=null,restoring=false;
 const requested=()=>new URL(browser.location.href).searchParams.get('screen')||defaultRoute;
 const read=()=>{
  const route=requested(),saved=browser.history.state?.findaTestEntry;
  if(saved?.version===1&&saved.variant===variant&&saved.route===route&&saved.state&&routeOf(saved.state)===route)return saved.state;
  return stateFor(route);
 };
 function record(state){
  const route=routeOf(state);if(!route)return;
  const url=new URL(browser.location.href);url.searchParams.set('screen',route);
  const previous=browser.history.state;
  const snapshot={...(previous&&typeof previous==='object'?previous:{}),findaTestEntry:{version:1,variant,route,state}};
  const method=restoring||activeRoute===null||activeRoute===route?'replaceState':'pushState';
  browser.history[method](snapshot,'',url.href);
  activeRoute=route;
 }
 function onPop(){
  restoring=true;
  try{onRestore(read());}finally{restoring=false;}
 }
 browser.addEventListener('popstate',onPop);
 return {initial(){const state=read();record(state);return state;},record,destroy(){browser.removeEventListener('popstate',onPop);}};
}
