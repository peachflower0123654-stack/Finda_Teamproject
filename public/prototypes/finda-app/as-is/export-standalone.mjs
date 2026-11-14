// Package the existing prototype as one offline HTML file. No app build step.
import {readFile,writeFile} from "node:fs/promises";
import path from "node:path";
import {fileURLToPath} from "node:url";
import vm from "node:vm";
import {gzipSync} from "node:zlib";
import {bottomBarItems} from "../bottom-bar.js";

const root=path.dirname(fileURLToPath(import.meta.url));
const read=name=>readFile(path.join(root,name),"utf8");
const loanOnly=process.argv.includes("--loan-only");
let sourceDesigns=await read("designs.js");
let sourceExtraDesigns=await read("extra-designs.js");
const sourceBottomBar=await read("../bottom-bar.js");
const sourceChipGroup=await read("../chip-group.js");
const sourcePostList=(await read("post-list.js")).replace(/^import .*;\r?\n/gm,"");
const sourcePostData=loanOnly?"const asIsPostCategories=[];const asIsPostItems=[];":await read("post-instance-data.js");
let sourceFlow=await read("flow.mjs");
let sourceApp=await read("app.js");
if(loanOnly){
 const data=JSON.parse(sourceExtraDesigns.slice(sourceExtraDesigns.indexOf("=")+1).trim().replace(/;$/,""));
 const ids=["4418:4271","4500:6614","4500:6920"];
 sourceDesigns="export const asIsDesigns={};";
 sourceExtraDesigns="export const extraAsIsDesigns="+JSON.stringify(Object.fromEntries(ids.map(id=>[id,data[id]])))+";";
 const screens=[["all","Finda_All","4418:4271"],["find-loan","Finda_FindLoan","4500:6614"],["rate-cut","Finda_금리인하","4500:6920"]];
 sourceFlow=sourceFlow.replace(/export const asIsScreens = \[[\s\S]*?\n\];/,"export const asIsScreens="+JSON.stringify(screens)+";").replace('screen: "splash"','screen: "all"');
 sourceFlow=sourceFlow.replace('if (["point","all"].includes(state.screen)) return {...state,screen:"home"};','if(state.screen==="all")return state;').replace('if(state.screen==="find-loan")return {...state,screen:"home"};','if(state.screen==="find-loan")return {...state,screen:"all"};');
 sourceApp=sourceApp.replace("function switchTab(screen){",'function switchTab(screen){if(!asIsScreens.some(([key])=>key===screen)){toast("이 파일은 전체 메뉴와 추가 화면 검토용이에요.");return;}');
 sourceApp=sourceApp.replace(/<div class="asis-note">[\s\S]*?<\/div>/,'<div class="asis-note">전체 메뉴에서 대출 받기·금리인하 화면으로 이동하는 검토용 파일입니다. 홈·포인트·온보딩은 전체본에서 볼 수 있습니다.</div>');
 sourceApp=sourceApp.replace('panel.querySelector(\'[data-review="next"]\').disabled=','panel.querySelector(\'[data-review="back"]\').disabled=backAsIs(state).screen===state.screen;panel.querySelector(\'[data-review="next"]\').disabled=');
}
const sourceStyle=await read("style.css");
const fontStyle=await read("share/font.css");
const license=await read("assets/OFL-NotoSansKR.txt");
const assetNames=new Set([...(sourceDesigns+sourceExtraDesigns+sourcePostData).matchAll(/assets\/([\w.-]+\.(?:svg|png))/g)].map(match=>match[1]));
for(const [name] of bottomBarItems)for(const state of ["on","off"])assetNames.add(`bottom-bar-${name}-${state}.svg`);
const assetData={};
for(const name of assetNames){
 const bytes=await readFile(path.join(root,"assets",name));
 let mime;
 if(name.endsWith(".svg"))mime="image/svg+xml";
 else if(bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])))mime="image/png";
 else if(bytes[0]===255&&bytes[1]===216&&bytes[2]===255)mime="image/jpeg";
 else throw new Error("Unknown asset type: "+name);
 assetData[name]=`data:${mime};base64,${bytes.toString("base64")}`;
}
sourceApp=sourceApp.replace(/^import .*;\r?\n/gm,"")
 .replace('const testMode=params.get("mode")==="test";','let testMode=params.get("mode")!=="review";')
 .replace('<a href="index.html?mode=test" target="_blank" rel="noopener">참가자용 화면</a><a href="../index.html">개선안 보기</a>','<button data-portable="participant">참가자용 화면</button>')
 .replace('innerHeight-(testMode?0:32)','innerHeight-48-(testMode?0:32)')
 .replace('const asIsAsset=src=>src;','const asIsAsset=src=>portableAssets[src.split("/").at(-1)]||src;');
