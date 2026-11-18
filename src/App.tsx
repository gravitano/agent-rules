import { useMemo, useRef, useState } from 'react'
import './App.css'
import {
  generateRules,
  getSuggestedCommands,
  type GeneratedFile,
  type PackageManager,
  type ProjectConfig,
  type RuleLanguage,
} from './lib/generator'

const stackOptions = ['TypeScript', 'JavaScript', 'React', 'Vue / Nuxt', 'Node.js', 'Python', 'PHP / Laravel', 'Go', 'PostgreSQL', 'MySQL']
const priorityOptions = [
  ['security', 'Security'],
  ['testing', 'Testing'],
  ['accessibility', 'Accessibility'],
  ['performance', 'Performance'],
  ['documentation', 'Documentation'],
  ['simplicity', 'Simplicity'],
] as const

const presets: Array<{ name: string; eyebrow: string; config: Partial<ProjectConfig> }> = [
  {
    name: 'SaaS starter', eyebrow: 'Full-stack',
    config: {
      projectName: 'SaaS product', description: 'A multi-tenant SaaS application for growing teams.',
      stack: ['TypeScript', 'React', 'Node.js', 'PostgreSQL'], packageManager: 'pnpm',
      architecture: 'Modular monolith', testFramework: 'vitest', priorities: ['security', 'testing', 'accessibility', 'simplicity'],
    },
  },
  {
    name: 'API service', eyebrow: 'Backend',
    config: {
      projectName: 'API service', description: 'A secure HTTP API with database-backed business workflows.',
      stack: ['Python', 'PostgreSQL'], packageManager: 'other', architecture: 'Layered service',
      testFramework: 'pytest', priorities: ['security', 'testing', 'performance', 'documentation'],
    },
  },
  {
    name: 'Content site', eyebrow: 'Frontend',
    config: {
      projectName: 'Content site', description: 'A fast, accessible content website optimized for search.',
      stack: ['TypeScript', 'Vue / Nuxt'], packageManager: 'pnpm', architecture: 'Component-driven frontend',
      testFramework: 'vitest', priorities: ['accessibility', 'performance', 'documentation', 'simplicity'],
    },
  },
]

const initialConfig: ProjectConfig = {
  projectName: 'My project',
  description: 'A production application built with a small, focused team.',
  stack: ['TypeScript', 'React'],
  packageManager: 'pnpm',
  architecture: 'Modular monolith',
  testFramework: 'vitest',
  commands: getSuggestedCommands('pnpm', 'vitest'),
  priorities: ['testing', 'security', 'simplicity'],
  constraints: '',
  language: 'English',
}

function SparkIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 2 1.7 5.2L19 9l-5.3 1.8L12 16l-1.8-5.2L5 9l5.2-1.8L12 2Z"/><path d="m19 15 .8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15Z"/></svg>
}

function ShieldIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 5 6v5c0 4.8 2.8 8.3 7 10 4.2-1.7 7-5.2 7-10V6l-7-3Z"/><path d="m9 12 2 2 4-5"/></svg>
}

