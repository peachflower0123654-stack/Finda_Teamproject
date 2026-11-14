import {popupView,noobPopupView,editView,sheetView} from './quick-menu-views.js';
import {toggleMenu,getSavedPicks,savePicks,RECOMMENDED} from './quick-menu-edit.js';
import {sendTestEvent} from './test-data.js';
const openMenus=new WeakMap();
export function closeQuickMenu(root){openMenus.get(root)?.();}
const TOAST_MS=2000;

export function openQuickMenu(root,trigger,startEditing=false){
 if(root.querySelector('.quick-menu-overlay'))return;
 const overlay=document.createElement('div');
 overlay.className='quick-menu-overlay';
 const screen=root.querySelector('.screen,.figma-home-shell');
 if(screen)screen.inert=true;
 const announce=value=>root.dispatchEvent(new CustomEvent('quick-menu-view',{detail:value}));
 let picks=[],toastTimer=0;

 const showPopup=focusSelector=>{
  clearTimeout(toastTimer);
  overlay.classList.remove('is-editing');
  // app.js가 홈 상태에 따라 root.dataset.quickMenu를 'personal' 또는 'noob'으로 정해 둬요.
  overlay.innerHTML=root.dataset.quickMenu==='noob'?noobPopupView():popupView(getSavedPicks());
  (focusSelector&&overlay.querySelector(focusSelector)||overlay.querySelector('.quick-menu-close')).focus();
  announce('popup:quick-menu');
 };
 const showEdit=()=>{
  picks=getSavedPicks();
  overlay.classList.add('is-editing');
  overlay.innerHTML=editView(picks);
  overlay.querySelector('.qm-back').focus();
  // app.js의 미리보기 패널이 이 값을 읽어요(화면선택 "퀵메뉴 편집"과 같은 값).
  announce('popup:quick-add');
 };
 const showToast=message=>{
  const toast=overlay.querySelector('.qm-toast');
  toast.querySelector('p').textContent=message;
  toast.hidden=false;
  clearTimeout(toastTimer);
  toastTimer=setTimeout(()=>{toast.hidden=true;},TOAST_MS);
 };
 const renderPicks=()=>{
  overlay.querySelectorAll('.qm-item[aria-pressed]').forEach(item=>item.setAttribute('aria-pressed',String(picks.includes(item.dataset.menu))));
  overlay.querySelector('.qm-sheet').innerHTML=sheetView(picks);
 };

 const close=()=>{clearTimeout(toastTimer);document.removeEventListener('keydown',onKey,true);overlay.remove();openMenus.delete(root);if(screen)screen.inert=false;if(trigger?.isConnected)trigger.focus();announce(null);};
 const onKey=e=>{
  if(e.key==='Escape'){e.preventDefault();if(overlay.classList.contains('is-editing'))showPopup('.quick-menu-edit');else close();}
  else if(e.key==='Tab'){const buttons=[...overlay.querySelectorAll('button:not(:disabled)')];const first=buttons[0],last=buttons.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}
 };
 overlay.addEventListener('click',e=>{
  if(e.target===overlay&&!overlay.classList.contains('is-editing')||e.target.closest('.quick-menu-close,.quick-menu-browse')){close();return;}
  // [1분 만에 맞춤 메뉴 받기]는 data-action="start"라서 app.js가 온보딩(02 약관)으로 보내요.
  if(e.target.closest('.quick-menu-edit,.quick-menu-add')){showEdit();return;}
  if(e.target.closest('.qm-back')){showPopup('.quick-menu-edit');return;}
  const item=e.target.closest('.qm-item');
  if(item){const result=toggleMenu(picks,item.dataset.menu);picks=result.picks;renderPicks();if(result.toast)showToast(result.toast);return;}
  if(e.target.closest('.qm-done')){
   savePicks(picks);
   // 종료 지점 ③ 퀵메뉴 편집 [완료]: 고른 메뉴와 그때 보여 준 맞춤 추천 6개를 Supabase로 보내요.
   sendTestEvent('quickmenu_done',{selected_menu_ids:getSavedPicks(),recommendation_ids:[...RECOMMENDED]});
   showPopup('.quick-menu-edit');
  }
 });
 document.addEventListener('keydown',onKey,true);
 openMenus.set(root,close);root.append(overlay);
 if(startEditing)showEdit();else showPopup();
}
