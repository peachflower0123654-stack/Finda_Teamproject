import http from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.dirname(fileURLToPath(import.meta.url));
const publicRoot=path.resolve(root,'../..');
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.ttf':'font/ttf','.woff2':'font/woff2'};
const port=Number(process.env.FINDA_PREVIEW_PORT||4173);
http.createServer(async(req,res)=>{
 try{
  const url=new URL(req.url,'http://localhost'),pathname=decodeURIComponent(url.pathname);
  const isPublic=/^\/(?:asis|tobe|prototypes)(?:\/|$)/.test(pathname),base=isPublic?publicRoot:root;
  let file=path.resolve(base,'.'+(pathname==='/'?'/index.html':pathname));
  if(!file.startsWith(base+path.sep))throw new Error('Invalid path');
  if((await stat(file)).isDirectory()){
   if(!url.pathname.endsWith('/')){res.writeHead(308,{Location:url.pathname.split('/').at(-1)+'/'+url.search});res.end();return;}
   file=path.join(file,'index.html');
  }
  const body=await readFile(file);res.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');
  res.end(req.method==='HEAD'?undefined:body);
 }catch{res.statusCode=404;res.end('Not found');}
}).listen(port,'127.0.0.1',()=>console.log('http://127.0.0.1:'+port));