function App() {
  const [config, setConfig] = useState(initialConfig)
  const [files, setFiles] = useState<GeneratedFile[]>(() => generateRules(initialConfig))
  const [activeFile, setActiveFile] = useState<GeneratedFile['name']>('AGENTS.md')
  const [status, setStatus] = useState('')
  const outputRef = useRef<HTMLElement>(null)
  const active = useMemo(() => files.find((file) => file.name === activeFile) ?? files[0], [files, activeFile])

  const update = <K extends keyof ProjectConfig>(key: K, value: ProjectConfig[K]) =>
    setConfig((current) => ({ ...current, [key]: value }))

  const applyPreset = (preset: (typeof presets)[number]) => {
    setConfig((current) => {
      const manager = (preset.config.packageManager ?? current.packageManager) as PackageManager
      const framework = preset.config.testFramework ?? current.testFramework
      return { ...current, ...preset.config, commands: getSuggestedCommands(manager, framework) }
    })
    setStatus(`${preset.name} preset applied.`)
  }

  const generate = () => {
    const next = generateRules(config)
    setFiles(next)
    setActiveFile('AGENTS.md')
    setStatus('Three rule files generated locally.')
    window.setTimeout(() => outputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0)
  }

  const toggleStack = (stack: string) => {
    update('stack', config.stack.includes(stack) ? config.stack.filter((item) => item !== stack) : [...config.stack, stack])
  }

  const togglePriority = (priority: string) => {
    update('priorities', config.priorities.includes(priority)
      ? config.priorities.filter((item) => item !== priority)
      : [...config.priorities, priority])
  }

  const copy = async () => {
    await navigator.clipboard.writeText(active.content)
    setStatus(`${active.name} copied to clipboard.`)
  }

  const download = (file: GeneratedFile = active) => {
    const blob = new Blob([file.content], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = file.name
    anchor.click()
    URL.revokeObjectURL(url)
    setStatus(`${file.name} downloaded.`)
  }

  return (
    <div className="app-shell">
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Agent Rules home">
          <span className="brand-mark"><SparkIcon /></span>
          <span>Agent Rules</span>
          <span className="beta">Beta</span>
        </a>
        <nav aria-label="Primary navigation">
          <a href="#builder">Builder</a>
          <a href="#how">How it works</a>
          <a href="https://github.com/gravitano/agent-rules" target="_blank" rel="noreferrer">GitHub ↗</a>
        </nav>
      </header>

      <main id="top">
        <section className="hero-section" aria-labelledby="hero-title">
          <div className="hero-copy">
            <div className="eyebrow"><span className="eyebrow-dot" /> Free, private, open source</div>
            <h1 id="hero-title">Better instructions.<br /><span>Better AI code.</span></h1>
            <p className="hero-lead">Generate production-ready <code>AGENTS.md</code>, <code>CLAUDE.md</code>, and <code>.cursorrules</code> for your project—without writing boilerplate from scratch.</p>
            <div className="hero-actions">
              <a className="button button-primary" href="#builder"><SparkIcon /> Build my rules</a>
              <a className="button button-secondary" href="#example">See example</a>
            </div>
            <div className="trust-row">
              <span><ShieldIcon /> Your data stays in your browser</span>
              <span>No login</span><span>No analytics</span>
            </div>
          </div>
          <div className="hero-visual" aria-label="Example generated rule file">
            <div className="window-chrome"><i /><i /><i /><span>AGENTS.md</span></div>
            <pre><code><b># Agent guide for your project</b>{'\n\n'}<em>## Working agreement</em>{'\n\n'}1. Read relevant code first.{`\n`}2. Make the smallest correct change.{`\n`}3. Run quality gates before done.{`\n\n`}<em>## Definition of done</em>{`\n\n`}✓ Tests cover changed behavior{`\n`}✓ Lint, typecheck, build pass{`\n`}✓ No secrets or debug output</code></pre>
            <div className="floating-chip chip-one">Claude Code ready</div>
            <div className="floating-chip chip-two">Codex compatible</div>
          </div>
        </section>

        <section className="proof-strip" aria-label="Supported AI coding tools">
          <span>One setup for</span><b>Claude Code</b><b>OpenAI Codex</b><b>Cursor</b><b>GitHub Copilot</b><b>Windsurf</b>
        </section>

        <section className="builder-section" id="builder" aria-labelledby="builder-title">
          <div className="section-heading">
            <span>Rule builder</span>
            <h2 id="builder-title">Describe your project. Get focused agents.</h2>
            <p>Start with a preset, then tune the details that actually matter.</p>
          </div>

          <div className="preset-grid" aria-label="Project presets">
            {presets.map((preset) => (
              <button className="preset-card" key={preset.name} type="button" onClick={() => applyPreset(preset)}>
                <small>{preset.eyebrow}</small><strong>{preset.name}</strong><span>Use preset →</span>
              </button>
            ))}
          </div>

          <div className="builder-grid">
            <form className="config-panel" onSubmit={(event) => { event.preventDefault(); generate() }}>
              <div className="panel-heading"><span>01</span><div><h3>Project context</h3><p>Help agents understand what they are touching.</p></div></div>
              <div className="field-grid two-columns">
                <label>Project name<input value={config.projectName} onChange={(e) => update('projectName', e.target.value)} maxLength={80} required /></label>
                <label>Output language<select value={config.language} onChange={(e) => update('language', e.target.value as RuleLanguage)}><option>English</option><option>Bahasa Indonesia</option></select></label>
              </div>
              <label>Project summary<textarea value={config.description} onChange={(e) => update('description', e.target.value)} maxLength={280} rows={3} placeholder="What does this project do, and for whom?" /></label>

              <fieldset><legend>Technology stack</legend><p className="field-hint">Choose all that apply.</p><div className="chip-grid">{stackOptions.map((stack) => <label className={`choice-chip ${config.stack.includes(stack) ? 'selected' : ''}`} key={stack}><input type="checkbox" checked={config.stack.includes(stack)} onChange={() => toggleStack(stack)} /><span>{stack}</span></label>)}</div></fieldset>

              <div className="field-grid three-columns">
                <label>Package manager<select value={config.packageManager} onChange={(e) => { const manager = e.target.value as PackageManager; setConfig((current) => ({ ...current, packageManager: manager, commands: getSuggestedCommands(manager, current.testFramework) })) }}><option>pnpm</option><option>npm</option><option>yarn</option><option>bun</option><option>other</option></select></label>
                <label>Architecture<input value={config.architecture} onChange={(e) => update('architecture', e.target.value)} placeholder="e.g. Modular monolith" /></label>
                <label>Test framework<input value={config.testFramework} onChange={(e) => update('testFramework', e.target.value)} placeholder="e.g. vitest" /></label>
              </div>

              <fieldset><legend>Engineering priorities</legend><p className="field-hint">These become concrete, enforceable rules.</p><div className="chip-grid priorities">{priorityOptions.map(([value, label]) => <label className={`choice-chip ${config.priorities.includes(value) ? 'selected' : ''}`} key={value}><input type="checkbox" checked={config.priorities.includes(value)} onChange={() => togglePriority(value)} /><span>{label}</span></label>)}</div></fieldset>

              <details><summary>Customize project commands <span>Optional</span></summary><div className="field-grid command-grid">{(Object.keys(config.commands) as Array<keyof typeof config.commands>).map((key) => <label key={key}>{key[0].toUpperCase() + key.slice(1)}<input value={config.commands[key]} onChange={(e) => update('commands', { ...config.commands, [key]: e.target.value })} placeholder={`${key} command`} /></label>)}</div></details>
              <label>Project-specific constraints<textarea value={config.constraints} onChange={(e) => update('constraints', e.target.value)} rows={3} placeholder={'One rule per line, e.g.\nNever edit generated API clients.\nMigrations must be reversible.'} /></label>

              <button className="button button-primary generate-button" type="submit"><SparkIcon /> Generate files</button>
              <p className="local-note"><ShieldIcon /> Generated locally. Nothing is uploaded or stored.</p>
            </form>

            <aside className="preview-panel" id="example"><div className="panel-heading compact"><span>02</span><div><h3>What you get</h3><p>Three files, tuned for each agent.</p></div></div>
              {files.map((file) => <button key={file.name} type="button" className="file-summary" onClick={() => { setActiveFile(file.name); outputRef.current?.scrollIntoView({ behavior: 'smooth' }) }}><span className="file-icon">{file.name[0]}</span><span><strong>{file.name}</strong><small>{file.description}</small></span><b>→</b></button>)}
              <div className="quality-card"><strong>Built-in guardrails</strong><ul><li>Test-first behavior changes</li><li>Secret and destructive-action safety</li><li>Focused diffs and real verification</li><li>Accessible, reversible defaults</li></ul></div>
            </aside>
          </div>
        </section>

        <section className="output-section" ref={outputRef} aria-label="Generated files">
          <div className="output-heading"><div><span>Your files</span><h2>Ready to drop into your repo.</h2></div><div className="output-actions"><button className="button button-secondary" type="button" onClick={copy} aria-label={`Copy ${active.name}`}>Copy {active.name}</button><button className="button button-primary" type="button" onClick={() => download()}>Download</button></div></div>
          <div className="file-tabs" role="tablist" aria-label="Generated rule files">{files.map((file) => <button key={file.name} role="tab" aria-selected={activeFile === file.name} onClick={() => setActiveFile(file.name)}>{file.name}</button>)}</div>
          <pre className="output-code" tabIndex={0}><code>{active.content}</code></pre>
          <p className="status" role="status" aria-live="polite">{status}</p>
        </section>

        <section className="how-section" id="how"><div className="section-heading"><span>Why it works</span><h2>Context beats clever prompting.</h2></div><div className="how-grid"><article><b>01</b><h3>Specific context</h3><p>Agents get your stack, architecture, commands, and constraints before touching code.</p></article><article><b>02</b><h3>Concrete guardrails</h3><p>Vague advice becomes observable behaviors: test, verify, protect secrets, report evidence.</p></article><article><b>03</b><h3>Tool-aware files</h3><p>A shared foundation with focused additions for Claude Code, Codex, and Cursor.</p></article></div></section>
      </main>

      <footer><div className="brand"><span className="brand-mark"><SparkIcon /></span><span>Agent Rules</span></div><p>Built by <a href="https://warsono.dev" target="_blank" rel="noreferrer">Warsono</a> for developers building with AI.</p><a href="https://github.com/gravitano/agent-rules" target="_blank" rel="noreferrer">Source on GitHub ↗</a></footer>
    </div>
  )
}

export default App
