import {
  APPEARANCE_MODE_ATTRIBUTE,
  DARK_APPEARANCE_MODE,
  LIGHT_APPEARANCE_MODE,
  applyAppearanceMode,
  applyDarkModeState,
  getAppearancePalette,
  getRootAppearanceMode,
  syncRootAppearance
} from '@/Fix/appearance-sync/rootAppearance'

describe('rootAppearance', () => {
  beforeEach(() => {
    document.documentElement.className = ''
    document.documentElement.removeAttribute(APPEARANCE_MODE_ATTRIBUTE)
    document.documentElement.style.cssText = ''
  })

  test('applyAppearanceMode keeps only the requested light mode markers', () => {
    document.documentElement.classList.add('dark')

    const nextMode = applyAppearanceMode(LIGHT_APPEARANCE_MODE)

    expect(nextMode).toBe(LIGHT_APPEARANCE_MODE)
    expect(document.documentElement.classList.contains('light')).toBe(true)
    expect(document.documentElement.classList.contains('dark')).toBe(false)
    expect(
      document.documentElement.getAttribute(APPEARANCE_MODE_ATTRIBUTE)
    ).toBe(LIGHT_APPEARANCE_MODE)
    expect(document.documentElement.style.colorScheme).toBe(
      LIGHT_APPEARANCE_MODE
    )
    expect(
      document.documentElement.style.getPropertyValue('--fix-route-bg')
    ).toBe('#ffffff')
  })

  test('getRootAppearanceMode prefers the data attribute over conflicting classes', () => {
    document.documentElement.classList.add('dark', 'light')
    document.documentElement.setAttribute(
      APPEARANCE_MODE_ATTRIBUTE,
      LIGHT_APPEARANCE_MODE
    )

    expect(getRootAppearanceMode(document.documentElement, null)).toBe(
      LIGHT_APPEARANCE_MODE
    )
  })

  test('syncRootAppearance collapses conflicting classes to a single mode', () => {
    document.documentElement.classList.add('dark', 'light')
    document.documentElement.setAttribute(
      APPEARANCE_MODE_ATTRIBUTE,
      DARK_APPEARANCE_MODE
    )

    const nextMode = syncRootAppearance({
      root: document.documentElement,
      fallbackMode: LIGHT_APPEARANCE_MODE
    })

    expect(nextMode).toBe(DARK_APPEARANCE_MODE)
    expect(document.documentElement.className).toBe(DARK_APPEARANCE_MODE)
  })

  test('applyDarkModeState writes the fixed dark palette used by route transitions', () => {
    const nextMode = applyDarkModeState(true)

    expect(nextMode).toBe(DARK_APPEARANCE_MODE)
    expect(getAppearancePalette(nextMode)).toEqual({
      backgroundColor: '#000000',
      textColor: '#ffffff'
    })
    expect(
      document.documentElement.style.getPropertyValue('--fix-route-current-bg')
    ).toBe('#000000')
    expect(
      document.documentElement.style.getPropertyValue('--fix-route-current-text')
    ).toBe('#ffffff')
  })
})
