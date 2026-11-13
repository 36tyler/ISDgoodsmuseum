import {catalogRequest} from '../server/catalog.js';
export default async function handler(req,res) {
 try {
  const host=req.headers.host;
  if(!host || /[\s\\/]/.test(host)){res.writeHead(400);res.end();return;}
  const headers=new Headers();
  for(const [key,value]of Object.entries(req.headers))if(value!==undefined)headers.set(key,Array.isArray(value)?value.join(', '):value);
  let body;
  if(!['GET','HEAD'].includes(req.method||'GET')) {
   if(req.body!==undefined)body=typeof req.body==='string'||Buffer.isBuffer(req.body)?req.body:JSON.stringify(req.body);
   else {const chunks=[];let bytes=0;for await(const chunk of req){bytes+=Buffer.byteLength(chunk);if(bytes>3*1024*1024){res.writeHead(413,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(JSON.stringify({error:'사진 용량을 줄이거나 이미지 URL을 사용해주세요.'}));return;}chunks.push(Buffer.from(chunk));}body=Buffer.concat(chunks);}
  }
  const request=new Request(`${process.env.VERCEL?'https':'http'}://${host}/api/catalog`,{method:req.method,headers,...(body===undefined?{}:{body})});
  const response=await catalogRequest(request,process.env);
  res.writeHead(response.status,Object.fromEntries(response.headers));res.end(Buffer.from(await response.arrayBuffer()));
 }catch{res.writeHead(500,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(JSON.stringify({error:'요청을 처리하지 못했습니다.'}));}
}
