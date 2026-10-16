import type { CSSProperties } from 'react';

// SVG surfaces and geometry ported from the supplied Pixel Scoreboard (3).html.
type RefId = (name: string) => string;
const PITCH = 5, COLS = 60, ROWS = 40, GRID_Y = 58;
const GLYPH = { w: 20, h: 31, gap: 6 };
const SEGMENTS: Record<string, number[]> = {
  a: [0, 0, 20, 5], b: [15, 0, 5, 18], c: [15, 13, 5, 18],
  d: [0, 26, 20, 5], e: [0, 13, 5, 18], f: [0, 0, 5, 18], g: [0, 13, 20, 5],
};
const DIGITS = ['abcdef', 'bc', 'abdeg', 'abcdg', 'bcfg', 'acdfg', 'acdefg', 'abc', 'abcdefg', 'abcdfg'];
const GLYPH_PIXELS = DIGITS.map(segments => {
  const on = new Set<number>();
  for (const key of segments) {
    const [sx, sy, sw, sh] = SEGMENTS[key];
    for (let j = sy; j < sy + sh; j++) for (let i = sx; i < sx + sw; i++) on.add(j * GLYPH.w + i);
  }
  return [...on].map(n => [n % GLYPH.w, Math.floor(n / GLYPH.w)]);
});
export const SIDES = {
  L: { ringX: 74, bezelX: 79, dispX: 85, gridX: 88, bezelFill: '#08090c', bg: 'redBg', rim: '#ff2a2a', rimOpacity: .9, dim: '#7a0d0d', hal: '#ff1414', lit: '#ffe6e6', shadow: 'dsR', ledX: 42, ventX: 45, ledFill: '#4a0707', ledStroke: '#ff2a2a', ledCore: '#ffb4b4', btn: '#d40f0f', btnRing: '#ff4040', btnFace: '#ff2a2a', sym: '#f01818', glow: .45, minusX: 165, plusX: 307 },
  R: { ringX: 488, bezelX: 493, dispX: 496, gridX: 499, bezelFill: '#05060b', bg: 'blueBg', rim: '#2a52ff', rimOpacity: .95, dim: '#1b30b0', hal: '#1a3cff', lit: '#e6eeff', shadow: 'dsB', ledX: 826, ventX: 827, ledFill: '#06104d', ledStroke: '#2a52ff', ledCore: '#b4c8ff', btn: '#0a2fd0', btnRing: '#4070ff', btnFace: '#2a52ff', sym: '#1a3cf0', glow: .5, minusX: 579, plusX: 721 },
};
type SideConfig = typeof SIDES.L | typeof SIDES.R;
export const CONTROLS = [
  { id: 'home-minus', side: 'L', step: -1, cx: 165, label: 'Decrease home score' },
  { id: 'home-plus', side: 'L', step: 1, cx: 307, label: 'Increase home score' },
  { id: 'away-minus', side: 'R', step: -1, cx: 579, label: 'Decrease away score' },
  { id: 'away-plus', side: 'R', step: 1, cx: 721, label: 'Increase away score' },
] as const;
export type ScoreControl = typeof CONTROLS[number];
const SCREWS = [[48, 90], [838, 90], [86, 352], [386, 352], [500, 352], [800, 352]];

function Panel({ x, refId }: { x: number; refId: RefId }) {
  return <g><rect x={x} y="44" width="338" height="328" rx="26" fill={`url(#${refId('panelG')})`} stroke="#5c6168" strokeWidth="2" /><rect x={x} y="44" width="338" height="328" rx="26" fill="#000" filter={`url(#${refId('brush')})`} opacity=".3" /><rect x={x + 3} y="47" width="332" height="322" rx="23" fill="none" stroke="#fff" strokeOpacity=".5" strokeWidth="1.5" /></g>;
}

