import React from 'react';
import AttackGraphPage from '../../pages/AttackGraphPage';
import '../../index.css'; // ensure glassmorphism globals are applied

/**
 * Attack Graph story frame – displays the attack‑graph page inside a glass‑styled container.
 * A robot illustration (user‑provided) is positioned on the right side and gently floats.
 */
export default function AttackGraphStory() {
  return (
    <section className="min-h-screen snap-start relative overflow-hidden bg-black/70 flex items-center justify-center p-8">
      {/* Robot illustration – assumes a file named robot_frame_02.png exists in assets */}
      <img
        src={require('../../assets/robot_frame_02.png')}
        alt="Robot arm"
        className="absolute right-0 top-1/4 w-64 h-auto opacity-80 robot-frame"
        loading="lazy"
      />
      {/* Glass‑styled container for the AttackGraphPage */}
      <div className="relative z-10 glass-card cyber-corner w-full max-w-4xl p-6 rounded-3xl backdrop-blur-md bg-white/10 border border-white/10">
        <AttackGraphPage />
      </div>
    </section>
  );
}

