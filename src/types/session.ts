export type SessionStatus = 'active' | 'working' | 'idle' | 'error' | 'completed';

export interface SessionMessage {
  type: 'user' | 'assistant' | 'tool_use' | 'tool_result';
  timestamp: string;
  message?: {
    role: string;
    content: string | ContentBlock[];
  };
  toolUseResult?: unknown;
}

export interface ContentBlock {
  type: 'text' | 'tool_use' | 'tool_result';
  text?: string;
  name?: string;
  input?: unknown;
}

export interface FileChange {
  path: string;
  action: 'read' | 'edit' | 'create' | 'delete';
  timestamp: string;
}

export interface GitCommit {
  hash: string;
  message: string;
  timestamp: string;
  author: string;
}

export interface ClaudeSession {
  id: string;
  name: string;
  status: SessionStatus;
  workingDirectory: string;
  gitBranch?: string;
  startTime: string;
  lastActivity: string;
  messageCount: number;
  toolUseCount: number;
  tokenUsage?: {
    input: number;
    output: number;
  };
  modifiedFiles: FileChange[];
  recentCommits: GitCommit[];
  model?: string;
  hexPosition?: { q: number; r: number };
}

export interface SessionUpdate {
  type: 'session_update' | 'session_add' | 'session_remove' | 'file_change' | 'commit';
  sessionId: string;
  data: Partial<ClaudeSession> | FileChange | GitCommit;
}

export interface ServerMessage {
  type: 'init' | 'update' | 'error';
  sessions?: ClaudeSession[];
  update?: SessionUpdate;
  error?: string;
}
