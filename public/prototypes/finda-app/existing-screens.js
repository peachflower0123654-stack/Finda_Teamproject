import {extraAsIsDesigns} from './as-is/extra-designs.js';
import {findLoanDesign} from './as-is/find-loan-design.js';
import {applyBottomBar} from './bottom-bar.js';
import {showTestScopeNotice} from './test-scope-notice.js';

// Figma 4483:5998 / 4483:6018: 익명 컴포넌트만 공유하고 As-is의 흐름은 불러오지 않습니다.
const screens={point:['4418:4270','4483:5998','Finda_Point','포인트'],all:['4418:4271','4483:6018','Finda_All','전체 메뉴'],'find-loan':['4500:6614','4507:6766','Finda_FindLoan','대출 받기'],refinance:['4536:17329','4562:15589','Finda_대환','대출 갈아타기']};
export const existingScreenName=screen=>screens[screen]?.[2];
export function existingScreen(screen){
 const source=screens[screen];if(!source)return '';
 const [id,frame,,label]=source;
 const design=screen==='find-loan'?findLoanDesign:extraAsIsDesigns[id];
 const html=design.html.replace(`data-node-id="${id}"`,`data-node-id="${frame}"`).replaceAll('src="assets/','src="as-is/assets/');
 return `<section class="existing-finda-screen" data-existing-screen="${screen}" aria-label="${label}">${html}</section>`;
}

export function wireExistingScreen(app,{screen,onNavigate,onOpen,onBack,scrollTop=0}){
 const shell=app.querySelector('.existing-finda-screen');if(!shell)return;
 const root=shell.firstElementChild;
 const notice=()=>showTestScopeNotice(app);
 const action=(element,label,run=notice)=>{
  if(!element)return;
  element.setAttribute('role','button');element.tabIndex=0;element.setAttribute('aria-label',label);
  element.addEventListener('click',run);
  element.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();run();}});
 };
 if(screen==='refinance'){
  root.querySelector('.asis-refinance__back').addEventListener('click',onBack);
  root.querySelector('.asis-refinance__cta').addEventListener('click',notice);
  let lastNotice=-Infinity,touchStart=null;
  const scrollNotice=()=>{if(Date.now()-lastNotice>1200){lastNotice=Date.now();notice();}};
  root.addEventListener('wheel',event=>{if(event.deltaX||event.deltaY){event.preventDefault();scrollNotice();}},{passive:false});
  root.addEventListener('touchstart',event=>{const t=event.touches[0];touchStart=t?{x:t.clientX,y:t.clientY}:null;},{passive:true});
  root.addEventListener('touchmove',event=>{
   const t=event.touches[0];if(!t||!touchStart)return;
   const dx=Math.abs(t.clientX-touchStart.x),dy=Math.abs(t.clientY-touchStart.y);
   if(dy>8&&dy>=dx){event.preventDefault();scrollNotice();}
  },{passive:false});
  for(const type of ['touchend','touchcancel'])root.addEventListener(type,()=>{touchStart=null;},{passive:true});
  root.addEventListener('keydown',event=>{
   if(!['ArrowDown','ArrowUp','PageDown','PageUp','Home','End',' '].includes(event.key))return;
   if(event.key===' '&&event.target.closest('button'))return;
   event.preventDefault();scrollNotice();
  });
  return;
 }
 const children=[...root.children],detail=screen==='find-loan';
 const scroller=document.createElement('div');scroller.className=detail?'existing-finda-detail-scroll':'existing-finda-scroll';scroller.tabIndex=0;
 scroller.setAttribute('aria-label',detail?'대출 받기 안내':screen==='point'?'포인트 콘텐츠':'전체 메뉴 콘텐츠');
 if(detail){children[2].before(scroller);scroller.append(...children.slice(2,-1));}
 else{children[0].before(scroller);scroller.append(children[0]);}
 const nav=root.querySelector('[data-name="cmp_Common_BottomBar"]');applyBottomBar(nav,detail?'home':screen);
 nav.querySelector('[aria-pressed="true"]').setAttribute('aria-current','page');
 scroller.scrollTop=scrollTop;
 if(detail){
  action(shell.querySelector('[data-node-id="4500:6839"]'),'뒤로가기',onBack);
  action(shell.querySelector('[data-node-id="3531:2880"]'),'신용대출 조건 비교하기');
 }else if(screen==='point'){
  const attendance=shell.querySelector('[data-name="cmp_Point_Button"]');action(attendance,'출석하고 5P 받기');
  action(shell.querySelector('[data-node-id="4468:11694"]'),'핀다포인트 내역');
  for(const item of shell.querySelectorAll('[data-name^="cmp_Point_MenuItem"]')){
   const label=item.textContent.trim();action(item,label,label==='출석체크'?()=>attendance.focus({preventScroll:true}):notice);
  }
  action(shell.querySelector('[data-name="cmp_Point_RewardAd"]'),'광고 확인하고 10P');
 }else{
  for(const section of shell.querySelectorAll('[data-name="cmp_All_MenuSection"]')){
   section.setAttribute('role','region');section.setAttribute('aria-label',section.querySelector('[data-name="분류 제목"]').textContent.trim());
  }
  for(const row of shell.querySelectorAll('[data-name="cmp_All_MenuRow"]')){
   const label=row.querySelector('p').textContent.trim();
   const run=label==='대출 받기'?()=>onOpen('find-loan'):['포인트','출석체크'].includes(label)?()=>onNavigate('point',{attendance:label==='출석체크'}):notice;
   action(row,label,run);
  }
  for(const shortcut of shell.querySelectorAll('[data-name^="cmp_All_Shortcut"]'))action(shortcut,shortcut.textContent.trim());
  action(shell.querySelector('[data-node-id="3562:1237"]'),'설정');
 }
}
