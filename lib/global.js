import { APPEARANCE, LANG, NOTION_PAGE_ID, THEME } from '@/blog.config'
import {
  DARK_APPEARANCE_MODE,
  LIGHT_APPEARANCE_MODE,
  applyDarkModeState,
  syncRootAppearance
} from '@/Fix/appearance-sync/rootAppearance'
import resolveInitialDarkMode from '@/Fix/route-transition/resolveInitialDarkMode'
import {
  THEMES,
  getThemeConfig,
  initDarkMode,
  saveDarkModeToLocalStorage
} from '@/themes/theme'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/router'
import { createContext, useContext, useEffect, useState } from 'react'
import { generateLocaleDict, initLocale, redirectUserLang } from './utils/lang'

const GlobalContext = createContext()

export function GlobalContextProvider(props) {
  const {
    post,
    children,
    siteInfo,
    categoryOptions,
    tagOptions,
    NOTION_CONFIG
  } = props

  const [lang, updateLang] = useState(NOTION_CONFIG?.LANG || LANG)
  const [locale, updateLocale] = useState(
    generateLocaleDict(NOTION_CONFIG?.LANG || LANG)
  )
  const [theme, setTheme] = useState(NOTION_CONFIG?.THEME || THEME)
  const [THEME_CONFIG, SET_THEME_CONFIG] = useState(null)
  const [isLiteMode, setLiteMode] = useState(false)

  const defaultDarkMode = NOTION_CONFIG?.APPEARANCE || APPEARANCE
  const [isDarkMode, updateDarkMode] = useState(() =>
    resolveInitialDarkMode(defaultDarkMode)
  )
  const [onLoading, setOnLoading] = useState(false)
  const router = useRouter()

  const enableClerk = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
  const { isLoaded, isSignedIn, user } = enableClerk
    ? /* eslint-disable-next-line react-hooks/rules-of-hooks */
      useUser()
    : { isLoaded: true, isSignedIn: false, user: false }

  const fullWidth = post?.fullWidth ?? false

  function switchTheme() {
    const query = router.query
    const currentTheme = query.theme || theme
    const currentIndex = THEMES.indexOf(currentTheme)
    const newIndex = currentIndex < THEMES.length - 1 ? currentIndex + 1 : 0
    const newTheme = THEMES[newIndex]
    query.theme = newTheme
    router.push({ pathname: router.pathname, query })
    return newTheme
  }

  const updateThemeConfig = async themeValue => {
    const config = await getThemeConfig(themeValue)
    SET_THEME_CONFIG(config)
  }

  const toggleDarkMode = () => {
    const newStatus = !isDarkMode
    saveDarkModeToLocalStorage(newStatus)
    updateDarkMode(newStatus)
    applyDarkModeState(newStatus)
  }

  function changeLang(nextLang) {
    if (nextLang) {
      updateLang(nextLang)
      updateLocale(generateLocaleDict(nextLang))
    }
  }

  useEffect(() => {
    initLocale(router.locale, changeLang, updateLocale)
    if (router.query.lite && router.query.lite === 'true') {
      setLiteMode(true)
    }
  }, [router])

  useEffect(() => {
    initDarkMode(updateDarkMode, defaultDarkMode)
    if (
      NOTION_CONFIG?.REDIRECT_LANG &&
      JSON.parse(NOTION_CONFIG?.REDIRECT_LANG)
    ) {
      redirectUserLang(NOTION_PAGE_ID)
    }
    setOnLoading(false)
  }, [])

  useEffect(() => {
    if (typeof document === 'undefined') {
      return
    }

    const root = document.documentElement
    const fallbackMode =
      defaultDarkMode === DARK_APPEARANCE_MODE || defaultDarkMode === 'true'
        ? DARK_APPEARANCE_MODE
        : LIGHT_APPEARANCE_MODE
    const syncDarkModeState = () => {
      const nextMode = syncRootAppearance({ root, fallbackMode })
      updateDarkMode(nextMode === DARK_APPEARANCE_MODE)
    }

    const observer = new MutationObserver(syncDarkModeState)
    observer.observe(root, {
      attributes: true,
      attributeFilter: ['class', 'data-appearance-mode']
    })

    syncDarkModeState()

    return () => {
      observer.disconnect()
    }
  }, [defaultDarkMode])

  useEffect(() => {
    const handleStart = url => {
      const themeValue = router.query.theme
      const themeStr = Array.isArray(themeValue) ? themeValue[0] : themeValue

      if (themeStr && !url.includes(`theme=${themeStr}`)) {
        const newUrl = `${url}${url.includes('?') ? '&' : '?'}theme=${themeStr}`
        router.push(newUrl)
      }

      if (!onLoading) {
        setOnLoading(true)
      }
    }

    const handleStop = () => {
      if (onLoading) {
        setOnLoading(false)
      }
    }

    const currentTheme = router?.query?.theme || theme
    updateThemeConfig(currentTheme)

    router.events.on('routeChangeStart', handleStart)
    router.events.on('routeChangeError', handleStop)
    router.events.on('routeChangeComplete', handleStop)
    return () => {
      router.events.off('routeChangeStart', handleStart)
      router.events.off('routeChangeComplete', handleStop)
      router.events.off('routeChangeError', handleStop)
    }
  }, [router, onLoading])

  return (
    <GlobalContext.Provider
      value={{
        isLiteMode,
        isLoaded,
        isSignedIn,
        user,
        fullWidth,
        NOTION_CONFIG,
        THEME_CONFIG,
        toggleDarkMode,
        onLoading,
        setOnLoading,
        lang,
        changeLang,
        locale,
        updateLocale,
        isDarkMode,
        updateDarkMode,
        theme,
        setTheme,
        switchTheme,
        siteInfo,
        categoryOptions,
        tagOptions
      }}>
      {children}
    </GlobalContext.Provider>
  )
}

export const useGlobal = () => useContext(GlobalContext)
