// 개인화 홈(Home_OB_NoMD) 탐색 종료 조건 (11.20)
// ① 홈에서 실제로 누른 횟수가 CLICK_LIMIT번이 되는 순간 바로 종료해요.
//    단, 그 마지막 누름이 퀵메뉴 열기·포스트 칩/글이면 그 탐색을 이어 가게 두고(대기),
//    - 퀵메뉴: 편집에 들어가지 않고 닫으면 종료. 편집 [완료]는 기존 quickmenu_done 종료, 편집하다 그냥 나오면 계속 탐색.
//    - 포스트: 다른 칩·글을 누르는 동안은 계속, 포스트 밖을 누르면 종료. (MY 칩 글은 기존대로 바로 종료)
// ② 홈에 머문 시간이 DWELL_LIMIT_SEC초 이상(또는 ①의 횟수 이상)이면 끝까지 스크롤했을 때 종료해요.
// 화면·DOM과 상관없는 판정만 맡아요. 실제 모달·전송은 app.js가 해요.
export const CLICK_LIMIT=5;
export const DWELL_LIMIT_SEC=60;

// kind: 'quickmenu'(퀵메뉴 열기) | 'post'(포스트 칩·글) | 'other'(그 밖의 누를 수 있는 요소)
export function createExploreTrigger({clickLimit=CLICK_LIMIT,dwellLimit=DWELL_LIMIT_SEC}={}){
 let clicks=0,dwell=0,pending=null;
 return {
  get clicks(){return clicks;},
  get dwell(){return dwell;},
  get pending(){return pending;},
  stats(){return {click_count:clicks,dwell_sec:dwell};},
  tick(sec=1){dwell+=sec;},
  // 누를 때마다 불러요. 'end'면 지금 종료, 'wait'면 예외 탐색 시작, null이면 계속.
  click(kind){
   clicks++;
   if(pending==='post'&&kind!=='post'){pending=null;return 'end';}
   if(pending||clicks<clickLimit)return null;
   if(kind==='quickmenu'||kind==='post'){pending=kind;return 'wait';}
   return 'end';
  },
  // 퀵메뉴를 닫을 때(사용자가 닫은 경우만) 불러요. edited: 편집 화면에 들어갔는지, completed: 편집 [완료]를 눌렀는지.
  quickMenuClosed({edited=false,completed=false}={}){
   if(pending!=='quickmenu')return null;
   pending=null;
   return edited||completed?null:'end';
  },
  scrollEndReady(){return dwell>=dwellLimit||clicks>=clickLimit;},
 };
}
