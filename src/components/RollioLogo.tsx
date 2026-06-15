// Pre-computed Archimedean spiral: center (90,62), r0=3.5→r1=43, 2.875 clockwise turns
// Tail ends upper-right of circle (~120,32) to match the logo
const SPIRAL_D = (() => {
  const cx = 90, cy = 62, r0 = 3.5, r1 = 43, turns = 2.875, steps = 300;
  let d = '';
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const theta = t * turns * 2 * Math.PI;
    const r = r0 + (r1 - r0) * t;
    const x = cx + r * Math.cos(theta);
    const y = cy + r * Math.sin(theta);
    d += `${i === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)} `;
  }
  return d.trim();
})();

const ANIM_CSS = `
  @keyframes rl-crescent{from{opacity:0;transform:translateX(-8px)}to{opacity:1;transform:translateX(0)}}
  @keyframes rl-circle{from{opacity:0}to{opacity:1}}
  @keyframes rl-spiral{from{stroke-dashoffset:1000}to{stroke-dashoffset:0}}
  @keyframes rl-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}}
  .rl-crescent{opacity:0;animation:rl-crescent .5s .05s ease-out both}
  .rl-circle{opacity:0;animation:rl-circle .4s .2s ease-out both}
  .rl-spiral{stroke-dasharray:1000;stroke-dashoffset:1000;animation:rl-spiral 1.9s .45s cubic-bezier(.4,0,.2,1) both}
  .rl-float{animation:rl-float 5s 2.6s ease-in-out infinite}
`;

interface LogoProps {
  size?: number;
  float?: boolean;
  className?: string;
}

export function RollioAnimatedLogo({ size = 48, float = false, className }: LogoProps) {
  const h = Math.round(size * 120 / 150);
  return (
    <svg
      viewBox="0 0 150 120"
      width={size}
      height={h}
      className={className}
      aria-label="Rollio"
    >
      <defs><style>{ANIM_CSS}</style></defs>
      <g className={float ? 'rl-float' : undefined}>
        {/* Navy crescent — sits behind the main circle */}
        <circle className="rl-crescent" cx={50} cy={60} r={52} fill="#2d3a5c" />
        {/* Cream border ring */}
        <circle className="rl-circle" cx={90} cy={60} r={52} fill="#f0e8dc" />
        {/* Terracotta fill */}
        <circle className="rl-circle" cx={90} cy={60} r={48.5} fill="#c4714a" />
        {/* Spiral */}
        <path
          className="rl-spiral"
          d={SPIRAL_D}
          fill="none"
          stroke="#f0e8dc"
          strokeWidth={4}
          strokeLinecap="round"
          pathLength={1000}
        />
      </g>
    </svg>
  );
}

export function RollioLogo({ className }: { className?: string }) {
  return <RollioAnimatedLogo className={className} />;
}

export function RollioLogoHorizontal({
  className,
  textClass = 'text-foreground',
  size = 36,
}: {
  className?: string;
  textClass?: string;
  size?: number;
}) {
  return (
    <div className={`flex items-center gap-2 ${className ?? ''}`}>
      <RollioAnimatedLogo size={size} float />
      <span className={`text-lg font-semibold tracking-tight ${textClass}`}>Rollio</span>
    </div>
  );
}
