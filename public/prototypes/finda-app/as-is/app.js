import {asIsDesigns} from "./designs.js";
import {extraAsIsDesigns} from "./extra-designs.js";
import {applyBottomBar} from "../bottom-bar.js";
import {wireAsIsPostList} from "./post-list.js";
import {asIsScreens,initialAsIs,nextAsIs,backAsIs,goAsIs,reviewAsIs,shouldAdvanceAsIs} from "./flow.mjs";

const app=document.querySelector("#asis-app"), panel=document.querySelector("#asis-preview"), stage=document.querySelector("#asis-stage");
const params=new URLSearchParams(location.search);
const testMode=params.get("mode")==="test";
const asIsAsset=src=>src;
Object.assign(asIsDesigns,extraAsIsDesigns);
document.body.dataset.mode=testMode?"test":"review";
let state=initialAsIs(),timer,toastTimer;
let tabScrollPositions={home:0,point:0,all:0};
if(params.has("screen")&&!testMode)state=reviewAsIs(state,params.get("screen"));
const pick=id=>app.querySelector(`[data-node-id="${id}"]`);

function action(element,label,run){
 if(!element)return;
 element.setAttribute("role","button");
 element.setAttribute("tabindex","0");
 element.setAttribute("aria-label",label);
 element.dataset.action=label;
 element.addEventListener("click",run);
 element.addEventListener("keydown",event=>{
  if(event.key==="Enter"||event.key===" "){event.preventDefault();run();}
 });
}
const advance=()=>{state=nextAsIs(state);render(true);};
const previous=()=>{
 const closingSecurity=state.screen==="security-consent";
 state=backAsIs(state);render(true);
 if(closingSecurity&&state.screen==="security")pick("4428:4366").focus({preventScroll:true});
};
const open=screen=>{state=goAsIs(state,screen);render(true);};
const tabScroller=()=>state.screen==="home"?pick("4453:5120"):app.querySelector(".asis-tab-scroll");
function switchTab(screen){
 const scroller=tabScroller();
 if(scroller)tabScrollPositions[state.screen]=scroller.scrollTop;
 if(screen===state.screen){if(scroller)scroller.scrollTop=0;tabScrollPositions[screen]=0;return;}
 open(screen);
}
function openDetail(screen){
 const scroller=tabScroller();if(scroller)tabScrollPositions[state.screen]=scroller.scrollTop;
 open(screen);
}
function toast(message){
 clearTimeout(toastTimer);
 app.querySelector(".asis-toast")?.remove();
 const element=document.createElement("div");
 element.className="asis-toast";
 element.setAttribute("role","status");
 element.textContent=message;
 app.append(element);
 toastTimer=setTimeout(()=>element.remove(),2500);
}
const unavailable=()=>toast("이번 테스트에서는 이용하지 않는 메뉴예요.");

