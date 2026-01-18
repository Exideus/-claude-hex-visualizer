import { useSessionStore } from '../store/sessionStore';
import { FileText, GitCommit, MessageSquare, Wrench, AlertCircle } from 'lucide-react';
import { useMemo } from 'react';

interface ActivityItem {
  id: string;
  type: 'file' | 'commit' | 'message' | 'tool' | 'status';
  sessionName: string;
  content: string;
  timestamp: string;
  color: string;
}

export function ActivityFeed() {
  const sessions = useSessionStore((state) => state.sessions);

  const activities = useMemo(() => {
    const items: ActivityItem[] = [];

    sessions.forEach((session) => {
      // Add file changes
      session.modifiedFiles.forEach((file) => {
        items.push({
          id: `file-${session.id}-${file.path}-${file.timestamp}`,
          type: 'file',
          sessionName: session.name,
          content: `${file.action}: ${file.path.split('/').pop()}`,
          timestamp: file.timestamp,
          color: 'text-purple-400',
        });
      });

      // Add commits
      session.recentCommits.forEach((commit) => {
        items.push({
          id: `commit-${session.id}-${commit.hash}`,
          type: 'commit',
          sessionName: session.name,
          content: commit.message.slice(0, 50) + (commit.message.length > 50 ? '...' : ''),
          timestamp: commit.timestamp,
          color: 'text-orange-400',
        });
      });
    });

    // Sort by timestamp, newest first
    items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return items.slice(0, 10);
  }, [sessions]);

  const getIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'file':
        return <FileText size={12} />;
      case 'commit':
        return <GitCommit size={12} />;
      case 'message':
        return <MessageSquare size={12} />;
      case 'tool':
        return <Wrench size={12} />;
      case 'status':
        return <AlertCircle size={12} />;
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);

    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    return date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
  };

  if (activities.length === 0) {
    return null;
  }

  return (
    <div className="fixed left-4 bottom-4 w-72 max-h-64 bg-gray-900/90 backdrop-blur-lg rounded-lg border border-gray-700 overflow-hidden z-50">
      <div className="p-3 border-b border-gray-700">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
          Activity Feed
        </h3>
      </div>

      <div className="overflow-y-auto max-h-48">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="px-3 py-2 border-b border-gray-800 hover:bg-gray-800/50 transition-colors"
          >
            <div className="flex items-center gap-2 mb-1">
              <span className={activity.color}>{getIcon(activity.type)}</span>
              <span className="text-[10px] text-gray-500 font-medium">
                {activity.sessionName}
              </span>
              <span className="text-[10px] text-gray-600 ml-auto">
                {formatTime(activity.timestamp)}
              </span>
            </div>
            <div className="text-xs text-gray-300 truncate">{activity.content}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
