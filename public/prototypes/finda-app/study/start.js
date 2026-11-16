import {DEFAULT_FIRST,isVersion,studyURL} from './plan.mjs';
const requested=new URLSearchParams(location.search).get('first');
const first=isVersion(requested)?requested:DEFAULT_FIRST;
const start=document.querySelector('#study-start');start.href=studyURL(first,first);
if(isVersion(requested))document.querySelector('.study-footnote').textContent='상단의 ‘체험 마치기’로 다음 단계로 이동할 수 있어요.';
