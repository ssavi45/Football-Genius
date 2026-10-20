import { getImageProps } from 'next/image';
import imageLoader from '@/lib/images/loader';
import { preloadImage } from '@/lib/images/preload';
import type { ComparisonPlayer } from './types';

export const PORTRAIT_SIZES='(max-width:700px) 44vw,(max-width:1100px) 35vw,360px';

/** Use exactly the same source candidates and sizes as the visible Next Image. */
export function preloadPortrait(src:string):Promise<void> {
  const {props}=getImageProps({src,alt:'',width:512,height:512,sizes:PORTRAIT_SIZES,loader:imageLoader});
  return preloadImage(props.src,360,{srcSet:props.srcSet,sizes:props.sizes,required:true});
}

export function preloadPlayerImages(images:string[]=[]):Promise<void> {
  images.slice(1).forEach(src=>{void preloadImage(src,48);});
  return images[0]?preloadPortrait(images[0]):Promise.resolve();
}

export function preloadComparisonPlayer(player:ComparisonPlayer):Promise<void> {
  const badges=player.selectedTransfer?[player.selectedTransfer.from.crest,player.selectedTransfer.to.crest]
    :[player.isRetired?'/img/icons/retired.png':player.clubBadge,player.nationalityFlag];
  return preloadPlayerImages([player.portrait,...badges.filter((src):src is string=>!!src)]);
}
