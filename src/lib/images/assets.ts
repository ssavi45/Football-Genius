import manifest from '@/data/image-assets.json';

const assets=manifest as unknown as Record<string,[string,number[]]>;

export function imageUrl(src:string,width:number):string {
  const asset=assets[src.split('?')[0]];
  if(!asset)return src;
  const [id,widths]=asset;
  if(!widths.length)return `/img/optimized/${id}.svg`;
  const size=widths.find(size=>size>=width)||widths[widths.length-1];
  return `/img/optimized/${id}-${size}.webp`;
}

export function imageSrcSet(src:string):string|undefined {
  const asset=assets[src.split('?')[0]];
  return asset?.[1].length?asset[1].map(width=>`${imageUrl(src,width)} ${width}w`).join(', '):undefined;
}
