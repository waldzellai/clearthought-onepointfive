# `.claude/` Directory Index

Configuration and automation for Claude Code development environment.

## 📁 Directory Structure

### [`settings.json`](settings.json)
Claude Code configuration file

### [`agents/`](agents/)
Agent templates and specifications
- [`core/`](agents/core/) - Core agent types (planner, tester)
- [`hive-mind/`](agents/hive-mind/) - Hive mind coordination agents
- [`optimization/`](agents/optimization/) - Performance and resource optimization agents
- [`specialized/`](agents/specialized/) - Domain-specific agents
- [`templates/`](agents/templates/) - Reusable agent templates

### [`checklists/`](checklists/)
Task checklists and verification guides
- [`mcp-evals-test-checklist.md`](checklists/mcp-evals-test-checklist.md)

### [`checkpoints/`](checkpoints/)
Checkpoint and state management

### [`commands/`](commands/)
Slash commands for development workflows

#### Core Categories
- [`agents/`](commands/agents/) - Agent management commands
- [`analysis/`](commands/analysis/) - Performance and bottleneck analysis
- [`automation/`](commands/automation/) - Automated workflow commands
- [`coordination/`](commands/coordination/) - Swarm coordination commands
- [`flow-nexus/`](commands/flow-nexus/) - Flow Nexus integration
- [`github/`](commands/github/) - GitHub workflow commands
- [`hive-mind/`](commands/hive-mind/) - Hive mind orchestration
- [`hooks/`](commands/hooks/) - Hook management
- [`memory/`](commands/memory/) - Memory and persistence
- [`monitoring/`](commands/monitoring/) - System monitoring
- [`optimization/`](commands/optimization/) - Performance optimization
- [`pair/`](commands/pair/) - Pair programming modes
- [`sparc/`](commands/sparc/) - SPARC methodology commands
- [`stream-chain/`](commands/stream-chain/) - Pipeline execution
- [`swarm/`](commands/swarm/) - Swarm management
- [`training/`](commands/training/) - Neural training
- [`truth/`](commands/truth/) - Truth verification
- [`verify/`](commands/verify/) - Verification workflows
- [`workflows/`](commands/workflows/) - Workflow automation

#### Notable Commands
- [`convert-to-journal.md`](commands/convert-to-journal.md) - Convert operations to journal pattern

### [`helpers/`](helpers/)
Utility scripts and automation
- [`checkpoint-manager.sh`](helpers/checkpoint-manager.sh)
- [`github-safe.js`](helpers/github-safe.js)
- [`github-setup.sh`](helpers/github-setup.sh)
- [`quick-start.sh`](helpers/quick-start.sh)
- [`setup-mcp.sh`](helpers/setup-mcp.sh)
- [`standard-checkpoint-hooks.sh`](helpers/standard-checkpoint-hooks.sh)

### [`hooks/`](hooks/)
Claude Code hooks for automation

### [`skills/`](skills/)
Reusable skills and patterns
- [`model-enhancement-mcp/`](skills/model-enhancement-mcp/) - MCP server enhancement patterns
  - [`blog-post.md`](skills/model-enhancement-mcp/blog-post.md)
  - [`example-notebooks/`](skills/model-enhancement-mcp/example-notebooks/)
  - [`example-servers/`](skills/model-enhancement-mcp/example-servers/)

## 🚀 Quick Start

1. Browse [`commands/`](commands/) for available slash commands
2. Check [`agents/`](agents/) for agent templates
3. Review [`helpers/`](helpers/) for setup scripts
4. Explore [`skills/`](skills/) for reusable patterns

## 📖 Documentation

See root [`docs/`](../docs/) directory for comprehensive guides and [`CLAUDE.md`](../CLAUDE.md) for project configuration.