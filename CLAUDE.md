# Clear Thought 2.0 - Project Architecture & Development Guide

## Project Overview

**Clear Thought 2.0** is a Model Context Protocol (MCP) server that enables sequential thinking and problem-solving through a detailed, step-by-step thinking process. It's the successor to Waldzell AI's Clear Thought project.

- **Repository**: https://github.com/Kastalien-Research/clear-thought-two.git
- **License**: MIT
- **Author**: Anthropic, PBC
- **Type**: ESM Node.js CLI/Server Application
- **Build Target**: ES2022

## Project Structure

```
clear-thought-two/
├── src/
│   └── index.ts                 # Main MCP server implementation
├── dist/                        # Compiled JavaScript output
│   ├── index.js                 # Executable server (with shebang)
│   ├── index.d.ts               # TypeScript type declarations
│   └── ai_docs/                 # Generated documentation
├── ai_docs/                     # Development documentation
│   ├── model-context-protocol/  # MCP specifications and schemas
│   ├── anthropic_*.md           # Anthropic integration guides
│   ├── cc_hooks_docs.md         # Claude Code hooks documentation
│   └── externalized-reasoning-report.md
├── .devcontainer/               # Development container config
├── .claude-plugin/              # Claude plugin marketplace info
├── logs/                        # Runtime logs (excluded from git)
├── package.json                 # Project metadata & scripts
├── tsconfig.json                # TypeScript configuration
├── Dockerfile                   # Multi-stage production Docker build
├── README.md                    # User documentation
├── .roomodes                    # Custom Claude Code modes
├── .gitignore                   # Git exclusions
└── cc_mcp_config.json           # MCP server configuration (contains secrets)
```

## Core Technologies & Stack

### Dependencies
- **@modelcontextprotocol/sdk** (v1.20.0) - MCP protocol implementation
- **chalk** (v5.6.0) - Terminal color formatting for visual output
- **yargs** (v18.0.0) - Command-line argument parsing

### DevDependencies
- **typescript** (v5.3.3+) - TypeScript compiler
- **@types/node** (v22) - Node.js type definitions
- **@types/yargs** (v17.0.32) - yargs type definitions
- **shx** (v0.3.4) - Cross-platform shell commands (chmod)

### Runtime Environment
- **Node.js**: 22-alpine (production Docker)
- **Module System**: ES Modules (ESM) with NodeNext resolution
- **Platform**: macOS, Linux (via Docker)

## Architecture

### MCP Server Implementation

The project implements a single MCP tool: **sequential_thinking**

#### Core Classes
- **SequentialThinkingServer**: Main service class managing:
  - `thoughtHistory[]` - Array storing all thoughts in sequence
  - `branches{}` - Map tracking branching thought paths
  - `disableThoughtLogging` - Environment flag for controlling console output

#### Key Components

1. **Tool Definition** (SEQUENTIAL_THINKING_TOOL)
   - Provides comprehensive documentation for the sequential thinking process
   - Defines schema for thought validation
   - Specifies 9 required parameters and 4 optional extension parameters

2. **Request Handlers**
   - ListToolsRequestSchema: Returns available MCP tools
   - CallToolRequestSchema: Processes sequential thinking calls

3. **Input Validation**
   - validateThoughtData() - Type-safe validation with clear error messages
   - Automatic totalThoughts adjustment when thoughtNumber exceeds estimate

4. **Thought Formatting**
   - formatThought() - Colorized ASCII-bordered output
   - Visual indicators: 💭 (regular), 🔄 (revision), 🌿 (branch)
   - Uses chalk for terminal coloring

#### Thought Data Structure

```typescript
interface ThoughtData {
  thought: string;                  // Current thinking step
  thoughtNumber: number;            // Current position in sequence
  totalThoughts: number;            // Estimated total steps
  nextThoughtNeeded: boolean;       // Continue thinking?
  isRevision?: boolean;             // Revises prior thought?
  revisesThought?: number;          // Which thought being reconsidered
  branchFromThought?: number;       // Branching point
  branchId?: string;                // Branch identifier
  needsMoreThoughts?: boolean;      // Additional steps needed?
}
```

