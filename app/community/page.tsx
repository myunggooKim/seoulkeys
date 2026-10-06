import type {Metadata} from 'next';
import {env} from 'cloudflare:workers';
import CommunityClient from './CommunityClient';
import {readFeed,readThread} from '../../db/forum';
export const dynamic='force-dynamic';
export const metadata:Metadata={title:'Hangul learners community · Seoul Keys',description:'A welcoming place to ask questions, share Korean typing struggles, and celebrate learning Hangul together.',alternates:{canonical:'https://seoulkeys.com/community'}};
export default async function CommunityPage(){
  const [feed,thread]=await Promise.all([readFeed(env.DB,null,null),readThread(env.DB,'welcome')]);
  return <CommunityClient key="community-feed" initialEntries={feed.entries} initialNext={feed.next} welcome={thread.post}/>;
}
