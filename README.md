# 🔷 Claude HEX Visualizer

A stunning 3D hexagonal visualization of your Claude Code agent sessions, inspired by [Vibecraft.sh](https://vibecraft.sh).

## Features

- **3D Hexagonal Grid**: Beautiful Three.js-powered visualization
- **Real-time Updates**: Automatically detects and updates session status
- **Session Details**: Click any hex to see detailed session info
- **Activity Feed**: Live feed of file changes and commits
- **Status Tracking**: Visual indicators for active, working, idle, and completed sessions

## Installation

```bash
# Run directly with npx
npx claude-hex-visualizer

# Or install globally
npm install -g claude-hex-visualizer
claude-hex
```

## Development

```bash
# Clone and install
git clone https://github.com/yourusername/claude-hex-visualizer
cd claude-hex-visualizer
npm install

# Run in development mode
npm run dev

# Build for production
npm run build
```

## How It Works

1. Scans `~/.claude/projects/` for Claude Code session files (`.jsonl`)
2. Parses session metadata: messages, tool usage, file changes, commits
3. Displays sessions as hexagonal tiles in a 3D grid
4. Updates in real-time as sessions change

## Session Status Colors

- 🟢 **Active** (green): Recent activity (< 5 min)
- 🟡 **Working** (yellow): Currently processing (< 1 min)
- ⚪ **Idle** (gray): No recent activity
- 🔵 **Completed** (blue): Session finished
- 🔴 **Error** (red): Session encountered an error

## Controls

- **Rotate**: Click and drag
- **Zoom**: Scroll wheel
- **Select**: Click on a hex tile
- **Pan**: Right-click and drag

## Requirements

- Node.js 18+
- Claude Code installed with existing sessions
- Modern browser with WebGL support

## Tech Stack

- **Frontend**: React 19, Three.js, React Three Fiber
- **Styling**: Tailwind CSS
- **State**: Zustand
- **Backend**: Express, WebSocket
- **Build**: Vite

## License

MIT
