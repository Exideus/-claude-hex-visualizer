import { create } from 'zustand';
import type { ClaudeSession, SessionStatus } from '../types/session';

interface SessionStore {
  sessions: ClaudeSession[];
  selectedSessionId: string | null;
  connected: boolean;

  // Actions
  setSessions: (sessions: ClaudeSession[]) => void;
  addSession: (session: ClaudeSession) => void;
  updateSession: (id: string, updates: Partial<ClaudeSession>) => void;
  removeSession: (id: string) => void;
  selectSession: (id: string | null) => void;
  setConnected: (connected: boolean) => void;

  // Computed
  getSessionById: (id: string) => ClaudeSession | undefined;
  getSessionsByStatus: (status: SessionStatus) => ClaudeSession[];
  getActiveCount: () => number;
  getWorkingCount: () => number;
}

// Helper to assign hex grid positions
function assignHexPositions(sessions: ClaudeSession[]): ClaudeSession[] {
  // Generate spiral hex positions
  const generateSpiral = (count: number) => {
    const positions: { q: number; r: number }[] = [{ q: 0, r: 0 }];
    let q = 0, r = 0;
    let direction = 0;
    let steps = 1;
    let stepCount = 0;
    let turnCount = 0;

    const directions = [
      { q: 1, r: 0 },   // East
      { q: 0, r: 1 },   // Southeast
      { q: -1, r: 1 },  // Southwest
      { q: -1, r: 0 },  // West
      { q: 0, r: -1 },  // Northwest
      { q: 1, r: -1 },  // Northeast
    ];

    while (positions.length < count) {
      const dir = directions[direction % 6];
      q += dir.q;
      r += dir.r;
      positions.push({ q, r });
      stepCount++;

      if (stepCount === steps) {
        stepCount = 0;
        direction++;
        turnCount++;
        if (turnCount === 2) {
          turnCount = 0;
          steps++;
        }
      }
    }

    return positions;
  };

  const positions = generateSpiral(sessions.length);

  return sessions.map((session, index) => ({
    ...session,
    hexPosition: positions[index],
  }));
}

export const useSessionStore = create<SessionStore>((set, get) => ({
  sessions: [],
  selectedSessionId: null,
  connected: false,

  setSessions: (sessions) => {
    const withPositions = assignHexPositions(sessions);
    set({ sessions: withPositions });
  },

  addSession: (session) => {
    set((state) => {
      const newSessions = [...state.sessions, session];
      return { sessions: assignHexPositions(newSessions) };
    });
  },

  updateSession: (id, updates) => {
    set((state) => ({
      sessions: state.sessions.map((s) =>
        s.id === id ? { ...s, ...updates } : s
      ),
    }));
  },

  removeSession: (id) => {
    set((state) => {
      const filtered = state.sessions.filter((s) => s.id !== id);
      return {
        sessions: assignHexPositions(filtered),
        selectedSessionId: state.selectedSessionId === id ? null : state.selectedSessionId,
      };
    });
  },

  selectSession: (id) => set({ selectedSessionId: id }),

  setConnected: (connected) => set({ connected }),

  getSessionById: (id) => get().sessions.find((s) => s.id === id),

  getSessionsByStatus: (status) => get().sessions.filter((s) => s.status === status),

  getActiveCount: () => get().sessions.filter((s) => s.status === 'active' || s.status === 'working').length,

  getWorkingCount: () => get().sessions.filter((s) => s.status === 'working').length,
}));
