// Scale the preview presentation while preserving the app's layout dimensions.
const stage=document.createElement('div');
stage.id='preview-stage';
const panel=document.querySelector('#preview');
const app=document.querySelector('#app');
document.body.prepend(stage);
stage.append(panel,app);
function fitPreview(){
 const height=app.querySelector('[data-existing-screen="refinance"]')?800:780;
 const participant=document.body.dataset.mode==='test',toolbar=document.body.dataset.study?56:0;
 const margin=participant?0:32,width=participant?360:690;
 const scale=Math.min(1,Math.max(0.1,(window.innerHeight-margin-toolbar)/height),Math.max(0.1,(window.innerWidth-margin)/width));
 stage.style.zoom=String(scale);
}
window.addEventListener('resize',fitPreview);
new MutationObserver(fitPreview).observe(app,{childList:true});
fitPreview();
