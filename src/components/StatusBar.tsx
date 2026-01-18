import { useSessionStore } from '../store/sessionStore';
import { Activity, Cpu, GitBranch, FileText, Wifi, WifiOff } from 'lucide-react';

export function StatusBar() {
  const { sessions, connected, getActiveCount, getWorkingCount } = useSessionStore();

  const totalSessions = sessions.length;
  const activeSessions = getActiveCount();
  const workingSessions = getWorkingCount();
  const totalFiles = sessions.reduce((acc, s) => acc + s.modifiedFiles.length, 0);
  const totalCommits = sessions.reduce((acc, s) => acc + s.recentCommits.length, 0);

  return (
    <div className="fixed top-4 left-4 right-4 flex justify-between items-center z-50 pointer-events-none">
      {/* Left side - Logo and connection status */}
      <div className="flex items-center gap-4 pointer-events-auto">
        <div className="bg-gray-900/90 backdrop-blur-lg px-4 py-2 rounded-lg border border-gray-700 flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-lg flex items-center justify-center">
              <Cpu size={18} className="text-white" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">Claude HEX</div>
              <div className="text-[10px] text-gray-400">Agent Visualizer</div>
            </div>
          </div>

          <div className="w-px h-8 bg-gray-700" />

          <div className="flex items-center gap-2">
            {connected ? (
              <>
                <Wifi size={16} className="text-green-400" />
                <span className="text-xs text-green-400">Connected</span>
              </>
            ) : (
              <>
                <WifiOff size={16} className="text-red-400" />
                <span className="text-xs text-red-400">Disconnected</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Center - Stats */}
      <div className="flex items-center gap-3 pointer-events-auto">
        <div className="bg-gray-900/90 backdrop-blur-lg px-4 py-2 rounded-lg border border-gray-700 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Activity size={14} className="text-blue-400" />
            <span className="text-xs text-gray-400">Sessions:</span>
            <span className="text-sm font-bold text-white">{totalSessions}</span>
          </div>

          <div className="w-px h-4 bg-gray-700" />

          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs text-gray-400">Active:</span>
            <span className="text-sm font-bold text-green-400">{activeSessions}</span>
          </div>

          <div className="w-px h-4 bg-gray-700" />

          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
            <span className="text-xs text-gray-400">Working:</span>
            <span className="text-sm font-bold text-yellow-400">{workingSessions}</span>
          </div>
        </div>
      </div>

      {/* Right side - File and commit stats */}
      <div className="flex items-center gap-3 pointer-events-auto">
        <div className="bg-gray-900/90 backdrop-blur-lg px-4 py-2 rounded-lg border border-gray-700 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <FileText size={14} className="text-purple-400" />
            <span className="text-xs text-gray-400">Files:</span>
            <span className="text-sm font-bold text-purple-400">{totalFiles}</span>
          </div>

          <div className="w-px h-4 bg-gray-700" />

          <div className="flex items-center gap-2">
            <GitBranch size={14} className="text-orange-400" />
            <span className="text-xs text-gray-400">Commits:</span>
            <span className="text-sm font-bold text-orange-400">{totalCommits}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
