export const consentItems=[
 {id:'service',label:'서비스 이용 약관 (필수)',required:true,detail:true},
 {id:'privacy',label:'필수 개인 정보 수집 및 이용 (필수)',required:true,detail:true},
 {id:'marketing',label:'마케팅 프로모션 알림 수신 동의 (선택)',required:false,detail:false},
];
export const emptyConsent=()=>Object.fromEntries(consentItems.map(item=>[item.id,false]));
export const canContinueConsent=values=>consentItems.filter(item=>item.required).every(item=>values?.[item.id]===true);
export function toggleConsent(values,id){
 const checked=id==='all'?!consentItems.every(item=>values[item.id]):!values[id];
 return id==='all'?Object.fromEntries(consentItems.map(item=>[item.id,checked])):{...values,[id]:checked};
}
export function consentScreen(values){
 const all=consentItems.every(item=>values[item.id]);
 const row=(id,label,checked,detail=false)=>`<div class="consent-row"><label><input type="checkbox" data-consent="${id}" ${checked?'checked':''}><span class="consent-check" aria-hidden="true"><img src="assets/${checked?'971e5':'be8ee'}.svg" alt="">${checked?'<span>✓</span>':''}</span><span>${label}</span></label>${detail?`<button class="consent-detail" disabled aria-label="${label} 상세 보기">›</button>`:''}</div>`;
 return `<div class="screen consent"><div class="top"><button class="back" data-action="back" aria-label="이전 화면">‹</button></div><h2>라이프스테이지 수집하면<br>좋은 이유 설명</h2><div class="consent-illustration" aria-hidden="true"></div><h3>약관동의</h3><div class="consent-rows">${row('all','모두 동의',all)}${consentItems.map(item=>row(item.id,item.label,values[item.id],item.detail)).join('')}</div><div class="actions"><button class="secondary" data-action="consent-home">홈으로 가기</button><button class="primary" data-action="next" ${canContinueConsent(values)?'':'disabled'}>다음</button></div></div>`;
}
