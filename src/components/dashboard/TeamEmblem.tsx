import Image from 'next/image';
import flagBounds from '@/data/scoreline-flag-bounds.json';
import { imageUrl } from '@/lib/images/assets';

interface Props {
  name: string;
  emblem: string;
  national: boolean;
}

export default function TeamEmblem({ name, emblem, national }: Props) {
  if (!national) {
    return <div className="team-emblem"><Image src={emblem} alt={`${name} crest`} width={220} height={220} /></div>;
  }

  const filename = emblem.split('/').pop() as keyof typeof flagBounds;
  const bounds = flagBounds[filename];
  const ratio = bounds.width / bounds.height;

  return <div className="team-emblem national-emblem">
    <svg
      className="national-flag"
      role="img"
      aria-label={`${name} flag`}
      viewBox={`${bounds.x} ${bounds.y} ${bounds.width} ${bounds.height}`}
      style={{ width: `${Math.min(1, ratio * .76) * 100}%`, aspectRatio: ratio }}
    >
      {/* Exclude transparent asset padding so rounding follows the flag edges. */}
      <image href={imageUrl(emblem,512)} width={bounds.canvasWidth} height={bounds.canvasHeight} />
    </svg>
  </div>;
}
