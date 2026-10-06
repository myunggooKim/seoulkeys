import {env} from 'cloudflare:workers';
import {getAuthenticatedMember} from '../../../server-auth';
import {ForumError,readForumRequest,validId} from '../../../community/model';
import {isSupportedLocale,type Locale} from '../../../locale-detection';
import {modelResponseText,parseTranslation,translationMessages,translationModel,translationMaxOutputTokens,translationPricingExpires} from '../../../community/translation-policy';
import {cachedTranslation,finishTranslation,reserveTranslation,translationEntry} from '../../../../db/forum-translations';

export const dynamic='force-dynamic';
function json(data:unknown,status=200) {return Response.json(data,{status,headers:{'cache-control':'private, no-store','x-content-type-options':'nosniff'}});}
function failure(error:unknown) {
  if(error instanceof ForumError)return json({error:error.code},error.status);
  console.error(JSON.stringify({event:'forum_translation_failed'}));return json({error:'translationFailed'},503);
}
function validate(id:unknown,language:unknown):asserts language is Locale {
  if(!validId(id)||typeof language!=='string'||!isSupportedLocale(language))throw new ForumError('invalid');
}
export async function GET(request:Request) {
  try {
    const url=new URL(request.url);const id=url.searchParams.get('id');const language=url.searchParams.get('language');validate(id,language);
    const entry=await translationEntry(env.DB,String(id));if(!entry)throw new ForumError('missing',404);
    if(entry.language===language)return json({status:'original',title:entry.title,body:entry.body});
    return json(await cachedTranslation(env.DB,entry.id,entry.revision,language)??{status:'absent'});
  }catch(error){return failure(error);}
}
export async function POST(request:Request) {
  let claimId:string|null=null;
  try {
    const input=await readForumRequest(request);validate(input.id,input.language);
    const language=input.language;const entry=await translationEntry(env.DB,String(input.id));if(!entry)throw new ForumError('missing',404);
    if(entry.language===language)return json({status:'original',title:entry.title,body:entry.body});
    const cached=await cachedTranslation(env.DB,entry.id,entry.revision,language);if(cached)return json(cached);
    const member=await getAuthenticatedMember();if(!member)throw new ForumError('signIn',401);
    const ai=env.AI;
    if(Date.now()>=translationPricingExpires||!ai||typeof ai!=='object'||!('run' in ai)||typeof ai.run!=='function')throw new ForumError('translationPaused',503);
    const prepared=translationMessages(entry.title,entry.body,entry.language,language);
    const claim=await reserveTranslation(env.DB,entry.id,entry.revision,language,member.identity.email);
    if(!claim.owned)return json(await cachedTranslation(env.DB,entry.id,entry.revision,language));
    claimId=claim.requestId;
    const result:unknown=await ai.run(translationModel,{messages:prepared.messages,max_tokens:translationMaxOutputTokens,temperature:0,stream:false,response_format:{type:'json_object'}});
    const responseText=modelResponseText(result);
    const translated=parseTranslation(responseText,prepared);
    await finishTranslation(env.DB,claimId,translated);
    return json({status:'ready',...translated});
  }catch(error){
    if(claimId)try{await finishTranslation(env.DB,claimId,null);}catch{console.error(JSON.stringify({event:'forum_translation_claim_stale'}));}
    return failure(error);
  }
}
