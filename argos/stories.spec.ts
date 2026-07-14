import { readFileSync } from 'node:fs'
import path from 'node:path'
import { argosScreenshot } from '@argos-ci/playwright'
import { test } from '@playwright/test'

type StoryIndex = {
  entries: Record<string, { id: string; title: string; name: string; type: string }>
}

const indexPath = path.join(__dirname, '../storybook-static/index.json')
const index: StoryIndex = JSON.parse(readFileSync(indexPath, 'utf-8'))

const only = process.env.ARGOS_ONLY?.split(',').map((s) => s.trim())

const stories = Object.values(index.entries).filter(
  (entry) => entry.type === 'story' && (!only || only.includes(entry.id))
)

for (const story of stories) {
  test(`${story.title} › ${story.name}`, async ({ page }) => {
    await page.goto(`/iframe.html?id=${story.id}&viewMode=story`)
    // Wait for Storybook's own render cycle: some stories render in a portal
    // and leave #storybook-root empty, so don't wait on the root itself.
    await page.waitForFunction(() => {
      const phase = (
        window as unknown as {
          __STORYBOOK_PREVIEW__?: { currentRender?: { phase?: string } }
        }
      ).__STORYBOOK_PREVIEW__?.currentRender?.phase
      return phase === 'completed' || phase === 'finished'
    })
    // Reuse the repo's own `chromatic` story parameters, so Argos snapshots
    // exactly what Chromatic snapshots — no second set of knobs to maintain.
    const chromatic = await page.evaluate(
      () =>
        (
          window as unknown as {
            __STORYBOOK_PREVIEW__?: {
              currentRender?: {
                story?: {
                  parameters?: {
                    chromatic?: { disableSnapshot?: boolean; delay?: number }
                  }
                }
              }
            }
          }
        ).__STORYBOOK_PREVIEW__?.currentRender?.story?.parameters?.chromatic ?? {}
    )
    test.skip(chromatic.disableSnapshot === true, 'story opts out of snapshots (chromatic parameter)')
    // `delay` is how the repo already declares "this story animates, wait for it"
    // (e.g. ProgressBar transitions its width over 800ms from JS, which neither
    // `reducedMotion` nor CSS-animation freezing can pin down).
    if (chromatic.delay) {
      await page.waitForTimeout(chromatic.delay)
    }
    // Carousels/scrolling lists may settle on a non-deterministic offset:
    // pin every scroll position before capturing.
    await page.evaluate(() => {
      for (const el of Array.from(document.querySelectorAll('*'))) {
        if (el.scrollLeft !== 0) el.scrollLeft = 0
        if (el.scrollTop !== 0) el.scrollTop = 0
      }
    })
    // Spinners and skeletons legitimately keep aria-busy forever.
    const isLoadingState = /load(ing|er)|skeleton|spinner|progress/i.test(
      `${story.title} ${story.name}`
    )
    await argosScreenshot(page, story.id, {
      stabilize: isLoadingState ? { waitForAriaBusy: false } : true,
    })
  })
}