function Side({ side, config: s, score, refId }: { side: string; config: SideConfig; score: number; refId: RefId }) {
  const paint = (name: string) => `url(#${refId(name)})`;
  const x = s.dispX;
  const glass = `M${x + 7} 60H${x + 299}Q${x + 303} 60 ${x + 303} 66V96Q${x + 153} 112 ${x + 7} 96Q${x + 3} 96 ${x + 3} 90V64Q${x + 3} 60 ${x + 7} 60Z`;
  const digits = String(score);
  const width = digits.length * GLYPH.w + (digits.length - 1) * GLYPH.gap;
  const col0 = Math.floor((COLS - width) / 2), row0 = Math.floor((ROWS - GLYPH.h) / 2);
  const pixels = [...digits].flatMap((ch, n) => GLYPH_PIXELS[+ch].map(([i,j]) => [s.gridX + (col0 + n * (GLYPH.w + GLYPH.gap) + i) * PITCH, GRID_Y + (row0 + j) * PITCH]));
  return <g>
    <rect x={s.ringX} y="44" width="328" height="230" rx="24" fill={paint('ring')} stroke="#4a4e55" />
    <rect x={s.bezelX} y="49" width="318" height="220" rx="20" fill={s.bezelFill} />
    <rect x={x} y="55" width="306" height="207" rx="15" fill={paint(s.bg)} />
    <rect x={x} y="55" width="306" height="207" rx="15" fill="none" stroke={s.rim} strokeWidth="3" filter={paint('blur3')} opacity={s.rimOpacity} />
    <pattern id={refId(`dim${side}`)} x={s.gridX} y={GRID_Y} width={PITCH} height={PITCH} patternUnits="userSpaceOnUse"><circle cx="2.5" cy="2.5" r="1.45" fill={s.dim} opacity=".8" /></pattern>
    <rect x={s.gridX} y={GRID_Y} width={COLS * PITCH} height={ROWS * PITCH} fill={paint(`dim${side}`)} />
    <g fill={s.hal} filter={paint('blur6')} opacity=".85">{pixels.map(([px,py]) => <rect key={`${px}-${py}`} x={px - 1} y={py - 1} width={PITCH + 2} height={PITCH + 2} />)}</g>
    <g fill={s.lit} filter={paint(s.shadow)}>{pixels.map(([px,py]) => <circle key={`${px}-${py}`} cx={px + PITCH / 2} cy={py + PITCH / 2} r="2.1" />)}</g>
    <rect x={x} y="55" width="306" height="207" rx="15" fill={paint('vig')} /><path d={glass} fill={paint('glass')} opacity=".5" />
    <rect x={s.ledX} y="118" width="18" height="57" rx="9" fill="#e5e8eb" stroke="#7a7f86" strokeWidth="1.2" />
    <rect x={s.ledX + 2.5} y="120.5" width="13" height="52" rx="6.5" fill={s.ledFill} stroke={s.ledStroke} strokeWidth="2.2" filter={paint('gG')} />
    <rect x={s.ledX + 7} y="127" width="4" height="38" rx="2" fill={s.ledCore} filter={paint('gG')} />
    <rect x={s.ventX} y="222" width="14" height="90" rx="5" fill={paint('vent')} />
  </g>;
}

function ControlArtwork({ control, pressed, refId }: { control: ScoreControl; pressed: boolean; refId: RefId }) {
  const s = SIDES[control.side], cx = control.cx;
  const paint = (name: string) => `url(#${refId(name)})`;
  return <g className={pressed ? 'pixel-scoreboard-button is-pressed' : 'pixel-scoreboard-button'} style={{ transformOrigin: `${cx}px 323px` } as CSSProperties}>
    <circle cx={cx} cy="323" r="40" fill={s.hal} opacity={s.glow} filter={paint('blur6')} />
    <circle cx={cx} cy="323" r="38" fill={s.btn} stroke={s.btnRing} strokeWidth="2" />
    <circle cx={cx} cy="323" r="34" fill={paint('btnFace')} stroke={s.btnFace} strokeWidth="2" />
    <rect x={cx - 14} y="320.5" width="28" height="5" rx="1.5" fill={s.sym} filter={paint('gG')} />
    {control.step === 1 && <rect x={cx - 2.5} y="309" width="5" height="28" rx="1.5" fill={s.sym} filter={paint('gG')} />}
  </g>;
}

