// The public HTML entries mount the existing apps; no screen markup is copied.
const sources={asis:'../as-is/index.html',tobe:'../index.html'};
const variant=document.body.dataset.testVariant;

async function mount(){
 if(!Object.hasOwn(sources,variant))throw new TypeError('Unknown test entry');
 const source=new URL(sources[variant],import.meta.url);
 const response=await fetch(source);
 if(!response.ok)throw new Error('Entry template unavailable');
 const template=new DOMParser().parseFromString(await response.text(),'text/html');
 const base=document.createElement('base');
 base.href=new URL('./',source).href;
 document.head.prepend(base);
 const scripts=[...template.querySelectorAll('script[type="module"][src]')].map(script=>new URL(script.getAttribute('src'),source).href);
 template.querySelectorAll('script').forEach(script=>script.remove());
 const styles=[...template.querySelectorAll('link[rel="stylesheet"]')].map(style=>new Promise((resolve,reject)=>{
  const link=document.createElement('link');link.rel='stylesheet';link.href=new URL(style.getAttribute('href'),source).href;
  link.onload=resolve;link.onerror=()=>reject(new Error('Stylesheet unavailable'));
  document.head.append(link);
 }));
 await Promise.all(styles);
 document.body.replaceChildren(...template.body.childNodes);
 for(const src of scripts)await import(src);
 document.body.dataset.entryReady='true';
}

mount().catch(error=>{
 const message=document.createElement('p');message.setAttribute('role','alert');
 message.textContent='화면을 열지 못했어요. 새로고침해 주세요.';
 document.body.replaceChildren(message);
 console.error('Test entry could not load',error);
});
