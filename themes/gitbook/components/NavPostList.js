import { siteConfig } from '@/lib/config'
import { useGlobal } from '@/lib/global'
import { useRouter } from 'next/router'
import { useEffect, useMemo, useState } from 'react'
import CONFIG from '../config'
import BlogPostCard from './BlogPostCard'
import NavPostItem from './NavPostItem'

const NavPostList = props => {
  const { filteredNavPages } = props
  const { locale, currentSearch } = useGlobal()
  const router = useRouter()

  const categoryFolders = useMemo(
    () => groupArticles(filteredNavPages),
    [filteredNavPages]
  )
  const currentPath = useMemo(
    () => getPathFromRoute(router.asPath),
    [router.asPath]
  )

  const GITBOOK_EXCLUSIVE_COLLAPSE = siteConfig(
    'GITBOOK_EXCLUSIVE_COLLAPSE',
    null,
    CONFIG
  )
  const GITBOOK_SIDEBAR_KEEP_STATE_ON_ROUTE = siteConfig(
    'GITBOOK_SIDEBAR_KEEP_STATE_ON_ROUTE',
    true,
    CONFIG
  )

  const [expandedGroups, setExpandedGroups] = useState(() =>
    getInitialExpandedGroups({
      categoryFolders,
      path: currentPath,
      exclusiveCollapse: GITBOOK_EXCLUSIVE_COLLAPSE,
      keepStateOnRoute: GITBOOK_SIDEBAR_KEEP_STATE_ON_ROUTE
    })
  )

  useEffect(() => {
    if (!categoryFolders.length) {
      setExpandedGroups(prevExpandedGroups =>
        prevExpandedGroups.length === 0 ? prevExpandedGroups : []
      )
      return
    }

    if (!GITBOOK_SIDEBAR_KEEP_STATE_ON_ROUTE) {
      const timer = setTimeout(() => {
        const defaultOpenIndex = getDefaultOpenIndexByPath(
          categoryFolders,
          currentPath
        )
        setExpandedGroups([defaultOpenIndex])
      }, 500)

      return () => clearTimeout(timer)
    }

    setExpandedGroups(prevExpandedGroups => {
      const nextExpandedGroups = getExpandedGroupsOnRouteChange({
        categoryFolders,
        path: currentPath,
        expandedGroups: prevExpandedGroups,
        exclusiveCollapse: GITBOOK_EXCLUSIVE_COLLAPSE,
        keepStateOnRoute: GITBOOK_SIDEBAR_KEEP_STATE_ON_ROUTE
      })

      return isSameGroupState(prevExpandedGroups, nextExpandedGroups)
        ? prevExpandedGroups
        : nextExpandedGroups
    })
  }, [
    categoryFolders,
    currentPath,
    GITBOOK_EXCLUSIVE_COLLAPSE,
    GITBOOK_SIDEBAR_KEEP_STATE_ON_ROUTE
  ])

  const toggleItem = index => {
    let newExpandedGroups = [...expandedGroups]

    if (expandedGroups.includes(index)) {
      newExpandedGroups = newExpandedGroups.filter(
        expandedIndex => expandedIndex !== index
      )
    } else {
      newExpandedGroups.push(index)
    }

    if (GITBOOK_EXCLUSIVE_COLLAPSE) {
      newExpandedGroups = newExpandedGroups.filter(
        expandedIndex => expandedIndex === index
      )
    }

    setExpandedGroups(newExpandedGroups)
  }

  if (!categoryFolders || categoryFolders.length === 0) {
    return (
      <div className='flex w-full items-center justify-center min-h-screen mx-auto md:-mt-20'>
        <p className='text-gray-500 dark:text-gray-300'>
          {locale.COMMON.NO_RESULTS_FOUND}{' '}
          {currentSearch && <div>{currentSearch}</div>}
        </p>
      </div>
    )
  }

  const href = siteConfig('GITBOOK_INDEX_PAGE') + ''
  const homePost = {
    id: '-1',
    title: siteConfig('DESCRIPTION'),
    href: href.indexOf('/') !== 0 ? '/' + href : href
  }

  return (
    <div
      id='posts-wrapper'
      className='w-full flex-grow space-y-0.5 pr-4 tracking-wider'>
      <BlogPostCard className='mb-4' post={homePost} />
      {categoryFolders.map((group, index) => (
        <NavPostItem
          key={index}
          group={group}
          onHeightChange={props.onHeightChange}
          expanded={expandedGroups.includes(index)}
          toggleItem={() => toggleItem(index)}
        />
      ))}
    </div>
  )
}

export function getPathFromRoute(asPath = '') {
  return decodeURIComponent(asPath.split('?')[0] || '')
}

export function getInitialExpandedGroups({
  categoryFolders,
  path,
  exclusiveCollapse,
  keepStateOnRoute
}) {
  if (!keepStateOnRoute) {
    return []
  }

  return getExpandedGroupsOnRouteChange({
    categoryFolders,
    path,
    expandedGroups: [],
    exclusiveCollapse,
    keepStateOnRoute
  })
}

export function getExpandedGroupsOnRouteChange({
  categoryFolders,
  path,
  expandedGroups = [],
  exclusiveCollapse,
  keepStateOnRoute
}) {
  if (!categoryFolders || categoryFolders.length === 0) {
    return []
  }

  const defaultOpenIndex = getDefaultOpenIndexByPath(categoryFolders, path)

  if (!keepStateOnRoute) {
    return [defaultOpenIndex]
  }

  const normalizedExpandedGroups = normalizeExpandedGroups(
    expandedGroups,
    categoryFolders.length
  )

  if (normalizedExpandedGroups.length === 0) {
    return [defaultOpenIndex]
  }

  if (normalizedExpandedGroups.includes(defaultOpenIndex)) {
    return normalizedExpandedGroups
  }

  if (exclusiveCollapse) {
    return [defaultOpenIndex]
  }

  return [...normalizedExpandedGroups, defaultOpenIndex]
}

function normalizeExpandedGroups(expandedGroups, totalGroups) {
  return [...new Set(expandedGroups)].filter(index => {
    return Number.isInteger(index) && index >= 0 && index < totalGroups
  })
}

function isSameGroupState(previousGroups, nextGroups) {
  if (previousGroups.length !== nextGroups.length) {
    return false
  }

  return previousGroups.every(
    (groupIndex, index) => groupIndex === nextGroups[index]
  )
}

export function groupArticles(filteredNavPages) {
  if (!filteredNavPages) {
    return []
  }

  const groups = []
  const AUTO_SORT = siteConfig('GITBOOK_AUTO_SORT', true, CONFIG)

  for (let i = 0; i < filteredNavPages.length; i++) {
    const item = filteredNavPages[i]
    const categoryName = item?.category ? item.category : ''

    let existingGroup = null
    if (AUTO_SORT) {
      existingGroup = groups.find(group => group.category === categoryName)
    } else {
      existingGroup = groups[groups.length - 1]
    }

    if (existingGroup && existingGroup.category === categoryName) {
      existingGroup.items.push(item)
    } else {
      groups.push({ category: categoryName, items: [item] })
    }
  }

  return groups
}

export function getDefaultOpenIndexByPath(categoryFolders, path) {
  const index = categoryFolders.findIndex(group => {
    return group.items.some(post => path === post.href)
  })

  if (index !== -1) {
    return index
  }

  return 0
}

export default NavPostList
