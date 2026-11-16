// cmp_Common_Alert / Default (Figma 3531:2681). 미구현 안내에는 검은 배경만 사용합니다.
export const TEST_SCOPE_MESSAGE='이 테스트에서는 구현되지않았어요';
const timers=new WeakMap();
export function showTestScopeNotice(root){
 if(!root)return;
 clearTimeout(timers.get(root));
 root.querySelector(':scope > .test-scope-notice')?.remove();
 const toast=document.createElement('div');
 toast.className='test-scope-notice';toast.dataset.type='Default';
 toast.setAttribute('role','status');toast.setAttribute('aria-live','polite');toast.setAttribute('aria-atomic','true');
 const text=document.createElement('p');text.textContent=TEST_SCOPE_MESSAGE;toast.append(text);
 root.append(toast);
 timers.set(root,setTimeout(()=>{toast.remove();timers.delete(root);},2500));
 return toast;
}
