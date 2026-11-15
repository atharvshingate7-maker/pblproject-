import React from 'react';
import Topbar from '../components/navigation/Topbar';
import SciFiBackground from '../components/common/SciFiBackground';
import { Outlet } from 'react-router-dom';

export default function AppLayout() {
  return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
        background: '#060608',
      }}
    >
      {/* Wireframe background */}
      <SciFiBackground />

      {/* Sticky top navigation */}
      <Topbar />

      {/* Main content — flex: 1 so StoryPage fills remaining height */}
      <main
        style={{
          flex: 1,
          position: 'relative',
          zIndex: 1,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Outlet />
      </main>
    </div>
  );
}
