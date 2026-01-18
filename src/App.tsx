import { Scene } from './components/Scene';
import { StatusBar } from './components/StatusBar';
import { SessionPanel } from './components/SessionPanel';
import { ActivityFeed } from './components/ActivityFeed';
import { useDemoData } from './hooks/useWebSocket';
import './index.css';

function App() {
  // Use demo data for now (in production, use useWebSocket instead)
  useDemoData();

  return (
    <div className="w-full h-full relative scanline">
      {/* 3D Scene */}
      <Scene />

      {/* UI Overlays */}
      <StatusBar />
      <SessionPanel />
      <ActivityFeed />

      {/* Instructions overlay */}
      <div className="fixed bottom-4 right-4 text-xs text-gray-500 bg-gray-900/50 px-3 py-2 rounded-lg">
        <div className="flex items-center gap-2">
          <span>🖱️ Drag to rotate</span>
          <span>•</span>
          <span>🔍 Scroll to zoom</span>
          <span>•</span>
          <span>👆 Click hex for details</span>
        </div>
      </div>
    </div>
  );
}

export default App;
