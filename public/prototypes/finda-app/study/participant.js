import {studyContext,studyURL} from './plan.mjs';

let current=null,returnFocus=null;
export const isComparisonStudy=()=>new URLSearchParams(globalThis.location?.search||'').get('study')==='1';
export function finishStudyExperience(version=current?.version){
 const context=studyContext(version);
 if(!context)return false;
 if(document.querySelector('.study-completion'))return true;
 const overlay=document.createElement('div');overlay.className='study-completion';
 const first=context.step===1;
 overlay.innerHTML=`<section role="dialog" aria-modal="true" aria-labelledby="study-completion-title"><p class="study-eyebrow">${context.step} / 2</p><h2 id="study-completion-title">${first?'첫 번째 화면 체험을 마쳤어요':'두 화면을 모두 체험했어요'}</h2><p>${first?'다음 화면에서도 Maze의 안내에 따라 메뉴와 기능을 찾아보세요.':'Maze로 돌아가 과제를 마치고 다음 질문으로 진행해 주세요.'}</p>${first?'<a class="study-primary" data-study-next>두 번째 화면 시작</a>':''}<button class="study-secondary" data-study-resume>화면 더 살펴보기</button></section>`;
 if(first)overlay.querySelector('[data-study-next]').href=studyURL(context.order[1],context.first);
 const app=document.querySelector('#app,#asis-app');
 const wasInert=app?.inert;returnFocus=document.activeElement;if(app)app.inert=true;
 const close=()=>{document.removeEventListener('keydown',onKey,true);overlay.remove();if(app)app.inert=!!wasInert;if(returnFocus?.isConnected)returnFocus.focus({preventScroll:true});};
 const onKey=event=>{
  if(event.key==='Escape'){event.preventDefault();close();}
  if(event.key==='Tab'){
   const controls=[...overlay.querySelectorAll('button,a[href]')],first=controls[0],last=controls.at(-1);
   if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
   else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
  }
 };
 overlay.querySelector('[data-study-resume]').addEventListener('click',close);
 document.addEventListener('keydown',onKey,true);document.body.append(overlay);
 overlay.querySelector('a[href],button').focus();
 return true;
}
export function mountStudyControls(version){
 current=studyContext(version);if(!current)return;
 document.title=current.label+' · 핀다 화면 체험';
 document.body.dataset.study='comparison';document.body.dataset.studyVersion=version;
 const bar=document.createElement('header');bar.className='study-toolbar';
 bar.innerHTML=`<span><strong>${current.label}</strong><small>${current.step} / 2</small></span><button type="button">체험 마치기</button>`;
 bar.querySelector('button').addEventListener('click',()=>finishStudyExperience(version));
 document.body.append(bar);
}
