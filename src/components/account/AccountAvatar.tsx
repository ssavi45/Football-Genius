'use client';

import { useState } from 'react';
import Image from 'next/image';

export default function AccountAvatar({ name, image, className = '' }: { name: string; image?: string | null; className?: string }) {
  const [failedImage, setFailedImage] = useState<string | null>(null);
  const safeImage = image && /^(?:\/(?!\/)|https:\/\/)/.test(image) && failedImage !== image;
  return <span className={`account-avatar ${className}`} aria-hidden="true">
    {safeImage ? <Image src={image} alt="" fill sizes="80px" onError={() => setFailedImage(image)} /> : <span>{name.trim().slice(0, 2).toUpperCase() || 'FG'}</span>}
  </span>;
}
