import { chromium } from 'playwright'
import { mkdir } from 'node:fs/promises'

const baseURL = process.env.BASE_URL ?? 'http://127.0.0.1:4173/agent-rules/'
const artifacts = new URL('../artifacts/', import.meta.url)
await mkdir(artifacts, { recursive: true })

const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.CHROME_PATH,
})
try {
  const desktop = await browser.newContext({ viewport: { width: 1440, height: 1000 }, permissions: ['clipboard-read', 'clipboard-write'] })
  const page = await desktop.newPage()
  await page.goto(baseURL, { waitUntil: 'networkidle' })
  await page.getByRole('heading', { name: /better instructions/i }).waitFor()
  await page.getByRole('button', { name: /saas starter/i }).click()
  await page.getByLabel(/project name/i).fill('Atlas')
  await page.getByRole('button', { name: /generate files/i }).click()
  await page.getByText(/agent guide for atlas/i).waitFor()
  await page.getByRole('button', { name: /copy agents\.md/i }).click()
  await page.getByRole('status').getByText(/copied/i).waitFor()
  const downloadPromise = page.waitForEvent('download')
  await page.getByRole('button', { name: /^download$/i }).click()
  const download = await downloadPromise
  if (download.suggestedFilename() !== 'AGENTS.md') throw new Error(`Unexpected download: ${download.suggestedFilename()}`)
  await page.screenshot({ path: new URL('desktop.png', artifacts).pathname, fullPage: true })
  const desktopOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)
  if (desktopOverflow) throw new Error('Desktop page has horizontal overflow')
  await desktop.close()

  const mobile = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 })
  const mobilePage = await mobile.newPage()
  await mobilePage.goto(baseURL, { waitUntil: 'networkidle' })
  await mobilePage.getByRole('heading', { name: /better instructions/i }).waitFor()
  await mobilePage.screenshot({ path: new URL('mobile.png', artifacts).pathname, fullPage: true })
  const mobileOverflow = await mobilePage.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)
  if (mobileOverflow) throw new Error('Mobile page has horizontal overflow')
  await mobile.close()

  console.log(JSON.stringify({ ok: true, baseURL, checks: ['hero', 'preset', 'generate', 'copy', 'download', 'desktop-overflow', 'mobile-overflow'], screenshots: ['artifacts/desktop.png', 'artifacts/mobile.png'] }))
} finally {
  await browser.close()
}