### Transport & Communication

- **Transport**: StdioServerTransport (standard input/output)
- **Protocol**: Model Context Protocol (MCP)
- **Client Integration**: Claude Desktop, VS Code (Cline), other MCP clients

## Build & Development Workflow

### Build Process

```bash
npm run build      # Compile TypeScript to JavaScript
                   # 1. tsc compiles src/ → dist/
                   # 2. shx chmod +x dist/*.js (make executable)

npm run prepare    # Runs before npm publish (calls build)

npm run watch      # Continuous compilation during development
```

### TypeScript Configuration

- **Target**: ES2022 (modern JavaScript features)
- **Module**: NodeNext (ECMAScript modules)
- **Module Resolution**: NodeNext (native ESM resolution)
- **Strict Mode**: Enabled (full type safety)
- **Output**: dist/ directory
- **Source**: src/ directory
- **Declaration**: Enabled (generates .d.ts files)

### Installation & Setup

```bash
npm install        # Install dependencies
npm run build      # Build dist/
npm run watch      # Watch mode for development
```

## Configuration

### Environment Variables

- **DISABLE_THOUGHT_LOGGING** (boolean): Set to "true" to suppress thought output to stderr
  - Useful for production deployments or when integrating with other tools
  - Default: false (logging enabled)

### CLI Binary

The project publishes a binary entry point:

```json
"bin": {
  "clear-thought-two": "./dist/index.js"
}
```

Allows installation via: `npm install -g clear-thought-two` or `npx clear-thought-two`

## Integration Points

### Claude Desktop Integration

