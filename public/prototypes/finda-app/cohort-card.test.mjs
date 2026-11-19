import test from 'node:test';
import assert from 'node:assert/strict';
import {cohortCard,cohortView} from './cohort-card.js';
const done=a=>cohortCard({stage:'done',answers:{affiliation:'직장인',housing:'전월세 세입자',...a}});
test('온보딩 전은 ①, 자리 표시 숫자와 내 상황 알려주기',()=>{const c=cohortCard({stage:'none'});assert.equal(c.id,'①');assert.equal(c.btn,'start');assert.match(cohortView(c),/is-placeholder/);});
test('이탈은 임시 저장 위치대로 ②③③-1③-2⑥',()=>{
 const d=(step,a={})=>cohortCard({stage:'draft',resumeStep:step,answers:{affiliation:'직장인',housing:'전월세 세입자',...a}}).id;
 assert.equal(d('05'),'②');assert.equal(d('06',{has_loan:true}),'③');assert.equal(d('08',{has_loan:false}),'③-1');assert.equal(d('09',{has_loan:false,desired_amount:30000000}),'③-2');assert.equal(d('07',{has_loan:true,loan_count:1}),'⑥');
});
test('완료 직장인: 1건+추가대출 관심 → 금리 확인, 관심 없음·3건 이상 → 상환 관리',()=>{
 assert.equal(done({has_loan:true,loan_count:1,extra_loan:'전월세 보증금'}).btn,'rate');
 assert.equal(done({has_loan:true,loan_count:1,extra_loan:'없다'}).btn,'manage');
 const many=done({has_loan:true,loan_count:4,extra_loan:'전월세 보증금'});assert.equal(many.id,'⑦');assert.equal(many.btn,'manage');
});
test('계획 없음 ③-3, 학생 보증금 목적 → 전월세대출 추천, 은퇴정착층 2줄',()=>{
 assert.equal(done({has_loan:false,no_loan_plan:true}).id,'③-3');
 assert.equal(cohortCard({stage:'done',answers:{affiliation:'학생·취업준비·무직',has_loan:false,loan_purpose:'전월세 보증금'}}).btn,'rent');
 const r=cohortCard({stage:'done',answers:{affiliation:'은퇴정착층',has_loan:true,loan_count:1}});assert.equal(r.rows.length,2);assert.equal(r.btn,'manage');
});
test('나이대: 직장인·자영업자 완료 카드에 한 줄 추가, 링크는 사라짐 / 학생은 무시',async()=>{
 const c=done({has_loan:true,loan_count:1,extra_loan:'전월세 보증금'});assert.ok(c.link);
 const aged=cohortCard({stage:'done',age:'40',answers:{affiliation:'직장인',has_loan:true,loan_count:1}});
 assert.deepEqual(aged.rows.at(-1),['40대 가구 · 가운데 순자산','2억 8,384만 원']);assert.equal(aged.link,null);
 assert.equal(cohortCard({stage:'done',age:'30',answers:{affiliation:'학생·취업준비·무직',has_loan:false}}).rows.length,1);
 assert.equal(cohortCard({stage:'draft',age:'30',resumeStep:'05',answers:{affiliation:'직장인'}}).rows.length,1);
});
test('ⓘ 출처: 카드 숫자마다 출처가 있고 자리 표시 줄은 빼요',async()=>{
 const {cardSources,sourceSheetView,editSheetView}=await import('./cohort-sheet.js');
 for(const a of ['학생·취업준비·무직','직장인','자영업자·사업자·프리랜서','액티브시니어','은퇴정착층'])for(const n of [1,2,4])for(const age of ['','20','30','40','50']){
  const c=cohortCard({stage:'done',age,answers:{affiliation:a,has_loan:true,loan_count:n}});assert.equal(cardSources(c).length,c.rows.length,`${a} ${n}건 ${age}`);}
 assert.equal(cardSources(cohortCard({stage:'none'})).length,0);
 assert.match(sourceSheetView(done({has_loan:true,loan_count:1})),/7,206만 원/);
 assert.match(sourceSheetView(cohortCard({stage:'done',answers:{affiliation:'자영업자·사업자·프리랜서',has_loan:true,loan_count:1}})),/사업자등록을 한 개인사업자 기준/);
 assert.match(editSheetView({affiliation:'직장인',housing:'전월세 세입자',has_loan:true,loan_count:1,principal:'50000000',monthly:'700000'},'aff'),/원금 5,000만 · 월 70만 원/);
 assert.doesNotMatch(editSheetView({affiliation:'은퇴정착층',housing:'자가보유',has_loan:false}),/나이대/);
});
test('맨 위 한 줄에 대출 없음·계획 없음을 쓰지 않고, 수정 시트 대출 줄은 건수/없음만',async()=>{
 const {editSheetView}=await import('./cohort-sheet.js');
 assert.equal(cohortCard({stage:'done',answers:{affiliation:'자영업자·사업자·프리랜서',housing:'전월세 세입자',has_loan:false,no_loan_plan:true}}).eb,'자영업자·사업자·프리랜서 · 전월세');
 assert.doesNotMatch(done({has_loan:false,desired_amount:30000000}).eb,/대출 없음/);
 assert.doesNotMatch(cohortCard({stage:'draft',resumeStep:'08',answers:{affiliation:'직장인',has_loan:false}}).eb,/대출 없음/);
 const v=(a,open)=>editSheetView({affiliation:'직장인',housing:'전월세 세입자',...a},open);
 assert.match(v({has_loan:true,loan_count:1}),/>1건 </);assert.doesNotMatch(v({has_loan:true,loan_count:1}),/있음 ·/);
 assert.match(v({has_loan:true,loan_count:4}),/>3건 이상 </);
 assert.match(v({has_loan:false,no_loan_plan:true}),/>없음 </);assert.doesNotMatch(v({has_loan:false,no_loan_plan:true}),/지금은 계획 없음/);
});
test('카드에는 온보딩 값 요약 줄이 없고, ⓘ는 숫자마다 그 숫자의 출처를 열어요',async()=>{
 const {sourceSheetView}=await import('./cohort-sheet.js');
 const c=cohortCard({stage:'done',age:'30',answers:{affiliation:'직장인',housing:'부모·가족과 함께',has_loan:true,loan_count:1}});
 const html=cohortView(c);
 assert.doesNotMatch(html,/cohort-card__eyebrow|부모·가족과 함께|대출 1건 기준/);
 assert.equal((html.match(/data-cohort="info"/g)||[]).length,2);
 assert.match(sourceSheetView(c,'1억 5,585만 원'),/30대/);assert.doesNotMatch(sourceSheetView(c,'1억 5,585만 원'),/7,206만 원/);
 assert.doesNotMatch(cohortView(cohortCard({stage:'none'})),/data-cohort="info"/);
});
