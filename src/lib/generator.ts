export type PackageManager = 'npm' | 'pnpm' | 'yarn' | 'bun' | 'other'
export type RuleLanguage = 'English' | 'Bahasa Indonesia'

export interface Commands {
  install: string
  dev: string
  test: string
  lint: string
  build: string
}

export interface ProjectConfig {
  projectName: string
  description: string
  stack: string[]
  packageManager: PackageManager
  architecture: string
  testFramework: string
  commands: Commands
  priorities: string[]
  constraints: string
  language: RuleLanguage
}

export interface GeneratedFile {
  name: 'AGENTS.md' | 'CLAUDE.md' | '.cursorrules'
  description: string
  content: string
}

const commandLabels: Record<keyof Commands, string> = {
  install: 'Install',
  dev: 'Development',
  test: 'Test',
  lint: 'Lint',
  build: 'Build',
}

const cleanInline = (value: string, fallback = ''): string =>
  value.replace(/[#<>]/g, '').replace(/\s+/g, ' ').trim() || fallback

const cleanBlock = (value: string): string =>
  value
    .split('\n')
    .map((line) => line.replace(/^\s{0,3}#{1,6}\s*/, '').replace(/[<>]/g, '').trim())
    .filter(Boolean)
    .map((line) => `- ${line.replace(/^[-*]\s*/, '')}`)
    .join('\n')

export function getSuggestedCommands(
  manager: PackageManager,
  testFramework: string,
): Commands {
  if (manager === 'other') {
    const framework = testFramework.toLowerCase()
    return {
      install: '',
      dev: '',
      test: framework === 'pytest' ? 'pytest' : framework === 'go test' ? 'go test ./...' : '',
      lint: '',
      build: '',
    }
  }

  const run = manager === 'npm' ? 'npm run' : manager
  return {
    install: `${manager} install`,
    dev: `${run} dev`,
    test: `${run} test`,
    lint: `${run} lint`,
    build: `${run} build`,
  }
}

function commandsSection(commands: Commands): string {
  const rows = (Object.keys(commands) as Array<keyof Commands>)
    .filter((key) => commands[key].trim())
    .map((key) => `- ${commandLabels[key]}: \`${cleanInline(commands[key])}\``)
  return rows.length ? rows.join('\n') : '- Discover and use the commands already defined by the repository.'
}

function priorityRules(priorities: string[], bahasa: boolean): string {
  if (!priorities.length) {
    return bahasa
      ? '- Ikuti konvensi codebase yang sudah ada dan pilih perubahan paling sederhana yang benar.'
      : '- Follow the existing codebase conventions and choose the simplest correct change.'
  }
  const map: Record<string, [string, string]> = {
    security: ['Treat input as untrusted; never expose, log, or commit secrets.', 'Anggap semua input tidak tepercaya; jangan pernah mengekspos, mencatat, atau commit secret.'],
    testing: ['Write or update tests for behavior changes and run them before finishing.', 'Tulis atau perbarui test untuk perubahan perilaku dan jalankan sebelum selesai.'],
    accessibility: ['Preserve keyboard access, labels, focus states, and semantic HTML.', 'Pertahankan akses keyboard, label, focus state, dan HTML semantik.'],
    performance: ['Measure before optimizing and avoid unnecessary network or render work.', 'Ukur sebelum optimasi dan hindari network atau render yang tidak perlu.'],
    documentation: ['Update documentation when public behavior or setup changes.', 'Perbarui dokumentasi saat perilaku publik atau setup berubah.'],
    simplicity: ['Prefer small, reversible changes over speculative abstractions.', 'Utamakan perubahan kecil yang mudah dibatalkan daripada abstraksi spekulatif.'],
  }
  return priorities
    .map((priority) => `- ${(map[priority] ?? [priority, priority])[bahasa ? 1 : 0]}`)
    .join('\n')
}

function sharedDocument(config: ProjectConfig): string {
  const bahasa = config.language === 'Bahasa Indonesia'
  const name = cleanInline(config.projectName, 'This project')
  const description = cleanInline(
    config.description,
    bahasa ? 'Ikuti konvensi codebase yang sudah ada.' : 'Follow the existing codebase conventions.',
  )
  const stack = config.stack.length ? config.stack.map((item) => cleanInline(item)).filter(Boolean).join(', ') : 'Discover from the repository'
  const architecture = cleanInline(config.architecture, 'existing repository architecture')
  const constraints = cleanBlock(config.constraints)

  if (bahasa) {
    return `# Panduan agent untuk ${name}

## Konteks project

${description}

- Stack: ${stack}
- Arsitektur: ${architecture}
- Package manager: ${config.packageManager}
- Test framework: ${cleanInline(config.testFramework, 'deteksi dari repository')}

## Cara kerja

1. Baca kode dan dokumentasi terkait sebelum mengubah apa pun.
2. Buat perubahan terkecil yang menyelesaikan kebutuhan.
3. Jangan mengubah API publik, schema data, atau dependency tanpa alasan yang jelas.
4. Jalankan quality gate yang relevan sebelum menyatakan selesai.
5. Laporkan file yang berubah, hasil test nyata, dan risiko yang tersisa.

## Perintah

${commandsSection(config.commands)}

## Prioritas engineering

${priorityRules(config.priorities, true)}

## Batasan khusus

${constraints || '- Jangan mengubah file generated, secret, atau konfigurasi production tanpa instruksi eksplisit.'}

## Definition of done

- Implementasi memenuhi kebutuhan tanpa perubahan scope tersembunyi.
- Test untuk perilaku yang berubah tersedia dan lulus.
- Lint, typecheck, dan build yang relevan lulus.
- Tidak ada secret, debug output, atau file sementara di diff.
- Dokumentasi diperbarui jika setup atau perilaku pengguna berubah.
`
  }

  return `# Agent guide for ${name}

## Project context

${description}

- Stack: ${stack}
- Architecture: ${architecture}
- Package manager: ${config.packageManager}
- Test framework: ${cleanInline(config.testFramework, 'discover from the repository')}

## Working agreement

1. Read the relevant code and documentation before changing anything.
2. Make the smallest change that fully solves the requirement.
3. Do not alter public APIs, data schemas, or dependencies without a clear reason.
4. Run the relevant quality gates before claiming completion.
5. Report changed files, real test output, and remaining risks.

## Commands

${commandsSection(config.commands)}

## Engineering priorities

${priorityRules(config.priorities, false)}

## Project-specific constraints

${constraints || '- Do not modify generated files, secrets, or production configuration without explicit direction.'}

## Definition of done

- The implementation meets the requirement without hidden scope changes.
- Tests cover changed behavior and pass.
- Relevant lint, typecheck, and build checks pass.
- No secrets, debug output, or temporary artifacts appear in the diff.
- Documentation is updated when setup or user-facing behavior changes.
`
}

export function generateRules(config: ProjectConfig): GeneratedFile[] {
  const shared = sharedDocument(config)
  const bahasa = config.language === 'Bahasa Indonesia'
  const claude = `${shared}\n## Claude Code workflow\n\n- ${bahasa ? 'Gunakan plan mode untuk perubahan lintas file atau keputusan arsitektur.' : 'Use plan mode for multi-file changes or architectural decisions.'}\n- ${bahasa ? 'Gunakan tools untuk memverifikasi klaim; jangan mengarang output command.' : 'Use tools to verify claims; never invent command output.'}\n- ${bahasa ? 'Minta approval sebelum tindakan destruktif atau perubahan production.' : 'Ask for approval before destructive actions or production changes.'}\n`
  const cursor = `${shared}\n## Cursor workflow\n\n- ${bahasa ? 'Jaga edit tetap fokus pada file yang relevan.' : 'Keep edits focused on relevant files.'}\n- ${bahasa ? 'Jangan membuat file baru jika perubahan kecil pada file yang ada sudah cukup.' : 'Do not create new files when a small edit to an existing file is sufficient.'}\n- ${bahasa ? 'Periksa diagnostic editor dan jalankan command verifikasi sebelum selesai.' : 'Check editor diagnostics and run verification commands before finishing.'}\n`

  return [
    { name: 'AGENTS.md', description: 'Shared instructions for Codex and compatible agents.', content: shared },
    { name: 'CLAUDE.md', description: 'Shared guide plus Claude Code workflow rules.', content: claude },
    { name: '.cursorrules', description: 'Shared guide plus Cursor-specific editing rules.', content: cursor },
  ]
}
