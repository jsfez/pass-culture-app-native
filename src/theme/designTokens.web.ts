/* eslint-disable no-restricted-imports */
// it the only file we need to import theme from design system
import { theme as themeDark } from '@pass-culture/design-system/lib/jeune/dark.web_typo_rem'
import { theme as themeLight } from '@pass-culture/design-system/lib/jeune/light.web_typo_rem'

import { DesignTokensType } from 'theme/types'

// Simulates the next design-system release tightening the radius scale:
// size.borderRadius.m 8 -> 2. One token, consumed 103 times across the app.
const withTighterRadius = <T extends DesignTokensType>(tokens: T): T => ({
  ...tokens,
  size: {
    ...tokens.size,
    borderRadius: { ...tokens.size.borderRadius, m: 2 },
  },
})

export const designTokensLight: DesignTokensType = withTighterRadius(themeLight)
export const designTokensDark: DesignTokensType = withTighterRadius(themeDark)
