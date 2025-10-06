# CI/CD Implementation Plan
## Enforcing Code Quality Standards for Clear-Thought

**Branch:** `refactor/operation-scaffolding`  
**Based on:** Gemini Deep Research CI/CD Report  
**Integration with:** Architecture Alignment Plan

---

## Executive Summary

This plan establishes a comprehensive CI/CD pipeline with automated quality gates, security scanning, and enforcement mechanisms to ensure code quality standards throughout the refactoring process and beyond.

### Key Objectives
1. **Prevent regressions** during the architecture refactoring
2. **Enforce code quality standards** automatically
3. **Shift security left** with automated scanning
4. **Accelerate feedback loops** for developers
5. **Establish measurable quality metrics** (DORA framework)

---

## Phase 0: Pre-Commit Hooks (Local Developer Environment)

### Git Hooks with Husky

**Install Husky for Git hook management:**
```bash
npm install --save-dev husky
npx husky init
```

### Pre-Commit Hook Configuration

**`.husky/pre-commit`:**
```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# Run linter
npm run lint

# Run type checking
npm run typecheck

# Run unit tests (fast tests only)
npm run test:unit

# Check for secrets
npm run check:secrets
```

### Pre-Push Hook Configuration

**`.husky/pre-push`:**
```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# Run full test suite
npm run test

# Run security audit
npm audit --audit-level=moderate
```

---

## Phase 1: Linting & Code Quality Tools

### 1.1 TypeScript ESLint Configuration

**Install dependencies:**
```bash
npm install --save-dev @typescript-eslint/parser @typescript-eslint/eslint-plugin eslint
```

**`.eslintrc.json`:**
```json
{
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaVersion": 2020,
    "sourceType": "module",
    "project": "./tsconfig.json"
  },
  "plugins": ["@typescript-eslint"],
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking"
  ],
  "rules": {
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/explicit-function-return-type": "warn",
    "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
    "@typescript-eslint/no-floating-promises": "error",
    "no-console": ["warn", { "allow": ["warn", "error"] }],
    "max-lines": ["warn", { "max": 300, "skipBlankLines": true, "skipComments": true }],
    "complexity": ["warn", 10]
  }
}
```

### 1.2 Prettier for Code Formatting

**Install Prettier:**
```bash
npm install --save-dev prettier eslint-config-prettier
```

