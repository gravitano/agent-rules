import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('Agent Rules builder', () => {
  it('explains the product and privacy promise', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: /better instructions/i })).toBeInTheDocument()
    expect(screen.getByText(/stays in your browser/i)).toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: /github/i })[0]).toHaveAttribute('href', expect.stringContaining('github.com'))
  })

  it('generates files from a project preset and allows copying output', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: /saas starter/i }))
    expect(screen.getByLabelText(/project name/i)).toHaveValue('SaaS product')

    await user.clear(screen.getByLabelText(/project name/i))
    await user.type(screen.getByLabelText(/project name/i), 'Atlas')
    await user.click(screen.getByRole('button', { name: /generate files/i }))

    expect(screen.getByRole('tab', { name: 'AGENTS.md' })).toBeInTheDocument()
    expect(screen.getByText(/Agent guide for Atlas/)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /copy agents\.md/i }))
    await waitFor(async () => expect(await navigator.clipboard.readText()).toContain('Atlas'))
    expect(screen.getByRole('status')).toHaveTextContent(/copied/i)
  })

  it('switches generated language and keeps output accessible on mobile', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.selectOptions(screen.getByLabelText(/output language/i), 'Bahasa Indonesia')
    await user.click(screen.getByRole('button', { name: /generate files/i }))

    expect(screen.getByText(/Panduan agent untuk/)).toBeInTheDocument()
    expect(screen.getByRole('region', { name: /generated files/i })).toBeInTheDocument()
  })
})