export default function PixelScoreboardArtwork({ homeScore, awayScore, prefix, pressed }: { homeScore: number; awayScore: number; prefix: string; pressed: string | null }) {
  const refId: RefId = name => `${prefix}-${name}`;
  const paint = (name: string) => `url(#${refId(name)})`;
  return <svg className="pixel-scoreboard-artwork" viewBox="0 0 887 443" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
<defs>

<linearGradient id={refId("metal")} x1="0" y1="0" x2="0" y2="1">
<stop offset="0" stopColor="#f1f3f6" />
<stop offset=".12" stopColor="#c3c8cf" />
<stop offset=".5" stopColor="#8d939b" />
<stop offset=".88" stopColor="#b4b9c1" />
<stop offset="1" stopColor="#6b7078" />
</linearGradient>
<linearGradient id={refId("panelG")} x1="0" y1="0" x2="0" y2="1">
<stop offset="0" stopColor="#9ea4ac" />
<stop offset=".25" stopColor="#c2c7ce" />
<stop offset=".7" stopColor="#a5abb3" />
<stop offset="1" stopColor="#8e949c" />
</linearGradient>
<linearGradient id={refId("ring")} x1="0" y1="0" x2="0" y2="1">
<stop offset="0" stopColor="#5b6068" />
<stop offset=".5" stopColor="#d7dbe0" />
<stop offset="1" stopColor="#6c7179" />
</linearGradient>
<linearGradient id={refId("colG")} x1="0" y1="0" x2="1" y2="0">
<stop offset="0" stopColor="#7d838b" />
<stop offset=".25" stopColor="#d8dce1" />
<stop offset=".5" stopColor="#aeb3ba" />
<stop offset=".75" stopColor="#d8dce1" />
<stop offset="1" stopColor="#7d838b" />
</linearGradient>
<linearGradient id={refId("btnFace")} x1="0" y1="0" x2="0" y2="1">
<stop offset="0" stopColor="#fff" />
<stop offset=".6" stopColor="#e6e8eb" />
<stop offset="1" stopColor="#c9ccd1" />
</linearGradient>
<linearGradient id={refId("redBg")} x1="0" y1="0" x2="0" y2="1">
<stop offset="0" stopColor="#3b0606" />
<stop offset=".5" stopColor="#2a0303" />
<stop offset="1" stopColor="#1c0202" />
</linearGradient>
<linearGradient id={refId("blueBg")} x1="0" y1="0" x2="0" y2="1">
<stop offset="0" stopColor="#030a40" />
<stop offset=".5" stopColor="#020730" />
<stop offset="1" stopColor="#010420" />
</linearGradient>
<radialGradient id={refId("vig")} cx=".5" cy=".5" r=".75">
<stop offset=".6" stopColor="#000" stopOpacity="0" />
<stop offset="1" stopColor="#000" stopOpacity=".7" />
</radialGradient>
<linearGradient id={refId("glass")} x1="0" y1="0" x2="0" y2="1">
<stop offset="0" stopColor="#fff" stopOpacity=".18" />
<stop offset="1" stopColor="#fff" stopOpacity="0" />
</linearGradient>
<radialGradient id={refId("screwG")} cx=".4" cy=".35" r=".7">
<stop offset="0" stopColor="#e9ecef" />
<stop offset="1" stopColor="#6d727a" />
</radialGradient>
<radialGradient id={refId("greenLed")} cx=".45" cy=".35" r=".65">
<stop offset="0" stopColor="#9dffaa" />
<stop offset=".5" stopColor="#19d63a" />
<stop offset="1" stopColor="#07801f" />
</radialGradient>
<pattern id={refId("grill")} width="7" height="7" patternUnits="userSpaceOnUse">
<circle cx="3.5" cy="3.5" r="2.3" fill="#23262b" />
</pattern>
<pattern id={refId("vent")} width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(-35)">
<rect width="2.2" height="4" fill="#1c1f23" />
</pattern>
<filter id={refId("brush")} x="0" y="0" width="100%" height="100%">
<feTurbulence type="fractalNoise" baseFrequency="0.004 0.9" numOctaves="3" seed="4" />
<feColorMatrix type="matrix" values="0 0 0 0 .08  0 0 0 0 .09  0 0 0 0 .1  1.3 0 0 0 -.5" />
<feComposite in2="SourceAlpha" operator="in" />
</filter>
<filter id={refId("dsR")} x="-20%" y="-20%" width="140%" height="140%">
<feDropShadow dx="0" dy="0" stdDeviation="2.2" floodColor="#ff1818" />
</filter>
<filter id={refId("dsB")} x="-20%" y="-20%" width="140%" height="140%">
<feDropShadow dx="0" dy="0" stdDeviation="2.2" floodColor="#1c44ff" />
</filter>
<filter id={refId("blur3")} x="-50%" y="-50%" width="200%" height="200%">
<feGaussianBlur stdDeviation="3" />
</filter>
<filter id={refId("blur6")} x="-30%" y="-30%" width="160%" height="160%">
<feGaussianBlur stdDeviation="6" />
</filter>
<filter id={refId("blur14")} x="-50%" y="-50%" width="200%" height="200%">
<feGaussianBlur stdDeviation="14" />
</filter>
<filter id={refId("gG")} x="-80%" y="-80%" width="260%" height="260%">
<feGaussianBlur stdDeviation="3" result="b" />
<feMerge>
<feMergeNode in="b" />
<feMergeNode in="SourceGraphic" />
</feMerge>
</filter>
<filter id={refId("shadow")} x="-10%" y="-10%" width="120%" height="130%">
<feDropShadow dx="0" dy="5" stdDeviation="8" floodColor="#315782" floodOpacity=".2" />
</filter>
<path id={refId("chassis")} d="M70 32H816L856 74V350L816 392H70L30 350V74Z" />
<g id={refId("screw")}>
<circle r="5.5" fill={paint("screwG")} stroke="#4d5158" />
<path d="M-3.2 1.6L3.2-1.6" stroke="#33363b" strokeWidth="1.6" strokeLinecap="round" />
</g>
</defs>
<g filter={paint("blur14")}>
<ellipse cx="240" cy="404" rx="215" ry="16" fill="#ff536a" opacity=".09" />
<ellipse cx="650" cy="404" rx="215" ry="16" fill="#428aff" opacity=".11" />
<ellipse cx="38" cy="146" rx="20" ry="50" fill="#ff536a" opacity=".1" />
<ellipse cx="849" cy="146" rx="20" ry="50" fill="#428aff" opacity=".12" />
</g>
<g filter={paint("shadow")}>
<use href={"#" + refId("chassis")} fill={paint("metal")} stroke="#e9edf1" strokeWidth="1.5" />
</g>
<use href={"#" + refId("chassis")} fill="#000" filter={paint("brush")} opacity=".35" />
<path d="M74 37H812L851 77V347L812 387H74L35 347V77Z" fill="none" stroke="#fff" strokeOpacity=".45" strokeWidth="1.5" />
{[67, 481].map(x => <Panel key={x} x={x} refId={refId} />)}
{Object.entries(SIDES).map(([side, config]) => <Side key={side} side={side} config={config} score={side === "L" ? homeScore : awayScore} refId={refId} />)}
<rect x="409" y="36" width="68" height="352" fill={paint("colG")} stroke="#6a6f77" strokeWidth="1.5" />
<rect x="409" y="36" width="68" height="352" fill="#000" filter={paint("brush")} opacity=".3" />
<g stroke="#5f646b" strokeWidth="1.5">
<rect x="413" y="46" width="60" height="54" rx="6" fill="#aeb3ba" />
<rect x="413" y="292" width="60" height="66" rx="6" fill="#aeb3ba" />
</g>
<rect x="418" y="52" width="50" height="42" rx="3" fill="#8a9098" />
<rect x="418" y="52" width="50" height="42" fill={paint("grill")} />
<rect x="418" y="298" width="50" height="54" rx="3" fill="#8a9098" />
<rect x="418" y="298" width="50" height="54" fill={paint("grill")} />
<g id={refId("indicators")}>
<g filter={paint("blur6")} fill="#18e040" opacity=".35">
<circle cx="443" cy="139" r="22" />
<circle cx="443" cy="177" r="22" />
</g>
<g fill="#2b2f35" stroke="#c9cdd2" strokeWidth="2">
<circle cx="443" cy="139" r="17" />
<circle cx="443" cy="177" r="17" />
</g>
<g fill={paint("greenLed")} filter={paint("gG")}>
<circle cx="443" cy="139" r="13.5" />
<circle cx="443" cy="177" r="13.5" />
</g>
<g fill="#fff" opacity=".55">
<ellipse cx="439" cy="133" rx="5" ry="3" />
<ellipse cx="439" cy="171" rx="5" ry="3" />
</g>
</g>
{SCREWS.map(([x, y]) => <use key={`${x}-${y}`} href={`#${refId("screw")}`} x={x} y={y} />)}
{CONTROLS.map(control => <ControlArtwork key={control.id} control={control} pressed={pressed === control.id} refId={refId} />)}
  </svg>;
}