function wireOnboarding(){
 switch(state.screen){
 case "intro":
  action(pick("4422:4349"),"시작하기",advance);
  break;
 case "security":
  action(pick("4428:4323"),"뒤로가기",previous);
  action(pick("4428:4366"),"악성앱 찾기",advance);
  break;
 case "security-consent":
  pick("4516:6753-dim").addEventListener("click",previous);
  pick("I4516:6643;4438:6396").addEventListener("click",advance);
  pick("4516:6643").focus({preventScroll:true});
  break;
 case "assets":
  action(pick("4431:4347"),"자산 연결하기",advance);
  action(pick("4431:4350"),"다음에",()=>open("home"));
  break;
 case "connect":
  action(pick("4426:14527"),"뒤로가기",previous);
  action(pick("4434:4370")?.children[0],"한 번에 불러오기",advance);
  action(pick("4434:4370")?.children[1],"자산 직접 선택",()=>open("asset-select"));
  break;
 case "asset-select":
  for(const button of app.querySelectorAll("[data-direct-action]")){
   const run=button.dataset.directAction==="back"?previous:button.dataset.directAction==="continue"?advance:()=>toast("이 테스트에서는 구현되지 않았습니다.");
   button.addEventListener("click",run);
  }
  break;
 case "consent":
  wireConsent();
  break;
 case "verify":
  action(pick("4442:4413"),"뒤로가기",previous);
  action(pick("4442:4439"),"카카오 인증서로 인증하기",advance);
  action(pick("4442:4443"),"다른 인증서 선택하기",unavailable);
  break;
 case "signing":{
  // The supplied frame itself contains the original capture and its close glyph.
  const close=document.createElement("button");
  close.className="asis-action-hit";
  close.setAttribute("aria-label","인증 취소");
  close.addEventListener("click",previous);
  app.append(close);
  app.querySelector("img").alt="여러 건의 서명을 진행합니다. 화면을 나가면 서명이 모두 초기화됩니다. 잠시만 기다려주세요. 0%";
  break;
 }
 }
}
function wireConsent(){
 const dialog=pick("4438:10087"), background=pick("4438:10064");
 dialog.setAttribute("role","dialog");
 dialog.setAttribute("aria-modal","true");
 dialog.setAttribute("aria-label","자산 연결 동의");
 dialog.setAttribute("tabindex","-1");
 background.inert=true;
 const dim=pick("4438:10086");
 dim.addEventListener("click",previous);
 action(pick("I4438:10087;4438:6396"),"동의하고 연결하기",advance);
 action(pick("I4438:10087;4438:6381"),"마이데이터 이용약관",unavailable);
 dialog.focus({preventScroll:true});
}
function wireHome(){
 const scroller=pick("4453:5120");
 scroller.setAttribute("tabindex","0");
 scroller.setAttribute("aria-label","홈 콘텐츠");
 action(pick("I4453:5190;3531:3235"),"대출 혜택 배너 닫기",()=>pick("4453:5190").remove());
 action(pick("I4453:5190;3819:19977"),"지금 받아보기",unavailable);
 const headerLabels=["즐겨찾기","보안","알림"];
 [...app.querySelectorAll('[data-name^="Touch Area"]')].forEach((element,index)=>action(element,headerLabels[index],unavailable));
 for(const element of app.querySelectorAll('[data-name^="cmp_Home_LoanActionCard"], [data-name^="cmp_Home_LoanMenuItem"]')){
  const destination=element.dataset.nodeId==="4453:5214"?"refinance":element.dataset.name.endsWith("대출 받기")?"find-loan":null;
  action(element,element.textContent.trim(),destination?()=>openDetail(destination):unavailable);
 }
}
function wireBottomBar(selected=state.screen){
 const nav=app.querySelector('[data-name="cmp_Common_BottomBar"]');
 if(!nav)return;
 applyBottomBar(nav,selected);
 for(const image of nav.querySelectorAll("img"))image.setAttribute("src",asIsAsset(image.getAttribute("src")));
 for(const button of nav.querySelectorAll("button")){
  if(button.dataset.bottomNav===selected)button.setAttribute("aria-current","page");
  button.setAttribute("aria-label",button.textContent.trim());
  button.addEventListener("click",()=>switchTab(button.dataset.bottomNav));
 }
}
function wireTabScreen(){
 if(state.screen!=="home"){
  const root=app.firstElementChild,content=root.firstElementChild,scroller=document.createElement("div");
  scroller.className="asis-tab-scroll";
  scroller.setAttribute("tabindex","0");
  scroller.setAttribute("aria-label",state.screen==="point"?"포인트 콘텐츠":"전체 메뉴 콘텐츠");
  content.before(scroller);scroller.append(content);
 }
 wireBottomBar();
 const scroller=tabScroller();if(scroller)scroller.scrollTop=tabScrollPositions[state.screen]||0;
 if(state.screen==="point"){
  action(pick("4468:11623"),"출석하고 5P 받기",()=>toast("출석 보상은 이번 테스트에 포함되지 않아요."));
  action(pick("4468:11694"),"핀다포인트 내역",unavailable);
  for(const item of app.querySelectorAll('[data-name^="cmp_Point_MenuItem"]')){
   const label=item.textContent.trim();
   action(item,label,label==="출석체크"?()=>pick("4468:11623").focus({preventScroll:true}):unavailable);
  }
  action(pick("4468:11700"),"광고 확인하고 10P",unavailable);
 }else if(state.screen==="all"){
  for(const section of app.querySelectorAll('[data-name="cmp_All_MenuSection"]')){
   section.setAttribute("role","region");section.setAttribute("aria-label",section.querySelector('[data-name="분류 제목"]').textContent.trim());
  }
  for(const row of app.querySelectorAll('[data-name="cmp_All_MenuRow"]')){
   const label=row.querySelector("p").textContent.trim();
   const destination={"대출 받기":"find-loan","금리인하 자동신청":"rate-cut","핀다포스트":"posts"}[label];
   action(row,label,destination?()=>openDetail(destination):["포인트","출석체크"].includes(label)?()=>{switchTab("point");if(label==="출석체크")pick("4468:11623").focus({preventScroll:true});}:unavailable);
  }
  for(const shortcut of app.querySelectorAll('[data-name^="cmp_All_Shortcut"]'))action(shortcut,shortcut.textContent.trim(),unavailable);
  action(pick("3562:1237"),"설정",unavailable);
 }
}
function wireLoanDetail(){
 const root=app.firstElementChild,children=[...root.children];
 const scroller=document.createElement("div");scroller.className="asis-detail-scroll";
 scroller.setAttribute("tabindex","0");scroller.setAttribute("aria-label",state.screen==="find-loan"?"대출 받기 안내":"금리인하 안내");
 children[2].before(scroller);
 const content=state.screen==="find-loan"?children.slice(2,-1):children.slice(2,4);
 scroller.append(...content);
 if(state.screen==="find-loan"){
  action(pick("4500:6839"),"뒤로가기",previous);
  action(pick("3531:2880"),"신용대출 조건 비교하기",()=>toast("대출 조건 조회는 이번 테스트에 포함되지 않아요."));
  wireBottomBar("home");
 }else{
  action(pick("4500:6932"),"뒤로가기",previous);
  action(pick("I4500:7005;3761:22824"),"신청내역 확인",unavailable);
  action(pick("I4500:7005;3761:22825"),"금리인하 신청",()=>toast("신청 절차는 이번 테스트에 포함되지 않아요."));
 }
}

