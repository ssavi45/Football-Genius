'use client';
import { useEffect,useMemo,useRef,useState } from 'react';
import { ChevronLeft,ChevronRight,Crosshair,LoaderCircle,Send } from 'lucide-react';
import { CATEGORIES,scoutQuestions } from '@/lib/scouts-duel/questions';
import type { Category,ScoutQuestion,ScoutView } from '@/lib/scouts-duel/types';
export default function QuestionConsole({match,disabled,onAsk,onShoot}:{match:ScoutView;disabled:boolean;onAsk:(id:string)=>void;onShoot:()=>void}){
  const [category,setCategory]=useState<Category>('Position');
  const [query,setQuery]=useState(''),[resolved,setResolved]=useState<ScoutQuestion|null>(null),[checking,setChecking]=useState(false),[error,setError]=useState('');
  const categoriesRef=useRef<HTMLDivElement>(null);
  const currentRef=useRef({match,disabled});currentRef.current={match,disabled};
  const pendingQuestion=useRef<string|null>(null);
  const [scrollable,setScrollable]=useState({left:false,right:false});
  const questions=useMemo(()=>scoutQuestions(match.board),[match.board]);
  useEffect(()=>{
    const strip=categoriesRef.current;if(!strip)return;
    const measure=()=>setScrollable({left:strip.scrollLeft>2,right:strip.scrollLeft+strip.clientWidth<strip.scrollWidth-2});
    measure();const observer=new ResizeObserver(measure);observer.observe(strip);
    strip.addEventListener('scroll',measure,{passive:true});
    return()=>{observer.disconnect();strip.removeEventListener('scroll',measure);};
  },[]);
  useEffect(()=>{
    if(pendingQuestion.current&&match.askedIds.includes(pendingQuestion.current)){setQuery('');setResolved(null);setError('');pendingQuestion.current=null;}
  },[match.askedIds]);
  function scrollCategories(direction:number){
    const strip=categoriesRef.current;if(!strip)return;
    strip.scrollBy({left:direction*Math.max(120,strip.clientWidth*.8),behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
  }
  async function askCustom(){
    if(disabled||checking||!query.trim())return;
    const submit=(question:ScoutQuestion)=>{
      const current=currentRef.current;
      if(current.disabled||current.match.id!==match.id||current.match.deadline!==match.deadline)return;
      if(current.match.askedIds.includes(question.id)){setError('You already asked that question.');return;}
      pendingQuestion.current=question.id;onAsk(question.id);
    };
    if(resolved){submit(resolved);return;}
    setChecking(true);setError('');
    try{
      const response=await fetch('/api/games/scouts-duel/evaluate-question',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({roomId:match.id,query:query.trim()})});
      const data=await response.json();if(!response.ok)throw Error(data.error);
      const current=currentRef.current;
      if(current.disabled||current.match.id!==match.id||current.match.deadline!==match.deadline)return;
      if(current.match.askedIds.includes(data.question.id)){setError('You already asked that question.');return;}
      if(data.requiresConfirmation)setResolved(data.question);else submit(data.question);
    }catch(e){setError(e instanceof Error?e.message:'Could not ask this question.');}finally{setChecking(false);}
  }
  return <section className="scout-panel scout-console"><div className="scout-section-title"><h2>Ask a question</h2><span>YES / NO</span></div>
    <div className="scout-category-scroll">
      <button type="button" className="scout-category-arrow" aria-label="Scroll categories left" aria-controls="scout-question-categories" disabled={!scrollable.left} onClick={()=>scrollCategories(-1)}><ChevronLeft size={17}/></button>
      <div ref={categoriesRef} id="scout-question-categories" className="scout-tabs" role="group" aria-label="Question category">{CATEGORIES.map(c=><button type="button" key={c} onClick={()=>setCategory(c)} onFocus={e=>e.currentTarget.scrollIntoView({block:'nearest',inline:'nearest'})} aria-pressed={category===c}>{c}</button>)}</div>
      <button type="button" className="scout-category-arrow" aria-label="Scroll categories right" aria-controls="scout-question-categories" disabled={!scrollable.right} onClick={()=>scrollCategories(1)}><ChevronRight size={17}/></button>
    </div>
    <div className="scout-question-options">{questions.filter(q=>q.category===category).map(q=><button key={q.id} disabled={disabled||checking||match.askedIds.includes(q.id)} onClick={()=>onAsk(q.id)}><span>{q.text}</span>{match.askedIds.includes(q.id)?<small>Asked</small>:<Send size={14}/>}</button>)}</div>
    <form className="scout-custom" onSubmit={e=>{e.preventDefault();void askCustom();}}>
      <label htmlFor="scout-custom-query">Ask your own question</label>
      <div className="scout-custom-row">
        <input id="scout-custom-query" type="text" value={query} maxLength={200} disabled={disabled||checking} onChange={e=>{setQuery(e.target.value);setResolved(null);setError('');}} placeholder="Type a Yes/No question..." autoComplete="off" aria-describedby={error?'scout-custom-error':resolved?'scout-custom-confirmation':undefined} aria-invalid={!!error}/>
        <button type="submit" className="scout-primary" disabled={disabled||checking||!query.trim()}>{checking?<LoaderCircle className="scout-spinner" size={15} aria-label="Checking question"/>:<Send size={15}/>}<span>{resolved?'Confirm':'Ask'}</span></button>
      </div>
      {error&&<p id="scout-custom-error" className="scout-inline-error" role="alert">{error}</p>}
      {resolved&&<p id="scout-custom-confirmation" className="scout-question-preview">Confirm: {resolved.text}</p>}
    </form>
    <button className="scout-primary is-shoot" disabled={disabled||checking||!match.shootAllowed||match.remaining.length===0} onClick={onShoot}><Crosshair size={19}/>Shoot</button>
    {match.remaining.length===0&&<p className="scout-help">Restore a candidate on your board to take another shot.</p>}
    {!match.shootAllowed&&match.status==='active'&&match.activeSeat===match.seat&&<p className="scout-help">Your last shot missed. Ask a question this turn.</p>}
  </section>;
}
