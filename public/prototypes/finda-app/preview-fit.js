// Scale the preview presentation while preserving the app's layout dimensions.
const stage=document.createElement('div');
stage.id='preview-stage';
const panel=document.querySelector('#preview');
const app=document.querySelector('#app');
document.body.prepend(stage);
stage.append(panel,app);
function fitPreview(){
 const scale=Math.min(1,Math.max(0.1,(window.innerHeight-32)/780),Math.max(0.1,(window.innerWidth-32)/690));
 stage.style.zoom=String(scale);
}
window.addEventListener('resize',fitPreview);
fitPreview();
