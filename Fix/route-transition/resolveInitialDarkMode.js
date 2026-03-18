import {
  DARK_APPEARANCE_MODE,
  getRootAppearanceMode
} from '@/Fix/appearance-sync/rootAppearance'

export default function resolveInitialDarkMode(defaultDarkMode) {
  const fallbackMode =
    defaultDarkMode === DARK_APPEARANCE_MODE || defaultDarkMode === 'true'
      ? DARK_APPEARANCE_MODE
      : null

  if (typeof document === 'undefined') {
    return fallbackMode === DARK_APPEARANCE_MODE
  }

  const rootMode = getRootAppearanceMode(document.documentElement, fallbackMode)
  return rootMode === DARK_APPEARANCE_MODE
}
