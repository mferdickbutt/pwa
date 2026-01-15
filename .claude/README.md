# Claude Code Configuration - TimeHut PWA

This directory contains Claude Code configuration for the TimeHut Baby Memory Book PWA project.

## Directory Structure

```
.claude/
├── agents/                      # Specialized AI assistants
│   └── pwa-code-reviewer.md    # Code review agent for React/TypeScript/Firebase
├── commands/                    # Slash commands
│   ├── dev.md                 # Start all dev services
│   ├── test.md                # Run tests
│   ├── build.md               # Build for production
│   ├── lint.md                # Run ESLint
│   ├── type-check.md          # TypeScript compiler check
│   └── media-cache-clear.md   # Clear media cache
├── hooks/                       # Hook scripts (not yet implemented)
├── rules/                       # Modular instructions (not yet used)
├── skills/                      # Domain knowledge documents
│   ├── react-typescript/      # React/TypeScript patterns
│   ├── testing/               # Vitest + React Testing Library
│   ├── pwa-specific/          # Age calc, media upload, Firebase auth
│   ├── i18n/                  # react-i18next patterns
│   ├── firebase/              # Firebase integration patterns
│   ├── component-patterns/    # Reusable components
│   └── debugging/             # Debugging methodologies
├── settings.json               # Hooks, environment, permissions
└── settings.local.json          # Personal overrides (gitignored)
```

## Quick Start

### Use React/TypeScript Skills

When working with React components or TypeScript code, the `react-typescript` skill automatically loads and provides:
- Component structure patterns (lazy loading, code splitting)
- Zustand store patterns
- Firebase integration patterns
- Protected/Public route patterns
- Framer Motion animation patterns
- i18n integration patterns
- Type safety patterns
- Performance patterns

### Run Code Review

After making changes to any code, use the code reviewer:
```
Please review my changes using the pwa-code-reviewer agent.
```

### Use Slash Commands

Start all development services:
```
/dev
```

Run tests:
```
/test
```

Build for production:
```
/build
```

Run ESLint:
```
/lint
```

Type-check with TypeScript:
```
/type-check
```

Clear media cache:
```
/media-cache-clear
```

### Debug Issues

Use the debugging skill when troubleshooting:
```
I'm getting an error when uploading media. Use debugging skill.
```

## Configuration Files

### CLAUDE.md
Project memory that loads automatically at session start. Contains:
- Stack overview (React, TypeScript, Vite, Firebase, Zustand)
- Architecture (monorepo with packages/frontend and packages/media-api)
- Key commands (dev, build, test, lint)
- Firebase configuration
- Age calculation rules
- WHO growth data structure
- Media upload flow
- i18n patterns
- Component patterns

### settings.json
Hooks for automation:
- **PreToolUse**: Block edits on main branch
- **PostToolUse**:
  - Auto-format with Prettier
  - Auto-lint with ESLint
  - Type-check core files (Page, Store, Auth, Media, Capsule, Baby)
- **UserPromptSubmit**: Continue prompts (placeholder for skill evaluation)

### .mcp.json
MCP server configuration for external tools:
- zread (file reading)
- web-search-prime (search)
- web-reader (web scraping)
- zai-mcp-server (utilities)

## Skills Available

### react-typescript
React and TypeScript best practices for this project.
- **When to use**: Creating components, hooks, stores, or writing TypeScript code
- **Key patterns**: Component structure, Zustand stores, Firebase integration, lazy loading

### testing
Testing patterns and best practices.
- **When to use**: Writing or running tests
- **Key patterns**: Vitest + React Testing Library, Firebase emulator testing, mocking

### pwa-specific
Domain-specific patterns for the TimeHut app.
- **When to use**: Age calculation, media upload, Firebase auth, time capsules
- **Key patterns**: Age formatting (<24mo vs >=24mo), media upload flow, presigned URLs

### i18n
Internationalization patterns with react-i18next.
- **When to use**: Adding translations or handling localization
- **Key patterns**: Translation file structure, date/time localization, number formatting

### firebase
Firebase integration patterns.
- **When to use**: Auth, Firestore, or Firebase-related code
- **Key patterns**: Auth patterns, Firestore CRUD, security rules, emulator usage

### component-patterns
Reusable component patterns.
- **When to use**: Creating new page components or layout components
- **Key patterns**: Page structure, layout components, timeline patterns, form components

### debugging
Four-phase debugging methodology.
- **When to use**: Debugging any code issue
- **Key patterns**: Understand → Isolate → Hypothesize → Test

## Agents Available

### pwa-code-reviewer
Reviews code for quality, security, and best practices.
- **When to use**: After writing/modifying any code
- **Checks**: React best practices, TypeScript compliance, Firebase security, Tailwind patterns, Zustand patterns, i18n completeness, media security, performance

## Commands Available

### /dev
Start all development services (frontend + API + Firebase emulators).

### /test
Run all tests using Vitest.

### /build
Build frontend and API for production.

### /lint
Run ESLint on the codebase.

### /type-check
Run TypeScript compiler check (tsc).

### /media-cache-clear
Clear the media URL cache in the frontend.

## Best Practices

1. **Always include CLAUDE.md context** - It provides project memory
2. **Use skills for domain knowledge** - They teach Claude project patterns
3. **Run code review before committing** - Ensures quality
4. **Use slash commands for common tasks** - Faster workflows
5. **Test after changes** - The hooks will automatically format, lint, and type-check
6. **Follow the monorepo structure** - packages/frontend and packages/media-api

## GitHub Actions

### pwa-ci.yml
Automated CI/CD workflow:
- Install dependencies
- Type-check (tsc)
- Lint (ESLint)
- Run tests (when available)
- Build (Vite)
- Deploy to Vercel/Cloudflare

## Monorepo Structure

```
packages/
├── frontend/               # React + TypeScript + Vite frontend
├── media-api/             # Media upload API (Node.js/Cloudflare Worker)
└── shared/                # Shared types and utilities
```

## Adding New Skills

1. Create directory: `.claude/skills/skill-name/`
2. Create `SKILL.md` with frontmatter:
   ```markdown
   ---
   name: skill-name
   description: What this skill does and when to use it.
   ---
   ```
3. Document patterns and best practices

## Adding New Agents

1. Create file: `.claude/agents/agent-name.md`
2. Add frontmatter with name, description, and model
3. Define the agent's process and checklist

## Adding New Commands

1. Create file: `.claude/commands/command-name.md`
2. Add frontmatter with description and allowed-tools
3. Define steps and expected output

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Framer Motion
- **State**: Zustand
- **Backend**: Firebase (Auth, Firestore)
- **Storage**: Cloudflare R2 (prod) / MinIO (local)
- **Media API**: Cloudflare Worker (prod) / Node.js (local)
- **i18n**: react-i18next
- **Routing**: react-router-dom
- **Testing**: Vitest + React Testing Library

## Key Features

- Timeline feed with baby age calculation
- Calendar view
- Growth tracker (WHO percentiles)
- Time capsules
- Baby profile management
- Email link authentication (passwordless)
- Media upload with presigned URLs
- Caching layer for media URLs

## Resources

- [Claude Code Documentation](https://docs.anthropic.com/en/docs/claude-code)
- [Chris Wiles' Claude Code Showcase](https://github.com/ChrisWiles/claude-code-showcase)
- Project CLAUDE.md at project root
- PWA Improvement Plan: `PWA_CLAUDE_IMPROVEMENT_PLAN.md`