Add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "clear-thought-two": {
      "command": "npx",
      "args": ["-y", "clear-thought-two"]
    }
  }
}
```

### VS Code / Cline Integration

Add to `.vscode/mcp.json`:

```json
{
  "mcp": {
    "servers": {
      "clear-thought-two": {
        "command": "npx",
        "args": ["-y", "clear-thought-two"]
      }
    }
  }
}
```

### Docker Deployment

Multi-stage Dockerfile for production:
1. **Builder stage**: Installs deps, compiles TypeScript, prunes devDeps
2. **Release stage**: Alpine base with only runtime essentials
3. **Entrypoint**: `node dist/index.js`

## Key Architectural Patterns

### 1. Single Responsibility Principle
- SequentialThinkingServer handles only thought processing
- Server class manages protocol communication
- Clear separation of validation, formatting, and processing

### 2. Thought State Management
- History-based tracking enables revisions and branching
- Branches stored separately for multi-path analysis
- Immutable thought data (pushed to history, never modified)

### 3. Error Handling
- Validation errors caught and returned as JSON responses
- Graceful degradation: errors don't crash the server
- Detailed error messages for debugging

### 4. Extensibility
- Optional parameters support future thought features
- Branch system allows parallel reasoning paths
- Revision tracking enables hypothesis refinement

### 5. Type Safety
- Full TypeScript strict mode
- Input validation with explicit type coercion
- Exported type declarations for consumers

## Development Practices

### Code Style & Tooling

Per .roomodes configuration:
- **Code Files**: Target <500 lines per file for maintainability
- **Modular Architecture**: Clear boundaries between concerns
- **Security**: No hardcoded secrets or environment values
- **Configuration**: External config via environment variables

### Recommended Custom Modes

The project includes .roomodes with specialized Claude Code modes:

1. **🏗️ Architect** - Design scalable architectures
2. **🧠 Auto-Coder** - Implement modular code
3. **🧪 Tester (TDD)** - Test-driven development
4. **🪲 Debugger** - Troubleshoot runtime issues
5. **🛡️ Security Reviewer** - Audit code for vulnerabilities
6. **📚 Documentation Writer** - Maintain Markdown docs
7. **🔗 System Integrator** - Merge components into cohesive systems

### Development Container

Configured via `.devcontainer/devcontainer.json`:
- **Base**: Node 22 (with zsh shell, claude-code, git extensions)
- **VS Code Extensions**: claude-code, eslint, prettier, gitlens
- **Formatting**: Prettier on save with ESLint fixes
- **Port Forwarding**: 3000 (app), 8080 (API), 9229 (debugger)
- **Node Memory**: 4GB (NODE_OPTIONS)

## Testing & Validation

Current state:
- **No automated tests** configured (jest.config.js excluded from distribution)
- **Manual testing**: Via MCP client integration
- **Type Checking**: Provided by TypeScript strict mode
- **Validation**: Runtime input validation with clear error messages

### Recommended Testing Strategy

TDD approach recommended for future features:
1. Write test cases for new thought features
2. Implement minimum code to pass tests
3. Refactor for clarity and performance

## Performance Considerations

- **Memory**: In-memory storage of thought history and branches
  - Linear growth with thought count
  - Suitable for interactive sessions
  - Consider persistence for long-running sessions

- **Startup**: Near-instant (Node.js startup only)

- **Processing**: Minimal overhead (validation + formatting)
  - O(1) validation per thought
  - O(n) formatting for display

## Security Considerations

1. **Input Validation**
   - All inputs validated before processing
   - Type checking prevents injection attacks
   - Required fields enforced

2. **Environment Isolation**
   - No hardcoded secrets
   - DISABLE_THOUGHT_LOGGING safely defaults to false
   - Docker build prunes dev dependencies

3. **Logging**
   - Thought content logged to stderr (not stdout)
   - Respects DISABLE_THOUGHT_LOGGING flag
   - No sensitive data in output

4. **Known Issues**
   - cc_mcp_config.json contains API keys (excluded from npm/docker)
   - Ensure environment secrets never logged

## Git Workflow

- **Repository**: github.com/Kastalien-Research/clear-thought-two
- **Branch**: main (currently clean)
- **Recent Focus**: README updates, hook cleanup, production build fixes
- **Commits**: Conventional commit messages (chore:, feat:, fix:)

## NPM Publishing

- **Package Name**: clear-thought-two
- **Version**: 0.0.0 (use semver during releases)
- **Distribution**: Includes only `dist/` directory
- **Ignores**: cc_mcp_config.json, tests, docs

## Future Enhancement Opportunities

1. **Persistence**: Save thought histories to disk/database
2. **Analytics**: Track reasoning patterns and performance
3. **Collaboration**: Multi-user thought sessions
4. **Visualization**: Generate reasoning diagrams
5. **Testing**: Comprehensive test suite (TDD)
6. **Streaming**: Real-time thought updates via SSE
7. **Caching**: Memoize common thought patterns

## Deployment

### Local Development

```bash
npm install
npm run build
npm run watch   # For active development
```

### Production (Docker)

```bash
docker build -t clear-thought-two:latest .
docker run clear-thought-two:latest
```

### npm Registry

```bash
npm run build
npm publish     # Publishes from dist/
```

## Useful Commands

```bash
# Development
npm run build          # Compile once
npm run watch          # Watch mode
npm install            # Install dependencies

# Project inspection
npm ls --depth=0       # Show direct dependencies
git log --oneline -20  # Recent commits
git remote -v          # Repository URLs

# Docker
docker build -t clear-thought-two .
docker run -it clear-thought-two
```

## Documentation Resources

- **README.md** - User-facing features and installation
- **ai_docs/** - Development documentation
  - MCP specifications (model-context-protocol/)
  - Anthropic integration guides
  - Claude Code hooks documentation
- **Source Code** - Well-documented with JSDoc-style comments

## Contact & Support

- **Homepage**: https://modelcontextprotocol.io
- **Issues**: https://github.com/modelcontextprotocol/servers/issues
- **License**: MIT
