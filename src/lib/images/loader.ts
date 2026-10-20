'use client';
import type { ImageLoaderProps } from 'next/image';
import { imageUrl } from './assets';

export default function imageLoader({src,width}:ImageLoaderProps):string {
  return imageUrl(src,width);
}
