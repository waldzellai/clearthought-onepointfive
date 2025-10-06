# CHECKPOINTING.md

## Automatic Checkpointing Requirement

**THIS IS A MANDATORY REQUIREMENT, NOT A SUGGESTION.**

After EVERY file modification using `str-replace-editor` or `save-file` tools, you MUST immediately create a checkpoint commit.

## Procedure

After each file edit, execute:

```bash
git add -A && git commit --no-verify -m "checkpoint: <brief description>"
```

## Checkpoint Message Format

The checkpoint message should:
- Start with "checkpoint: " prefix
- Describe what was changed in 5-10 words
- Be specific enough to identify the change
- Use present tense

### Good Examples

```
checkpoint: removed prompt from OperationContext
checkpoint: fixed analogical-reasoning operation
checkpoint: updated base.ts to remove orchestrator pattern
checkpoint: fixed 5 pattern operations to use parameters
checkpoint: removed NextStepGuidance interface
checkpoint: updated logger to new status values
```

### Bad Examples

```
checkpoint: updated file
checkpoint: changes
checkpoint: fixed stuff
checkpoint: wip
```

## Batching Rules

- **Single file edit** = 1 checkpoint
- **Multiple related files in one tool call** = 1 checkpoint describing all changes
- **Multiple unrelated files** = Multiple checkpoints (one per logical change)

### Examples

If you edit `base.ts` in one tool call:
```bash
checkpoint: removed orchestrator interfaces from base.ts
```

If you edit 5 operation files to fix the same issue in one batch:
```bash
checkpoint: removed context.prompt from 5 core operations
```

If you edit `base.ts` then separately edit `logger.ts`:
```bash
checkpoint: removed orchestrator interfaces from base.ts
# ... then after next edit ...
checkpoint: updated logger to new status values
```

## Enforcement

This is NOT optional. This is NOT negotiable. This is a REQUIREMENT.

If you make file edits without checkpointing:
1. You are violating the rules
2. The user loses granular rollback capability
3. The change history becomes opaque

## Rationale

Checkpoints provide:
- **Granular rollback points** - Can undo individual changes
- **Change history** - Clear record of what was modified when
- **Safety net** - Easy recovery from mistakes
- **Progress tracking** - Visual confirmation of work completed

## Squashing Later

These checkpoint commits are meant to be squashed later into meaningful commits before pushing:

```bash
# View checkpoint history
git log --oneline

# Squash last 20 checkpoints into one commit
git rebase -i HEAD~20

# Or reset and recommit
git reset HEAD~20
git add -A
git commit -m "refactor: meaningful summary of all changes"
```

## Exception

The ONLY exception is when the user explicitly says "don't checkpoint this" or "skip checkpointing."

Otherwise, ALWAYS checkpoint after file modifications.

