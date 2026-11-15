import React from 'react';
import CasesPage from '../../pages/CasesPage';
import '../../index.css';

/**
 * Cases story frame – shows the Cases page (with RCA buttons) inside a glass‑styled pane.
 * A robot illustration (user‑provided) is placed at the bottom‑left and gently floats.
 */
export default function CasesStory() {
  return (
    <section className="min-h-screen snap-start relative overflow-hidden bg-black/70 flex items-center justify-center p-8">
      {/* Robot illustration */}
      <img
        src={require('../../assets/robot_frame_03.png')}
        alt="Robot scanner"
        className="absolute left-0 bottom-0 w-48 h-auto opacity-80 robot-frame"
        loading="lazy"
      />
      {/* Glass‑styled container for the Cases page */}
      <div className="relative z-10 glass-card cyber-corner w-full max-w-4xl p-6 rounded-3xl backdrop-blur-md bg-white/10 border border-white/10">
        <CasesPage />
      </div>
    </section>
  );
}

