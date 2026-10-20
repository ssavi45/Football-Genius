import { imageSrcSet,imageUrl } from '@/lib/images/assets';

export default function ImagePreload({src,sizes,media}:{src:string;sizes:string;media?:string}) {
  return <link rel="preload" as="image" href={imageUrl(src,960)} imageSrcSet={imageSrcSet(src)} imageSizes={sizes} media={media}/>;
}
