export const versions={asis:{label:'화면 A',path:'../as-is/index.html'},tobe:{label:'화면 B',path:'../index.html'}};
export const DEFAULT_FIRST='asis';
export const isVersion=value=>Object.hasOwn(versions,value);
export const comparisonOrder=(first=DEFAULT_FIRST)=>first==='tobe'?['tobe','asis']:['asis','tobe'];
export function studyContext(version,search=globalThis.location?.search||''){
 const params=new URLSearchParams(search);
 if(params.get('study')!=='1'||!isVersion(version))return null;
 const first=isVersion(params.get('first'))?params.get('first'):version;
 const order=comparisonOrder(first);
 return {version,first,order,step:order.indexOf(version)+1,label:versions[version].label};
}
export function studyURL(version,first=version,base=import.meta.url){
 if(!isVersion(version)||!isVersion(first))throw new TypeError('Unknown study version');
 const url=new URL(versions[version].path,base);
 url.search=new URLSearchParams({mode:'test',study:'1',first}).toString();
 return url.href;
}
