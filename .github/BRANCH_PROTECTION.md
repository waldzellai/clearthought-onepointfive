# Branch Protection Configuration

## Main Branch Protection Rules

These settings should be applied to the `main` branch via GitHub Settings > Branches > Branch protection rules.

### Required Settings

#### Protect matching branches
- Branch name pattern: `main`

#### Require a pull request before merging
- ✅ Require approvals: **1**
- ⬜ Dismiss stale pull request approvals when new commits are pushed
- ⬜ Require review from Code Owners
- ⬜ Restrict who can dismiss pull request reviews
- ⬜ Allow specified actors to bypass required pull requests
- ⬜ Require approval of the most recent reviewable push

#### Require status checks to pass before merging
- ✅ Require branches to be up to date before merging

**Required status checks:**
- `lint` (from CI Pipeline workflow)
- `security` (from CI Pipeline workflow)
- `test (18)` (from CI Pipeline workflow)
- `test (20)` (from CI Pipeline workflow)
- `build` (from CI Pipeline workflow)

#### Require conversation resolution before merging
- ✅ Enabled

#### Require signed commits
- ⬜ Not required (optional)

#### Require linear history
- ⬜ Not required (allows merge commits)

#### Require deployments to succeed before merging
- ⬜ Not required

#### Lock branch
- ⬜ Not locked

#### Do not allow bypassing the above settings
- ✅ Enabled (admins must follow rules)

#### Restrict who can push to matching branches
- ⬜ Not restricted (all collaborators can push via PR)

#### Allow force pushes
- ⬜ Disabled

#### Allow deletions
- ⬜ Disabled

---

## Refactor Branch Protection Rules

For `refactor/operation-scaffolding` and other feature branches:

### Settings
- ✅ Require status checks to pass before merging
  - `lint`
  - `security`
  - `test (18)`
  - `test (20)`
  - `build`
- ✅ Allow force pushes (for rebasing during development)
- ⬜ Do not require pull request reviews (can merge directly)

---

## How to Apply

### Via GitHub Web UI

1. Go to: https://github.com/waldzellai/clearthought-onepointfive/settings/branches
2. Click "Add branch protection rule"
3. Enter branch name pattern: `main`
4. Configure settings as listed above
5. Click "Create" or "Save changes"

### Via GitHub CLI (if available)

```bash
# Install GitHub CLI if not already installed
# https://cli.github.com/

# Configure main branch protection
gh api \
  --method PUT \
  -H "Accept: application/vnd.github+json" \
  /repos/waldzellai/clearthought-onepointfive/branches/main/protection \
  -f required_status_checks='{"strict":true,"contexts":["lint","security","test (18)","test (20)","build"]}' \
  -f enforce_admins=false \
  -f required_pull_request_reviews='{"required_approving_review_count":1}' \
  -f restrictions=null \
  -f required_conversation_resolution=true \
  -f allow_force_pushes=false \
  -f allow_deletions=false
```

---

## Verification

After applying branch protection rules, verify by:

1. Attempting to push directly to `main` (should be blocked)
2. Creating a test PR without passing CI (should be blocked from merging)
3. Creating a test PR with passing CI but no approval (should be blocked from merging)
4. Creating a test PR with passing CI and approval (should be allowed to merge)

---

## Notes

- Branch protection rules require admin access to configure
- The GitHub API may require additional permissions (repo admin scope)
- If automated configuration fails, manual setup via web UI is recommended
- These rules help enforce code quality and prevent accidental direct pushes to main

