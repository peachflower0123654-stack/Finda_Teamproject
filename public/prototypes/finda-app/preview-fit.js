// Scale the preview presentation while preserving the app's layout dimensions.
import {viewportSize,watchViewport} from './viewport-fit.mjs';
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
 const viewport=viewportSize();
 const scale=Math.min(1,Math.max(0.1,(viewport.height-margin-toolbar)/height),Math.max(0.1,(viewport.width-margin)/width));
 stage.style.zoom=String(scale);
}
watchViewport(fitPreview);
new MutationObserver(fitPreview).observe(app,{childList:true});
fitPreview();
