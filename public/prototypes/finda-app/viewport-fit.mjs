// Mobile layout viewports can temporarily grow to the unscaled 360px canvas.
// Use the visible viewport in device CSS pixels so that scaling does not feed
// that enlarged layout size back into the next frame. Preserve browser pinch zoom.
export function viewportSize(host=globalThis.window){
 const visible=host.visualViewport;
 const positive=(value,fallback)=>Number.isFinite(value)&&value>0?value:fallback;
 const scale=positive(visible?.scale,1);
 const width=positive(host.innerWidth,360),height=positive(host.innerHeight,780);
 return {width:Math.min(width,positive(visible?.width,Infinity)*scale),height:Math.min(height,positive(visible?.height,Infinity)*scale)};
}

export function watchViewport(update,host=globalThis.window){
 let pending=null;
 const schedule=()=>{if(pending!==null)return;pending=host.requestAnimationFrame(()=>{pending=null;update();});};
 host.addEventListener('resize',schedule);
 host.addEventListener('orientationchange',schedule);
 host.visualViewport?.addEventListener('resize',schedule);
 schedule();
 return ()=>{
  host.removeEventListener('resize',schedule);
  host.removeEventListener('orientationchange',schedule);
  host.visualViewport?.removeEventListener('resize',schedule);
  if(pending!==null)host.cancelAnimationFrame(pending);
 };
}
