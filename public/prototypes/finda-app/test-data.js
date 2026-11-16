// 사용자 테스트 데이터를 Supabase에 보내요 (supabase/schema.sql의 test_events 테이블).
// - 테스터마다 익명 test_id를 만들어 localStorage에 둬요. 같은 브라우저면 다시 와도 같은 id예요.
// - 이벤트마다 고유 event_id를 붙여요. DB의 유일 인덱스가 같은 event_id를 두 번 저장하지 않게 막아요.
// - 보내기 전에 먼저 finda.pendingTestEvents에 기록 → 전송 → 성공하면 삭제. 실패하면 남겨 두고 다음 접속 때 다시 보내요.
// - supabase-config.js(키 파일, git에 올리지 않음)가 없으면 아무것도 보내지 않아요. 앱은 그대로 동작해요.
// 다른 화면에서도 sendTestEvent('이벤트_이름', {...})로 쓰면 돼요.

export const FLOW_VERSION='finda-app-2026-11';
const TEST_ID_KEY='finda.testId';
const QUEUE_KEY='finda.pendingTestEvents';
const MAX_QUEUE=50;

const safeGet=(storage,key)=>{try{return storage?.getItem(key)??null;}catch{return null;}};
const safeSet=(storage,key,value)=>{try{storage?.setItem(key,value);}catch{}};
const uuid=()=>crypto.randomUUID();

export function getTestId(storage=globalThis.localStorage,makeId=uuid){
 const saved=safeGet(storage,TEST_ID_KEY);
 if(saved&&/^[0-9a-f-]{36}$/i.test(saved))return saved;
 const id=makeId();
 safeSet(storage,TEST_ID_KEY,id);
 return id;
}

export function buildRow(event,payload,testId,eventId=uuid()){
 if(!/^[a-z0-9_]{1,64}$/.test(event))throw new Error(`잘못된 이벤트 이름: ${event}`);
 return {test_id:testId,event,payload:{...payload,event_id:eventId,sent_at:new Date().toISOString()},flow_version:FLOW_VERSION};
}
const eventIdOf=row=>row?.payload?.event_id;

export function readQueue(storage=globalThis.localStorage){
 try{const rows=JSON.parse(safeGet(storage,QUEUE_KEY)||'[]');return Array.isArray(rows)?rows:[];}catch{return [];}
}
export function writeQueue(rows,storage=globalThis.localStorage){
 safeSet(storage,QUEUE_KEY,JSON.stringify(rows.slice(-MAX_QUEUE)));
}
// 예전 방식으로 쌓인(event_id 없는) 기록에도 id를 붙여서, 다시 보내도 한 번만 저장되게 해요.
function normalizedQueue(storage){
 const rows=readQueue(storage);
 let changed=false;
 const fixed=rows.filter(r=>r&&typeof r==='object').map(r=>{if(eventIdOf(r))return r;changed=true;return {...r,payload:{...(r.payload||{}),event_id:uuid()}};});
 if(changed||fixed.length!==rows.length)writeQueue(fixed,storage);
 return fixed;
}
function removeFromQueue(eventId,storage){writeQueue(readQueue(storage).filter(r=>eventIdOf(r)!==eventId),storage);}

// 브라우저에 두면 안 되는 키(secret, service_role)면 true. 이런 키로는 절대 보내지 않아요.
export function isSecretKey(key){
 if(/^sb_secret_/i.test(key))return true;
 const parts=String(key).split('.');
 if(parts.length!==3)return false;
 try{return /service_role/.test(atob(parts[1].replace(/-/g,'+').replace(/_/g,'/')));}catch{return false;}
}

// 기록 한 줄을 보내요. 'ok' 저장됨 / 'duplicate' 이미 저장된 event_id(409) / 'fail' 다시 보내야 함.
export async function postRow(row,config,fetchImpl=globalThis.fetch){
 if(!config?.url||!config?.publishableKey)return 'fail';
 if(isSecretKey(config.publishableKey)){console.error('supabase-config.js에 secret/service_role 키가 들어 있어요. publishable 키로 바꿔 주세요.');return 'fail';}
 try{
  const response=await fetchImpl(`${config.url.replace(/\/$/,'')}/rest/v1/test_events`,{
   // keepalive: 전송 중에 화면이 바뀌거나 탭이 닫혀도 요청이 끝까지 가요.
   method:'POST',keepalive:true,
   headers:{'Content-Type':'application/json',apikey:config.publishableKey,Authorization:`Bearer ${config.publishableKey}`,Prefer:'return=minimal'},
   body:JSON.stringify(row),
  });
  if(response.ok)return 'ok';
  return response.status===409?'duplicate':'fail';
 }catch{return 'fail';}
}

let configPromise;
function loadConfig(){
 // 키 파일이 없으면(404) null이 돼서 전송을 건너뛰어요.
 configPromise??=import('./supabase-config.js').then(m=>m.default??null).catch(()=>null);
 return configPromise;
}

// 이 탭에서 지금 보내고 있는 event_id. 같은 기록을 동시에 두 번 보내지 않게 해요.
const inflight=new Set();

// 쌓여 있는 기록을 한 줄씩 순서대로 보내요. 저장된(또는 이미 저장돼 있던) 줄만 지워요. 보낸 event_id 목록을 돌려줘요.
export async function flushPendingTestEvents(deps={}){
 const storage=deps.storage??globalThis.localStorage;
 const config=deps.config!==undefined?deps.config:await loadConfig();
 const saved=[];
 if(!config)return saved;
 for(const row of normalizedQueue(storage)){
  const id=eventIdOf(row);
  // 다른 전송이 이미 보내는 중이거나 그새 저장돼서 큐에서 빠졌으면 건너뛰어요.
  if(inflight.has(id)||!readQueue(storage).some(r=>eventIdOf(r)===id))continue;
  inflight.add(id);
  try{
   const result=await postRow(row,config,deps.fetch);
   if(result!=='fail'){removeFromQueue(id,storage);saved.push(id);}
  }finally{inflight.delete(id);}
 }
 return saved;
}

// 1) 먼저 기록 → 2) 전송 → 3) 성공하면 삭제, 실패하면 남겨 둠. 1)은 await 전에 끝나서, 바로 화면을 옮겨도 기록이 사라지지 않아요.
export async function sendTestEvent(event,payload={},deps={}){
 const storage=deps.storage??globalThis.localStorage;
 const row=buildRow(event,payload,getTestId(storage,deps.makeId),(deps.makeEventId??uuid)());
 writeQueue([...normalizedQueue(storage),row],storage);
 const saved=await flushPendingTestEvents(deps);
 return saved.includes(eventIdOf(row));
}
