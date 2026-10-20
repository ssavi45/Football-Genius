import { imageSrcSet,imageUrl } from './assets';

const warmed=new Map<string,Promise<void>>();

export function preloadImage(src:string,displayWidth:number,options:{sizes?:string;srcSet?:string;required?:boolean}={}):Promise<void> {
  if(typeof window==='undefined'||!src.startsWith('/'))return Promise.resolve();
  if(!options.required&&(navigator as Navigator&{connection?:{saveData?:boolean}}).connection?.saveData)return Promise.resolve();
  const sizes=options.sizes||`${displayWidth}px`;
  const srcSet=options.srcSet||imageSrcSet(src);
  const key=`${src}:${sizes}:${srcSet||''}:${window.devicePixelRatio||1}`;
  const existing=warmed.get(key);if(existing)return existing;
  if(warmed.size>=256)warmed.delete(warmed.keys().next().value!);
  let finish!:()=>void;
  const ready=new Promise<void>(resolve=>{finish=resolve;});
  warmed.set(key,ready);
  const image=new window.Image();
  let settled=false;
  const complete=(failed=false)=>{
    if(settled)return;settled=true;clearTimeout(timeout);
    image.onload=image.onerror=null;
    if(failed)warmed.delete(key); // A failed request must be retryable.
    finish();
  };
  // Keep the game usable if a connection drops during an image request.
  const timeout=setTimeout(()=>complete(true),8000);
  image.onload=()=>{
    if(typeof image.decode==='function')void image.decode().then(()=>complete(),()=>complete(true));
    else complete();
  };
  image.onerror=()=>complete(true);
  image.decoding='async';image.sizes=sizes;
  if(srcSet)image.srcset=srcSet;
  image.src=imageUrl(src,displayWidth*(window.devicePixelRatio||1));
  return ready;
}
