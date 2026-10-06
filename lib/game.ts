import { env } from 'cloudflare:workers';

export type Edition = {number:number;question:string;opens_at:number;closes_at:number};
export function database() {
  if (!env.DB) throw new Error('Database is unavailable');
  return env.DB;
}
export function isAdmin(req: Request) {
  const email = req.headers.get('oai-authenticated-user-email')?.toLowerCase();
  const user = req.headers.get('oai-authenticated-user-id');
  const allowed = (env.ADMIN_EMAILS ?? '').split(',').map(s=>s.trim().toLowerCase()).filter(Boolean);
  return Boolean(user && email && allowed.includes(email));
}
export function voterId(req: Request, browserId?: string | null) {
  const user=req.headers.get('oai-authenticated-user-id');
  if(user) return `user:${user}`;
  return browserId && /^[a-z0-9-]{36}$/i.test(browserId) ? `browser:${browserId}` : null;
}
const seeds = [
  ['future','see 10 minutes into the future','see 150 years into the future','Superpowers'],
  ['mind','have telekinesis — move things with your mind','have telepathy — read minds','Superpowers'],
  ['heroes','team up with Wonder Woman','team up with Captain Marvel','Pop culture'],
  ['music','sing along to every song you hear','dance to every song you hear','Life choices'],
  ['time','be in jail for five years','be in a coma for a decade','Life choices'],
];
export async function currentEdition(now=Date.now()):Promise<Edition|null> {
  const db=database();
  await db.batch([
    db.prepare('INSERT OR IGNORE INTO settings (id,interval_hours) VALUES (1,24)'),
    ...seeds.map(q=>db.prepare('INSERT OR IGNORE INTO questions (id,a,b,category) VALUES (?,?,?,?)').bind(...q)),
  ]);
  // A unique edition number, question and opening time make concurrent requests idempotent.
  // Missing windows are filled in order; all visitors get the same current edition.
  for (let i=0;i<500;i++) {
    const latest=await db.prepare('SELECT * FROM editions ORDER BY number DESC LIMIT 1').first<Edition>();
    if(latest && latest.closes_at>now) return latest;
    const next=await db.prepare('SELECT q.id FROM questions q WHERE NOT EXISTS (SELECT 1 FROM editions e WHERE e.question=q.id) ORDER BY q.rowid LIMIT 1').first<{id:string}>();
    if(!next) return latest;
    const config=await db.prepare('SELECT interval_hours FROM settings WHERE id=1').first<{interval_hours:number}>();
    const start=latest?.closes_at??now;
    await db.prepare('INSERT OR IGNORE INTO editions (number,question,opens_at,closes_at) VALUES (?,?,?,?)')
      .bind((latest?.number??0)+1,next.id,start,start+(config?.interval_hours??24)*3600000).run();
  }
  return db.prepare('SELECT * FROM editions ORDER BY number DESC LIMIT 1').first<Edition>();
}
export async function counts(id:string) {
  return database().prepare('SELECT COALESCE(SUM(choice=0),0) AS aVotes,COALESCE(SUM(choice=1),0) AS bVotes FROM votes WHERE question=?').bind(id).first<{aVotes:number;bVotes:number}>();
}
export async function editionView(req:Request, edition:Edition, browserId?:string|null) {
  const db=database();
  const question=await db.prepare('SELECT id,a,b FROM questions WHERE id=?').bind(edition.question).first<{id:string;a:string;b:string}>();
  const voter=voterId(req,browserId);
  const vote=voter?await db.prepare('SELECT choice FROM votes WHERE question=? AND voter=?').bind(edition.question,voter).first<{choice:number}>():null;
  return {...question,...await counts(edition.question),number:edition.number,opensAt:edition.opens_at,closesAt:edition.closes_at,choice:vote?.choice??null,serverTime:Date.now()};
}
export function json(value:unknown,status=200) {
  return Response.json(value,{status,headers:{'Cache-Control':'no-store'}});
}
export function validOrigin(req:Request) {
  const origin=req.headers.get('origin');
  return !origin || origin===new URL(req.url).origin;
}
