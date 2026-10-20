import { imageSrcSet,imageUrl } from './assets';

const pending=new Set<HTMLImageElement>();
const warmed=new Set<string>();

export function preloadImage(src:string,displayWidth:number) {
  if(typeof window==='undefined'||!src.startsWith('/'))return;
  if((navigator as Navigator&{connection?:{saveData?:boolean}}).connection?.saveData)return;
  const key=`${src}:${displayWidth}`;
  if(warmed.has(key))return;
  if(warmed.size>=256)warmed.delete(warmed.values().next().value!);
  warmed.add(key);
  const image=new window.Image();pending.add(image);
  image.onload=image.onerror=()=>pending.delete(image);
  image.decoding='async';image.sizes=`${displayWidth}px`;
  const srcSet=imageSrcSet(src);if(srcSet)image.srcset=srcSet;
  image.src=imageUrl(src,displayWidth*(window.devicePixelRatio||1));
}
