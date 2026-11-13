import {authenticated} from '../worker/index.js';
import {sanitizeCatalog} from '../shared/catalog.js';
const MAX_BYTES=3*1024*1024;
function json(value,status=200,headers={}) {return new Response(JSON.stringify(value),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff',...headers}});}
export async function catalogRequest(request, env, dbFetch=fetch) {
 const url=new URL(request.url);
 if(!['GET','PUT'].includes(request.method))return json({error:'허용되지 않은 요청입니다.'},405);
 if(request.method==='PUT') {
  if(request.headers.get('Origin')!==url.origin || request.headers.get('Sec-Fetch-Site')==='cross-site')return json({error:'허용되지 않은 요청입니다.'},403);
  if(!env.ADMIN_PASSWORD || !env.ADMIN_SESSION_SECRET || !await authenticated(request,env))return json({error:'관리자 로그인이 필요합니다.'},401);
 }
 if(!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY)return json({error:'공용 저장소가 아직 연결되지 않았습니다.'},503);
 let endpoint;
 try {endpoint=new URL('/rest/v1/archive_catalog',env.SUPABASE_URL);if(endpoint.protocol!=='https:')throw new Error();}catch{return json({error:'공용 저장소 설정을 확인해주세요.'},503);}
 const headers={apikey:env.SUPABASE_SERVICE_ROLE_KEY,Authorization:`Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,'Content-Type':'application/json'};
 try {
  if(request.method==='GET') {
   endpoint.search='id=eq.public&select=revision,document';
   const response=await dbFetch(endpoint,{headers,cache:'no-store'});
   if(!response.ok)throw new Error('Database read failed');
   const rows=await response.json();
   if(!rows.length)return json({revision:0,snapshot:null});
   const revision=Number(rows[0].revision);const snapshot=sanitizeCatalog(rows[0].document);
   if(!Number.isSafeInteger(revision)||revision<1)throw new Error('Invalid revision');
   const etag=`"catalog-${revision}"`;
   const cache={'ETag':etag,'Cache-Control':'public, max-age=0, s-maxage=15, stale-while-revalidate=15','Vercel-CDN-Cache-Control':'public, s-maxage=15, stale-while-revalidate=15'};
   if(request.headers.get('If-None-Match')===etag)return new Response(null,{status:304,headers:cache});
   return json({revision,snapshot},200,cache);
  }
  if(!request.headers.get('Content-Type')?.startsWith('application/json'))return json({error:'JSON 형식으로 요청해주세요.'},415);
  const text=await request.text();
  if(new TextEncoder().encode(text).length>MAX_BYTES)return json({error:'저장할 내용이 너무 큽니다. 사진을 줄이거나 이미지 URL을 사용해주세요.'},413);
  let body,snapshot;
  try{body=JSON.parse(text);snapshot=sanitizeCatalog(body.snapshot);if(!Number.isSafeInteger(body.expectedRevision)||body.expectedRevision<0)throw new Error();}catch{return json({error:'저장할 데이터 형식을 확인해주세요.'},400);}
  const revision=body.expectedRevision+1;
  endpoint.search=body.expectedRevision===0?'select=revision':`id=eq.public&revision=eq.${body.expectedRevision}&select=revision`;
  const response=await dbFetch(endpoint,{method:body.expectedRevision===0?'POST':'PATCH',headers:{...headers,Prefer:'return=representation'},body:JSON.stringify(body.expectedRevision===0?{id:'public',revision,document:snapshot}:{revision,document:snapshot})});
  if(response.status===409)return json({error:'다른 관리자 또는 탭에서 먼저 수정했습니다. 최신 내용을 확인한 뒤 다시 저장해주세요.'},409);
  if(!response.ok)throw new Error('Database write failed');
  const rows=await response.json();
  if(rows.length!==1)return json({error:'다른 관리자 또는 탭에서 먼저 수정했습니다. 최신 내용을 확인한 뒤 다시 저장해주세요.'},409);
  return json({revision:Number(rows[0].revision)});
 }catch{return json({error:'공용 저장소에 연결하지 못했습니다. 잠시 후 다시 시도해주세요.'},503);}
}
