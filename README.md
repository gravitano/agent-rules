# Agent Rules

Build better rule files for AI coding agents in minutes.

**Agent Rules** is a private, browser-only generator for:

- `AGENTS.md` — shared instructions for Codex and compatible agents
- `CLAUDE.md` — shared rules plus Claude Code workflow guidance
- `.cursorrules` — shared rules plus Cursor-focused editing guidance

## Why

AI coding agents perform better when they know the project context, real commands, architecture, engineering priorities, constraints, and definition of done. Most teams either skip these files or copy generic boilerplate. Agent Rules turns a small set of project facts into focused, auditable instructions.

## Privacy

Everything runs locally in the browser. There is no login, backend, analytics, or data collection in the initial release.

## Development

```bash
npm install
npm run dev
```

Quality gate:

```bash
npm run check
```

## Deployment

Pushes to `main` run tests, lint, typecheck, and production build before deploying to GitHub Pages.

## License

MIT — built by [Warsono](https://warsono.dev).
