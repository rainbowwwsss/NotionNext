import Badge from '@/components/Badge'
import { siteConfig } from '@/lib/config'
import { useEffect, useRef, useState } from 'react'
import CONFIG from '../config'
import BlogPostCard from './BlogPostCard'

const NavPostItem = props => {
  const { group, expanded, toggleItem } = props
  const hoverExpand = siteConfig('GITBOOK_FOLDER_HOVER_EXPAND', false, CONFIG)
  const animateCollapse = siteConfig(
    'GITBOOK_SIDEBAR_ANIMATE_COLLAPSE',
    false,
    CONFIG
  )
  const [isTouchDevice, setIsTouchDevice] = useState(false)

  useEffect(() => {
    const checkTouchDevice = () => {
      if (window.matchMedia('(pointer: coarse)').matches) {
        setIsTouchDevice(true)
      }
    }
    checkTouchDevice()

    window.addEventListener('resize', checkTouchDevice)
    return () => {
      window.removeEventListener('resize', checkTouchDevice)
    }
  }, [])

  const onHoverToggle = () => {
    if (!hoverExpand || isTouchDevice) {
      return
    }
    toggleItem()
  }

  const groupHasLatest = group?.items?.some(post => post.isLatest)

  if (group?.category) {
    return (
      <>
        <div
          onMouseEnter={onHoverToggle}
          onClick={toggleItem}
          className='cursor-pointer relative flex justify-between text-md p-2 hover:bg-gray-50 rounded-md dark:hover:bg-yellow-100 dark:hover:text-yellow-600'
          key={group.category}>
          <span className={`${expanded ? 'font-semibold' : ''}`}>
            {group.category}
          </span>
          <div className='inline-flex items-center select-none pointer-events-none'>
            <i
              className={`px-2 fas fa-chevron-left opacity-50 ${
                expanded ? '-rotate-90' : ''
              } ${animateCollapse ? 'transition-all duration-200' : ''}`}></i>
          </div>
          {groupHasLatest &&
            siteConfig('GITBOOK_LATEST_POST_RED_BADGE') &&
            !expanded && <Badge />}
        </div>
        <GitBookGroupContent isOpen={expanded} animate={animateCollapse}>
          {group.items?.map((post, index) => (
            <div key={index} className='ml-3 border-l'>
              <BlogPostCard className='ml-3' post={post} />
            </div>
          ))}
        </GitBookGroupContent>
      </>
    )
  }

  return (
    <>
      {group?.items?.map((post, index) => (
        <div key={index}>
          <BlogPostCard className='text-md py-2' post={post} />
        </div>
      ))}
    </>
  )
}

function GitBookGroupContent({ isOpen, animate, children }) {
  const contentRef = useRef(null)
  const [height, setHeight] = useState(isOpen ? 'auto' : 0)

  useEffect(() => {
    if (!animate) {
      setHeight(isOpen ? 'auto' : 0)
      return
    }

    const element = contentRef.current
    if (!element) {
      return
    }

    if (isOpen) {
      const nextHeight = element.scrollHeight
      setHeight(nextHeight)
      const timer = window.setTimeout(() => {
        setHeight('auto')
      }, 220)

      return () => window.clearTimeout(timer)
    }

    const currentHeight = element.scrollHeight
    setHeight(currentHeight)
    const frame = window.requestAnimationFrame(() => {
      setHeight(0)
    })

    return () => window.cancelAnimationFrame(frame)
  }, [isOpen, animate, children])

  if (!animate) {
    if (!isOpen) {
      return null
    }

    return <div>{children}</div>
  }

  return (
    <div
      ref={contentRef}
      style={{
        height: typeof height === 'number' ? `${height}px` : height
      }}
      className='overflow-hidden transition-[height] duration-200 ease-out'
      aria-hidden={!isOpen}>
      {children}
    </div>
  )
}

export default NavPostItem
