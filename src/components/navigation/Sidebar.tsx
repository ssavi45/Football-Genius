'use client';

import { useEffect,useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Gamepad2,Grid2X2,Trophy,BarChart2,Users2,ShieldCheck,Settings,ChevronLeft,ChevronRight,X } from 'lucide-react';
import { sound } from '@/lib/utils/sound';
import { isSharedGameRoute } from '@/lib/navigation';
import BrandLogo from './BrandLogo';
import './Sidebar.css';

interface SidebarProps {
  isOpen:boolean;
  onClose:()=>void;
  collapsed:boolean;
  onToggleCollapsed:()=>void;
}

export default function Sidebar({isOpen,onClose,collapsed,onToggleCollapsed}:SidebarProps) {
  const pathname=usePathname(),isCurrentGame=isSharedGameRoute(pathname);
  const drawerRef=useRef<HTMLDivElement>(null),closeRef=useRef(onClose);closeRef.current=onClose;
  useEffect(()=>{
    if(!isOpen)return;
    const previous=document.activeElement as HTMLElement|null,overflow=document.body.style.overflow;
    document.body.style.overflow='hidden';drawerRef.current?.querySelector<HTMLElement>('a,button')?.focus();
    const key=(event:KeyboardEvent)=>{
      if(event.key==='Escape'){event.preventDefault();closeRef.current();return;}
      if(event.key!=='Tab')return;
      const items=Array.from(drawerRef.current?.querySelectorAll<HTMLElement>('a[href],button:not(:disabled)')||[]),first=items[0],last=items.at(-1);
      if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus();}
      else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus();}
    };
    const resize=()=>{if(window.innerWidth>=1024)closeRef.current();};
    document.addEventListener('keydown',key);window.addEventListener('resize',resize);
    return()=>{document.body.style.overflow=overflow;document.removeEventListener('keydown',key);window.removeEventListener('resize',resize);previous?.focus();};
  },[isOpen]);
  const items=[
    {label:'Play Game',href:isCurrentGame?pathname:'/games/scoreline',icon:Gamepad2,active:isCurrentGame},
    {label:'Game Modes',href:'/game-modes',icon:Grid2X2,active:pathname==='/game-modes'},
    {label:'Leaderboard',href:'/leaderboard',icon:Trophy,active:pathname==='/leaderboard'},
    {label:'My Stats',href:'/profile',icon:BarChart2,active:pathname==='/profile'},
    {label:'Challenges',href:'/games/scouts-duel',icon:Users2,active:false},
    {label:'Achievements',href:'/profile#badges',icon:ShieldCheck,active:false},
    {label:'Settings',href:'/profile#settings',icon:Settings,active:false},
  ];
  const brand=(compact:boolean)=><Link href="/" className="sidebar-brand" aria-label="Football Genius home" onClick={()=>{sound.playClick();onClose();}}><BrandLogo compact={compact}/></Link>;
  const content=(compact:boolean,id:string)=><div className="sidebar-content">
    <nav id={id} className="sidebar-links" aria-label="Main navigation">{items.map(item=><Link key={item.label} href={item.href} aria-label={item.label} aria-current={item.active?'page':undefined} data-tooltip={compact?item.label:undefined} onMouseEnter={()=>sound.playHover()} onClick={()=>{sound.playClick();onClose();}}>
      <item.icon aria-hidden="true"/><span className="sidebar-label">{item.label}</span>
    </Link>)}</nav>
    <div className="sidebar-quote" aria-hidden="true"><svg viewBox="0 0 100 100"><polygon points="50,5 64,36 98,36 70,57 81,91 50,70 19,91 30,57 2,36 36,36"/></svg><p>Great<br/>football<br/>minds<br/>predict<br/>the future.</p><span/></div>
  </div>;

  return <>
    <aside className={`sidebar-desktop ${collapsed?'is-collapsed':''}`} aria-label="Sidebar">
      <div className="sidebar-card">
        <div className="sidebar-brand-row">{brand(collapsed)}</div>
        <button type="button" className="sidebar-collapse-toggle" onClick={()=>{sound.playClick();onToggleCollapsed();}} aria-label={collapsed?'Expand sidebar':'Collapse sidebar'} title={collapsed?'Expand sidebar':'Collapse sidebar'} aria-expanded={!collapsed} aria-controls="desktop-sidebar-navigation">{collapsed?<ChevronRight size={16}/>:<ChevronLeft size={16}/>}</button>
        {content(collapsed,'desktop-sidebar-navigation')}
      </div>
    </aside>
    {isOpen&&<div className="sidebar-mobile-overlay">
      <div className="sidebar-backdrop" onClick={onClose} aria-hidden="true"/>
      <div ref={drawerRef} id="mobile-sidebar" className="sidebar-mobile-drawer" role="dialog" aria-modal="true" aria-label="Navigation menu">
        <div className="sidebar-brand-row">{brand(false)}<button type="button" className="sidebar-close" onClick={onClose} aria-label="Close navigation menu"><X size={20}/></button></div>
        {content(false,'mobile-sidebar-navigation')}
      </div>
    </div>}
  </>;
}
