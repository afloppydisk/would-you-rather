import {z} from 'zod';
import {counts,currentEdition,database,editionView,json,validOrigin,voterId} from '@/lib/game';
export async function GET(req:Request) {
  try {
    const edition=await currentEdition();
    if(!edition) return json({error:'No question available'},503);
    return json(await editionView(req,edition,new URL(req.url).searchParams.get('voter')));
  } catch {return json({error:'Could not load the question. Please try again.'},503)}
}
export async function POST(req:Request) {
  if(!validOrigin(req)) return json({error:'Invalid origin'},403);
  try {
    const x=z.object({action:z.literal('vote'),id:z.string(),number:z.number().int(),choice:z.union([z.literal(0),z.literal(1)]),voter:z.string().optional()}).parse(await req.json());
    if(x.action!=='vote'||![0,1].includes(x.choice)||typeof x.id!=='string'||!Number.isInteger(x.number)) return json({error:'Invalid vote'},400);
    const voter=voterId(req,x.voter);
    if(!voter) return json({error:'A browser voter ID is required'},400);
    const edition=await currentEdition();
    if(!edition||edition.question!==x.id||edition.number!==x.number||edition.closes_at<=Date.now()) return json({error:'This question has closed.',expired:true},409);
    // The time check is also in the INSERT so a request cannot vote after the boundary.
    await database().prepare('INSERT OR IGNORE INTO votes (question,voter,choice) SELECT ?,?,? WHERE EXISTS (SELECT 1 FROM editions WHERE number=? AND question=? AND closes_at>?)')
      .bind(x.id,voter,x.choice,x.number,x.id,Date.now()).run();
    const vote=await database().prepare('SELECT choice FROM votes WHERE question=? AND voter=?').bind(x.id,voter).first<{choice:number}>();
    if(!vote) return json({error:'This question has closed.',expired:true},409);
    return json({...await counts(x.id),choice:vote.choice});
  } catch {return json({error:'Your vote could not be saved. Try again.'},400)}
}
