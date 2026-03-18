import {
  DARK_APPEARANCE_MODE,
  LIGHT_APPEARANCE_MODE,
  getAppearancePalette,
  getRootAppearanceMode
} from '@/Fix/appearance-sync/rootAppearance'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

function getCurrentPalette() {
  if (typeof window === 'undefined') {
    return {
      backgroundColor: '#ffffff',
      textColor: '#111111'
    }
  }

  const root = document.documentElement
  const appearanceMode = getRootAppearanceMode(root, null)
  if (
    appearanceMode === DARK_APPEARANCE_MODE ||
    appearanceMode === LIGHT_APPEARANCE_MODE
  ) {
    return getAppearancePalette(appearanceMode)
  }

  const nextRoot = document.getElementById('__next')
  const candidates = [document.body, nextRoot, root]
  const backgroundColor =
    candidates
      .map(node => node && window.getComputedStyle(node).backgroundColor)
      .find(
        color => color && color !== 'transparent' && color !== 'rgba(0, 0, 0, 0)'
      ) || '#ffffff'

  return {
    backgroundColor,
    textColor: '#111111'
  }
}

function applyCurrentPalette() {
  if (typeof window === 'undefined') {
    return
  }

  const root = document.documentElement
  const { backgroundColor, textColor } = getCurrentPalette()

  root.style.setProperty('--fix-route-bg', backgroundColor)
  root.style.setProperty('--fix-route-text', textColor)
  root.style.setProperty('--fix-route-current-bg', backgroundColor)
  root.style.setProperty('--fix-route-current-text', textColor)
}

export default function RouteTransitionFix() {
  const router = useRouter()
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const root = document.documentElement
    let firstFrame = 0
    let secondFrame = 0

    const cancelHideFrames = () => {
      if (firstFrame) {
        window.cancelAnimationFrame(firstFrame)
      }
      if (secondFrame) {
        window.cancelAnimationFrame(secondFrame)
      }
    }

    const showShield = () => {
      cancelHideFrames()
      applyCurrentPalette()
      root.dataset.routeTransition = 'true'
      setIsVisible(true)
    }

    const hideShield = () => {
      cancelHideFrames()
      firstFrame = window.requestAnimationFrame(() => {
        secondFrame = window.requestAnimationFrame(() => {
          applyCurrentPalette()
          delete root.dataset.routeTransition
          setIsVisible(false)
        })
      })
    }

    const observer = new MutationObserver(() => {
      applyCurrentPalette()
    })

    observer.observe(root, {
      attributes: true,
      attributeFilter: ['class', 'data-appearance-mode']
    })

    applyCurrentPalette()
    router.events.on('routeChangeStart', showShield)
    router.events.on('routeChangeComplete', hideShield)
    router.events.on('routeChangeError', hideShield)

    return () => {
      cancelHideFrames()
      observer.disconnect()
      router.events.off('routeChangeStart', showShield)
      router.events.off('routeChangeComplete', hideShield)
      router.events.off('routeChangeError', hideShield)
    }
  }, [router.events])

  return <div id='route-transition-shield' data-visible={isVisible} />
}
