import { siteConfig } from '@/lib/config'
import { useGlobal } from '@/lib/global'
import { useGitBookGlobal } from '@/themes/gitbook'
import { useRouter } from 'next/router'
import { useEffect, useMemo } from 'react'
import CONFIG from '../config'
import BlogPostCard from './BlogPostCard'
import NavPostItem from './NavPostItem'

export const UNCATEGORIZED_GROUP_KEY = 'uncategorized'

const NavPostList = props => {
  const { filteredNavPages } = props
  const { locale, currentSearch } = useGlobal()
  const { sidebarExpandedGroupKeys, setSidebarExpandedGroupKeys } =
    useGitBookGlobal()
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

  useEffect(() => {
    setSidebarExpandedGroupKeys(prevExpandedGroupKeys => {
      const nextExpandedGroupKeys = getExpandedGroupKeysOnRouteChange({
        categoryFolders,
        path: currentPath,
        expandedGroupKeys: prevExpandedGroupKeys,
        exclusiveCollapse: GITBOOK_EXCLUSIVE_COLLAPSE,
        keepStateOnRoute: GITBOOK_SIDEBAR_KEEP_STATE_ON_ROUTE
      })

      return areGroupKeysEqual(prevExpandedGroupKeys, nextExpandedGroupKeys)
        ? prevExpandedGroupKeys
        : nextExpandedGroupKeys
    })
  }, [
    categoryFolders,
    currentPath,
    GITBOOK_EXCLUSIVE_COLLAPSE,
    GITBOOK_SIDEBAR_KEEP_STATE_ON_ROUTE,
    setSidebarExpandedGroupKeys
  ])

  const toggleItem = groupKey => {
    setSidebarExpandedGroupKeys(prevExpandedGroupKeys => {
      const normalizedExpandedGroupKeys = normalizeExpandedGroupKeys(
        prevExpandedGroupKeys,
        categoryFolders
      )
      const isExpanded = normalizedExpandedGroupKeys.includes(groupKey)

      if (isExpanded) {
        return normalizedExpandedGroupKeys.filter(
          expandedGroupKey => expandedGroupKey !== groupKey
        )
      }

      if (GITBOOK_EXCLUSIVE_COLLAPSE) {
        return [groupKey]
      }

      return [...normalizedExpandedGroupKeys, groupKey]
    })
  }

  if (!categoryFolders.length) {
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
      {categoryFolders.map((group, index) => {
        const groupKey = getGroupKey(group, index)
        return (
          <NavPostItem
            key={groupKey}
            group={group}
            onHeightChange={props.onHeightChange}
            expanded={sidebarExpandedGroupKeys.includes(groupKey)}
            toggleItem={() => toggleItem(groupKey)}
          />
        )
      })}
    </div>
  )
}

export function getPathFromRoute(asPath = '') {
  return decodeURIComponent(asPath.split('?')[0] || '')
}

export function getGroupKey(group, index = 0) {
  const category = group?.category?.trim()
  const categoryKey = category ? `category:${category}` : UNCATEGORIZED_GROUP_KEY
  const firstHref = group?.items?.[0]?.href || `index:${index}`
  return `${categoryKey}::${firstHref}`
}

export function getGroupKeyByPath(categoryFolders, path) {
  const index = categoryFolders.findIndex(group => {
    return group.items.some(post => path === post.href)
  })

  if (index === -1) {
    return null
  }

  return getGroupKey(categoryFolders[index], index)
}

export function getExpandedGroupKeysOnRouteChange({
  categoryFolders,
  path,
  expandedGroupKeys = [],
  exclusiveCollapse,
  keepStateOnRoute
}) {
  if (!categoryFolders || categoryFolders.length === 0) {
    return []
  }

  const fallbackGroupKey = getGroupKey(categoryFolders[0], 0)
  const currentGroupKey = getGroupKeyByPath(categoryFolders, path)
  const preferredGroupKey = currentGroupKey || fallbackGroupKey

  if (!keepStateOnRoute) {
    return [preferredGroupKey]
  }

  const normalizedExpandedGroupKeys = normalizeExpandedGroupKeys(
    expandedGroupKeys,
    categoryFolders
  )

  if (!normalizedExpandedGroupKeys.length) {
    return [preferredGroupKey]
  }

  if (normalizedExpandedGroupKeys.includes(preferredGroupKey)) {
    return normalizedExpandedGroupKeys
  }

  if (exclusiveCollapse) {
    return [preferredGroupKey]
  }

  return [...normalizedExpandedGroupKeys, preferredGroupKey]
}

export function normalizeExpandedGroupKeys(expandedGroupKeys, categoryFolders) {
  const validGroupKeys = new Set(
    categoryFolders.map((group, index) => getGroupKey(group, index))
  )

  return [...new Set(expandedGroupKeys)].filter(groupKey =>
    validGroupKeys.has(groupKey)
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

function areGroupKeysEqual(previousGroupKeys = [], nextGroupKeys = []) {
  if (previousGroupKeys.length !== nextGroupKeys.length) {
    return false
  }

  return previousGroupKeys.every(
    (groupKey, index) => groupKey === nextGroupKeys[index]
  )
}

export default NavPostList
