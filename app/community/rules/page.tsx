import type {Metadata} from 'next';
import CommunityRules from './CommunityRules';
export const metadata:Metadata={title:'Community rules & privacy · Seoul Keys',alternates:{canonical:'https://seoulkeys.com/community/rules'}};
export default function RulesPage(){return <CommunityRules/>;}
