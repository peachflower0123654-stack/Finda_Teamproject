import {quickMenuAddScreen} from './quick-menu-add.js';
const openMenus=new WeakMap();
export function closeQuickMenu(root){openMenus.get(root)?.();}
const menuItems=[
 ['전월세대출 가이드','jeonse','전월세대출<br>가이드'],
 ['계산기','calculator','계산기'],
 ['내 자산','asset','내 자산'],
 ['전세대출','loan','전세대출'],
 ['신용점수','credit','신용점수'],
 ['상환결제일정','schedule','상환결제일정'],
 ['추가','add','추가'],
 ['추가','add','추가'],
];
export function openQuickMenu(root,trigger,startEditing=false){
 if(root.querySelector('.quick-menu-overlay'))return;
 const overlay=document.createElement('div');
 overlay.className='quick-menu-overlay';
 const items=menuItems.map(([label,icon,text],i)=>`<button type="button" class="quick-menu-item ${i===0?'guide':''}" aria-label="${label}" disabled><img src="assets/quick-menu-${icon}.svg" alt=""><span>${text}</span></button>`);
 const popupContent=`<header><h2>메뉴 즐겨찾기</h2><button class="quick-menu-close" type="button" aria-label="퀵메뉴 닫기"><span aria-hidden="true"></span></button></header><div class="quick-menu-grid quick-menu-first-row">${items.slice(0,4).join('')}</div><div class="quick-menu-grid quick-menu-second-row">${items.slice(4).join('')}</div><button type="button" class="quick-menu-edit">편집하기</button>`;
 overlay.innerHTML=`<section class="quick-menu-dialog" role="dialog" aria-modal="true" aria-label="메뉴 즐겨찾기">${popupContent}</section>`;
 const screen=root.querySelector('.screen,.figma-home-shell');
 if(screen)screen.inert=true;
 const announce=value=>root.dispatchEvent(new CustomEvent('quick-menu-view',{detail:value}));
 const close=()=>{document.removeEventListener('keydown',onKey,true);overlay.remove();openMenus.delete(root);if(screen)screen.inert=false;if(trigger?.isConnected)trigger.focus();announce(null);};
 const focusClose=()=>overlay.querySelector('.quick-menu-close').focus();
 const onKey=e=>{if(e.key==='Escape'){e.preventDefault();close();}else if(e.key==='Tab'){const buttons=[...overlay.querySelectorAll('button:not(:disabled)')];const first=buttons[0],last=buttons.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}};
 overlay.addEventListener('click',e=>{
  if(e.target===overlay||e.target.closest('.quick-menu-close')){close();return;}
  const dialog=overlay.querySelector('.quick-menu-dialog');
  if(e.target.closest('.quick-menu-edit')){dialog.classList.add('is-editing');dialog.setAttribute('aria-label','퀵메뉴 항목 추가');dialog.innerHTML=quickMenuAddScreen();focusClose();announce('popup:quick-add');}
  if(e.target.closest('.quick-add-done')){dialog.classList.remove('is-editing');dialog.setAttribute('aria-label','메뉴 즐겨찾기');dialog.innerHTML=popupContent;overlay.querySelector('.quick-menu-edit').focus();announce('popup:quick-menu');}
 });
 document.addEventListener('keydown',onKey,true);
 openMenus.set(root,close);root.append(overlay);focusClose();announce('popup:quick-menu');
 if(startEditing)overlay.querySelector('.quick-menu-edit').click();
}
