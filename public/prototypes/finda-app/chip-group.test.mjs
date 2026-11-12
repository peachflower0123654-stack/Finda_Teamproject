import test from 'node:test';
import assert from 'node:assert/strict';
import {categoryChips,wireChipGroup} from './chip-group.js';

function fixture(count=8,scale=1){
 const handlers=new Map(),classes=new Set(),captures=new Set();
 const slot={children:Array.from({length:count},(_,index)=>({index,remove(){slot.children=slot.children.filter(chip=>chip!==this);}}))};
 const group={scrollLeft:100,offsetWidth:296,querySelector:()=>slot,getBoundingClientRect:()=>({width:296*scale}),
  classList:{add:name=>classes.add(name),remove:name=>classes.delete(name)},
  setPointerCapture:id=>captures.add(id),hasPointerCapture:id=>captures.has(id),releasePointerCapture:id=>captures.delete(id),
  addEventListener:(type,handler)=>handlers.set(type,handler)};
 wireChipGroup(group);
 const fire=(type,values={})=>{
  const event={pointerType:'mouse',button:0,pointerId:1,clientX:100,clientY:20,detail:1,preventDefault(){this.prevented=true;},stopImmediatePropagation(){this.stopped=true;},...values};
  handlers.get(type)?.(event);return event;
 };
 return {group,slot,classes,fire};
}

test('chip groups show at most nine chips, without padding or changing source data',()=>{
 const source=Array.from({length:12},(_,id)=>({id}));
 assert.deepEqual(categoryChips(source).map(chip=>chip.id),[0,1,2,3,4,5,6,7,8]);
 assert.equal(source.length,12);assert.equal(categoryChips(source.slice(0,7)).length,7);
 assert.equal(fixture(12).slot.children.length,9);
});

test('mouse dragging scrolls both ways, accounts for preview scale, and suppresses the resulting click',()=>{
 const {group,classes,fire}=fixture(8,0.5);
 fire('pointerdown');fire('pointermove',{clientX:70});assert.equal(group.scrollLeft,160);
 fire('pointermove',{clientX:130});assert.equal(group.scrollLeft,40);
 fire('pointerup');assert.equal(classes.has('is-dragging'),false);
 const click=fire('click');assert.equal(click.prevented,true);assert.equal(click.stopped,true);
 fire('pointerdown');fire('pointerup');assert.equal(fire('click').stopped,undefined);
});

test('a small movement remains a click; touch and vertical gestures keep native scrolling',()=>{
 const {group,fire}=fixture();
 fire('pointerdown');fire('pointermove',{clientX:103});fire('pointerup');
 assert.equal(fire('click').stopped,undefined);assert.equal(group.scrollLeft,100);
 fire('pointerdown',{pointerType:'touch'});
 assert.equal(fire('pointermove',{pointerType:'touch',clientX:40}).prevented,undefined);
 fire('pointerdown');assert.equal(fire('pointermove',{clientX:102,clientY:60}).prevented,undefined);
 assert.equal(group.scrollLeft,100);
});

test('cancelling a drag releases capture and does not suppress a later touch or keyboard click',()=>{
 const {group,classes,fire}=fixture();
 fire('pointerdown');fire('pointermove',{clientX:70});fire('pointercancel');
 assert.equal(classes.has('is-dragging'),false);assert.equal(group.hasPointerCapture(1),false);
 assert.equal(fire('click',{detail:0}).stopped,undefined);
 fire('pointerdown',{pointerType:'touch'});assert.equal(fire('click').stopped,undefined);
});
