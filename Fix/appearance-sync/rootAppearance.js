export const DARK_APPEARANCE_MODE = 'dark'
export const LIGHT_APPEARANCE_MODE = 'light'
export const APPEARANCE_MODE_ATTRIBUTE = 'data-appearance-mode'

const APPEARANCE_PALETTES = {
  [DARK_APPEARANCE_MODE]: {
    backgroundColor: '#000000',
    textColor: '#ffffff'
  },
  [LIGHT_APPEARANCE_MODE]: {
    backgroundColor: '#ffffff',
    textColor: '#111111'
  }
}

export function normalizeAppearanceMode(mode, fallbackMode = LIGHT_APPEARANCE_MODE) {
  if (mode === DARK_APPEARANCE_MODE || mode === LIGHT_APPEARANCE_MODE) {
    return mode
  }

  return fallbackMode
}

export function getAppearancePalette(mode) {
  return APPEARANCE_PALETTES[
    normalizeAppearanceMode(mode, LIGHT_APPEARANCE_MODE)
  ]
}

export function getRootAppearanceMode(root = null, fallbackMode = null) {
  const targetRoot =
    root || (typeof document !== 'undefined' ? document.documentElement : null)

  if (!targetRoot) {
    return fallbackMode
  }

  const attributeMode = targetRoot.getAttribute(APPEARANCE_MODE_ATTRIBUTE)
  if (
    attributeMode === DARK_APPEARANCE_MODE ||
    attributeMode === LIGHT_APPEARANCE_MODE
  ) {
    return attributeMode
  }

  const hasDarkClass = targetRoot.classList?.contains(DARK_APPEARANCE_MODE)
  const hasLightClass = targetRoot.classList?.contains(LIGHT_APPEARANCE_MODE)

  if (hasDarkClass && !hasLightClass) {
    return DARK_APPEARANCE_MODE
  }

  if (hasLightClass && !hasDarkClass) {
    return LIGHT_APPEARANCE_MODE
  }

  const colorScheme = targetRoot.style?.colorScheme
  if (
    colorScheme === DARK_APPEARANCE_MODE ||
    colorScheme === LIGHT_APPEARANCE_MODE
  ) {
    return colorScheme
  }

  return fallbackMode
}

export function applyAppearanceMode(mode, { root = null } = {}) {
  const targetRoot =
    root || (typeof document !== 'undefined' ? document.documentElement : null)
  const fallbackMode =
    getRootAppearanceMode(targetRoot, LIGHT_APPEARANCE_MODE) ||
    LIGHT_APPEARANCE_MODE
  const nextMode = normalizeAppearanceMode(mode, fallbackMode)

  if (!targetRoot) {
    return nextMode
  }

  const { backgroundColor, textColor } = getAppearancePalette(nextMode)
  const oppositeMode =
    nextMode === DARK_APPEARANCE_MODE
      ? LIGHT_APPEARANCE_MODE
      : DARK_APPEARANCE_MODE

  if (
    targetRoot.classList?.contains(oppositeMode) ||
    !targetRoot.classList?.contains(nextMode)
  ) {
    targetRoot.classList?.remove(
      DARK_APPEARANCE_MODE,
      LIGHT_APPEARANCE_MODE
    )
    targetRoot.classList?.add(nextMode)
  }

  if (targetRoot.getAttribute(APPEARANCE_MODE_ATTRIBUTE) !== nextMode) {
    targetRoot.setAttribute(APPEARANCE_MODE_ATTRIBUTE, nextMode)
  }

  if (targetRoot.style.backgroundColor !== backgroundColor) {
    targetRoot.style.backgroundColor = backgroundColor
  }

  if (targetRoot.style.colorScheme !== nextMode) {
    targetRoot.style.colorScheme = nextMode
  }

  if (targetRoot.style.getPropertyValue('--fix-route-bg') !== backgroundColor) {
    targetRoot.style.setProperty('--fix-route-bg', backgroundColor)
  }

  if (targetRoot.style.getPropertyValue('--fix-route-text') !== textColor) {
    targetRoot.style.setProperty('--fix-route-text', textColor)
  }

  if (
    targetRoot.style.getPropertyValue('--fix-route-current-bg') !==
    backgroundColor
  ) {
    targetRoot.style.setProperty('--fix-route-current-bg', backgroundColor)
  }

  if (
    targetRoot.style.getPropertyValue('--fix-route-current-text') !== textColor
  ) {
    targetRoot.style.setProperty('--fix-route-current-text', textColor)
  }

  return nextMode
}

export function applyDarkModeState(isDarkMode, options = {}) {
  return applyAppearanceMode(
    isDarkMode ? DARK_APPEARANCE_MODE : LIGHT_APPEARANCE_MODE,
    options
  )
}

export function syncRootAppearance({
  root = null,
  fallbackMode = LIGHT_APPEARANCE_MODE
} = {}) {
  const resolvedMode = getRootAppearanceMode(root, fallbackMode)
  return applyAppearanceMode(resolvedMode, { root })
}
