import { useEffect, useRef, useCallback } from 'react';
import { useSessionStore } from '../store/sessionStore';
import type { ServerMessage, ClaudeSession } from '../types/session';

const WS_URL = import.meta.env.PROD
  ? `ws://${window.location.host}`
  : 'ws://localhost:3847';

const RECONNECT_DELAY = 3000;
const MAX_RECONNECT_ATTEMPTS = 10;

export function useWebSocket() {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttempts = useRef(0);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { setSessions, setConnected } = useSessionStore();

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      console.log('Connecting to WebSocket...', WS_URL);
      const ws = new WebSocket(WS_URL);

      ws.onopen = () => {
        console.log('WebSocket connected');
        setConnected(true);
        reconnectAttempts.current = 0;
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as ServerMessage;

          if (data.type === 'init' && data.sessions) {
            setSessions(data.sessions);
          } else if (data.type === 'update' && data.update) {
            // Handle individual session updates
            const { update } = data;
            // TODO: Handle specific update types
            console.log('Received update:', update);
          }
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      ws.onclose = () => {
        console.log('WebSocket closed');
        setConnected(false);
        wsRef.current = null;

        // Attempt to reconnect
        if (reconnectAttempts.current < MAX_RECONNECT_ATTEMPTS) {
          reconnectAttempts.current++;
          console.log(
            `Reconnecting in ${RECONNECT_DELAY}ms... (attempt ${reconnectAttempts.current}/${MAX_RECONNECT_ATTEMPTS})`
          );

          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, RECONNECT_DELAY);
        } else {
          console.log('Max reconnect attempts reached');
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('Failed to create WebSocket:', error);
      setConnected(false);
    }
  }, [setSessions, setConnected]);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  return {
    connected: wsRef.current?.readyState === WebSocket.OPEN,
    reconnect: connect,
  };
}

// Demo data for development/testing
export function useDemoData() {
  const { setSessions, setConnected } = useSessionStore();

  useEffect(() => {
    // Set connected status
    setConnected(true);

    // Generate demo sessions
    const demoSessions: ClaudeSession[] = [
      {
        id: 'session-001',
        name: 'Claude 94',
        status: 'working',
        workingDirectory: '/home/user/projects/webapp',
        gitBranch: 'feature/auth',
        startTime: new Date(Date.now() - 3600000).toISOString(),
        lastActivity: new Date().toISOString(),
        messageCount: 45,
        toolUseCount: 23,
        tokenUsage: { input: 12500, output: 8900 },
        modifiedFiles: [
          { path: 'src/auth/login.tsx', action: 'edit', timestamp: new Date().toISOString() },
          { path: 'src/api/auth.ts', action: 'create', timestamp: new Date().toISOString() },
        ],
        recentCommits: [
          {
            hash: 'a1b2c3d',
            message: 'feat: Add JWT authentication flow',
            timestamp: new Date().toISOString(),
            author: 'Claude',
          },
        ],
      },
      {
        id: 'session-002',
        name: 'Claude 101',
        status: 'active',
        workingDirectory: '/home/user/projects/api-server',
        gitBranch: 'main',
        startTime: new Date(Date.now() - 7200000).toISOString(),
        lastActivity: new Date(Date.now() - 60000).toISOString(),
        messageCount: 78,
        toolUseCount: 45,
        tokenUsage: { input: 25000, output: 18000 },
        modifiedFiles: [
          { path: 'routes/users.ts', action: 'edit', timestamp: new Date().toISOString() },
        ],
        recentCommits: [],
      },
      {
        id: 'session-003',
        name: 'Claude 102',
        status: 'idle',
        workingDirectory: '/home/user/docs/specs',
        startTime: new Date(Date.now() - 1800000).toISOString(),
        lastActivity: new Date(Date.now() - 600000).toISOString(),
        messageCount: 12,
        toolUseCount: 5,
        modifiedFiles: [],
        recentCommits: [],
      },
      {
        id: 'session-004',
        name: 'Claude 105',
        status: 'working',
        workingDirectory: '/home/user/projects/mobile-app',
        gitBranch: 'fix/navigation',
        startTime: new Date(Date.now() - 900000).toISOString(),
        lastActivity: new Date().toISOString(),
        messageCount: 34,
        toolUseCount: 28,
        tokenUsage: { input: 9800, output: 7200 },
        modifiedFiles: [
          { path: 'src/navigation/Router.tsx', action: 'edit', timestamp: new Date().toISOString() },
          { path: 'src/screens/Home.tsx', action: 'edit', timestamp: new Date().toISOString() },
        ],
        recentCommits: [
          {
            hash: 'e5f6g7h',
            message: 'fix: Navigation stack reset issue',
            timestamp: new Date().toISOString(),
            author: 'Claude',
          },
        ],
      },
      {
        id: 'session-005',
        name: 'Claude 108',
        status: 'error',
        workingDirectory: '/home/user/projects/legacy',
        startTime: new Date(Date.now() - 2400000).toISOString(),
        lastActivity: new Date(Date.now() - 1200000).toISOString(),
        messageCount: 23,
        toolUseCount: 15,
        modifiedFiles: [],
        recentCommits: [],
      },
      {
        id: 'session-006',
        name: 'Claude 112',
        status: 'completed',
        workingDirectory: '/home/user/projects/cli-tool',
        gitBranch: 'release/v2.0',
        startTime: new Date(Date.now() - 5400000).toISOString(),
        lastActivity: new Date(Date.now() - 3600000).toISOString(),
        messageCount: 156,
        toolUseCount: 89,
        tokenUsage: { input: 45000, output: 32000 },
        modifiedFiles: [
          { path: 'src/cli.ts', action: 'edit', timestamp: new Date().toISOString() },
          { path: 'README.md', action: 'edit', timestamp: new Date().toISOString() },
        ],
        recentCommits: [
          {
            hash: 'i9j0k1l',
            message: 'chore: Prepare v2.0.0 release',
            timestamp: new Date().toISOString(),
            author: 'Claude',
          },
        ],
      },
      {
        id: 'session-007',
        name: 'Claude 115',
        status: 'active',
        workingDirectory: '/home/user/projects/dashboard',
        gitBranch: 'feature/charts',
        startTime: new Date(Date.now() - 1200000).toISOString(),
        lastActivity: new Date(Date.now() - 120000).toISOString(),
        messageCount: 67,
        toolUseCount: 41,
        modifiedFiles: [],
        recentCommits: [],
      },
    ];

    setSessions(demoSessions);

    // Simulate activity updates
    const interval = setInterval(() => {
      const updatedSessions = demoSessions.map((session) => {
        // Randomly update working sessions
        if (session.status === 'working' && Math.random() > 0.5) {
          return {
            ...session,
            messageCount: session.messageCount + Math.floor(Math.random() * 3),
            toolUseCount: session.toolUseCount + Math.floor(Math.random() * 2),
            lastActivity: new Date().toISOString(),
          };
        }
        return session;
      });
      setSessions(updatedSessions);
    }, 5000);

    return () => clearInterval(interval);
  }, [setSessions, setConnected]);
}
