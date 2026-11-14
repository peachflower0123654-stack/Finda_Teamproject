export const asIsScreens = [
 ["splash", "Finda_Splash", "4466:5862"],
 ["intro", "Finda_OB_01", "4422:4258"],
 ["security", "Finda_OB_02", "4428:4320"],
 ["security-consent", "Finda_OB_02_popup", "4516:6753"],
 ["assets", "Finda_OB_03", "4418:4260"],
 ["connect", "Finda_OB_04", "4418:4261"],
 ["asset-select", "Finda_OB_05-자산직접불러오기1", "4507:7017"],
 ["consent", "Finda_OB_05", "4418:4262"],
 ["verify", "Finda_OB_06", "4418:4263"],
 ["signing", "Finda_OB_07", "4418:4264"],
 ["home", "Finda_Home", "4418:4265"],
 ["point", "Finda_Point", "4418:4270"],
 ["all", "Finda_All", "4418:4271"],
 ["find-loan", "Finda_FindLoan", "4500:6614"],
 ["rate-cut", "Finda_금리인하", "4500:6920"],
 ["posts", "Finda_포스트 리스트", "4525:8341"],
 ["refinance", "Finda_대환", "4536:17329"],
];
export const initialAsIs = () => ({screen: "splash", history: [], review: false});
const forward = {splash:"intro", intro:"security", security:"security-consent", "security-consent":"assets", assets:"connect", connect:"consent", "asset-select":"consent", consent:"verify", verify:"signing", signing:"home"};
export function goAsIs(state, screen) {
 if (!asIsScreens.some(([key]) => key === screen) || state.screen === screen) return state;
 return {...state, screen, history: [...state.history, state.screen]};
}
export const nextAsIs = state => forward[state.screen] ? goAsIs(state, forward[state.screen]) : state;
export function backAsIs(state) {
 if (state.history.length) return {...state, screen: state.history.at(-1), history: state.history.slice(0, -1)};
 if (["point","all"].includes(state.screen)) return {...state,screen:"home"};
 if(state.screen==="find-loan")return {...state,screen:"home"};
 if(state.screen==="rate-cut")return {...state,screen:"all"};
 if(state.screen==="posts")return {...state,screen:"all"};
 if(state.screen==="refinance")return {...state,screen:"home"};
 if(["asset-select","consent"].includes(state.screen))return {...state,screen:"connect"};
 const index=asIsScreens.findIndex(([key])=>key===state.screen);
 return index>0 ? {...state, screen: asIsScreens[index-1][0]} : state;
}
export const reviewAsIs = (state, screen) => asIsScreens.some(([key]) => key === screen) ? {...state, screen, history: [], review: true} : state;
export const shouldAdvanceAsIs = state => !state.review && ["splash", "signing"].includes(state.screen);