**`.prettierrc.json`:**
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false
}
```

**`.prettierignore`:**
```
dist/
node_modules/
coverage/
*.md
```

### 1.3 Biome (Alternative to ESLint + Prettier)

**Note:** The project already uses Biome. Enhance configuration:

**`biome.json`:**
```json
{
  "$schema": "https://biomejs.dev/schemas/1.5.0/schema.json",
  "organizeImports": {
    "enabled": true
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true,
      "complexity": {
        "noExtraBooleanCast": "error",
        "noMultipleSpacesInRegularExpressionLiterals": "error",
        "noUselessCatch": "error",
        "noUselessConstructor": "error",
        "noUselessLoneBlockStatements": "error",
        "noUselessRename": "error",
        "noWith": "error",
        "useFlatMap": "error",
        "useOptionalChain": "error",
        "useSimplifiedLogicExpression": "error"
      },
      "correctness": {
        "noConstAssign": "error",
        "noConstantCondition": "error",
        "noEmptyPattern": "error",
        "noGlobalObjectCalls": "error",
        "noInnerDeclarations": "error",
        "noInvalidConstructorSuper": "error",
        "noNewSymbol": "error",
        "noUnreachable": "error",
        "noUnreachableSuper": "error",
        "noUnsafeFinally": "error",
        "noUnsafeOptionalChaining": "error",
        "noUnusedVariables": "error",
        "useValidForDirection": "error"
      },
      "security": {
        "noDangerouslySetInnerHtml": "error",
        "noGlobalEval": "error"
      },
      "style": {
        "noArguments": "error",
        "noVar": "error",
        "useConst": "error",
        "useTemplate": "error"
      },
      "suspicious": {
        "noAsyncPromiseExecutor": "error",
        "noCatchAssign": "error",
        "noClassAssign": "error",
        "noCompareNegZero": "error",
        "noDebugger": "error",
        "noDoubleEquals": "error",
        "noDuplicateCase": "error",
        "noDuplicateClassMembers": "error",
        "noDuplicateObjectKeys": "error",
        "noExplicitAny": "warn",
        "noFallthroughSwitchClause": "error",
        "noFunctionAssign": "error",
        "noGlobalAssign": "error",
        "noImportAssign": "error",
        "noMisleadingCharacterClass": "error",
        "noPrototypeBuiltins": "error",
        "noRedeclare": "error",
        "noShadowRestrictedNames": "error",
        "noUnsafeNegation": "error"
      }
    }
  },
  "formatter": {
    "enabled": true,
    "formatWithErrors": false,
    "indentStyle": "tab",
    "indentWidth": 2,
    "lineWidth": 100
  }
}
```

---

## Phase 2: Security Scanning

### 2.1 Secrets Detection

**Install detect-secrets:**
```bash
npm install --save-dev @secretlint/secretlint @secretlint/secretlint-rule-preset-recommend
```

**`.secretlintrc.json`:**
```json
{
  "rules": [
    {
      "id": "@secretlint/secretlint-rule-preset-recommend"
    }
  ]
}
```

**Add to package.json:**
```json
{
  "scripts": {
    "check:secrets": "secretlint '**/*'"
  }
}
```

### 2.2 Dependency Vulnerability Scanning

**Use npm audit (built-in):**
```bash
npm audit --audit-level=moderate
```

**Install Snyk for advanced scanning:**
```bash
npm install --save-dev snyk
```

**Add to package.json:**
```json
{
  "scripts": {
    "security:audit": "npm audit --audit-level=moderate",
    "security:snyk": "snyk test",
    "security:all": "npm run security:audit && npm run security:snyk"
  }
}
```

### 2.3 SAST (Static Application Security Testing)

**Use SonarQube or SonarCloud:**

**`sonar-project.properties`:**
```properties
sonar.projectKey=waldzellai_clearthought-onepointfive
sonar.organization=waldzellai
sonar.sources=src
sonar.tests=tests
sonar.typescript.lcov.reportPaths=coverage/lcov.info
sonar.javascript.lcov.reportPaths=coverage/lcov.info
sonar.exclusions=**/node_modules/**,**/dist/**,**/coverage/**
```

---

## Phase 3: Automated Testing

### 3.1 Test Structure (Test Pyramid)

```
┌─────────────────────────────────┐
│     E2E Tests (Few)             │  ← Slow, expensive, comprehensive
├─────────────────────────────────┤
│   Integration Tests (Some)      │  ← Medium speed, test interactions
├─────────────────────────────────┤
│   Unit Tests (Many)             │  ← Fast, cheap, focused
└─────────────────────────────────┘
```

### 3.2 Test Scripts in package.json

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:unit": "vitest run --testPathPattern=tests/unit",
    "test:integration": "vitest run --testPathPattern=tests/integration",
    "test:e2e": "vitest run --testPathPattern=tests/e2e",
    "test:coverage": "vitest run --coverage",
    "test:ci": "vitest run --coverage --reporter=verbose --reporter=junit --outputFile=test-results/junit.xml"
  }
}
```

### 3.3 Coverage Thresholds

**`vitest.config.ts`:**
```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 75,
        statements: 80
      },
      exclude: [
        'node_modules/',
        'dist/',
        'tests/',
        '**/*.test.ts',
        '**/*.spec.ts'
      ]
    }
  }
});
```

---

## Phase 4: GitHub Actions CI/CD Pipeline

### 4.1 Main CI Pipeline

**`.github/workflows/ci.yml`:**
```yaml
name: CI Pipeline

on:
  push:
    branches: [main, refactor/operation-scaffolding]
  pull_request:
    branches: [main]

jobs:
  lint:
    name: Lint & Format Check
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run Biome check
        run: npm run check
      
      - name: TypeScript type check
        run: npm run typecheck

  security:
    name: Security Scanning
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Check for secrets
        run: npm run check:secrets
      
      - name: Run npm audit
        run: npm audit --audit-level=moderate
      
      - name: Run Snyk security scan
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
        with:
          args: --severity-threshold=high

  test:
    name: Test Suite
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18, 20]
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests with coverage
        run: npm run test:ci
      
      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
          flags: unittests
          name: codecov-umbrella
      
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: test-results-${{ matrix.node-version }}
          path: test-results/

  build:
    name: Build
    runs-on: ubuntu-latest
    needs: [lint, security, test]
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build project
        run: npm run build
      
      - name: Upload build artifacts
        uses: actions/upload-artifact@v3
        with:
          name: dist
          path: dist/
```

### 4.2 Pull Request Quality Gate

**`.github/workflows/pr-quality-gate.yml`:**
```yaml
name: PR Quality Gate

on:
  pull_request:
    types: [opened, synchronize, reopened]

jobs:
  quality-gate:
    name: Quality Gate
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0  # Full history for better analysis
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run all quality checks
        run: |
          npm run check
          npm run typecheck
          npm run test:coverage
      
      - name: Check coverage thresholds
        run: |
          if [ -f coverage/coverage-summary.json ]; then
            node -e "
              const coverage = require('./coverage/coverage-summary.json');
              const total = coverage.total;
              const failed = [];
              if (total.lines.pct < 80) failed.push('lines');
              if (total.functions.pct < 80) failed.push('functions');
              if (total.branches.pct < 75) failed.push('branches');
              if (total.statements.pct < 80) failed.push('statements');
              if (failed.length > 0) {
                console.error('Coverage thresholds not met:', failed.join(', '));
                process.exit(1);
              }
            "
          fi
      
      - name: Comment PR with results
        uses: actions/github-script@v6
        if: always()
        with:
          script: |
            const fs = require('fs');
            const coverage = JSON.parse(fs.readFileSync('coverage/coverage-summary.json', 'utf8'));
            const total = coverage.total;
            
            const comment = `## Quality Gate Results
            
            ### Code Coverage
            - Lines: ${total.lines.pct.toFixed(2)}% (threshold: 80%)
            - Functions: ${total.functions.pct.toFixed(2)}% (threshold: 80%)
            - Branches: ${total.branches.pct.toFixed(2)}% (threshold: 75%)
            - Statements: ${total.statements.pct.toFixed(2)}% (threshold: 80%)
            
            ${total.lines.pct >= 80 && total.functions.pct >= 80 && total.branches.pct >= 75 && total.statements.pct >= 80 ? '✅ All thresholds met!' : '❌ Some thresholds not met'}
            `;
            
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: comment
            });
