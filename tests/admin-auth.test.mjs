import {test} from 'node:test';
import assert from 'node:assert/strict';
import worker from '../worker/index.js';
const origin='https://archive.test';
const env={ADMIN_PASSWORD:'test-only-password',ADMIN_SESSION_SECRET:'test-only-random-signing-key',ASSETS:{fetch:async()=>new Response('asset')}};
function request(path,method='GET',body,headers={}){return new Request(origin+path,{method,headers:{Origin:origin,'Content-Type':'application/json','CF-Connecting-IP':crypto.randomUUID(),...headers},...(body===undefined?{}:{body:JSON.stringify(body)})});}
test('anonymous, missing configuration, and static assets',async()=>{
 assert.equal((await worker.fetch(request('/api/admin/session'),{})).status,503);
 assert.deepEqual(await (await worker.fetch(request('/api/admin/session'),env)).json(),{user:null});
 assert.equal(await (await worker.fetch(request('/assets/test.png'),env)).text(),'asset');
});
test('invalid passwords rejected and no sample-password disclosure',async()=>{
 for(const password of ['wrong','1234','admin','isegye2024!']){
  const response=await worker.fetch(request('/api/admin/login','POST',{password}),env);
  assert.equal(response.status,401);assert.equal(response.headers.get('Set-Cookie'),null);
  assert.equal((await response.json()).error,'관리자 비밀번호가 일치하지 않습니다.');
 }
});
test('server login issues secure session and rejects forgery, expiry and password rotation',async()=>{
 const response=await worker.fetch(request('/api/admin/login','POST',{password:env.ADMIN_PASSWORD}),env);
 assert.equal(response.status,200);
 const cookie=response.headers.get('Set-Cookie');
 for(const flag of ['HttpOnly','Secure','SameSite=Strict','Path=/'])assert.ok(cookie.includes(flag));
 const value=cookie.split(';')[0];
 const session=()=>request('/api/admin/session','GET',undefined,{Cookie:value});
 assert.equal((await (await worker.fetch(session(),env)).json()).user.role,'admin');
 assert.equal((await (await worker.fetch(session(),{...env,ADMIN_PASSWORD:'rotated'})).json()).user,null);
 const forged=value.slice(0,-5)+'xxxxx';
 assert.equal((await (await worker.fetch(request('/api/admin/session','GET',undefined,{Cookie:forged}),env)).json()).user,null);
 const actualNow=Date.now;Date.now=()=>actualNow()+5*60*60*1000;
 try{assert.equal((await (await worker.fetch(session(),env)).json()).user,null);}finally{Date.now=actualNow;}
 const logout=await worker.fetch(request('/api/admin/logout','POST',undefined,{Cookie:value}),env);
 assert.ok(logout.headers.get('Set-Cookie').includes('Max-Age=0'));
});
test('CSRF, unsupported methods and JSON restrictions',async()=>{
 assert.equal((await worker.fetch(request('/api/admin/login','POST',{password:env.ADMIN_PASSWORD},{Origin:'https://evil.test'}),env)).status,403);
 assert.equal((await worker.fetch(request('/api/admin/login'),env)).status,405);
 assert.equal((await worker.fetch(request('/api/admin/login','POST',{}, {'Content-Type':'text/plain'}),env)).status,415);
 assert.equal((await worker.fetch(request('/api/unknown'),env)).status,404);
});
test('repeated guesses are throttled within an isolate',async()=>{
 const headers={'CF-Connecting-IP':crypto.randomUUID()};
 for(let i=0;i<5;i++)assert.equal((await worker.fetch(request('/api/admin/login','POST',{password:'wrong'},headers),env)).status,401);
 const response=await worker.fetch(request('/api/admin/login','POST',{password:env.ADMIN_PASSWORD},headers),env);
 assert.equal(response.status,429);assert.ok(response.headers.has('Retry-After'));
});
