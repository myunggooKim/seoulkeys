"use client";

import Link from 'next/link';
import {useEffect,useState,type FormEvent} from 'react';
import {GoogleSignIn} from '../GoogleSignIn';
import {useActiveLocale} from '../use-active-locale';
import {saveManualLocalePreference,supportedLocaleCodes,isSupportedLocale,type Locale} from '../locale-detection';
import {communityCopy,welcomeBodies} from './copy';
import {languageNames} from './translation-policy';
import {forumTags,type ForumEntry,type ForumTag,type ForumViewer} from './model';
import PostLikeButton from './PostLikeButton';
import styles from './community.module.css';

type Thread={post:ForumEntry;comments:ForumEntry[];next:string|null};
type Translation={status:string;title?:string;body?:string;error?:string};
const nativeNames:Partial<Record<Locale,string>>={ko:'한국어',es:'Español',ja:'日本語','pt-BR':'Português (Brasil)','zh-Hans':'简体中文','zh-Hant':'繁體中文',fr:'Français',de:'Deutsch',it:'Italiano',pl:'Polski',nl:'Nederlands',ru:'Русский',tr:'Türkçe',ar:'العربية',fa:'فارسی',ur:'اردو',fil:'Filipino',th:'ไทย',id:'Bahasa Indonesia',ms:'Bahasa Melayu',vi:'Tiếng Việt',my:'မြန်မာ',km:'ខ្មែរ',lo:'ລາວ',hi:'हिन्दी',bn:'বাংলা',ta:'தமிழ்',ne:'नेपाली',si:'සිංහල',kk:'Қазақша',uz:'O‘zbekcha',mn:'Монгол'};
function errorText(locale:Locale,code:string){const c=communityCopy(locale);return code==='rules'?c.rulesError:code==='alias'?c.invalid:code==='signIn'?c.signIn:code==='blocked'?c.forbidden:code==='translationLimit'?c.translationLimit:code==='translationPaused'?c.translationPaused:code==='translationFailed'?c.translationFailed:(code in c?c[code as keyof typeof c]:c.unavailable);}
async function requestAction(data:Record<string,unknown>,path='/api/community'){
  const response=await fetch(path,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(data),cache:'no-store'});
  const result=await response.json() as {error?:string;id?:string}&Translation;
  if(!response.ok)throw new Error(result.error??'unavailable');return result;
}
export function CommunityHeader({locale}:{locale:Locale}){
  const c=communityCopy(locale);
  useEffect(()=>{document.documentElement.removeAttribute('data-app-booting');document.documentElement.setAttribute('data-app-ready','community');},[]);
  return <header className={styles.header}>
    <Link className={styles.brand} href="/"><span className={styles.mark} aria-hidden="true">ㅅ</span>Seoul Keys</Link>
    <nav className={styles.nav} aria-label={c.community}>
      <Link href="/">{c.home}</Link><Link href="/learn">{c.guides}</Link><Link href="/community">{c.community}</Link>
      <select aria-label="Interface language" value={locale} onChange={event=>{if(isSupportedLocale(event.target.value))saveManualLocalePreference(window.localStorage,event.target.value);}}>
        {supportedLocaleCodes.map(code=><option key={code} value={code}>{nativeNames[code]??languageNames[code]}</option>)}
      </select>
    </nav>
  </header>;
}
function TranslationText({entry,locale,signedIn,automatic=false}:{entry:ForumEntry;locale:Locale;signedIn:boolean;automatic?:boolean}){
  const c=communityCopy(locale);const [translation,setTranslation]=useState<Translation|null>(null);const [showOriginal,setShowOriginal]=useState(false);const [working,setWorking]=useState(false);
  const staticWelcome=entry.id==='welcome'?welcomeBodies[locale]:undefined;
  const needsTranslation=entry.language!==locale&&!staticWelcome;
  useEffect(()=>{
    const abort=new AbortController();setTranslation(null);setShowOriginal(false);setWorking(false);
    if(!needsTranslation)return ()=>abort.abort();
    const load=async()=>{
      try{
        const response=await fetch(`/api/community/translate?id=${entry.id}&language=${locale}`,{cache:'no-store',signal:abort.signal});
        const cached=await response.json() as Translation;
        if(abort.signal.aborted)return;
        if(!response.ok){setTranslation({status:'failed',error:cached.error??'translationFailed'});return;}
        if(cached.status==='absent'&&signedIn&&automatic){
          setWorking(true);
          const generated=await requestAction({id:entry.id,language:locale},'/api/community/translate');
          if(!abort.signal.aborted)setTranslation(generated);
        }else setTranslation(cached);
      }catch(error){if(!abort.signal.aborted)setTranslation({status:'failed',error:error instanceof Error?error.message:'translationFailed'});}
      finally{if(!abort.signal.aborted)setWorking(false);}
    };
    void load();return ()=>abort.abort();
  },[entry.id,entry.revision,locale,needsTranslation,signedIn,automatic]);
  // Pending means another request owns the job. Read its cache, never generate a retry.
  useEffect(()=>{
    if(translation?.status!=='pending')return;const abort=new AbortController();let polls=0;
    const timer=window.setInterval(()=>{
      if(++polls>5){window.clearInterval(timer);return;}
      void fetch(`/api/community/translate?id=${entry.id}&language=${locale}`,{cache:'no-store',signal:abort.signal})
        .then(r=>r.json()).then((value:Translation)=>{if(!abort.signal.aborted&&value.status!=='pending')setTranslation(value);})
        .catch(()=>undefined);
    },2500);
    return()=>{abort.abort();window.clearInterval(timer);};
  },[translation?.status,entry.id,locale]);
  const translated=!showOriginal&&(staticWelcome||translation?.status==='ready');
  const title=translated?(staticWelcome?c.welcome:translation?.title):entry.title;
  const body=translated?(staticWelcome??translation?.body):entry.body;
  async function translate(){setWorking(true);try{setTranslation(await requestAction({id:entry.id,language:locale},'/api/community/translate'));setShowOriginal(false);}catch(error){setTranslation({status:'failed',error:error instanceof Error?error.message:'translationFailed'});}finally{setWorking(false);}}
  return <>
    {entry.title&&<h1 dir="auto">{title}</h1>}
    {entry.language!==locale&&<div className={styles.translationTools}>
      <button className={styles.secondary} type="button" aria-pressed={showOriginal||!translated} onClick={()=>setShowOriginal(true)}>{c.original} · {nativeNames[entry.language]??languageNames[entry.language]}</button>
      {(staticWelcome||translation?.status==='ready')&&<button className={styles.secondary} type="button" aria-pressed={Boolean(translated)} onClick={()=>setShowOriginal(false)}>{staticWelcome?nativeNames[locale]:c.translated}</button>}
      {needsTranslation&&translation?.status==='absent'&&signedIn&&<button className={styles.secondary} type="button" disabled={working} onClick={()=>void translate()}>{c.translate}</button>}
    </div>}
    {(working||translation?.status==='pending')&&<p className={styles.note} role="status">{c.working}</p>}
    {translation?.status==='failed'&&<p className={styles.note} role="status">{errorText(locale,translation.error??'translationFailed')}</p>}
    {needsTranslation&&translation?.status==='absent'&&!signedIn&&<p className={styles.note}>{c.translationGuest}</p>}
    <div className={styles.text} dir="auto" lang={translated?locale:entry.language}>{body}</div>
    {translated&&!staticWelcome&&<p className={styles.note}>{c.translated} · {c.translationNote}</p>}
  </>;
}
function PostForm({locale,viewer,parentId,onCancel,onPublished}:{locale:Locale;viewer:ForumViewer;parentId?:string;onCancel:()=>void;onPublished:(id:string)=>void}){
  const c=communityCopy(locale);const [alias,setAlias]=useState(viewer.alias);const [language,setLanguage]=useState(locale);const [tag,setTag]=useState<ForumTag>('question');const [title,setTitle]=useState('');const [body,setBody]=useState('');const [consent,setConsent]=useState(false);const [busy,setBusy]=useState(false);const [error,setError]=useState('');const [id]=useState(()=>crypto.randomUUID());
  async function publish(event:FormEvent<HTMLFormElement>){event.preventDefault();if(busy)return;setBusy(true);setError('');
    try{const form=new FormData(event.currentTarget);const result=await requestAction({action:'create',id,kind:parentId?'comment':'post',parentId,alias,language,tag,title,body,consent,website:form.get('website')});onPublished(result.id??'');}
    catch(err){setError(errorText(locale,err instanceof Error?err.message:'unavailable'));}finally{setBusy(false);}}
  return <form className={styles.form} data-clarity-mask="true" onSubmit={event=>void publish(event)}>
    <h2>{parentId?c.reply:c.write}</h2>
    <div className={styles.formRow}><label>{c.alias}<input value={alias} onChange={e=>setAlias(e.target.value)} required minLength={2} maxLength={32} autoComplete="nickname"/><small className={styles.note}>{c.aliasHint}</small></label>
      <label>{c.language}<select value={language} onChange={e=>{if(isSupportedLocale(e.target.value))setLanguage(e.target.value);}}>{supportedLocaleCodes.map(code=><option key={code} value={code}>{nativeNames[code]??languageNames[code]}</option>)}</select></label></div>
    {!parentId&&<><label>{c.tag}<select value={tag} onChange={e=>setTag(e.target.value as ForumTag)}>{forumTags.map(t=><option key={t} value={t}>{c[t]}</option>)}</select></label><label>{c.title}<input value={title} onChange={e=>setTitle(e.target.value)} required minLength={3} maxLength={120} dir="auto"/></label></>}
    <label>{c.body}<textarea value={body} onChange={e=>setBody(e.target.value)} required minLength={2} maxLength={parentId?1500:3000} dir="auto"/></label>
    <label className={styles.trap} aria-hidden="true">Website<input name="website" tabIndex={-1} autoComplete="off"/></label>
    <label className={styles.consent}><input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)} required/>{c.rules}</label>
    <p className={styles.note}>{c.privacy} <Link href="/community/rules">{c.policy}</Link></p>
    {error&&<p className={styles.status} role="alert">{error}</p>}
    <div className={styles.formActions}><button className={styles.primary} disabled={busy} type="submit">{busy?c.working:c.publish}</button><button className={styles.secondary} type="button" onClick={onCancel}>{c.cancel}</button></div>
  </form>;
}
function SignIn({locale}:{locale:Locale}){const c=communityCopy(locale);return <div className={styles.login}><p>{c.signIn}</p><GoogleSignIn locale={locale} redirectTo={typeof window==='undefined'?'/community':window.location.pathname} showRoleChoice={false}/></div>;}

