'use client';

import type { CloudRun } from './types';
export async function cloudGame<T>(mode:string,variant:string,action:string,fields:Record<string,unknown>={}):Promise<CloudRun<T>> {
  const response=await fetch('/api/game-progress',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({mode,variant,action,requestId:crypto.randomUUID(),...fields}),cache:'no-store'});
  const data=await response.json();if(!response.ok)throw new Error(data.error||'Your progress could not be saved. Please retry.');return data;
}
