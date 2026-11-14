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

// 맞춤 추천 6개. 지금은 계산 없이 고정이에요(편집 화면 순서).
export const RECOMMENDED=['LoanJeonse','LoanGuide','JeonseRentCalc','MyAsset','CreditScore','RepaySchedule'];
// 홈 팝업은 Figma pop_Home_QuickMenu(4329:18315) 순서와 짧은 이름을 따라요.
export const POPUP_RECOMMENDED=[
 ['LoanGuide','전월세\n대출가이드'],['JeonseRentCalc','계산기'],['MyAsset','내 자산'],['LoanJeonse','전세대출'],
 ['CreditScore','신용점수'],['RepaySchedule','상환·결제\n일정'],
];

export const SECTIONS=[
 {title:'맞춤 추천 6개',note:'내 정보에 맞춰 고정돼요',fixed:true,items:RECOMMENDED},
 {title:'대출',items:['LoanMoney','LoanRefinance','RateCut','LoanCarPurchase','AILoanAlert','LoanMortgage','LoanInstallment','LoanCarLeaseRent']},
 {title:'카드',items:['CardCompare','FindaCard','CardFind']},
 {title:'나의 금융 정보',items:['CardPerformance']},
 {title:'사업자',items:['LoanBusiness','BusinessCredit','MarketAnalysis']},
 {title:'부가 서비스',items:['DepositCompare','LoanInsurance','SpamBlock','FindaPost','PhoneGuard','AgeCalc','MoneyMate']},
 {title:'소식',items:['Notice','Attendance','FAQ']},
];

export const MAX_PICKS=2;
// 온보딩을 마친 홈(OB_*)만 맞춤 팝업을 보여 줘요. 그 전(NoOB·InOB)에는 빈 상태 팝업이에요.
export const popupMode=homeState=>String(homeState||'').startsWith('OB_')?'personal':'noob';
export const TOAST_FIXED='맞춤 메뉴는 제거가 어려워요.\n대신 다른 메뉴 2가지 추가가 가능해요';
export const TOAST_MAX='추가 메뉴는 최대 2개까지 고를 수 있어요';

// 메뉴를 눌렀을 때: 새 선택 목록과 띄울 토스트(없으면 null)를 돌려줘요.
export function toggleMenu(picks,id){
 if(RECOMMENDED.includes(id))return {picks,toast:TOAST_FIXED};
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

// [완료]로 저장한 메뉴. 메모리에만 두고 새로고침하면 초기화돼요.
let saved=[];
export const getSavedPicks=()=>[...saved];
export const savePicks=picks=>{saved=picks.filter(id=>MENUS[id]&&!RECOMMENDED.includes(id)).slice(0,MAX_PICKS);};
