import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Readable} from 'node:stream';
import login from '../api/admin/login.js';
import logout from '../api/admin/logout.js';
import session from '../api/admin/session.js';
process.env.VERCEL='1';
process.env.ADMIN_PASSWORD='adapter-test-password';
process.env.ADMIN_SESSION_SECRET='adapter-test-session-secret';
async function invoke(handler,{method='GET',body,raw,headers={}}={}) {
 const request=Readable.from(raw===undefined?[]:[raw]);
 request.method=method;request.headers={host:'archive.example',origin:'https://archive.example','content-type':'application/json','x-forwarded-for':crypto.randomUUID(),...headers};request.body=body;
 let status, responseHeaders, data;
 const response={headersSent:false,writeHead(code,h){status=code;responseHeaders=h;this.headersSent=true;},end(value){data=Buffer.from(value||'').toString();}};
 await handler(request,response);
 return {status,headers:responseHeaders,data:JSON.parse(data)};
}
test('Vercel session and login bridges retain server authentication',async()=>{
 assert.equal((await invoke(session)).data.user,null);
 assert.equal((await invoke(login,{method:'POST',body:{password:'wrong'}})).status,401);
 const success=await invoke(login,{method:'POST',body:{password:process.env.ADMIN_PASSWORD}});
 assert.equal(success.status,200);assert.equal(success.data.user.role,'admin');
 const cookie=success.headers['set-cookie'];assert.ok(cookie.includes('HttpOnly'));assert.ok(cookie.includes('Secure'));
 assert.equal((await invoke(session,{headers:{cookie:cookie.split(';')[0]}})).data.user.role,'admin');
 assert.ok((await invoke(logout,{method:'POST',body:{}})).headers['set-cookie'].includes('Max-Age=0'));
});
test('Vercel raw request bodies, CSRF and request limits',async()=>{
 assert.equal((await invoke(login,{method:'POST',raw:JSON.stringify({password:process.env.ADMIN_PASSWORD})})).status,200);
 assert.equal((await invoke(login,{method:'POST',body:{password:process.env.ADMIN_PASSWORD},headers:{origin:'https://evil.example'}})).status,403);
 assert.equal((await invoke(login,{method:'POST',raw:'x'.repeat(2049)})).status,413);
 assert.equal((await invoke(login,{method:'POST',body:{password:'x'.repeat(2049)}})).status,413);
});
test('Vercel missing runtime secret fails closed',async()=>{
 const password=process.env.ADMIN_PASSWORD;delete process.env.ADMIN_PASSWORD;
 try{assert.equal((await invoke(session)).status,503);}finally{process.env.ADMIN_PASSWORD=password;}
});
