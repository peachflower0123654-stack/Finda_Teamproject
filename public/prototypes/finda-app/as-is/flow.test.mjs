import test from "node:test";
import assert from "node:assert/strict";
import {initialAsIs,nextAsIs,backAsIs,goAsIs,reviewAsIs,shouldAdvanceAsIs} from "./flow.mjs";

test("Splash부터 서명과 홈까지 연결하고 뒤로가기로 복귀한다",()=>{
 let state=initialAsIs();
 for(const screen of ["intro","security","security-consent","assets","connect","consent","verify","signing","home"]){
  state=nextAsIs(state);
  assert.equal(state.screen,screen);
 }
 assert.equal(nextAsIs(state),state);
 assert.equal(backAsIs(state).screen,"signing");
});
test("자산 연결을 다음에 하면 홈으로 가고 뒤로가면 자산 안내로 돌아온다",()=>{
 let state=initialAsIs();
 for(let i=0;i<4;i++)state=nextAsIs(state);
 state=goAsIs(state,"home");
 assert.equal(state.screen,"home");
 assert.equal(backAsIs(state).screen,"assets");
 assert.equal(goAsIs(state,"unknown"),state);
});
test("악성앱 찾기는 필수 동의 팝업을 열고 확인 후 자산 안내로 진행한다",()=>{
 const security=reviewAsIs(initialAsIs(),"security");
 const popup=nextAsIs(security);
 assert.equal(popup.screen,"security-consent");
 assert.equal(shouldAdvanceAsIs(popup),false);
 assert.equal(backAsIs(popup).screen,"security");
 assert.equal(backAsIs(reviewAsIs(initialAsIs(),"security-consent")).screen,"security");
 assert.equal(nextAsIs(popup).screen,"assets");
});
test("직접 검토하는 Splash와 서명은 자동 전환하지 않는다",()=>{
 for(const screen of ["splash","signing"]){
  const live=goAsIs(initialAsIs(),screen);
  assert.equal(shouldAdvanceAsIs(live),true);
  assert.equal(shouldAdvanceAsIs(reviewAsIs(live,screen)),false);
 }
 assert.equal(shouldAdvanceAsIs(goAsIs(initialAsIs(),"verify")),false);
});
test("동의 시트 직접 검토에서 뒤로가기는 연결 방식 화면을 복원한다",()=>{
 const state=reviewAsIs(initialAsIs(),"consent");
 assert.equal(backAsIs(state).screen,"connect");
 assert.equal(backAsIs(initialAsIs()).screen,"splash");
 assert.equal(reviewAsIs(state,"unknown"),state);
});
test("직접 선택 분기는 기존 동의창을 재사용하고 닫으면 직접 선택으로 복귀한다",()=>{
 const connect=reviewAsIs(initialAsIs(),"connect");
 const select=goAsIs(connect,"asset-select");
 assert.equal(select.screen,"asset-select");
 assert.equal(shouldAdvanceAsIs(select),false);
 assert.equal(backAsIs(select).screen,"connect");
 const consent=nextAsIs(select);
 assert.equal(consent.screen,"consent");
 assert.equal(backAsIs(consent).screen,"asset-select");
 assert.equal(nextAsIs(consent).screen,"verify");
 assert.equal(backAsIs(reviewAsIs(initialAsIs(),"asset-select")).screen,"connect");
});
test("홈·포인트·전체는 온보딩을 다시 실행하지 않고 왕복한다",()=>{
 let state=reviewAsIs(initialAsIs(),"home");
 for(const screen of ["point","all","home","all","point"]){
  state=goAsIs(state,screen);
  assert.equal(state.screen,screen);
  assert.equal(shouldAdvanceAsIs(state),false);
  assert.equal(nextAsIs(state),state);
 }
 assert.equal(backAsIs(state).screen,"all");
 for(const screen of ["point","all"])assert.equal(backAsIs(reviewAsIs(initialAsIs(),screen)).screen,"home");
});
test("대출·금리인하·핀다포스트 진입 후 출발 화면으로 복귀하며 자동 진행하지 않는다",()=>{
 for(const [origin,destination] of [["home","find-loan"],["home","refinance"],["all","find-loan"],["all","rate-cut"],["all","posts"]]){
  const state=goAsIs(reviewAsIs(initialAsIs(),origin),destination);
  assert.equal(state.screen,destination);
  assert.equal(backAsIs(state).screen,origin);
  assert.equal(nextAsIs(state),state);
  assert.equal(shouldAdvanceAsIs(state),false);
 }
 assert.equal(backAsIs(reviewAsIs(initialAsIs(),"find-loan")).screen,"home");
 assert.equal(backAsIs(reviewAsIs(initialAsIs(),"rate-cut")).screen,"all");
 assert.equal(backAsIs(reviewAsIs(initialAsIs(),"posts")).screen,"all");
 assert.equal(backAsIs(reviewAsIs(initialAsIs(),"refinance")).screen,"home");
});