function wireRefinance(){
 const root=pick("4536:17329");let lastNotice=-Infinity,touchStart=null;
 const notice=()=>{lastNotice=Date.now();toast("이 테스트에서는 구현되지 않았습니다.");};
 root.querySelector(".asis-refinance__back").addEventListener("click",previous);
 root.querySelector(".asis-refinance__cta").addEventListener("click",notice);
 const scrollNotice=()=>{if(Date.now()-lastNotice>1200)notice();};
 root.addEventListener("wheel",event=>{if(event.deltaX||event.deltaY)scrollNotice();},{passive:true});
 root.addEventListener("touchstart",event=>{const touch=event.touches[0];touchStart=touch?{x:touch.clientX,y:touch.clientY}:null;},{passive:true});
 root.addEventListener("touchmove",event=>{
  const touch=event.touches[0];if(!touch||!touchStart)return;
  const dx=Math.abs(touch.clientX-touchStart.x),dy=Math.abs(touch.clientY-touchStart.y);
  if(dy>8&&dy>=dx)scrollNotice();
 },{passive:true});
 root.addEventListener("touchend",()=>{touchStart=null;},{passive:true});
 root.addEventListener("touchcancel",()=>{touchStart=null;},{passive:true});
 root.addEventListener("keydown",event=>{
  if(event.target!==root||!["ArrowDown","ArrowUp","PageDown","PageUp","Home","End"," "].includes(event.key))return;
  event.preventDefault();scrollNotice();
 });
}

function render(focus=false){
 clearTimeout(timer);clearTimeout(toastTimer);
 const [,name,id]=asIsScreens.find(([key])=>key===state.screen);
 app.dataset.screen=state.screen;
 app.dataset.frame=name;
 app.innerHTML=asIsDesigns[id].html;
 if(state.screen==="splash")app.querySelector("img").alt="finda";
 wireOnboarding();
 if(state.screen==="home")wireHome();
 if(["home","point","all"].includes(state.screen))wireTabScreen();
 if(["find-loan","rate-cut"].includes(state.screen))wireLoanDetail();
 if(state.screen==="posts")wireAsIsPostList({app,pick,action,previous,toast,asset:asIsAsset});
 if(state.screen==="refinance")wireRefinance();
 panel.innerHTML=`<h1>핀다 As-is</h1><code>${name}</code><label for="asis-screen">화면 선택</label><select id="asis-screen">${asIsScreens.map(([key,title])=>`<option value="${key}" ${state.screen===key?"selected":""}>${title}</option>`).join("")}</select><div><button data-review="back" ${state.screen==="splash"?"disabled":""}>이전</button><button data-review="next" ${state.screen==="home"?"disabled":""}>다음</button><button data-review="reset">처음부터</button></div><div class="asis-note">${state.review?"화면 검토 중 · 자동 전환 멈춤":"Splash 1.5초 후 시작 · 서명은 2초 후 홈으로 이동"}<br><br>악성앱 검사·자산 연결·인증은 테스트용 전환입니다. 실제 조회나 외부 연결은 하지 않습니다.<br>OB_08은 원본이 비어 있어 서명 후 홈으로 연결했습니다.</div><a href="index.html?mode=test" target="_blank" rel="noopener">참가자용 화면</a><a href="../index.html">개선안 보기</a>`;
 panel.querySelector('[data-review="next"]').disabled=nextAsIs(state).screen===state.screen;
 if(shouldAdvanceAsIs(state))timer=setTimeout(advance,state.screen==="splash"?1500:2000);
 if(focus&&!["consent","security-consent"].includes(state.screen))app.focus({preventScroll:true});
 fit();
}
function fit(){
 const width=testMode?360:690;
 const height=state.screen==="refinance"?800:780;
 const scale=Math.min(1,(innerWidth-(testMode?0:32))/width,(innerHeight-(testMode?0:32))/height);
 stage.style.zoom=String(Math.max(0.1,scale));
}
panel.addEventListener("change",event=>{
 if(event.target.id==="asis-screen"){state=reviewAsIs(state,event.target.value);render();if(!["consent","security-consent"].includes(state.screen))panel.querySelector("select").focus();}
});
panel.addEventListener("click",event=>{
 const key=event.target.closest("[data-review]")?.dataset.review;
 if(key==="back")previous();
 else if(key==="next")advance();
 else if(key==="reset"){tabScrollPositions={home:0,point:0,all:0};state=initialAsIs();render(true);}
});
document.addEventListener("keydown",event=>{
 if(!["consent","security-consent"].includes(state.screen))return;
 if(event.key==="Escape"){event.preventDefault();previous();return;}
 if(event.key==="Tab"){
  const dialog=pick(state.screen==="consent"?"4438:10087":"4516:6643");
  const focusable=[...dialog.querySelectorAll('button,[tabindex="0"]')];
  const first=focusable[0],last=focusable.at(-1);
  if(event.shiftKey&&(document.activeElement===first||document.activeElement===dialog)){event.preventDefault();last.focus();}
  else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
 }
});
window.addEventListener("resize",fit);
render();
