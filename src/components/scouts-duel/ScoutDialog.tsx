'use client';
import { useEffect,useRef,type ReactNode } from 'react';
import { X } from 'lucide-react';
export default function ScoutDialog({title,children,onClose,wide=false}:{title:string;children:ReactNode;onClose?:()=>void;wide?:boolean}){
  const ref=useRef<HTMLDivElement>(null);
  const closeRef=useRef(onClose);closeRef.current=onClose;
  useEffect(()=>{
    const previous=document.activeElement as HTMLElement|null,overflow=document.body.style.overflow;
    document.body.style.overflow='hidden';ref.current?.querySelector<HTMLElement>('button,input')?.focus();
    const key=(e:KeyboardEvent)=>{
      if(e.key==='Escape'&&closeRef.current)closeRef.current();
      if(e.key!=='Tab')return;
      const items=Array.from(ref.current?.querySelectorAll<HTMLElement>('button:not(:disabled),input:not(:disabled),[tabindex="0"]')||[]);
      const first=items[0],last=items.at(-1);if(!first){e.preventDefault();return;}
      if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}
      else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
    };
    document.addEventListener('keydown',key);return()=>{document.body.style.overflow=overflow;document.removeEventListener('keydown',key);previous?.focus();};
  },[]);
  return <div className="scout-modal-backdrop"><div ref={ref} className={`scout-modal ${wide?'is-wide':''}`} role="dialog" aria-modal="true" aria-label={title}><header><h2>{title}</h2>{onClose&&<button className="scout-icon-button" aria-label="Close dialog" onClick={onClose}><X size={20}/></button>}</header>{children}</div></div>;
}
