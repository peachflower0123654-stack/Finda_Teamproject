import {asIsPostCategories,asIsPostItems} from "./post-instance-data.js";
import {wireChipGroup} from "../chip-group.js";

// IDs such as L-009 and L-010 are ordered numerically, within their category.
export const postsForAsIsCategory=name=>asIsPostItems.filter(post=>post.category===name).sort((a,b)=>Number(a.id.split("-")[1])-Number(b.id.split("-")[1]));

export function wireAsIsPostList({app,pick,action,previous,toast,asset}){
 const root=app.firstElementChild,scroller=document.createElement("div"),content=document.createElement("div");
 scroller.className="asis-post-scroll";content.className="asis-post-content";
 scroller.setAttribute("tabindex","0");scroller.setAttribute("aria-label","핀다포스트 콘텐츠");
 for(const id of ["4525:8344","4525:8345","4525:8346","4525:9537"])content.append(pick(id));
 scroller.append(content);root.append(scroller);
 const list=pick("4525:8346"),up=pick("4525:9537");
 const template=list.querySelector('[data-component-id="4525:9506"]').cloneNode(true);
 const tabs=pick("4525:9451"),viewport=pick("4525:9450");
 const tabTemplate=tabs.children[1].cloneNode(true);
 const originalDots=new Map([...tabs.children].map(tab=>[tab.querySelector("p").textContent,!!tab.querySelector("img")]));
 const slot=document.createElement("div");slot.dataset.name="Slot";slot.className="asis-post-category-slot";
 let selected="사용팁";

 action(pick("4525:8373"),"뒤로가기",previous);
 action(up,"맨 위로",()=>scroller.scrollTo({top:0,behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"instant":"smooth"}));
 action(pick("4525:8382"),"신용점수별 대출 이자 계산기",()=>toast("계산기 화면은 아직 연결되지 않았어요."));

 function populate(){
  const posts=postsForAsIsCategory(selected),fragment=document.createDocumentFragment();
  for(const [index,post] of posts.entries()){
   const row=template.cloneNode(true);
   row.removeAttribute("id");row.dataset.nodeId=post.nodeId;row.dataset.postId=post.id;row.dataset.category=post.category;
   for(const node of row.querySelectorAll("[data-node-id]"))node.dataset.nodeId=node.dataset.nodeId.replace(/^I[^;]+;/,"I"+post.nodeId+";");
   const title=row.querySelector('[data-node-id$=";4525:9507"]');
   title.classList.add("asis-post-instance-title");title.textContent=post.title;
   const thumb=row.querySelector('[data-name="썸네일"]'),clip=document.createElement("div"),image=document.createElement("img");
   const {width,height,transform:m}=post.thumbnail;
   // Keep the source instance's crop and proportions; move its 88x62 slot right.
   thumb.style.height=height+"px";thumb.dataset.sourceNodeId="I"+post.nodeId+";3835:31475";
   clip.className="asis-post-instance-crop";
   image.alt="";image.draggable=false;image.src=asset(post.thumbnail.src);
   image.style.width=(100/m[0][0])+"%";image.style.height=(100/m[1][1])+"%";
   image.style.left=(-100*m[0][2]/m[0][0])+"%";image.style.top=(-100*m[1][2]/m[1][1])+"%";
   clip.append(image);thumb.replaceChildren(clip);
   if(index===posts.length-1)row.querySelector('[data-name="포스트 구분선"]')?.remove();
   action(row,post.title.replace(/\n/g," "),()=>toast("포스트 상세 화면은 아직 연결되지 않았어요."));
   fragment.append(row);
  }
  list.replaceChildren(fragment);list.dataset.category=selected;list.setAttribute("role","region");list.setAttribute("aria-label",selected+" 포스트");
  const height=Math.max(1028,420+posts.length*95+29);
  content.style.height=height+"px";up.style.top=(height-64)+"px";
  for(const tab of slot.children){const active=tab.dataset.category===selected;tab.setAttribute("aria-pressed",String(active));tab.dataset.componentId=active?"4525:9441":"4525:9445";}
 }
 function select(category,tab){
  if(category!==selected){selected=category;populate();scroller.scrollTop=0;}
  const left=20+tab.offsetLeft,right=left+tab.offsetWidth;
  if(left<viewport.scrollLeft)viewport.scrollLeft=Math.max(0,left-10);
  else if(right>viewport.scrollLeft+viewport.clientWidth)viewport.scrollLeft=right-viewport.clientWidth+10;
 }
 for(const category of asIsPostCategories){
  const tab=tabTemplate.cloneNode(true);tab.removeAttribute("id");tab.classList.add("asis-post-category");tab.dataset.category=category.name;
  tab.querySelector("p").textContent=category.name;
  if(!originalDots.get(category.name))tab.querySelector("img")?.parentElement.remove();
  for(const image of tab.querySelectorAll("img"))image.draggable=false;
  action(tab,category.name,()=>select(category.name,tab));slot.append(tab);
 }
 tabs.replaceChildren(slot);tabs.setAttribute("role","group");tabs.setAttribute("aria-label","포스트 카테고리");
 viewport.setAttribute("tabindex","0");viewport.setAttribute("aria-label","포스트 카테고리 좌우 스크롤");
 viewport.addEventListener("keydown",event=>{
  if(event.target!==viewport||!["ArrowLeft","ArrowRight"].includes(event.key))return;
  event.preventDefault();viewport.scrollLeft+=event.key==="ArrowRight"?120:-120;
 });
 wireChipGroup(viewport);populate();
}
