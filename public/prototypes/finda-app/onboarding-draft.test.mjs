import test from 'node:test';
import assert from 'node:assert/strict';
import {DRAFT_KEYS,draftKey,readDraft,writeDraft,clearDraft,newDraft,saveStep,trackOf,eventPayload,restoreState,exitField} from './onboarding-draft.js';
import {initial} from './flow.mjs';

const memory=()=>{const map=new Map();return {getItem:k=>map.has(k)?map.get(k):null,setItem:(k,v)=>map.set(k,String(v)),removeItem:k=>map.delete(k),map};};
const at=(screen,extra={})=>({...initial(),screen,...extra});
const fresh=()=>newDraft(()=>'attempt-1');

test('participant links use the study key, everything else the dev key',()=>{
 assert.equal(draftKey(true),'finda.study.v1.onboardingDraft');
 assert.equal(draftKey(false),'finda.dev.v1.onboardingDraft');
 assert.deepEqual(Object.values(DRAFT_KEYS),['finda.study.v1.onboardingDraft','finda.dev.v1.onboardingDraft']);
});

test('drafts round-trip through storage and can be cleared',()=>{
 const storage=memory(),key=DRAFT_KEYS.dev;
 assert.equal(readDraft(storage,key),null);
 writeDraft(fresh(),storage,key);
 assert.equal(readDraft(storage,key).attempt_id,'attempt-1');
 clearDraft(storage,key);
 assert.equal(readDraft(storage,key),null);
 storage.setItem(key,'{broken');
 assert.equal(readDraft(storage,key),null);
});

test('multiple-choice answers are saved on next with the next screen as resume point',()=>{
 let d=saveStep(fresh(),at('03',{affiliation:'직장인'}),'next');
 assert.deepEqual(d.answers,{affiliation:'직장인'});
 assert.deepEqual(d.resume,{step:'04',field:null});
 d=saveStep(d,at('04',{housing:'전월세 세입자'}),'next');
 assert.deepEqual(d.resume,{step:'05',field:null});
 assert.equal(d.attempt_id,'attempt-1');
});

test('loan ownership confirm picks the track and its first field',()=>{
 const yes=saveStep(fresh(),at('05',{ownership:true}),'next');
 assert.equal(yes.answers.has_loan,true);
 assert.deepEqual(yes.resume,{step:'06',field:'loan_count'});
 assert.equal(trackOf(yes),'has_loan');
 const no=saveStep(fresh(),at('05',{ownership:false}),'next');
 assert.deepEqual(no.resume,{step:'08',field:'desired_amount'});
 assert.equal(trackOf(no),'no_loan');
});

test('changing ownership drops the other track answers',()=>{
 let d=saveStep(fresh(),at('05',{ownership:true}),'next');
 d=saveStep(d,at('06',{ownership:true,count:'2',revealed:2}),'reveal');
 d=saveStep(d,at('05',{ownership:false}),'next');
 assert.deepEqual(d.answers,{has_loan:false});
});

test('loan count and principal are saved when focus moves to the next field, not while typing',()=>{
 let d=saveStep(fresh(),at('05',{ownership:true}),'next');
 d=saveStep(d,at('06',{ownership:true,count:'2',principal:'',revealed:2}),'reveal');
 assert.equal(d.answers.loan_count,2);
 assert.equal('loan_principal' in d.answers,false);
 assert.deepEqual(d.resume,{step:'06',field:'loan_principal'});
 d=saveStep(d,at('06',{ownership:true,count:'2',principal:'30000000',monthly:'',revealed:3}),'reveal');
 assert.equal(d.answers.loan_principal,30000000);
 assert.equal('monthly_repayment' in d.answers,false);
 d=saveStep(d,at('06',{ownership:true,count:'2',principal:'30000000',monthly:'500000',revealed:3}),'next');
 assert.equal(d.answers.monthly_repayment,500000);
 assert.deepEqual(d.resume,{step:'07',field:null});
});

test('desired amount is saved on the number pad next',()=>{
 const d=saveStep(fresh(),at('08',{ownership:false,amount:'10000000'}),'next');
 assert.equal(d.answers.desired_amount,10000000);
 assert.deepEqual(d.resume,{step:'09',field:null});
});

test('event payload flattens the saved answers next to the attempt id',()=>{
 const d=saveStep(fresh(),at('03',{affiliation:'직장인'}),'next');
 assert.deepEqual(eventPayload(d,{exit_step:'04',exit_field:null}),{attempt_id:'attempt-1',affiliation:'직장인',exit_step:'04',exit_field:null});
});

test('restore leaves multiple-choice screens unselected',()=>{
 let d=saveStep(fresh(),at('03',{affiliation:'직장인'}),'next');
 const {state,focus}=restoreState(at('11',{affiliation:'직장인',housing:'자가보유'}),d);
 assert.equal(state.screen,'04');
 assert.equal(state.housing,'');
 assert.equal(state.affiliation,'');
 assert.equal(focus,null);
});

test('restore on the loan info screen fills only saved fields and focuses the resume field',()=>{
 let d=saveStep(fresh(),at('05',{ownership:true}),'next');
 d=saveStep(d,at('06',{ownership:true,count:'2',revealed:2}),'reveal');
 const {state,focus}=restoreState(at('11',{principal:'999'}),d);
 assert.equal(state.screen,'06');
 assert.equal(state.ownership,true);
 assert.equal(state.count,'2');
 assert.equal(state.principal,'');
 assert.equal(state.revealed,2);
 assert.equal(focus,'principal');
});

test('restore after monthly repayment lands on extra loan with nothing selected',()=>{
 let d=saveStep(fresh(),at('05',{ownership:true}),'next');
 d=saveStep(d,at('06',{ownership:true,count:'2',principal:'1',monthly:'1',revealed:3}),'next');
 const {state}=restoreState(at('11',{interest:'전월세 보증금'}),d);
 assert.equal(state.screen,'07');
 assert.equal(state.interest,'');
 assert.equal(state.revealed,3);
});

test('exit field is reported only on input screens',()=>{
 assert.equal(exitField('06','principal'),'loan_principal');
 assert.equal(exitField('08','amount'),'desired_amount');
 assert.equal(exitField('04','count'),null);
});
