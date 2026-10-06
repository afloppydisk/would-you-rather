import {z} from 'zod';
import {currentEdition,database,isAdmin,json,validOrigin} from '@/lib/game';
export async function GET(req:Request) {
  if(!isAdmin(req))return json({error:'Administrator access required'},403);
  const current=await currentEdition();
  const db=database();
  const settings=await db.prepare('SELECT interval_hours AS intervalHours FROM settings WHERE id=1').first();
  const questions=await db.prepare('SELECT q.*,e.number,e.opens_at AS opensAt,e.closes_at AS closesAt,(SELECT COUNT(*) FROM votes v WHERE v.question=q.id) AS voteCount FROM questions q LEFT JOIN editions e ON e.question=q.id ORDER BY q.rowid').all();
  return json({settings,current,questions:questions.results});
}
export async function POST(req:Request) {
  if(!isAdmin(req)||!validOrigin(req))return json({error:'Administrator access required'},403);
  try {
    const x=z.discriminatedUnion('action',[z.object({action:z.literal('settings'),intervalHours:z.number().int().min(1).max(8760)}),z.object({action:z.literal('add'),a:z.string().trim().min(1).max(240),b:z.string().trim().min(1).max(240)})]).parse(await req.json());
    const db=database();
    const current=await currentEdition();
    if(x.action==='settings') {
      if(!Number.isInteger(x.intervalHours)||x.intervalHours<1||x.intervalHours>8760)return json({error:'Choose a whole number of hours from 1 to 8760.'},400);
      await db.prepare('UPDATE settings SET interval_hours=? WHERE id=1').bind(x.intervalHours).run();
      return json({ok:true});
    }
    if(x.action==='add') {
      if(typeof x.a!=='string'||typeof x.b!=='string'||!x.a.trim()||!x.b.trim()||x.a.length>240||x.b.length>240||x.a.trim().toLowerCase()===x.b.trim().toLowerCase())return json({error:'Enter two different options, up to 240 characters each.'},400);
      const count=await db.prepare('SELECT COUNT(*) AS total FROM questions').first<{total:number}>();
      if((count?.total??0)>=500)return json({error:'The question limit is 500.'},400);
      const pending=await db.prepare('SELECT COUNT(*) AS total FROM questions q WHERE NOT EXISTS (SELECT 1 FROM editions e WHERE e.question=q.id)').first<{total:number}>();
      const id=crypto.randomUUID();
      await db.prepare('INSERT INTO questions (id,a,b,category) VALUES (?,?,?,?)').bind(id,x.a.trim(),x.b.trim(),'Life choices').run();
      // Restart a depleted queue when its administrator adds the next question.
      if(current && current.closes_at<=Date.now() && pending?.total===0) {
        const settings=await db.prepare('SELECT interval_hours FROM settings WHERE id=1').first<{interval_hours:number}>();
        const now=Date.now();
        await db.prepare('INSERT OR IGNORE INTO editions (number,question,opens_at,closes_at) VALUES (?,?,?,?)')
          .bind(current.number+1,id,now,now+(settings?.interval_hours??24)*3600000).run();
      }
      return json({ok:true});
    }
    return json({error:'Unknown action'},400);
  }catch{return json({error:'Could not save. Please try again.'},400)}
}
