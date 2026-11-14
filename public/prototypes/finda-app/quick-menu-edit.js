// 퀵메뉴 데이터와 편집 규칙 (DOM 없음, quick-menu.test.mjs에서 테스트).
// Figma 퀵메뉴 풀 3845:34002, 퀵메뉴 편집 4329:16274. 아이콘은 assets/menu-<id>.svg.

// [id, 이름, 줄바꿈 표시(\n)]
const menuList=[
 ['LoanJeonse','전세대출'],
 ['LoanGuide','전월세대출 가이드','전월세대출\n가이드'],
 ['JeonseRentCalc','전세·월세 비교 계산기','전세·월세\n비교 계산기'],
 ['MyAsset','내 자산'],
 ['CreditScore','신용점수'],
 ['RepaySchedule','상환·결제 일정','상환·결제\n일정'],
 ['LoanMoney','대출받기'],
 ['LoanRefinance','대출 갈아타기','대출\n갈아타기'],
 ['RateCut','금리인하 자동신청','금리인하\n자동신청'],
 ['LoanCarPurchase','차 구매대출'],
 ['AILoanAlert','AI 대출 예측 알리미','AI 대출 예측\n알리미'],
 ['LoanMortgage','주택담보대출'],
 ['LoanInstallment','우수대부'],
 ['LoanCarLeaseRent','차 리스렌트'],
 ['CardCompare','카드 한번에 비교','카드\n한번에 비교'],
 ['FindaCard','핀다 카드'],
 ['CardFind','신용카드 찾기'],
 ['CardPerformance','핀다카드 실적관리','핀다카드\n실적관리'],
 ['LoanBusiness','사업자대출'],
 ['BusinessCredit','사업자 신용관리','사업자\n신용관리'],
 ['MarketAnalysis','상권 분석 서비스'],
 ['DepositCompare','예적금 비교'],
 ['LoanInsurance','대출 갚아주는 보험','대출 갚아주는\n보험'],
 ['SpamBlock','금융 스팸 차단'],
 ['FindaPost','핀다 포스트'],
 ['PhoneGuard','내 폰 지키미'],
 ['AgeCalc','나이값 계산기'],
 ['MoneyMate','머니메이트'],
 ['Notice','공지사항'],
 ['Attendance','출석체크'],
 ['FAQ','자주 묻는 질문'],
];
export const MENUS=Object.fromEntries(menuList.map(([id,label,text=label])=>[id,{id,label,text,icon:`assets/menu-${id}.svg`}]));

// 퀵메뉴 추천 로직 (11/7 설계, 노션 "포스트 로직 설계 최종 및 퀵메뉴 로직 설계"의 선영안 HTML 점수 그대로)
// 메뉴마다 소속 5칸 · 주거 3칸 · 대출 건수 3칸을 0~10점으로 매겼어요. 주거 "기타"는 5점.
// 그 사람의 3칸 합계 → 비즈니스 가치(bm 0~3) → 핀다 기존 노출 순서(o) 순으로 6개를 골라요.
// 자주 묻는 질문은 누구에게나 같아서 후보에서 빼고 소식 그룹에 고정. 포인트는 앱에 아이콘이 없어 뺐어요.
// [id, 그룹, 소속 5칸, 주거 3칸, 대출 3칸, bm, o]
const SCORES=[
 ['LoanMoney','대출',[5,8,6,6,4],[6,5,6],[6,8,5],3,0],
 ['LoanRefinance','대출',[2,7,6,6,5],[5,4,6],[0,10,9],3,1],
 ['RateCut','대출',[2,7,5,5,4],[5,4,6],[0,9,7],1,10],
 ['LoanCarPurchase','대출',[2,7,6,5,3],[4,6,5],[5,5,2],3,8],
 ['LoanGuide','대출',[8,7,4,3,2],[10,7,1],[6,5,3],2,11],
 ['AILoanAlert','대출',[4,7,6,5,4],[5,5,5],[7,7,6],2,12],
 ['LoanJeonse','대출',[6,8,5,3,2],[10,6,1],[6,6,3],3,5],
 ['LoanMortgage','대출',[0,6,6,7,6],[3,2,10],[4,6,5],3,4],
 ['LoanInstallment','대출',[2,3,5,3,3],[4,3,3],[1,4,8],2,6],
 ['LoanCarLeaseRent','대출',[1,5,7,4,3],[4,4,5],[4,4,2],2,9],
 ['CreditScore','신용관리',[7,7,7,6,5],[5,5,5],[8,7,10],1,13],
 ['CardCompare','카드',[6,8,6,5,4],[5,6,5],[6,5,3],2,14],
 ['FindaCard','카드',[5,7,5,4,3],[5,6,5],[5,5,3],3,2],
 ['CardFind','카드',[7,7,5,4,3],[5,6,5],[6,5,2],3,7],
 ['MyAsset','나의 금융 정보',[4,7,7,8,9],[5,4,7],[5,6,7],1,15],
 ['RepaySchedule','나의 금융 정보',[2,6,6,6,6],[5,4,6],[0,9,10],1,16],
 ['CardPerformance','나의 금융 정보',[3,6,4,4,3],[5,5,5],[4,4,3],1,17],
 ['MoneyMate','나의 금융 정보',[8,8,5,5,6],[6,7,5],[6,6,8],1,30],
 ['JeonseRentCalc','계산기',[7,7,4,3,2],[10,7,1],[5,5,3],1,18],
 ['LoanBusiness','사업자',[0,1,10,3,1],[5,4,5],[4,7,6],3,3],
 ['BusinessCredit','사업자',[0,0,10,2,1],[5,4,5],[5,6,8],2,19],
 ['MarketAnalysis','사업자',[1,1,9,3,2],[5,4,5],[5,5,4],2,20],
 ['SpamBlock','부가 서비스',[4,4,4,8,9],[5,5,5],[5,5,7],0,21],
 ['LoanInsurance','부가 서비스',[0,5,5,5,4],[4,3,6],[0,7,7],1,22],
 ['DepositCompare','부가 서비스',[6,7,4,7,8],[5,6,5],[8,5,2],1,23],
 ['FindaPost','부가 서비스',[5,5,5,5,5],[5,5,5],[5,5,5],0,24],
 ['PhoneGuard','부가 서비스',[3,3,3,8,9],[5,5,5],[5,5,5],0,25],
 ['AgeCalc','부가 서비스',[6,5,3,3,2],[5,5,5],[5,5,5],0,26],
 ['Notice','소식',[3,3,3,3,3],[3,3,3],[3,3,3],0,27],
 ['Attendance','소식',[7,4,3,5,5],[4,5,4],[4,4,4],0,29],
].map(([id,group,af,ho,lo,bm,o],fo)=>({id,group,af,ho,lo,bm,o,fo}));
export const PICK_COUNT=6;
// 편집 화면 전체 메뉴 그룹 (핀다 전체 메뉴 8개 그룹). 그룹 안은 핀다 기존 순서, 빈 그룹은 숨겨요.
export const GROUPS=['대출','신용관리','카드','나의 금융 정보','계산기','사업자','부가 서비스','소식'];
const GROUP_ITEMS=Object.fromEntries(GROUPS.map(g=>[g,[...SCORES.filter(m=>m.group===g).map(m=>m.id),...(g==='소식'?['FAQ']:[])]]));

