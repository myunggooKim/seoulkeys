import {env} from 'cloudflare:workers';
import {getAuthenticatedMember} from '../../server-auth';
import {getAdminUser} from '../../admin-auth';
import {ForumError,readForumRequest} from '../../community/model';
import {createEntry,forumViewer,moderationQueue,readFeed,readThread,removeOrModerate,reportEntry} from '../../../db/forum';
import {readPostLike,setPostLike} from '../../../db/forum-likes';
import {translationMonth,translationMonthlyLimitKrw,translationReservationKrw,translationPricingExpires} from '../../community/translation-policy';

export const dynamic='force-dynamic';
function json(data:unknown,status=200) {return Response.json(data,{status,headers:{'cache-control':'private, no-store','x-content-type-options':'nosniff'}});}
function failure(error:unknown) {
  if (error instanceof ForumError) return json({error:error.code},error.status);
  console.error(JSON.stringify({event:'forum_request_failed'}));
  return json({error:'unavailable'},503);
}
export async function GET(request:Request) {
  try {
    const url=new URL(request.url); const member=await getAuthenticatedMember(); const admin=Boolean(member&&await getAdminUser());
    const viewer=await forumViewer(env.DB,member?.identity.email??null,admin);
    if (url.searchParams.get('moderation')==='1') {
      if (!admin) throw new ForumError('forbidden',403);
      const month=translationMonth(Date.now());
      const budget=await env.DB.prepare('SELECT reserved_krw FROM forum_translation_budget WHERE month=?').bind(month).first<{reserved_krw:number}>();
      return json({entries:await moderationQueue(env.DB),viewer,budget:{month,reservedKrw:budget?.reserved_krw??0,
        remainingRequests:Math.floor((translationMonthlyLimitKrw-(budget?.reserved_krw??0))/translationReservationKrw),pricingExpires:translationPricingExpires}});
    }
    const id=url.searchParams.get('id');
    const email=member?.identity.email??null;
    const data=id?await readThread(env.DB,id,url.searchParams.get('before'),email):await readFeed(env.DB,url.searchParams.get('tag'),url.searchParams.get('before'),email);
    const welcomeLike=!id&&!url.searchParams.get('before')?await readPostLike(env.DB,'welcome',email):undefined;
    return json({...data,welcomeLike,viewer,signedIn:Boolean(member)});
  } catch(error) {return failure(error);}
}
export async function POST(request:Request) {
  try {
    const input=await readForumRequest(request); const member=await getAuthenticatedMember();
    if (!member) throw new ForumError('signIn',401);
    const email=member.identity.email;
    if (input.action==='like') return json(await setPostLike(env.DB,email,input));
    if (input.action==='create') return json(await createEntry(env.DB,email,input),201);
    if (input.action==='report') return json(await reportEntry(env.DB,email,input));
    return json(await removeOrModerate(env.DB,email,Boolean(await getAdminUser()),input));
  } catch(error) {return failure(error);}
}
