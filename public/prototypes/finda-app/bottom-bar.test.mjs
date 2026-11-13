import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {bottomBar,bottomBarItems,applyBottomBar,wireBottomBars} from './bottom-bar.js';

test('each selected menu uses its own active icon and leaves the other two inactive',()=>{
 for(const [selected] of bottomBarItems){
  const html=bottomBar(selected);
  assert.equal((html.match(/aria-pressed="true"/g)||[]).length,1);
  assert.equal((html.match(/aria-pressed="false"/g)||[]).length,2);
  for(const [name] of bottomBarItems)assert.ok(html.includes(`assets/bottom-bar-${name}-${name===selected?'on':'off'}.svg`));
 }
 assert.equal(bottomBar('unknown'),bottomBar('home'));
});

test('clicking changes the icon state and notifies the app without replacing the bar or creating a route',()=>{
 let clicked,selected,focusOptions,wires=0;
 const bar={className:'old-style',dataset:{},setAttribute(){},contains:()=>true,
  addEventListener:(type,handler)=>{assert.equal(type,'click');clicked=handler;wires++;},
  querySelector:()=>({focus:options=>focusOptions=options})};
 applyBottomBar(bar);
 assert.equal(bar.className,'cmp-bottom-bar');
 const root={querySelectorAll:()=>[bar]};
 wireBottomBars(root,value=>selected=value);wireBottomBars(root,value=>selected=value);
 assert.equal(wires,1);
 for(const [name] of bottomBarItems){
  clicked({target:{closest:()=>({dataset:{bottomNav:name}})}});
  assert.equal(selected,name);assert.ok(bar.innerHTML.includes(`assets/bottom-bar-${name}-on.svg`));
  assert.equal((bar.innerHTML.match(/aria-pressed="true"/g)||[]).length,1);
  assert.deepEqual(focusOptions,{preventScroll:true});
 }
});

test('all six Figma icon states are local, non-empty, and preserve their 24px dimensions',()=>{
 for(const [name] of bottomBarItems)for(const state of ['on','off']){
  const svg=readFileSync(new URL(`./assets/bottom-bar-${name}-${state}.svg`,import.meta.url),'utf8');
  assert.match(svg,/<svg[^>]*width="24" height="24"/);
 }
});
