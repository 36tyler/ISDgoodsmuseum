import {mkdir,copyFile,writeFile} from 'node:fs/promises';
await mkdir('dist/server',{recursive:true});
await copyFile('worker/index.js','dist/server/index.js');
await writeFile('dist/server/package.json',JSON.stringify({type:'module'}));
await writeFile('dist/server/wrangler.json',JSON.stringify({name:'isegye-archive',main:'index.js',compatibility_date:'2026-11-01',assets:{directory:'../client',binding:'ASSETS',not_found_handling:'single-page-application',run_worker_first:['/api/*']}},null,2));