if(sourceApp.includes('href="index.html')||sourceApp.includes("../index.html"))throw new Error("Unconverted navigation link");
const script=`"use strict";\n(()=>{\n${sourceDesigns.replace(/^export /gm,"")}\n${sourceExtraDesigns.replace(/^export /gm,"")}\nObject.assign(asIsDesigns,extraAsIsDesigns);\n${sourceBottomBar.replace(/^export /gm,"")}
${sourceChipGroup.replace(/^export /gm,"")}
${sourcePostData.replace(/^export /gm,"")}
${sourcePostList.replace(/^export /gm,"")}\n${sourceFlow.replace(/^export /gm,"")}\nconst portableAssets=${JSON.stringify(assetData)};\nfor(const design of Object.values(asIsDesigns))design.html=design.html.replace(/assets\\/([A-Za-z0-9.-]+)/g,(match,name)=>{if(!portableAssets[name])throw new Error("Missing embedded asset: "+name);return portableAssets[name];});\n${sourceApp}\nfunction setPortableMode(participant){testMode=participant;if(participant)tabScrollPositions={home:0,point:0,all:0};state=participant?initialAsIs():{...state,review:true};document.body.dataset.mode=participant?"test":"review";document.querySelector("#portable-review").setAttribute("aria-pressed",String(!participant));render(true);}\ndocument.querySelector("#portable-review").addEventListener("click",()=>setPortableMode(!testMode));\ndocument.querySelector("#portable-reset").addEventListener("click",()=>{tabScrollPositions={home:0,point:0,all:0};state=initialAsIs();render(true);});\npanel.addEventListener("click",event=>{if(event.target.closest('[data-portable="participant"]'))setPortableMode(true);});\n})();`;
new vm.Script(script,{filename:"Finda_AsIs_Notion.html"});
const css=[await read("../tokens.css"),await read("designs.css"),await read("extra-designs.css"),sourceStyle.replace(/@font-face\s*\{[^}]*\}/g,""),fontStyle,`
.portable-toolbar{height:48px;display:flex;align-items:center;justify-content:center;gap:8px;font-size:12px;color:#3a415a;padding:4px 8px;background:#eceef4}
.portable-toolbar strong{margin-right:12px}.portable-toolbar button{font:inherit;border:1px solid #cbd0df;border-radius:8px;padding:5px 10px;background:white;color:inherit;cursor:pointer}
body{padding-top:0}body[data-mode="test"] .portable-toolbar{background:white}
body[data-mode="test"] #asis-stage{margin-top:0}
`].join("\n");
if(/url\((?!['"]?data:)/.test(css))throw new Error("External CSS asset remains");
const escapeEndTag=value=>value.replace(/<\/script/gi,"<\\/script");
let html=`<!doctype html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data:; font-src data:; connect-src 'none'; base-uri 'none'; form-action 'none'">
<title>핀다 As-is · 노션 공유용</title>
<style>${css}</style>
</head>
<body>
<div class="portable-toolbar" aria-label="프로토타입 도구"><strong>핀다 As-is</strong><button id="portable-reset">처음부터</button><button id="portable-review" aria-pressed="false">화면 검토</button></div>
<div id="asis-stage"><aside id="asis-preview" aria-label="테스트 검토 도구"></aside><main id="asis-app" tabindex="-1" aria-label="핀다 As-is 프로토타입"></main></div>
<noscript>이 프로토타입은 JavaScript 실행이 필요합니다. 노션에서는 /html 블록에 이 파일을 업로드해주세요.</noscript>
<script>${escapeEndTag(script)}</script>
<script type="text/plain" id="font-license">${escapeEndTag(license)}</script>
</body>
</html>`;
// Lossless container compression keeps the original assets intact.
const payload=gzipSync(Buffer.from(JSON.stringify({css,script})),{level:9}).toString("base64");
const bootstrap='(async()=>{try{const raw=atob(document.querySelector("#portable-payload").textContent.trim());const bytes=Uint8Array.from(raw,c=>c.charCodeAt(0));const stream=new Blob([bytes]).stream().pipeThrough(new DecompressionStream("gzip"));const data=JSON.parse(await new Response(stream).text());document.querySelector("#portable-style").textContent=data.css;const script=document.createElement("script");script.textContent=data.script;document.body.append(script);}catch(error){document.querySelector("#asis-app").textContent="파일을 열지 못했어요. 최신 브라우저에서 다시 열어주세요.";}})();';
html=html.replace("<style>"+css+"</style>",'<style id="portable-style"></style>');
html=html.replace("<script>"+escapeEndTag(script)+"</script>",'<script type="application/octet-stream" id="portable-payload">'+payload+'</script><script>'+bootstrap+'</script>');
if(loanOnly)html=html.replace("핀다 As-is · 노션 공유용","핀다 As-is · 추가 화면 검토용");
const destination=path.join(root,loanOnly?"share/Finda_AsIs_LoanScreens_Notion.html":"share/Finda_AsIs_Notion.html");
await writeFile(destination,html);
const bytes=Buffer.byteLength(html);
if(loanOnly&&bytes>=5_000_000)throw new Error(`Focused export exceeds 5 MB: ${bytes}`);
console.log(JSON.stringify({file:destination,bytes,images:assetNames.size,fontFaces:(fontStyle.match(/@font-face/g)||[]).length,noExternalAssets:true,under5MB:bytes<5_000_000},null,2));
