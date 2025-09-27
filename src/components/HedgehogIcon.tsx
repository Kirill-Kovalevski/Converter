import React, { useId, useMemo } from "react";

/**
 * Mythic Hedgehog Badge — full 360° spikes (very noticeable)
 * - Spikes cover the whole inner circle with glow + gentle wind ripple
 * - Left-eye wink loop, subtle breathing, tiny ear twitch
 * - Everything clipped inside the badge ring
 */
type Props = {
  size?: number;
  theme?: "dark" | "light";
  wind?: boolean;          // ripple motion on spikes
  winkEveryMs?: number;    // wink cadence
  breath?: boolean;
  earTwitch?: boolean;

  // Spike style (tweak if you want even bigger spikes)
  spikeCount?: number;     // how many spikes around the ring (default 36)
  spikeLength?: number;    // radial length of each spike (px)
  spikeWidthDeg?: number;  // angular width of each spike (degrees)
};

const HedgehogIcon: React.FC<Props> = ({
  size = 96,
  theme = "dark",
  wind = true,
  winkEveryMs = 4200,
  breath = true,
  earTwitch = true,
  spikeCount = 36,
  spikeLength = 16,
  spikeWidthDeg = 9,
}) => {
  const uid = useId().replace(/:/g, "_");

  const INK  = theme === "dark" ? "#0b0f1a" : "#111827";
  const PAPER = "#ffffff";
  const TEAL  = "#14b8a6";
  const BLUE  = "#60a5fa";

  // Badge geometry
  const ringR  = 86;          // outer visual halo
  const innerR = 72;          // visible white coin (inside ring)
  const ringW  = 6;           // ring stroke width
  const safeR  = innerR - 3;  // clip radius for contents

  // Helpers
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const polar = (cx: number, cy: number, r: number, deg: number) => {
    const a = toRad(deg);
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  };

  // Generate 360° spike polygons
  const spikes = useMemo(() => {
    const outR = safeR - 2;              // tip radius (just inside ring)
    const baseR = Math.max(38, outR - spikeLength); // inward base radius
    const halfW = spikeWidthDeg / 2;
    const arr = Array.from({ length: spikeCount }).map((_, i) => {
      const ang = -90 + (360 / spikeCount) * i; // start at top
      const tip   = polar(100, 100, outR, ang);
      const baseL = polar(100, 100, baseR, ang - halfW);
      const baseRr= polar(100, 100, baseR, ang + halfW);
      return {
        i,
        tip,
        baseL,
        baseRr,
        // small per-spike random-ish variance for wind feel
        wiggle: ((i * 53) % 7) - 3, // -3..+3 deg
      };
    });
    return arr;
  }, [safeR, spikeCount, spikeLength, spikeWidthDeg]);

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      role="img"
      aria-label="Mythic Hedgehog"
      style={{ display: "block" }}
    >
      <defs>
        {/* soft halo */}
        <radialGradient id={`halo_${uid}`} cx="50%" cy="35%" r="75%">
          <stop offset="0%" stopColor={`${BLUE}22`} />
          <stop offset="100%" stopColor={`${TEAL}18`} />
        </radialGradient>

        {/* ring gradient */}
        <linearGradient id={`ring_${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={TEAL} />
          <stop offset="100%" stopColor={BLUE} />
        </linearGradient>

        {/* subtle ring inner glow */}
        <filter id={`innerGlow_${uid}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="2.2" result="b" />
          <feComposite in="b" in2="SourceAlpha" operator="out" result="inset" />
          <feColorMatrix
            in="inset"
            type="matrix"
            values="0 0 0 0 0
                    0 0 0 0 0
                    0 0 0 0 0
                    0 0 0 .35 0"
          />
          <feBlend in="SourceGraphic" mode="normal" />
        </filter>

        {/* cyan/blue glow for spikes */}
        <filter id={`spikeGlow_${uid}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2.8" result="g" />
          <feColorMatrix
            in="g"
            type="matrix"
            values="0 0 0 0 0.10
                    0 0 0 0 0.71
                    0 0 0 0 0.66
                    0 0 0 0.95 0"
          />
        </filter>

        {/* clip: nothing escapes the inner coin */}
        <clipPath id={`clip_${uid}`}>
          <circle cx="100" cy="100" r={safeR} />
        </clipPath>

        {/* animations */}
        <style>{`
          /* wink (left eye) */
          @keyframes wink_${uid} {
            0%   { transform: scaleY(1); }
            40%  { transform: scaleY(1); }
            45%  { transform: scaleY(.12); }
            55%  { transform: scaleY(.12); }
            60%  { transform: scaleY(1); }
            100% { transform: scaleY(1); }
          }
          /* gentle wind ripple for spikes */
          @keyframes gust_${uid} {
            0%   { transform: rotate(0deg) }
            50%  { transform: rotate(-2.5deg) }
            100% { transform: rotate(0deg) }
          }
          /* breathing chest */
          @keyframes breath_${uid} {
            0%   { transform: translateY(0) scale(1,1); opacity:.18; }
            50%  { transform: translateY(-1px) scale(1.06,1.09); opacity:.26; }
            100% { transform: translateY(0) scale(1,1); opacity:.18; }
          }
          /* tiny ear twitch */
          @keyframes ear_${uid} {
            0%,82% { transform: rotate(0deg) }
            85%    { transform: rotate(-10deg) }
            88%    { transform: rotate(4deg) }
            92%    { transform: rotate(-5deg) }
            96%,100% { transform: rotate(0deg) }
          }

          .hh-eye-left-${uid} {
            transform-origin: 84px 95px;
            animation: wink_${uid} ${Math.max(1200, winkEveryMs)}ms ease-in-out infinite;
          }
          .hh-breath-${uid} {
            ${breath ? `animation: breath_${uid} 2600ms ease-in-out infinite;` : ""}
            transform-origin: 100px 130px;
          }
          .hh-ear-${uid} {
            ${earTwitch ? `animation: ear_${uid} 5200ms ease-in-out infinite;` : ""}
            transform-origin: 150px 96px;
          }
          .hh-spike-${uid} {
            ${wind ? `animation: gust_${uid} 2400ms ease-in-out infinite;` : ""}
            transform-origin: 100px 100px; /* rotate around center for ripple */
          }
        `}</style>
      </defs>

      {/* halo + coin ring */}
      <circle cx="100" cy="100" r={ringR} fill={`url(#halo_${uid})`} />
      <circle
        cx="100"
        cy="100"
        r={innerR}
        fill={PAPER}
        stroke={`url(#ring_${uid})`}
        strokeWidth={ringW}
        filter={`url(#innerGlow_${uid})`}
      />

      {/* full 360° SPIKES (glow underlay + ink layer) */}
      <g clipPath={`url(#clip_${uid})`}>
        {/* glow underlay */}
        <g filter={`url(#spikeGlow_${uid})`}>
          {spikes.map(({ i, tip, baseL, baseRr, wiggle }) => (
            <polygon
              key={`sg${i}`}
              className={`hh-spike-${uid}`}
              style={{ animationDelay: `${(i * 70) % 1400}ms`, transform: `rotate(${wiggle}deg)` }}
              points={`${baseL[0]},${baseL[1]} ${tip[0]},${tip[1]} ${baseRr[0]},${baseRr[1]}`}
              fill={BLUE}
              opacity={0.42}
            />
          ))}
        </g>
        {/* solid spikes */}
        {spikes.map(({ i, tip, baseL, baseRr, wiggle }) => (
          <polygon
            key={`s${i}`}
            className={`hh-spike-${uid}`}
            style={{ animationDelay: `${(i * 70) % 1400}ms`, transform: `rotate(${wiggle}deg)` }}
            points={`${baseL[0]},${baseL[1]} ${tip[0]},${tip[1]} ${baseRr[0]},${baseRr[1]}`}
            fill={INK}
          />
        ))}
      </g>

      {/* hedgehog body & face — clipped so it never escapes */}
      <g clipPath={`url(#clip_${uid})`}>
        {/* breathing chest aura */}
        <ellipse className={`hh-breath-${uid}`} cx="100" cy="130" rx="44" ry="12" fill="#00000022" />

        {/* body (rounded capsule) */}
        <path
          d="M52 125
             Q50 110 66 104
             Q88 96 112 98
             Q132 100 148 108
             Q160 114 160 126
             Q158 144 138 152
             Q118 160 96 160
             Q68 160 58 156
             Q52 152 52 125 Z"
          fill={INK}
        />

        {/* ear (little triangle) */}
        <polygon className={`hh-ear-${uid}`} points="146,100 154,92 158,104" fill={INK} />

        {/* face mask */}
        <ellipse cx="100" cy="98" rx="40" ry="30" fill={PAPER} stroke={INK} strokeWidth="3.2" />

        {/* paws */}
        <g>
          <ellipse cx="76" cy="115" rx="12" ry="10" fill={PAPER} stroke={INK} strokeWidth="3" />
          <ellipse cx="124" cy="115" rx="12" ry="10" fill={PAPER} stroke={INK} strokeWidth="3" />
          <path d="M68 115 h16" stroke={INK} strokeWidth="2" />
          <path d="M116 115 h16" stroke={INK} strokeWidth="2" />
        </g>

        {/* eyes (left winks) */}
        <g>
          <ellipse cx="84" cy="95" rx="7" ry="7.6" fill={INK} className={`hh-eye-left-${uid}`} />
          <circle cx="86.2" cy="93.2" r="2" fill={PAPER} />
          <ellipse cx="116" cy="95" rx="7" ry="7.6" fill={INK} />
          <circle cx="118.2" cy="93.2" r="2" fill={PAPER} />
        </g>

        {/* nose */}
        <circle cx="100" cy="108" r="5" fill={INK} />
      </g>
    </svg>
  );
};

export default HedgehogIcon;
