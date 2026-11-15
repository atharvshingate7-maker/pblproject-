import React from 'react';
import { GlassButton } from '../common/GlassButton';
import { cyberAudio } from '../../utils/cyberAudio';

// Reference hero image imported via relative path – user should place the image at src/assets/reference_hero.jpg
import heroImg from '../../assets/reference_hero.jpg';

export default function HeroSection() {
  // Scroll‑driven narrative – the whole page uses CSS scroll‑snap, each section sticks to viewport height.
  return (
    <section
      className="relative min-h-screen snap-start flex items-center justify-center overflow-hidden"
      style={{
        backgroundImage: `url(${heroImg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        // Dark overlay to match the liquid‑chrome theme
        '--overlay-color': 'rgba(0,0,0,0.55)',
      } as React.CSSProperties}
    >
      {/* Dark translucent overlay */}
      <div className="absolute inset-0 bg-black/55" />

      {/* Robot illustration – user can replace with their own SVG/PNG */}
      <img
        src={require('../../assets/robot_frame_01.png')}
        alt="Robot frame"
        className="absolute left-1/4 top-1/3 w-48 h-auto opacity-80 animate-fade-in"
      />

      {/* Headline / call‑to‑action */}
      <div className="relative z-10 text-center px-4 md:px-0">
        <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-wider mb-4">
          AUTONOMOUS THREAT<br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-200 to-white">
            INTELLIGENCE & DEFENSE
          </span>
        </h1>
        <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-8">
          Real‑time attack‑graph reconstruction, AI‑driven RCA, and a living dashboard that feels like a sci‑fi cockpit.
        </p>
        <GlassButton href="/attack-graph" onClick={() => cyberAudio.playChirp(1100, 0.03)}>
          Explore Attack Graph
        </GlassButton>
      </div>
    </section>
  );
}