// {a,h,n} = 소속·주거·대출 건수 인덱스 (post-personalization.js profileFromAnswers와 같아요)
export function scoreMenus({a,h,n}){
 return SCORES.map(m=>{const af=m.af[a],ho=h<3?m.ho[h]:5,lo=m.lo[n];return {...m,total:af+ho+lo}})
  .sort((x,y)=>y.total-x.total||y.bm-x.bm||x.o-y.o);
}
export const recommendMenus=profile=>scoreMenus(profile).slice(0,PICK_COUNT).map(m=>m.id);

// 기본값은 온보딩 답이 없을 때와 같은 직장인 · 전월세 세입자 · 대출 1~2건.
export const DEFAULT_PROFILE={a:1,h:0,n:1};
let recommended=recommendMenus(DEFAULT_PROFILE);
// [완료]로 저장한 메뉴. 메모리에만 두고 새로고침하면 초기화돼요.
let saved=[];
export const getRecommended=()=>[...recommended];
// app.js가 화면을 그릴 때마다 지금 온보딩 답(또는 미리보기 프로필)을 넘겨요.
export function setQuickMenuProfile(profile){
 recommended=recommendMenus(profile||DEFAULT_PROFILE);
 saved=saved.filter(id=>!recommended.includes(id));
}

// 홈 팝업은 72px 칸이라 긴 이름만 Figma pop_Home_QuickMenu(4329:18315)의 짧은 이름을 써요.
const POPUP_LABEL={LoanGuide:'전월세\n대출가이드',JeonseRentCalc:'계산기'};
export const popupRecommended=()=>recommended.map(id=>[id,POPUP_LABEL[id]||MENUS[id].text]);

// 편집 화면 섹션: 맞춤 추천 6개 + 그 6개를 뺀 전체 메뉴 그룹
export function sections(){
 return [
  {title:'맞춤 추천 6개',note:'내 정보에 맞춰 고정돼요',fixed:true,items:getRecommended()},
  ...GROUPS.map(title=>({title,items:GROUP_ITEMS[title].filter(id=>!recommended.includes(id))})).filter(s=>s.items.length),
 ];
}

export const MAX_PICKS=2;
// 온보딩을 마친 홈(OB_*)만 맞춤 팝업을 보여 줘요. 그 전(NoOB·InOB)에는 빈 상태 팝업이에요.
export const popupMode=homeState=>String(homeState||'').startsWith('OB_')?'personal':'noob';
export const TOAST_FIXED='맞춤 메뉴는 제거가 어려워요.\n대신 다른 메뉴 2가지 추가가 가능해요';
export const TOAST_MAX='추가 메뉴는 최대 2개까지 고를 수 있어요';

// 메뉴를 눌렀을 때: 새 선택 목록과 띄울 토스트(없으면 null)를 돌려줘요.
export function toggleMenu(picks,id){
 if(recommended.includes(id))return {picks,toast:TOAST_FIXED};
 if(picks.includes(id))return {picks:picks.filter(pick=>pick!==id),toast:null};
 if(picks.length>=MAX_PICKS)return {picks,toast:TOAST_MAX};
 return {picks:[...picks,id],toast:null};
}

// 바텀시트 버튼: 0개는 비활성, 1개는 "1개 추가하기", 2개는 "완료".
export function sheetButton(picks){
 if(picks.length===0)return {label:'추가하기',disabled:true};
 if(picks.length<MAX_PICKS)return {label:`${picks.length}개 추가하기`,disabled:false};
 return {label:'완료',disabled:false};
}

// 홈 팝업의 추가 2칸. 고른 메뉴가 없으면 null(= "추가" 칸).
export function popupExtraSlots(saved){
 return Array.from({length:MAX_PICKS},(_,i)=>saved[i]?MENUS[saved[i]]:null);
}

export const getSavedPicks=()=>[...saved];
export const savePicks=picks=>{saved=picks.filter(id=>MENUS[id]&&!recommended.includes(id)).slice(0,MAX_PICKS);};
