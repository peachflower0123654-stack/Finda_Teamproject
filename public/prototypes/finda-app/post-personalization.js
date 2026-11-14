import {POSTS,AFFILIATIONS,HOUSINGS} from './post-data.js';
// 핀다 포스트 개인화 V4.0. 계산 방식은 참고 파일(핀다_포스트개인화_테스트_V4.0.html)과 같다.
// a = 소속(AFFILIATIONS), h = 주거(HOUSINGS), n = 대출 건수(LOAN_COUNTS) 인덱스.
// 칩 순서 연결표 (하은 3.0v 기준, 맞는 글이 3개 미만인 연결 2곳 수정: 자영업, 대출 1~2건)
const HOUSING_CHIPS=[['부동산'],[],['부동산'],[]];
const LOAN_CHIPS=[['사용팁'],['대출','사용팁'],['신용점수','대출']];
const AFFILIATION_CHIPS=[['정책','생활'],['생활','대출'],['대출','정책'],['생활','정책'],['정책','생활']];
// 연결되지 않은 칩은 비즈니스 순서 (글의 비즈니스 가치 평균 순)
const BUSINESS_ORDER=['대출','사용팁','부동산','신용점수','정책','생활'];
export function chipOrder(a,h,n){
 const o=[];
 for(const c of [...HOUSING_CHIPS[h],...LOAN_CHIPS[n],...AFFILIATION_CHIPS[a],...BUSINESS_ORDER])if(!o.includes(c))o.push(c);
 o.push('금융사고');return o;
}
export function scorePost(p,a,h,n){
 // 칸별 0~10점. 주거 "기타"는 모든 글 4점
 const v=p.s10,af=v[a],ho=h<3?v[5+h]:4,lo=v[8+n],raw=af+ho+lo;
 let score=Math.round(raw/3*10)/10,notes=[];
 if(Math.max(af,ho,lo)<8&&score>6){score=6;notes.push('공통 정보 상한 6')}
 if(p.st&&score>3){score=3;notes.push('시기 지남('+p.st+')')}
 return {...p,af,ho,lo,raw,score,urg:p.ur?1:0,notes};
}
// 동점: 상한 전 합계 → 가장 잘 맞는 칸 점수 → 시급성 → 비즈니스 가치 → 핀다 노출 순서
export const inChip=(x,y)=>y.score-x.score||y.raw-x.raw||Math.max(y.af,y.ho,y.lo)-Math.max(x.af,x.ho,x.lo)||y.urg-x.urg||y.bm-x.bm||x.fo-y.fo;
export function recommend(a,h,n){
 const order=chipOrder(a,h,n);
 const ranked={};
 for(const c of order)ranked[c]=POSTS.filter(p=>p.c===c).map(p=>scorePost(p,a,h,n)).sort(inChip);
 const firsts=order.map(c=>({...ranked[c][0],chip:c}));
 // MY: 1위 7개 중 점수 → 시급성 → 비즈니스 가치 → 그 사람의 칩 순서
 const sorted=[...firsts].sort((x,y)=>y.score-x.score||y.urg-x.urg||y.bm-x.bm||order.indexOf(x.chip)-order.indexOf(y.chip));
 const my=sorted.slice(0,3);
 const myChips=new Set(my.map(p=>p.chip));
 const chips=[{name:'MY',posts:my}];
 // MY에 1위를 보낸 칩은 2·3·4위, 나머지 칩은 1·2·3위 → 홈 24칸에 같은 글이 없다.
 for(const c of order){
  const list=myChips.has(c)?ranked[c].slice(1,4):ranked[c].slice(0,3);
  chips.push({name:c,posts:list.map(p=>({...p,chip:c}))});
 }
 return {order,chips};
}
// 온보딩 전(NoOB) 홈 포스트: 개인화 없이 핀다 기본값 그대로 (11/14 결정: 인기순 X, MY 칩 X, 정책 칩 O).
// 칩은 핀다 기존 순서(사용팁>대출>신용점수>부동산>생활>금융사고)를 그대로 두고, 새 정책 칩은 부동산과 생활 사이.
// 정책 글의 출처 탭(대출·부동산·생활)과 가깝고, OB 홈처럼 정책이 생활보다 앞이에요. 앞 4칸은 핀다와 같아요.
// 칩 안 글은 핀다 노출 순서(fo, 탭 위→아래 = 최신순)대로 3개.
export const DEFAULT_CHIP_ORDER=['사용팁','대출','신용점수','부동산','정책','생활','금융사고'];
export function defaultFeed(){
 const chips=DEFAULT_CHIP_ORDER.map(c=>({name:c,posts:POSTS.filter(p=>p.c===c).sort((x,y)=>x.fo-y.fo).slice(0,3).map(p=>({...p,chip:c}))}));
 return {order:[...DEFAULT_CHIP_ORDER],chips};
}
// 온보딩 답 → {a,h,n}. 답이 없는 칸은 참고 파일 기본값(직장인 · 전월세 세입자 · 1~2건).
export function profileFromAnswers(s){
 const a=AFFILIATIONS.indexOf(s.affiliation),h=HOUSINGS.indexOf(String(s.housing).replace('.','·'));
 const count=Number(s.count);
 const n=s.ownership===false?0:s.ownership===true&&/^\d+$/.test(s.count)?(count>=3?2:count>=1?1:0):1;
 return {a:a<0?1:a,h:h<0?0:h,n};
}
const SPRITE_COLS=19;
export const thumbStyle=p=>`background-image:url(assets/post-thumbs.jpg);background-size:1672px 1178px;background-position:${-(p.sp%SPRITE_COLS)*88}px ${-Math.floor(p.sp/SPRITE_COLS)*62}px`;
