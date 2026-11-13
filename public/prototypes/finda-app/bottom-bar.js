// Figma 2303:701 / NavItem Active=true,false / icons Name=home,point,all × true/false.
// 선택 상태만 전환한다. 아직 정의되지 않은 포인트·전체 화면 이동은 추가하지 않는다.
export const bottomBarItems=[['home','홈'],['point','포인트'],['all','전체']];
const validItem=value=>bottomBarItems.some(([name])=>name===value)?value:'home';
const items=selected=>bottomBarItems.map(([name,label])=>`<button type="button" class="cmp-bottom-bar__item" data-bottom-nav="${name}" aria-pressed="${name===selected}"><img src="assets/bottom-bar-${name}-${name===selected?'on':'off'}.svg" alt=""><span>${label}</span></button>`).join('');

export const bottomBar=(selected='home')=>`<nav class="cmp-bottom-bar" data-node-id="2303:701" data-name="cmp_Common_BottomBar" aria-label="하단 메뉴">${items(validItem(selected))}</nav>`;

export function applyBottomBar(element,selected='home'){
 element.className='cmp-bottom-bar';
 element.dataset.name='cmp_Common_BottomBar';
 element.setAttribute('role','navigation');
 element.setAttribute('aria-label','하단 메뉴');
 element.innerHTML=items(validItem(selected));
}

const wired=new WeakSet();
export function wireBottomBars(root,onSelect){
 for(const bar of root.querySelectorAll('.cmp-bottom-bar')){
  if(wired.has(bar))continue;
  wired.add(bar);
  bar.addEventListener('click',event=>{
   const button=event.target.closest('[data-bottom-nav]');
   if(!button||!bar.contains(button))return;
   const selected=validItem(button.dataset.bottomNav);
   bar.innerHTML=items(selected);
   onSelect?.(selected);
   bar.querySelector('[aria-pressed="true"]')?.focus({preventScroll:true});
  });
 }
}
