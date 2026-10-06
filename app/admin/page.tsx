import {headers} from 'next/headers';
import {isAdmin} from '@/lib/game';
import {requireChatGPTUser} from '../chatgpt-auth';
import Admin from './panel';
export const dynamic='force-dynamic';
export default async function AdminPage(){
  await requireChatGPTUser('/admin');
  const h=await headers();
  const req=new Request('https://app.local/admin',{headers:h});
  if(!isAdmin(req))return <main className="admin denied"><h1>Administrator access required</h1><p>Your account does not have the admin role.</p><a href="/">Back to the question</a></main>;
  return <Admin/>;
}
