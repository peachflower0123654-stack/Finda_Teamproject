// Scale the preview presentation while preserving the app's layout dimensions.
const stage=document.createElement('div');
stage.id='preview-stage';
const panel=document.querySelector('#preview');
const app=document.querySelector('#app');
document.body.prepend(stage);
stage.append(panel,app);
function fitPreview(){
 const height=app.querySelector('[data-existing-screen="refinance"]')?800:780;
 const review=document.body.dataset.review==='true',toolbar=document.body.dataset.study?56:0;
 const margin=review?32:0,width=review?690:360;
 const scale=Math.min(1,Math.max(0.1,(window.innerHeight-margin-toolbar)/height),Math.max(0.1,(window.innerWidth-margin)/width));
 stage.style.zoom=String(scale);
}
window.addEventListener('resize',fitPreview);
new MutationObserver(fitPreview).observe(app,{childList:true});
fitPreview();
