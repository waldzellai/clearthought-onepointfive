# Claude Code Configuration

This directory contains Claude Code configuration for the Clear-Thought project.

## Contents

### Commands

**`commands/convert-to-journal.md`** - Slash command for converting operations to structured journal pattern

Usage:
```
/convert-to-journal
```

This command provides a step-by-step workflow for converting Clear-Thought operations to use the same structured journal pattern as the Sequential Thinking MCP server.

### Hooks

**`hooks/validate-vaporware.ts`** - PostToolUse hook for automatic vaporware detection

Automatically validates operation implementations against anti-patterns:
- Placeholder returns
- Prompt echoing
- Fake pattern selection
- Vaporware algorithm claims
- Missing implementations
- Token waste
- Silent failures

### Settings

**`settings.json`** - Hook configuration

Configures the PostToolUse hook to run on Write/Edit operations in `src/tools/operations/`.

## How It Works

1. **Developer runs** `/convert-to-journal` to start conversion workflow
2. **Developer edits** operation file following the guided process
3. **On save**, PostToolUse hook automatically triggers
4. **Hook validates** the implementation:
   - Static analysis (fast, ~100ms)
   - Claude Agent SDK analysis (if needed, ~10-30s)
5. **If validation fails**, hook exits with code 2 (blocks operation)
6. **Developer fixes** issues and saves again
7. **When validation passes**, developer commits changes

## Installation

1. Install dependencies:
```bash
npm install --save-dev @anthropic-ai/claude-agent-sdk tsx chalk
```

2. Make hook executable:
```bash
chmod +x .claude/hooks/validate-vaporware.ts
```

3. Verify configuration:
```bash
cat .claude/settings.json
```

## Documentation

- **Full Guide**: `docs/AGENTIC_WORKFLOW_GUIDE.md`
- **Quick Reference**: `docs/QUICK_REFERENCE_VAPORWARE_DETECTION.md`
- **Pattern Analysis**: `reports/how-sequentialthinking-actually-works.md`
- **Reference Implementation**: `docs/sequential-thinking-mcp-index.ts`
- **Anti-Patterns**: `reports/analysis-clear-thought-actually-does-nothing.md`

## Troubleshooting

### Hook not running

Check:
- `.claude/settings.json` exists and is valid JSON
- Hook script is executable: `chmod +x .claude/hooks/validate-vaporware.ts`
- `tsx` is installed: `npm install -g tsx`
- File path matches: `src/tools/operations/*.ts`

### Validation always fails

Check:
- Static analysis output for specific issues
- Claude Agent SDK feedback for detailed analysis
- Reference implementation for correct pattern
- Anti-pattern examples for what to avoid

### Hook times out

Increase timeout in `settings.json`:
```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "tsx \"$CLAUDE_PROJECT_DIR\"/.claude/hooks/validate-vaporware.ts",
            "timeout": 180
          }
        ]
      }
    ]
  }
}
```

## Customization

### Adjust validation threshold

Edit `.claude/hooks/validate-vaporware.ts`:

```typescript
// Change passing score from 70 to 80
const finalPassed = finalScore >= 80;
```

### Skip validation for specific files

Edit `.claude/hooks/validate-vaporware.ts`:

```typescript
// Skip validation for specific operations
const skipFiles = ['legacy-operation.ts', 'experimental-operation.ts'];
if (skipFiles.some(f => filePath.includes(f))) {
  console.error(chalk.gray(`Skipping validation for ${filePath}`));
  process.exit(0);
}
```

### Add custom checks

Edit `.claude/hooks/validate-vaporware.ts`:

```typescript
// Add custom static analysis check
if (/your-pattern-here/i.test(content)) {
  issues.push("CUSTOM: Your custom issue description");
  score -= 10;
}
```

## Maintenance

### Update Claude Agent SDK

```bash
npm update @anthropic-ai/claude-agent-sdk
```

### Update hook script

Edit `.claude/hooks/validate-vaporware.ts` and test:

```bash
# Test hook manually
echo '{"tool_input":{"file_path":"src/tools/operations/test.ts","content":"..."}}' | \
  tsx .claude/hooks/validate-vaporware.ts
```

### Update slash command

Edit `.claude/commands/convert-to-journal.md` to refine the workflow.

## Security

The hook executes automatically on file saves. Review the hook script before use:

```bash
cat .claude/hooks/validate-vaporware.ts
```

The hook:
- Only reads files (no writes)
- Only validates TypeScript files in `src/tools/operations/`
- Exits with code 2 to block on failure (doesn't modify files)
- Uses Claude Agent SDK for analysis (requires API access)

## Contributing

When modifying the workflow:

1. Update the slash command in `commands/convert-to-journal.md`
2. Update the hook script in `hooks/validate-vaporware.ts`
3. Update documentation in `docs/AGENTIC_WORKFLOW_GUIDE.md`
4. Update quick reference in `docs/QUICK_REFERENCE_VAPORWARE_DETECTION.md`
5. Test the workflow end-to-end
6. Commit all changes together

## License

Same as the main project (MIT).

