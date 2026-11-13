import {test} from 'node:test';
import assert from 'node:assert/strict';
import worker from '../worker/index.js';
import {catalogRequest} from '../server/catalog.js';
const env={ADMIN_PASSWORD:'catalog-test-password',ADMIN_SESSION_SECRET:'catalog-test-signing-key',SUPABASE_URL:'https://example.supabase.co',SUPABASE_SERVICE_ROLE_KEY:'server-only-test-key'};
const data=()=>({goods:[{id:'one',title:'앨범',originalPrice:1000,components:['a'],isOwned:true,isWishlist:true,userNote:'PRIVATE',checkedComponentIndices:[0]}],config:{siteTitle:'박물관'},categories:[{id:'album',label:'음반'}],news:[]});
function request(method='GET',body,headers={}){return new Request('https://archive.test/api/catalog',{method,headers:{Origin:'https://archive.test','Content-Type':'application/json',...headers},...(body===undefined?{}:{body:JSON.stringify(body)})});}
async function cookie(){const response=await worker.fetch(new Request('https://archive.test/api/admin/login',{method:'POST',headers:{Origin:'https://archive.test','Content-Type':'application/json','CF-Connecting-IP':crypto.randomUUID()},body:JSON.stringify({password:env.ADMIN_PASSWORD})}),env);return response.headers.get('Set-Cookie').split(';')[0];}
test('public reads strip private fields and support conditional cached reads',async()=>{
 let calls=0;
 const db=async(url,options)=>{calls++;assert.equal(options.headers.apikey,env.SUPABASE_SERVICE_ROLE_KEY);return Response.json([{revision:3,document:data()}]);};
 const response=await catalogRequest(request(),env,db);assert.equal(response.status,200);assert.ok(response.headers.get('Cache-Control').includes('s-maxage=15'));const text=await response.text();for(const secret of ['PRIVATE','isOwned','checkedComponentIndices',env.SUPABASE_SERVICE_ROLE_KEY])assert.equal(text.includes(secret),false);
 assert.equal((await catalogRequest(request('GET',undefined,{'If-None-Match':'"catalog-3"'}),env,db)).status,304);assert.equal(calls,2);
});
test('writes require server admin session and same origin before any database access',async()=>{
 const db=async()=>{throw new Error('must not access DB');};
 assert.equal((await catalogRequest(request('PUT',{snapshot:data(),expectedRevision:0}),env,db)).status,401);
 assert.equal((await catalogRequest(request('PUT',{}, {Origin:'https://evil.test'}),env,db)).status,403);
 assert.equal((await catalogRequest(request('PUT',{}, {Cookie:'__Host-isegye_admin=forged'}),env,db)).status,401);
});
test('first publish and revision-checked update persist public fields only',async()=>{
 const auth=await cookie();let revision=0;let document;
 const db=async(url,options)=>{const body=JSON.parse(options.body);assert.equal(JSON.stringify(body).includes('PRIVATE'),false);assert.equal(JSON.stringify(body).includes('isOwned'),false);if(options.method==='POST'){if(revision)return new Response(null,{status:409});revision=body.revision;document=body.document;return Response.json([{revision}]);}assert.ok(url.search.includes(`revision=eq.${revision}`));revision=body.revision;document=body.document;return Response.json([{revision}]);};
 assert.equal((await catalogRequest(request('PUT',{snapshot:data(),expectedRevision:0},{Cookie:auth}),env,db)).status,200);
 assert.equal(revision,1);assert.equal(document.goods[0].title,'앨범');
 assert.equal((await catalogRequest(request('PUT',{snapshot:data(),expectedRevision:1},{Cookie:auth}),env,db)).status,200);assert.equal(revision,2);
});
test('stale revisions and invalid payloads fail without replacing the database',async()=>{
 const auth=await cookie();
 assert.equal((await catalogRequest(request('PUT',{snapshot:data(),expectedRevision:3},{Cookie:auth}),env,async()=>Response.json([]))).status,409);
 assert.equal((await catalogRequest(request('PUT',{snapshot:{},expectedRevision:0},{Cookie:auth}),env)).status,400);
 assert.equal((await catalogRequest(request('PUT',{snapshot:data(),expectedRevision:-1},{Cookie:auth}),env)).status,400);
 assert.equal((await catalogRequest(request('PUT',{padding:'x'.repeat(3*1024*1024)},{Cookie:auth}),env)).status,413);
});
test('missing configuration and database errors do not leak secrets or pretend to save',async()=>{
 assert.equal((await catalogRequest(request(),{})).status,503);
 const response=await catalogRequest(request(),env,async()=>{throw new Error(env.SUPABASE_SERVICE_ROLE_KEY);});assert.equal(response.status,503);assert.equal((await response.text()).includes(env.SUPABASE_SERVICE_ROLE_KEY),false);
});
