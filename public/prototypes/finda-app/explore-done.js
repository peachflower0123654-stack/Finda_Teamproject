// 탐색 완료 안내 모달: 테스터에게 "Maze로 돌아가 [다음]"을 알려 줘요.
// 종료 지점(①홈 끝까지 스크롤 ②MY 칩 포스트 클릭 ③퀵메뉴 편집 [완료] → 바로 닫힘)에서 showExploreDone(app)을 불러요.
// 모달이 실제로 뜬 순간(true를 돌려줄 때)에만 explore_done 이벤트를 Supabase로 보내요. 그래서 테스터마다 첫 종료 지점 한 줄이 남아요.
// 온보딩 값을 받은 개인화 홈(Home_OB_NoMD)에서만, 같은 화면을 다시 불러오기 전까지 한 번만 떠요.
// app.js가 root.dataset.homeState에 지금 홈 상태를 넣어 둬요. 화면선택 미리보기(force)는 언제든 띄워요.
export const EXPLORE_DONE_HOME='OB_NoMD';
import {isComparisonStudy,finishStudyExperience} from './study/participant.js';
export const EXPLORE_DONE={
 title:'둘러보기를 마쳤어요',
 body:'이제 Maze 창으로 돌아가\n[다음]을 눌러 주세요.',
 button:'확인',
};
let shown=false;
export const resetExploreDone=()=>{shown=false;};
// ① 홈 끝까지 스크롤: 바닥에서 slack(px) 안쪽이면 끝으로 봐요.
export const atScrollEnd=({scrollTop,clientHeight,scrollHeight},slack=4)=>scrollHeight>clientHeight&&scrollTop+clientHeight>=scrollHeight-slack;

// 종료 지점 이름 (explore_done.exit_point)
export const EXIT_POINTS={scrollEnd:'scroll_end',myPost:'my_post_click',quickMenu:'quickmenu_done'};
// ② 종료 지점은 개인화 홈의 MY 칩 글 클릭만이에요. 다른 칩(정책·대출 등) 글 클릭은 post_click 기록만 남겨요.
export const MY_CHIP='MY';
export const isExitPost=chipName=>chipName===MY_CHIP;
// post_click payload: 어느 칩의 몇 번째 글을 눌렀는지 + 그 사람의 MY 3칸(클릭률·비교용).
export function postClickPayload({chip,post,position,myPostIds=[]}){
 return {chip,post_id:post.id,post_category:post.c??null,position,my_post_ids:[...myPostIds]};
}

// home_ob_view: 개인화 홈에서 MY 3칸이 처음 보인 순간. MY 클릭률의 분모예요.
// 같은 페이지에서 같은 MY 3칸이면 한 번만 보내요(화면을 다시 그려도 중복 없음). 온보딩을 다시 해서 MY가 바뀌면 다시 보내요.
let lastHomeView='';
export const resetHomeView=()=>{lastHomeView='';};
export function homeViewPayload(myPostIds,recommendationIds){
 const key=myPostIds.join(',');
 if(!key||key===lastHomeView)return null;
 lastHomeView=key;
 return {my_post_ids:[...myPostIds],recommendation_ids:[...recommendationIds]};
}

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
 if(isComparisonStudy())return finishStudyExperience('tobe');
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
