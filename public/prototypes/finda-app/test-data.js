// 사용자 테스트 데이터를 Supabase에 보내요 (supabase/schema.sql의 test_events 테이블).
// - 테스터마다 익명 test_id를 만들어 localStorage에 둬요. 같은 브라우저면 다시 와도 같은 id예요.
// - 보내기에 실패하면 localStorage에 쌓아 뒀다가 다음 전송 때 같이 보내요.
// - supabase-config.js(키 파일, git에 올리지 않음)가 없으면 아무것도 보내지 않아요. 앱은 그대로 동작해요.
// 다른 화면에서도 sendTestEvent('이벤트_이름', {...})로 쓰면 돼요.

export const FLOW_VERSION='finda-app-2026-11';
const TEST_ID_KEY='finda.testId';
const QUEUE_KEY='finda.pendingTestEvents';
const MAX_QUEUE=50;

const safeGet=(storage,key)=>{try{return storage?.getItem(key)??null;}catch{return null;}};
const safeSet=(storage,key,value)=>{try{storage?.setItem(key,value);}catch{}};

export function getTestId(storage=globalThis.localStorage,makeId=()=>crypto.randomUUID()){
 const saved=safeGet(storage,TEST_ID_KEY);
 if(saved&&/^[0-9a-f-]{36}$/i.test(saved))return saved;
 const id=makeId();
 safeSet(storage,TEST_ID_KEY,id);
 return id;
}

export function buildRow(event,payload,testId){
 if(!/^[a-z0-9_]{1,64}$/.test(event))throw new Error(`잘못된 이벤트 이름: ${event}`);
 return {test_id:testId,event,payload:{...payload,sent_at:new Date().toISOString()},flow_version:FLOW_VERSION};
}

export function readQueue(storage=globalThis.localStorage){
 try{const rows=JSON.parse(safeGet(storage,QUEUE_KEY)||'[]');return Array.isArray(rows)?rows:[];}catch{return [];}
}
export function writeQueue(rows,storage=globalThis.localStorage){
 safeSet(storage,QUEUE_KEY,JSON.stringify(rows.slice(-MAX_QUEUE)));
}

// 브라우저에 두면 안 되는 키(secret, service_role)면 true. 이런 키로는 절대 보내지 않아요.
export function isSecretKey(key){
 if(/^sb_secret_/i.test(key))return true;
 const parts=String(key).split('.');
 if(parts.length!==3)return false;
 try{return /service_role/.test(atob(parts[1].replace(/-/g,'+').replace(/_/g,'/')));}catch{return false;}
}

// 쌓인 기록과 새 기록을 한 번에 보내요. 성공하면 쌓인 걸 비우고, 실패하면 모두 다시 쌓아요.
export async function postRows(rows,config,fetchImpl=globalThis.fetch){
 if(!config?.url||!config?.publishableKey||rows.length===0)return false;
 if(isSecretKey(config.publishableKey)){console.error('supabase-config.js에 secret/service_role 키가 들어 있어요. publishable 키로 바꿔 주세요.');return false;}
 try{
  const response=await fetchImpl(`${config.url.replace(/\/$/,'')}/rest/v1/test_events`,{
   method:'POST',keepalive:true,
   headers:{'Content-Type':'application/json',apikey:config.publishableKey,Authorization:`Bearer ${config.publishableKey}`,Prefer:'return=minimal'},
   body:JSON.stringify(rows),
  });
  return response.ok;
 }catch{return false;}
}

let configPromise;
function loadConfig(){
 // 키 파일이 없으면(404) null이 돼서 전송을 건너뛰어요.
 configPromise??=import('./supabase-config.js').then(m=>m.default??null).catch(()=>null);
 return configPromise;
}

export async function sendTestEvent(event,payload={},deps={}){
 const storage=deps.storage??globalThis.localStorage;
 const config=deps.config!==undefined?deps.config:await loadConfig();
 const row=buildRow(event,payload,getTestId(storage,deps.makeId));
 const rows=[...readQueue(storage),row];
 if(!config){writeQueue(rows,storage);return false;}
 const ok=await postRows(rows,config,deps.fetch);
 writeQueue(ok?[]:rows,storage);
 return ok;
}
