import test from 'node:test';
import assert from 'node:assert/strict';
import {initial} from '../flow.mjs';
import {toBeRoute,toBeState} from './tobe-entry.mjs';
test('each supported To-be route reopens its intended screen',()=>{
 const home={...initial(),screen:'11',tab:'Asset'};
 const routes=['home','home-loan','point','all','find-loan','refinance','onboarding-00','onboarding-02','onboarding-03','onboarding-04','onboarding-05','onboarding-06','onboarding-07','onboarding-08','onboarding-09','result-HasLoan','result-HasLoanUnavailable','result-NoLoan','ai-rate-intro','ai-rate-consent','ai-rate-loading','ai-rate-rate','ai-rate-limit'];
 for(const route of routes)assert.equal(toBeRoute(toBeState(route,home)),route,route);
});
