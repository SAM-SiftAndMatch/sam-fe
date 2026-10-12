import type React from 'react';

const HeroSignalBackground: React.FC = () => (
  <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
    <div className="hero-signal-grid absolute inset-0" />
    <div className="hero-signal-orb hero-signal-orb-one" />
    <div className="hero-signal-orb hero-signal-orb-two" />

    <svg
      className="hero-signal-paths absolute left-1/2 top-1/2 h-[760px] w-[1180px] -translate-x-1/2 -translate-y-1/2"
      viewBox="0 0 1180 760"
      fill="none"
    >
      <path d="M80 505C240 305 384 630 566 386C728 170 832 336 1090 158" />
      <path d="M46 596C274 460 327 692 571 522C799 364 900 510 1144 382" />
      <circle className="hero-signal-node hero-signal-node-one" cx="566" cy="386" r="5" />
      <circle className="hero-signal-node hero-signal-node-two" cx="832" cy="336" r="4" />
      <circle className="hero-signal-node hero-signal-node-three" cx="571" cy="522" r="4" />
    </svg>
  </div>
);

export default HeroSignalBackground;
