// 탐색 완료 안내 모달: 테스터에게 "Maze로 돌아가 [다음]"을 알려 줘요.
// 종료 지점(①홈 끝까지 스크롤 ②콘텐츠 클릭 ③퀵메뉴 편집 [완료])에서 showExploreDone(app)만 부르면 돼요.
// 온보딩 값을 받은 개인화 홈(Home_OB_NoMD)에서만, 같은 화면을 다시 불러오기 전까지 한 번만 떠요.
// app.js가 root.dataset.homeState에 지금 홈 상태를 넣어 둬요. 화면선택 미리보기(force)는 언제든 띄워요.
export const EXPLORE_DONE_HOME='OB_NoMD';
export const EXPLORE_DONE={
 title:'둘러보기를 마쳤어요',
 body:'이제 Maze 창으로 돌아가\n[다음]을 눌러 주세요.',
 button:'확인',
};
let shown=false;
export const resetExploreDone=()=>{shown=false;};
// ① 홈 끝까지 스크롤: 바닥에서 slack(px) 안쪽이면 끝으로 봐요.
export const atScrollEnd=({scrollTop,clientHeight,scrollHeight},slack=4)=>scrollHeight>clientHeight&&scrollTop+clientHeight>=scrollHeight-slack;

export function exploreDoneView(){
 const body=EXPLORE_DONE.body.split('\n').join('<br>');
 return `<section class="explore-done" role="alertdialog" aria-modal="true" aria-labelledby="explore-done-title" aria-describedby="explore-done-body">
<h2 id="explore-done-title">${EXPLORE_DONE.title}</h2>
<p id="explore-done-body">${body}</p>
<button type="button" class="btn explore-done-ok" data-hierarchy="primary" data-size="medium">${EXPLORE_DONE.button}</button>
</section>`;
}

export function showExploreDone(root,{force=false,onClose}={}){
 if(!root)return false;
 if(!force&&root.dataset?.homeState!==EXPLORE_DONE_HOME)return false;
 if((shown&&!force)||root.querySelector('.explore-done-overlay'))return false;
 shown=true;
 const overlay=document.createElement('div');
 overlay.className='explore-done-overlay';
 overlay.innerHTML=exploreDoneView();
 const screen=root.querySelector('.screen,.figma-home-shell');
 const wasInert=screen?.inert;
 if(screen)screen.inert=true;
 const returnFocus=document.activeElement;
 const close=()=>{
  document.removeEventListener('keydown',onKey,true);
  overlay.remove();
  if(screen)screen.inert=!!wasInert;
  if(returnFocus?.isConnected)returnFocus.focus();
  onClose?.();
 };
 // 버튼이 하나뿐이라 Tab은 그 자리에 머물고, Esc도 [확인]과 같아요.
 const onKey=e=>{if(e.key==='Escape'){e.preventDefault();close();}else if(e.key==='Tab'){e.preventDefault();overlay.querySelector('.explore-done-ok').focus();}};
 overlay.addEventListener('click',e=>{if(e.target.closest('.explore-done-ok'))close();});
 document.addEventListener('keydown',onKey,true);
 root.append(overlay);
 overlay.querySelector('.explore-done-ok').focus();
 return true;
}
