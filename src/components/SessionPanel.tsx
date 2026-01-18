import { useSessionStore } from '../store/sessionStore';
import { X, GitBranch, Clock, FileText, MessageSquare, Wrench, FolderOpen } from 'lucide-react';
import type { SessionStatus } from '../types/session';

const STATUS_LABELS: Record<SessionStatus, { label: string; color: string }> = {
  active: { label: 'Active', color: 'bg-green-500' },
  working: { label: 'Working', color: 'bg-yellow-500' },
  idle: { label: 'Idle', color: 'bg-gray-500' },
  error: { label: 'Error', color: 'bg-red-500' },
  completed: { label: 'Completed', color: 'bg-blue-500' },
};

export function SessionPanel() {
  const { selectedSessionId, selectSession, getSessionById } = useSessionStore();

  if (!selectedSessionId) return null;

  const session = getSessionById(selectedSessionId);
  if (!session) return null;

  const statusInfo = STATUS_LABELS[session.status];

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDuration = (start: string) => {
    const startDate = new Date(start);
    const now = new Date();
    const diff = now.getTime() - startDate.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    return `${minutes}m`;
  };

  return (
    <div className="fixed right-4 top-20 bottom-4 w-80 bg-gray-900/95 backdrop-blur-lg rounded-lg border border-gray-700 overflow-hidden flex flex-col z-50">
      {/* Header */}
      <div className="p-4 border-b border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${statusInfo.color}`} />
          <div>
            <h2 className="font-bold text-white text-sm">{session.name}</h2>
            <span className="text-xs text-gray-400">{statusInfo.label}</span>
          </div>
        </div>
        <button
          onClick={() => selectSession(null)}
          className="p-1 hover:bg-gray-700 rounded transition-colors"
        >
          <X size={16} className="text-gray-400" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Directory */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <FolderOpen size={12} />
            <span>Working Directory</span>
          </div>
          <div className="text-xs text-gray-300 bg-gray-800 p-2 rounded font-mono break-all">
            {session.workingDirectory}
          </div>
        </div>

        {/* Git Branch */}
        {session.gitBranch && (
          <div className="flex items-center gap-2 text-sm">
            <GitBranch size={14} className="text-blue-400" />
            <span className="text-gray-400">Branch:</span>
            <span className="text-blue-400 font-mono">{session.gitBranch}</span>
          </div>
        )}

        {/* Time info */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Clock size={14} className="text-gray-400" />
            <span className="text-gray-400">Started:</span>
            <span className="text-gray-300">{formatTime(session.startTime)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock size={14} className="text-green-400" />
            <span className="text-gray-400">Duration:</span>
            <span className="text-green-400">{formatDuration(session.startTime)}</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-800 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <MessageSquare size={12} className="text-blue-400" />
              <span className="text-xs text-gray-400">Messages</span>
            </div>
            <div className="text-xl font-bold text-white">{session.messageCount}</div>
          </div>
          <div className="bg-gray-800 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Wrench size={12} className="text-yellow-400" />
              <span className="text-xs text-gray-400">Tool Uses</span>
            </div>
            <div className="text-xl font-bold text-white">{session.toolUseCount}</div>
          </div>
        </div>

        {/* Token usage */}
        {session.tokenUsage && (
          <div className="bg-gray-800 p-3 rounded-lg">
            <div className="text-xs text-gray-400 mb-2">Token Usage</div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Input:</span>
              <span className="text-green-400">{session.tokenUsage.input.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Output:</span>
              <span className="text-blue-400">{session.tokenUsage.output.toLocaleString()}</span>
            </div>
          </div>
        )}

        {/* Modified Files */}
        {session.modifiedFiles.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <FileText size={12} />
              <span>Modified Files ({session.modifiedFiles.length})</span>
            </div>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {session.modifiedFiles.slice(-5).map((file, i) => (
                <div
                  key={`${file.path}-${i}`}
                  className="text-xs bg-gray-800 p-2 rounded flex items-center gap-2"
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      file.action === 'create'
                        ? 'bg-green-400'
                        : file.action === 'edit'
                        ? 'bg-yellow-400'
                        : file.action === 'delete'
                        ? 'bg-red-400'
                        : 'bg-blue-400'
                    }`}
                  />
                  <span className="text-gray-300 font-mono truncate flex-1">
                    {file.path.split('/').pop()}
                  </span>
                  <span className="text-gray-500 text-[10px]">
                    {formatTime(file.timestamp)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Commits */}
        {session.recentCommits.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <GitBranch size={12} />
              <span>Recent Commits ({session.recentCommits.length})</span>
            </div>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {session.recentCommits.slice(-3).map((commit, i) => (
                <div key={`${commit.hash}-${i}`} className="bg-gray-800 p-2 rounded">
                  <div className="text-xs font-mono text-orange-400 mb-1">
                    {commit.hash.slice(0, 7)}
                  </div>
                  <div className="text-xs text-gray-300 line-clamp-2">
                    {commit.message}
                  </div>
                  <div className="text-[10px] text-gray-500 mt-1">
                    {formatTime(commit.timestamp)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
