import {handleAdminRequest} from '../../server/vercel-admin.js';
export default function handler(req,res) { return handleAdminRequest(req,res,'logout'); }
