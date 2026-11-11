const COOKIE = '__Host-isegye_admin';
const TTL = 60 * 60 * 4;
const encoder = new TextEncoder();
const attempts = new Map();
const adminUser = {id:'admin-master', email:'admin@isegye.idol', nickname:'박물관 총괄관리자', role:'admin', biasMember:'group', joinedDate:'2022.08.26', avatar:'👑'};
const json = (body, status=200, headers={}) => new Response(JSON.stringify(body), {status, headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff',...headers}});
const base64url = bytes => btoa(String.fromCharCode(...new Uint8Array(bytes))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
const decode = value => Uint8Array.from(atob(value.replace(/-/g,'+').replace(/_/g,'/')), c=>c.charCodeAt(0));
const digest = value => crypto.subtle.digest('SHA-256', encoder.encode(value));
async function equal(a,b) {
 const [x,y]=await Promise.all([digest(a),digest(b)]); const aa=new Uint8Array(x),bb=new Uint8Array(y);
 let different=0; for(let i=0;i<aa.length;i++)different|=aa[i]^bb[i]; return different===0;
}
async function signingKey(env) {
 return crypto.subtle.importKey('raw', encoder.encode(env.ADMIN_SESSION_SECRET+':'+env.ADMIN_PASSWORD),{name:'HMAC',hash:'SHA-256'},false,['sign','verify']);
}
async function token(env) {
 const payload=base64url(encoder.encode(JSON.stringify({exp:Math.floor(Date.now()/1000)+TTL,nonce:crypto.randomUUID()})));
 const signature=await crypto.subtle.sign('HMAC',await signingKey(env),encoder.encode(payload));
 return payload+'.'+base64url(signature);
}
async function authenticated(request,env) {
 try {
  const raw=request.headers.get('Cookie')?.split(';').map(x=>x.trim()).find(x=>x.startsWith(COOKIE+'='))?.slice(COOKIE.length+1);
  if(!raw||raw.length>1024)return false;
  const [payload,signature,...rest]=raw.split('.'); if(rest.length||!signature)return false;
  if(!await crypto.subtle.verify('HMAC',await signingKey(env),decode(signature),encoder.encode(payload)))return false;
  const data=JSON.parse(new TextDecoder().decode(decode(payload)));
  return Number.isInteger(data.exp)&&data.exp>Math.floor(Date.now()/1000)&&data.exp<=Math.floor(Date.now()/1000)+TTL;
 }catch{return false;}
}
const cookie = (value,age=TTL)=>`${COOKIE}=${value}; Path=/; Max-Age=${age}; HttpOnly; Secure; SameSite=Strict`;
export default {
 async fetch(request,env) {
  const url=new URL(request.url);
  if(!url.pathname.startsWith('/api/'))return env.ASSETS.fetch(request);
  if(!['/api/admin/session','/api/admin/login','/api/admin/logout'].includes(url.pathname))return json({error:'찾을 수 없습니다.'},404);
  if(!env.ADMIN_PASSWORD||!env.ADMIN_SESSION_SECRET)return json({error:'관리자 인증 설정을 확인해주세요.'},503);
  if(url.pathname==='/api/admin/session') {
   if(request.method!=='GET')return json({error:'허용되지 않은 요청입니다.'},405);
   return json({user:await authenticated(request,env)?adminUser:null});
  }
  if(request.method!=='POST')return json({error:'허용되지 않은 요청입니다.'},405);
  if(request.headers.get('Origin')!==url.origin||request.headers.get('Sec-Fetch-Site')==='cross-site')return json({error:'허용되지 않은 요청입니다.'},403);
  if(url.pathname==='/api/admin/logout')return json({ok:true},200,{'Set-Cookie':cookie('',0)});
  if(!request.headers.get('Content-Type')?.startsWith('application/json'))return json({error:'잘못된 요청입니다.'},415);
  const ip=request.headers.get('CF-Connecting-IP')||'unknown';
  const now=Date.now();
  for(const [key,value]of attempts)if(value.until<=now)attempts.delete(key);
  let attempt=attempts.get(ip);
  if(attempt?.count>=5)return json({error:'로그인 시도가 많습니다. 10분 후 다시 시도해주세요.'},429,{'Retry-After':String(Math.ceil((attempt.until-now)/1000))});
  if(!attempt){if(attempts.size>=10000)return json({error:'잠시 후 다시 시도해주세요.'},503);attempt={count:0,until:now+600000};attempts.set(ip,attempt);}
  attempt.count++;
  let body;
  try {
   const text=await request.text(); if(text.length>2048)return json({error:'잘못된 요청입니다.'},413);
   body=JSON.parse(text);
  }catch{return json({error:'잘못된 요청입니다.'},400);}
  if(typeof body.password!=='string'||body.password.length>256||!await equal(body.password,env.ADMIN_PASSWORD))return json({error:'관리자 비밀번호가 일치하지 않습니다.'},401);
  attempts.delete(ip);
  return json({user:adminUser},200,{'Set-Cookie':cookie(await token(env))});
 }
};