export default function CommunityClient({initialEntries,initialNext,welcome:initialWelcome,thread:initialThread}:{initialEntries:ForumEntry[];initialNext:string|null;welcome?:ForumEntry;thread?:Thread}){
  const locale=useActiveLocale({loadRuntimePack:false});const c=communityCopy(locale);
  const [entries,setEntries]=useState(initialEntries);const [next,setNext]=useState(initialNext);const [thread,setThread]=useState(initialThread);
  const [welcome,setWelcome]=useState(initialWelcome);
  const [viewer,setViewer]=useState<ForumViewer>({authorId:null,alias:'',moderator:false});const [signedIn,setSignedIn]=useState(false);const [ready,setReady]=useState(false);const [tag,setTag]=useState<ForumTag|null>(null);const [form,setForm]=useState(false);const [error,setError]=useState('');const [busy,setBusy]=useState(false);const [reporting,setReporting]=useState<string|null>(null);const [reason,setReason]=useState('');const [moderation,setModeration]=useState<(ForumEntry&{status:string;reports:number;blocked:number;report_reasons?:string})[]|null>(null);
  const [budget,setBudget]=useState<{month:string;reservedKrw:number;remainingRequests:number;pricingExpires:number}|null>(null);
  useEffect(()=>{
    const abort=new AbortController();setError('');
    const query=new URLSearchParams();if(initialThread)query.set('id',initialThread.post.id);else if(tag)query.set('tag',tag);
    void fetch(`/api/community?${query}`,{cache:'no-store',signal:abort.signal}).then(async response=>{
      const data=await response.json();if(!response.ok)throw new Error(data.error??'unavailable');if(abort.signal.aborted)return;
      setViewer(data.viewer);setSignedIn(data.signedIn);setReady(true);
      if(initialThread)setThread({post:data.post,comments:data.comments,next:data.next});else{setEntries(data.entries);setNext(data.next);if(data.welcomeLike)setWelcome(prev=>prev?{...prev,...data.welcomeLike}:prev);}
    }).catch(err=>{if(!abort.signal.aborted){setReady(true);setError(errorText(locale,err instanceof Error?err.message:'unavailable'));}});
    return()=>abort.abort();
    // Locale changes only relabel existing data; they do not repeat account/feed reads.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[tag,initialThread?.post.id]);
  async function loadMore(){if(busy)return;setBusy(true);try{
    const query=new URLSearchParams({before:thread?.next??next??''});if(thread)query.set('id',thread.post.id);else if(tag)query.set('tag',tag);
    const response=await fetch(`/api/community?${query}`,{cache:'no-store'});const data=await response.json();if(!response.ok)throw new Error(data.error??'unavailable');
    if(thread)setThread({...thread,comments:[...thread.comments,...data.comments],next:data.next});else{setEntries(prev=>[...prev,...data.entries]);setNext(data.next);}
  }catch(err){setError(errorText(locale,err instanceof Error?err.message:'unavailable'));}finally{setBusy(false);}}
  async function act(data:Record<string,unknown>){setBusy(true);setError('');try{
    await requestAction(data);if(data.action==='report'){setReporting(null);setReason('');setError(c.reported);}
    else if(data.action==='delete'&&thread?.post.id===data.id)window.location.assign('/community');
    else if(moderation)await showModeration();
    else if(thread){const response=await fetch(`/api/community?id=${thread.post.id}`,{cache:'no-store'});if(response.ok)setThread(await response.json());}
  }catch(err){setError(errorText(locale,err instanceof Error?err.message:'unavailable'));}finally{setBusy(false);}}
  async function showModeration(){try{const response=await fetch('/api/community?moderation=1',{cache:'no-store'});const data=await response.json();if(!response.ok)throw new Error(data.error??'unavailable');setModeration(data.entries);setBudget(data.budget);}catch(err){setError(errorText(locale,err instanceof Error?err.message:'unavailable'));}}
  function actions(entry:ForumEntry){return <div className={styles.actions}>
    {entry.parent_id===null&&<PostLikeButton entry={entry} locale={locale} signedIn={signedIn} ready={ready}/>}
    {signedIn&&entry.id!=='welcome'&&<button type="button" className={styles.textButton} onClick={()=>{setReporting(entry.id);setReason('');}}>{c.report}</button>}
    {entry.author_id===viewer.authorId&&<button type="button" className={styles.textButton} disabled={busy} onClick={()=>{if(window.confirm(c.confirmDelete))void act({action:'delete',id:entry.id});}}>{c.delete}</button>}
    {viewer.moderator&&entry.id!=='welcome'&&<button className={styles.textButton} disabled={busy} type="button" onClick={()=>void act({action:'hide',id:entry.id})}>{c.hide}</button>}
  </div>;}
  const date=(entry:ForumEntry)=>new Date(entry.created_at).toLocaleDateString(locale);
  return <div className={styles.page}>
    <CommunityHeader locale={locale}/>
    <main className={styles.shell} id="main-content">
      {!['en','ko','es','ja'].includes(locale)&&<p className={styles.note}>{c.uiFallback}</p>}
      {error&&<p className={styles.status} role="status">{error}</p>}
      {!thread?<>
        <section className={styles.hero}><div className={styles.eyebrow}>Seoul Keys · {c.community}</div><h1>{c.intro}</h1><p>{c.lead}</p><button className={styles.primary} type="button" onClick={()=>setForm(true)}>{c.write} ↗</button></section>
        {form&&(signedIn?<PostForm locale={locale} viewer={viewer} onCancel={()=>setForm(false)} onPublished={id=>window.location.assign(`/community/${id}`)}/>:ready?<SignIn locale={locale}/>:<p role="status">{c.working}</p>)}
        <div className={styles.tabs} aria-label={c.tag}><button className={styles.tab} type="button" aria-pressed={!tag} onClick={()=>setTag(null)}>{c.all}</button>{forumTags.map(t=><button key={t} className={styles.tab} type="button" aria-pressed={tag===t} onClick={()=>setTag(t)}>{c[t]}</button>)}</div>
        <div className={styles.list}>
          {welcome&&<article className={styles.card}><Link className={styles.cardLink} href="/community/welcome"><div className={styles.meta}><span className={`${styles.tag} ${styles.pin}`}>{c.pinned} · {c.notice}</span><span>{c.owner}</span></div><h2>{c.welcome}</h2><p>{c.welcomeLead}</p></Link><div className={styles.likeRow}><PostLikeButton entry={welcome} locale={locale} signedIn={signedIn} ready={ready}/></div></article>}
          {entries.map(entry=><article key={entry.id} className={styles.card}><Link className={styles.cardLink} href={`/community/${entry.id}`}><div className={styles.meta}><span className={styles.tag}>{c[entry.tag as ForumTag]??c.notice}</span><span dir="auto">{entry.author_alias}</span><span>{date(entry)}</span><span>{nativeNames[entry.language]??languageNames[entry.language]}</span></div><h2 dir="auto">{entry.title}</h2><p dir="auto">{entry.body.slice(0,170)}{entry.body.length>170?'…':''}</p><div className={styles.meta}>{c.comments} {entry.replies??0}</div></Link><div className={styles.likeRow}><PostLikeButton entry={entry} locale={locale} signedIn={signedIn} ready={ready}/></div></article>)}
          {entries.length===0&&<section className={styles.empty}><div aria-hidden="true">ㅇ + ㅏ = 아</div><h2>{c.empty}</h2><p>{c.emptyLead}</p><button className={styles.secondary} type="button" onClick={()=>setForm(true)}>{c.write}</button></section>}
        </div>{next&&<button className={`${styles.secondary} ${styles.loadMore}`} disabled={busy} type="button" onClick={()=>void loadMore()}>{c.more}</button>}
      </>:<>
        <Link href="/community" className={styles.back}>← {c.back}</Link>
        <article className={styles.article}><div className={styles.meta}><span className={styles.tag}>{thread.post.tag==='notice'?c.notice:c[thread.post.tag]}</span><span dir="auto">{thread.post.id==='welcome'?c.owner:thread.post.author_alias}</span><span>{date(thread.post)}</span></div><TranslationText entry={thread.post} locale={locale} signedIn={signedIn} automatic/>{actions(thread.post)}</article>
        <div className={styles.replyHeader}><h2>{c.comments}</h2><button className={styles.secondary} type="button" onClick={()=>setForm(true)}>{c.reply}</button></div>
        {form&&(signedIn?<PostForm locale={locale} viewer={viewer} parentId={thread.post.id} onCancel={()=>setForm(false)} onPublished={()=>{window.location.reload();}}/>:ready?<SignIn locale={locale}/>:<p role="status">{c.working}</p>)}
        {thread.comments.map(entry=><article className={styles.replyCard} key={entry.id}><div className={styles.meta}><b dir="auto">{entry.author_alias}</b><span>{date(entry)}</span></div><TranslationText entry={entry} locale={locale} signedIn={signedIn}/>{actions(entry)}</article>)}
        {thread.next&&<button className={styles.secondary} disabled={busy} type="button" onClick={()=>void loadMore()}>{c.more}</button>}
      </>}
      {reporting&&<form className={styles.form} data-clarity-mask="true" onSubmit={e=>{e.preventDefault();void act({action:'report',id:reporting,reason});}}><label>{c.reportReason}<textarea required minLength={3} maxLength={300} value={reason} onChange={e=>setReason(e.target.value)}/></label><div className={styles.formActions}><button className={styles.primary} disabled={busy} type="submit">{c.report}</button><button className={styles.secondary} type="button" onClick={()=>setReporting(null)}>{c.cancel}</button></div></form>}
      {viewer.moderator&&<button className={`${styles.secondary} ${styles.loadMore}`} type="button" onClick={()=>void showModeration()}>{c.moderation}</button>}
      {moderation&&<section className={styles.moderation}><h2>{c.moderation}</h2>{budget&&<p className={styles.note}>{budget.month} · {locale==='ko'?'번역 예산 예약액':'Translation budget reserved'}: ₩{budget.reservedKrw.toLocaleString()} / ₩10,000 · {locale==='ko'?'남은 새 번역':'New translations remaining'}: {budget.remainingRequests}<br/>{locale==='ko'?'단가 검증 유효기간':'Pricing review valid until'}: {new Date(budget.pricingExpires).toLocaleDateString(locale)} · {locale==='ko'?'실제 청구액이 아닌 보수적 예약액입니다.':'This is a conservative reservation, not the invoice total.'}</p>}{moderation.length===0&&<p>{c.noReports}</p>}{moderation.map(entry=><div className={styles.modRow} key={entry.id}><b>{entry.title||entry.author_alias}</b><p>{entry.body.slice(0,400)}</p><p>{c.report}: {entry.reports} · {entry.status}</p>{entry.report_reasons&&<p>{c.reason}: {entry.report_reasons}</p>}<div className={styles.formActions}>{(['hide','restore',entry.blocked?'unblock':'block'] as const).map(action=><button key={action} type="button" className={styles.secondary} disabled={busy} onClick={()=>void act({action,id:entry.id})}>{c[action]}</button>)}</div></div>)}<button type="button" className={styles.textButton} onClick={()=>setModeration(null)}>{c.close}</button></section>}
    </main>
    <footer className={styles.footer}><div><Link href="/community/rules">{c.policy}</Link> · <Link href="/contact">Contact</Link></div><span>{c.cost}</span></footer>
  </div>;
}
