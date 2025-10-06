# Git Hooks Guide

## Overview

This project uses **Husky** to manage git hooks that provide automated quality checks while maintaining fast iteration during development.

## Hook Strategy: "Warn but Don't Block"

Our hooks use a **two-tier approach**:

1. **Checkpoint commits** - Lightweight checks that **warn but don't block**
2. **Regular commits** - Full validation that **enforces quality gates**

This provides visibility into issues while maintaining fast iteration.

## Installed Hooks

### 1. Pre-Commit Hook (`.husky/pre-commit`)

Runs before every commit. Behavior depends on commit type:

#### For Checkpoint Commits

```bash
git commit -m "checkpoint: added new feature"
```

**Checks** (warn but don't block):
- ⚡ Quick syntax check (TypeScript compilation)
- ⚠️ Shows errors but allows commit
- ✅ Always succeeds

**Output example**:
```
⚡ Checkpoint commit detected - running lightweight checks...
📝 Quick syntax check...
src/tools/operations/foo.ts(15,25): error TS2339: Property 'prompt' does not exist
⚠️  WARNING: Type errors detected (not blocking checkpoint)
✅ Checkpoint commit allowed
```

#### For Regular Commits

```bash
git commit -m "feat: add new operation"
```

**Checks** (enforced):
- 📝 Linting (`npm run lint`)
- 🔧 Type checking (`npm run typecheck`)
- 🧪 Unit tests (`npm run test:unit`)
- ❌ Blocks commit if any check fails

**Output example**:
```
🔍 Running full pre-commit checks...
📝 Checking code style...
✅ Linting passed
🔧 Type checking...
✅ Type checking passed
🧪 Running unit tests...
✅ All tests passed
✅ Pre-commit checks passed!
```

### 2. Commit Message Hook (`.husky/commit-msg`)

Validates commit message format.

#### Allowed Formats

**1. Checkpoint commits** (warn but don't block):
```
checkpoint: <brief description>
```

Examples:
- ✅ `checkpoint: added MCP Evals checklist`
- ✅ `checkpoint: fixed type errors in operations`
- ⚠️ `checkpoint: wip` (warns but allows)
- ⚠️ `checkpoint: fix` (warns but allows)

**2. Conventional commits** (enforced):
```
<type>: <description>
<type>(<scope>): <description>
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `perf`, `ci`, `build`, `revert`

Examples:
- ✅ `feat: add new operation for analogical reasoning`
- ✅ `fix(operations): correct parameter validation`
- ✅ `docs: update README with installation instructions`
- ❌ `added stuff` (blocks commit)

**3. Merge commits** (always allowed):
```
Merge branch 'feature' into main
```

**4. Revert commits** (always allowed):
```
Revert "feat: add new operation"
```

## Workflow

### Development Session

```bash
# Edit file 1
vim src/tools/operations/foo.ts

# Checkpoint (lightweight checks)
git add -A && git commit -m "checkpoint: added foo operation"
# ⚡ Quick syntax check runs
# ⚠️ Shows warnings but doesn't block
# ✅ Commit succeeds

# Edit file 2
vim src/tools/operations/bar.ts

# Checkpoint (lightweight checks)
git add -A && git commit -m "checkpoint: added bar operation"
# ⚡ Quick syntax check runs
# ✅ Commit succeeds

# ... (20 more checkpoints)

# Squash all checkpoints
git rebase -i HEAD~22

# Final commit (full validation)
git commit -m "feat: add foo and bar operations"
# 🔍 Full pre-commit checks run
# 📝 Linting
# 🔧 Type checking
# 🧪 Tests
# ✅ All checks pass
# ✅ Commit succeeds
```

### What Gets Checked

| Commit Type | Syntax Check | Linting | Type Check | Tests | Message Format |
|-------------|--------------|---------|------------|-------|----------------|
| Checkpoint  | ✅ (warn)    | ❌      | ❌         | ❌    | ✅ (warn)      |
| Regular     | ✅ (block)   | ✅      | ✅         | ✅    | ✅ (block)     |

## Installation

Hooks are automatically installed when you run:

```bash
npm install
```

This triggers the `prepare` script in `package.json`:

```json
{
  "scripts": {
    "prepare": "husky"
  }
}
```

## Manual Installation

If hooks aren't working:

```bash
# Install husky
npm install --save-dev husky

# Initialize husky
npx husky init

# Make hooks executable
chmod +x .husky/pre-commit
chmod +x .husky/commit-msg
```

## Verification

Test that hooks are working:

```bash
# Check git hooks path
git config core.hooksPath
# Should output: .husky/_

# Test checkpoint commit
echo "test" > test.txt
git add test.txt
git commit -m "checkpoint: test hooks"
# Should see: ⚡ Checkpoint commit detected...

# Test regular commit
git commit --amend -m "feat: test hooks"
# Should see: 🔍 Running full pre-commit checks...
```

## Bypassing Hooks

### For Checkpoints (Not Recommended)

Checkpoints already use lightweight checks, but if you need to skip them:

```bash
git commit --no-verify -m "checkpoint: emergency fix"
```

### For Regular Commits (Use Sparingly)

Only bypass hooks when absolutely necessary (e.g., emergency hotfix):

```bash
git commit --no-verify -m "fix: emergency hotfix"
```

**Warning**: Bypassing hooks on regular commits skips all quality checks!

## Customization

### Modify Pre-Commit Checks

Edit `.husky/pre-commit`:

```bash
# Add new check for checkpoint commits
if [ "$IS_CHECKPOINT" = true ]; then
  echo "🔍 Running custom check..."
  npm run custom:check || echo "⚠️  WARNING: Custom check failed"
fi

# Add new check for regular commits
else
  echo "🔍 Running custom check..."
  npm run custom:check || exit 1
fi
```

### Modify Commit Message Validation

Edit `.husky/commit-msg`:

```bash
# Add new commit type
if echo "$commit_msg" | grep -qE "^(feat|fix|docs|custom)(\(.+\))?: .+"; then
  echo "✅ Conventional commit format valid"
  exit 0
fi
```

## Troubleshooting

### Hooks Not Running

**Problem**: Commits succeed without any hook output

**Solutions**:
1. Check hooks path: `git config core.hooksPath` (should be `.husky/_`)
2. Reinstall hooks: `npm run prepare`
3. Make hooks executable: `chmod +x .husky/*`
4. Check you're not using `--no-verify`

### Hooks Failing on Checkpoint Commits

**Problem**: Checkpoint commits are blocked

**Solutions**:
1. Check commit message starts with `checkpoint:`
2. Verify `.husky/pre-commit` has checkpoint detection logic
3. Check `.git/COMMIT_EDITMSG` is readable

### Type Errors Blocking Checkpoints

**Problem**: Checkpoint commits fail due to type errors

**Solutions**:
1. Verify pre-commit hook has `exit 0` for checkpoints
2. Check the hook is detecting checkpoint commits correctly
3. Review the hook output - should say "WARNING" not "ERROR"

## Best Practices

### 1. Use Checkpoints Frequently

```bash
# After every file edit
git add -A && git commit -m "checkpoint: <what you changed>"
```

### 2. Write Descriptive Checkpoint Messages

**Good**:
- `checkpoint: added MCP Evals checklist`
- `checkpoint: fixed type errors in operations`
- `checkpoint: updated slash command to reference checklist`

**Bad** (will warn):
- `checkpoint: wip`
- `checkpoint: fix`
- `checkpoint: update`

### 3. Squash Before Pushing

```bash
# Squash last 20 checkpoints
git rebase -i HEAD~20

# Or reset and recommit
git reset HEAD~20
git add -A
git commit -m "feat: meaningful summary"
```

### 4. Run Full Checks Before Final Commit

```bash
# Before final commit, run full checks manually
npm run lint
npm run typecheck
npm run test

# Then commit (hooks will verify)
git commit -m "feat: add new feature"
```

## Integration with Claude Code

The hooks integrate with the Claude Code workflow:

1. **Claude makes edits** → Files modified
2. **Claude checkpoints** → `git commit -m "checkpoint: ..."`
3. **Hooks run** → Quick syntax check (warns but doesn't block)
4. **Claude sees warnings** → Can address issues or continue
5. **User squashes** → Combines checkpoints into meaningful commits
6. **User commits** → Full validation runs

This provides **visibility** without **blocking** the agentic workflow.

## References

- **Husky Documentation**: https://typicode.github.io/husky/
- **Conventional Commits**: https://www.conventionalcommits.org/
- **Checkpointing Guide**: `.augment/rules/CHECKPOINTING.md`
- **Hook Files**:
  - `.husky/pre-commit`
  - `.husky/commit-msg`

