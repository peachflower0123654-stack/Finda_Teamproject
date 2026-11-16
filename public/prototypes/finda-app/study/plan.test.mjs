import test from 'node:test';import assert from 'node:assert/strict';
import {DEFAULT_FIRST,comparisonOrder,studyContext,studyURL} from './plan.mjs';
test('either starting link leads to both versions exactly once',()=>{
 for(const first of ['asis','tobe']){
  const order=comparisonOrder(first);assert.equal(new Set(order).size,2);
  assert.equal(studyContext(order[0],`study=1&first=${first}`).step,1);
  assert.equal(studyContext(order[1],`study=1&first=${first}`).step,2);
 }
 assert.equal(DEFAULT_FIRST,'asis');assert.deepEqual(comparisonOrder(),['asis','tobe']);
});
test('participant links preserve a GitHub Pages subpath and keep reviews separate',()=>{
 const base='https://example.github.io/Finda_Teamproject/prototypes/finda-app/study/plan.mjs';
 const asis=new URL(studyURL('asis','tobe',base)),tobe=new URL(studyURL('tobe','asis',base));
 assert.equal(asis.pathname,'/Finda_Teamproject/prototypes/finda-app/as-is/index.html');
 assert.equal(tobe.pathname,'/Finda_Teamproject/prototypes/finda-app/index.html');
 for(const url of [asis,tobe]){assert.equal(url.searchParams.get('mode'),'test');assert.equal(url.searchParams.get('study'),'1');}
 assert.equal(studyContext('asis','mode=test'),null);assert.equal(studyContext('unknown','study=1'),null);
 assert.throws(()=>studyURL('https://elsewhere.example','asis'),TypeError);
});
