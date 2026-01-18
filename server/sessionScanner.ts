import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { glob } from 'glob';
import * as readline from 'readline';

export interface SessionMessage {
  type: 'user' | 'assistant' | 'tool_use' | 'tool_result';
  timestamp: string;
  message?: {
    role: string;
    content: unknown;
  };
  sessionId?: string;
  cwd?: string;
  gitBranch?: string;
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
  status: 'active' | 'working' | 'idle' | 'error' | 'completed';
  workingDirectory: string;
  gitBranch?: string;
  startTime: string;
  lastActivity: string;
  messageCount: number;
  toolUseCount: number;
  tokenUsage?: { input: number; output: number };
  modifiedFiles: FileChange[];
  recentCommits: GitCommit[];
  model?: string;
  filePath: string;
}

const CLAUDE_DIR = path.join(os.homedir(), '.claude');
const PROJECTS_DIR = path.join(CLAUDE_DIR, 'projects');

// Decode the encoded directory path
function decodeProjectPath(encoded: string): string {
  // Replace leading dash and all dashes with forward slashes
  return encoded.replace(/^-/, '/').replace(/-/g, '/');
}

// Parse a JSONL file to extract session info
async function parseSessionFile(filePath: string): Promise<ClaudeSession | null> {
  try {
    const stats = fs.statSync(filePath);
    const fileName = path.basename(filePath, '.jsonl');

    // Skip summary files
    if (fileName.includes('summary')) {
      return null;
    }

    const messages: SessionMessage[] = [];
    const fileStream = fs.createReadStream(filePath);
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity,
    });

    for await (const line of rl) {
      try {
        const parsed = JSON.parse(line) as SessionMessage;
        messages.push(parsed);
      } catch {
        // Skip invalid JSON lines
      }
    }

    if (messages.length === 0) {
      return null;
    }

    // Extract session info from messages
    const firstMessage = messages[0];
    const lastMessage = messages[messages.length - 1];

    // Count message types
    let messageCount = 0;
    let toolUseCount = 0;
    const fileChanges: FileChange[] = [];
    const commits: GitCommit[] = [];
    let workingDirectory = '';
    let gitBranch = '';

    for (const msg of messages) {
      if (msg.type === 'user' || msg.type === 'assistant') {
        messageCount++;
      }
      if (msg.type === 'tool_use' || msg.type === 'tool_result') {
        toolUseCount++;

        // Extract file changes from tool results
        if (msg.type === 'tool_result' && msg.message?.content) {
          const content = msg.message.content;
          if (typeof content === 'object' && content !== null) {
            // Look for Read, Edit, Write tool results
            const toolContent = content as { tool?: string; path?: string };
            if (toolContent.path) {
              fileChanges.push({
                path: toolContent.path,
                action: 'edit',
                timestamp: msg.timestamp,
              });
            }
          }
        }
      }

      // Get working directory from message
      if (msg.cwd) {
        workingDirectory = msg.cwd;
      }
      if (msg.gitBranch) {
        gitBranch = msg.gitBranch;
      }
    }

    // If no cwd found, try to decode from project folder
    if (!workingDirectory) {
      const projectFolder = path.basename(path.dirname(filePath));
      workingDirectory = decodeProjectPath(projectFolder);
    }

    // Determine session status based on last activity time
    const lastActivityTime = new Date(lastMessage.timestamp || stats.mtime).getTime();
    const now = Date.now();
    const minutesSinceActivity = (now - lastActivityTime) / 60000;

    let status: ClaudeSession['status'] = 'idle';
    if (minutesSinceActivity < 1) {
      status = 'working';
    } else if (minutesSinceActivity < 5) {
      status = 'active';
    } else if (minutesSinceActivity < 30) {
      status = 'idle';
    } else {
      status = 'completed';
    }

    // Generate a friendly name
    const dirName = path.basename(workingDirectory);
    const sessionNum = fileName.slice(-4);
    const name = `${dirName}/${sessionNum}`;

    return {
      id: fileName,
      name: name.length > 20 ? name.slice(-20) : name,
      status,
      workingDirectory,
      gitBranch: gitBranch || undefined,
      startTime: firstMessage.timestamp || stats.birthtime.toISOString(),
      lastActivity: lastMessage.timestamp || stats.mtime.toISOString(),
      messageCount,
      toolUseCount,
      modifiedFiles: fileChanges.slice(-10),
      recentCommits: commits.slice(-5),
      filePath,
    };
  } catch (error) {
    console.error(`Error parsing session file ${filePath}:`, error);
    return null;
  }
}

// Scan all Claude Code sessions
export async function scanSessions(): Promise<ClaudeSession[]> {
  const sessions: ClaudeSession[] = [];

  if (!fs.existsSync(PROJECTS_DIR)) {
    console.log('Claude projects directory not found:', PROJECTS_DIR);
    return sessions;
  }

  try {
    // Find all .jsonl files in the projects directory
    const pattern = path.join(PROJECTS_DIR, '**', '*.jsonl');
    const files = await glob(pattern, { absolute: true });

    console.log(`Found ${files.length} session files`);

    // Parse each session file
    for (const file of files) {
      const session = await parseSessionFile(file);
      if (session) {
        sessions.push(session);
      }
    }

    // Sort by last activity, most recent first
    sessions.sort(
      (a, b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime()
    );

    // Limit to most recent sessions
    return sessions.slice(0, 50);
  } catch (error) {
    console.error('Error scanning sessions:', error);
    return sessions;
  }
}

// Watch for session file changes
export function watchSessions(
  onChange: (sessions: ClaudeSession[]) => void
): () => void {
  let debounceTimer: NodeJS.Timeout | null = null;

  const handleChange = async () => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    debounceTimer = setTimeout(async () => {
      const sessions = await scanSessions();
      onChange(sessions);
    }, 500);
  };

  // Watch the projects directory for changes
  const watcher = fs.watch(
    PROJECTS_DIR,
    { recursive: true },
    (eventType, filename) => {
      if (filename?.endsWith('.jsonl')) {
        handleChange();
      }
    }
  );

  // Initial scan
  handleChange();

  // Return cleanup function
  return () => {
    watcher.close();
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
  };
}
