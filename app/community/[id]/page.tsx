import type {Metadata} from 'next';
import {env} from 'cloudflare:workers';
import {notFound} from 'next/navigation';
import CommunityClient from '../CommunityClient';
import {readThread} from '../../../db/forum';
import {ForumError,validId} from '../model';
export const dynamic='force-dynamic';
export async function generateMetadata({params}:{params:Promise<{id:string}>}):Promise<Metadata>{
  const {id}=await params;
  return {title:id==='welcome'?'Welcome to the Seoul Keys community':'Hangul conversation · Seoul Keys',alternates:{canonical:`https://seoulkeys.com/community/${validId(id)?id:''}`},robots:{index:id==='welcome',follow:true}};
}
export default async function ThreadPage({params}:{params:Promise<{id:string}>}){
  const {id}=await params;
  try{const thread=await readThread(env.DB,id);return <CommunityClient key={`community-thread-${id}`} initialEntries={[]} initialNext={null} thread={thread}/>;}
  catch(error){if(error instanceof ForumError&&error.status===404)notFound();throw error;}
}
