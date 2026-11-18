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