```

---

## Phase 5: Branch Protection Rules

### GitHub Branch Protection Configuration

**For `main` branch:**
- ✅ Require pull request reviews before merging (1 approval minimum)
- ✅ Require status checks to pass before merging:
  - `lint`
  - `security`
  - `test (18)`
  - `test (20)`
  - `build`
- ✅ Require branches to be up to date before merging
- ✅ Require conversation resolution before merging
- ✅ Do not allow bypassing the above settings
- ✅ Restrict who can push to matching branches (maintainers only)

**For `refactor/*` branches:**
- ✅ Require status checks to pass before merging
- ✅ Allow force pushes (for rebasing during development)

---

## Updated package.json Scripts

```json
{
  "scripts": {
    "build:stdio": "tsc cli/stdio-server.ts --outDir dist --module esnext --target es2020 --moduleResolution node --esModuleInterop true",
    "build:http": "npx @smithery/cli build",
    "copy-resources": "mkdir -p dist/resources && cp -r src/resources/* dist/resources/",
    "build": "npm run build:stdio && npm run build:http && npm run copy-resources",
    "dev": "npx @smithery/cli dev",
    
    "typecheck": "tsc --noEmit",
    "lint": "npx @biomejs/biome check --write",
    "check": "npx @biomejs/biome check --write --unsafe",
    "format": "npx @biomejs/biome format --write",
    
    "test": "vitest run",
    "test:watch": "vitest",
    "test:unit": "vitest run --testPathPattern=tests/unit",
    "test:integration": "vitest run --testPathPattern=tests/integration",
    "test:e2e": "vitest run --testPathPattern=tests/e2e",
    "test:coverage": "vitest run --coverage",
    "test:ci": "vitest run --coverage --reporter=verbose --reporter=junit --outputFile=test-results/junit.xml",
    
    "check:secrets": "secretlint '**/*'",
    "security:audit": "npm audit --audit-level=moderate",
    "security:snyk": "snyk test",
    "security:all": "npm run security:audit && npm run security:snyk",
    
    "ci": "npm run lint && npm run typecheck && npm run test:coverage && npm run build",
    "prepublishOnly": "npm run ci",
    "version": "npm run check && git add -A",
    "postversion": "git push && git push --tags",
    
    "prepare": "husky install"
  }
}
```

---

## Implementation Checklist

### Immediate Actions (Before Starting Refactoring)
- [ ] Install Husky and configure pre-commit hooks
- [ ] Configure Biome with enhanced rules
- [ ] Set up secrets detection
- [ ] Create GitHub Actions CI pipeline
- [ ] Configure branch protection rules on `main`
- [ ] Add coverage thresholds to vitest config

### During Refactoring
- [ ] Run `npm run ci` before each commit
- [ ] Ensure all tests pass locally before pushing
- [ ] Monitor CI pipeline results on each PR
- [ ] Address security vulnerabilities immediately
- [ ] Maintain >80% code coverage

### Post-Refactoring
- [ ] Set up SonarCloud integration
- [ ] Configure automated dependency updates (Dependabot/Renovate)
- [ ] Establish DORA metrics tracking
- [ ] Document CI/CD process in README

---

## Success Metrics (DORA Framework)

### Target Metrics for This Project
- **Deployment Frequency:** On-demand (via npm publish)
- **Lead Time for Changes:** <1 hour (commit to merge)
- **Change Failure Rate:** <15%
- **Mean Time to Recovery:** <1 hour

### Monitoring
- Track via GitHub Actions insights
- Monitor test failure rates
- Track coverage trends over time
- Review security scan results weekly

---

## Benefits of This Approach

1. **Prevents Regressions:** Automated tests catch breaking changes immediately
2. **Enforces Standards:** Linting and formatting happen automatically
3. **Shifts Security Left:** Vulnerabilities caught before merge
4. **Accelerates Reviews:** Automated checks reduce manual review burden
5. **Builds Confidence:** Comprehensive testing enables fearless refactoring
6. **Improves Quality:** Continuous feedback loop raises code quality
7. **Reduces Toil:** Automation eliminates manual, repetitive tasks

---

## Next Steps

**Ready to implement CI/CD infrastructure before starting the architecture refactoring?**

This will ensure we have quality gates in place to protect against regressions during the major refactoring work.

