import React from 'react';
import { Navbar } from './components/layout/Navbar.jsx';
import { SidebarLeft } from './components/layout/SidebarLeft.jsx';
import { SidebarRight } from './components/layout/SidebarRight.jsx';
import { NetworkCanvas } from './components/canvas/NetworkCanvas.jsx';
import { BottomPanel } from './components/bottompanel/BottomPanel.jsx';
import { LearningDrawer } from './components/common/LearningDrawer.jsx';
import { TemplatesModal } from './components/modals/TemplatesModal.jsx';
import { ProjectModal } from './components/modals/ProjectModal.jsx';
import { FTPModal } from './components/modals/FTPModal.jsx';

export function App() {
  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Top Navbar */}
      <Navbar />

      {/* Main Workspace Workspace Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Device Palette Left Sidebar */}
        <SidebarLeft />

        {/* Center Topology Editor Canvas */}
        <NetworkCanvas />

        {/* Device Configuration Right Sidebar */}
        <SidebarRight />

        {/* Educational Learning Mode Overlay Drawer */}
        <LearningDrawer />
      </div>

      {/* Bottom Protocol Inspector & Console Panel */}
      <BottomPanel />

      {/* Global Modals */}
      <TemplatesModal />
      <ProjectModal />
      <FTPModal />
    </div>
  );
}

export default App;
