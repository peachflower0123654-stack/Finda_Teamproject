import {openQuickMenu} from './quick-menu-dialog.js';
// 퀵메뉴 아이콘 SP3: 보라 그라데이션 별 안에 흰 압정 (design/quick-menu-icon-concepts/qm-icon-SP3.svg).
const starIcon=`<svg class="quick-menu-star" width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><defs><linearGradient id="quick-menu-star-fill" x1="4" y1="2" x2="17" y2="23" gradientUnits="userSpaceOnUse"><stop stop-color="#B6AFF9"/><stop offset="1" stop-color="#5D4CF2"/></linearGradient></defs><path d="M12 2.4 15.61 8.03 22.08 9.72 17.85 14.9 18.23 21.58 12 19.15 5.77 21.58 6.15 14.9 1.92 9.72 8.39 8.03Z" fill="url(#quick-menu-star-fill)" stroke="url(#quick-menu-star-fill)" stroke-width="2.6" stroke-linejoin="round"/><g transform="translate(12 13.6) rotate(35) scale(.86)" fill="#fff"><rect x="-3" y="-6" width="6" height="2.2" rx="1.1"/><path d="M-2.2-4.2h4.4l.75 4.6h-5.9l.75-4.6Z"/><rect x="-4.4" y="-.1" width="8.8" height="2.2" rx="1.1"/><path d="M-.65 2h1.3l-.4 4.3a.25.25 0 0 1-.5 0L-.65 2Z"/></g></svg>`;
export function quickMenuButton(){
 return `<button class="quick-menu-button" type="button" aria-label="즐겨찾기 퀵메뉴">${starIcon}<span class="quick-menu-sparkles" aria-hidden="true"></span></button>`;
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
