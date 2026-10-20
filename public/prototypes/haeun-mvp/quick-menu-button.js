import {openQuickMenu} from './quick-menu-dialog.js';
// Reuses the star path in the existing repository's src/App.tsx.
export function quickMenuButton(){
 return `<button class="quick-menu-button" type="button" aria-label="즐겨찾기 퀵메뉴"><svg class="quick-menu-star" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="m12 3 2.4 5 5.6.8-4 3.9.9 5.6-4.9-2.6-4.9 2.6.9-5.6-4-3.9 5.6-.8L12 3Z"/></svg><span class="quick-menu-sparkles" aria-hidden="true"></span></button>`;
}
export function wireQuickMenuButtons(root){
 for(const button of root.querySelectorAll('.quick-menu-button')){
  button.addEventListener('click',()=>{
   button.classList.remove('is-sparkling');
   void button.offsetWidth;
   button.classList.add('is-sparkling');
   openQuickMenu(root,button);
  });
  button.addEventListener('animationend',event=>{
   if(event.animationName==='quick-menu-click')button.classList.remove('is-sparkling');
  });
 }
}
