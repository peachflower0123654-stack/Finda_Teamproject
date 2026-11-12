// MY를 포함한 카테고리 칩의 최대 표시 개수.
export const MAX_CATEGORY_CHIPS=9;
export const categoryChips=chips=>chips.slice(0,MAX_CATEGORY_CHIPS);

export function wireChipGroup(group){
 if(!group)return;
 const slot=group.querySelector('[data-name="Slot"]');
 if(!slot)return;
 for(const chip of [...slot.children].slice(MAX_CATEGORY_CHIPS))chip.remove();
 group.classList.add('post-chip-group');
 let pointer=null,suppressClick=false;
 // 터치는 브라우저의 기본 가로 스크롤을 사용하고, 마우스에만 드래그를 더한다.
 group.addEventListener('pointerdown',event=>{
  suppressClick=false;
  if(event.pointerType!=='mouse'||event.button!==0)return;
  pointer={id:event.pointerId,x:event.clientX,y:event.clientY,left:group.scrollLeft,scale:group.getBoundingClientRect().width/group.offsetWidth||1,dragging:false};
 });
 group.addEventListener('pointermove',event=>{
  if(!pointer||event.pointerId!==pointer.id)return;
  const dx=event.clientX-pointer.x,dy=event.clientY-pointer.y;
  if(!pointer.dragging){
   if(Math.max(Math.abs(dx),Math.abs(dy))<6)return;
   if(Math.abs(dy)>Math.abs(dx)){pointer=null;return;}
   pointer.dragging=true;suppressClick=true;
   group.setPointerCapture(event.pointerId);
   group.classList.add('is-dragging');
  }
  event.preventDefault();
  group.scrollLeft=pointer.left-dx/pointer.scale;
 });
 const finish=event=>{
  if(!pointer||event.pointerId!==pointer.id)return;
  pointer=null;group.classList.remove('is-dragging');
  if(group.hasPointerCapture(event.pointerId))group.releasePointerCapture(event.pointerId);
 };
 group.addEventListener('pointerup',finish);
 group.addEventListener('pointercancel',finish);
 group.addEventListener('lostpointercapture',finish);
 group.addEventListener('pointerleave',event=>{if(pointer&&!pointer.dragging)finish(event);});
 group.addEventListener('click',event=>{
  if(!suppressClick||event.detail===0)return;
  suppressClick=false;event.preventDefault();event.stopImmediatePropagation();
 },true);
}
