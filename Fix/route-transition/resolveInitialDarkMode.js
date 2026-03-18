export default function resolveInitialDarkMode(defaultDarkMode) {
  if (typeof document === 'undefined') {
    return defaultDarkMode === 'dark'
  }

  const root = document.documentElement

  if (root.classList.contains('dark')) {
    return true
  }

  if (root.classList.contains('light')) {
    return false
  }

  return defaultDarkMode === 'dark'
}
