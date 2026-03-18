jest.mock('@/themes/gitbook', () => ({
  useGitBookGlobal: jest.fn(() => ({
    sidebarExpandedGroupKeys: [],
    setSidebarExpandedGroupKeys: jest.fn()
  }))
}))

import {
  getExpandedGroupKeysOnRouteChange,
  getGroupKey,
  getGroupKeyByPath,
  normalizeExpandedGroupKeys
} from '@/themes/gitbook/components/NavPostList'

describe('GitBook NavPostList route state', () => {
  const categoryFolders = [
    {
      category: 'Guides',
      items: [{ href: '/guide/a' }, { href: '/guide/b' }]
    },
    {
      category: 'Notes',
      items: [{ href: '/note/a' }, { href: '/note/b' }]
    }
  ]

  test('uses stable group keys instead of array indexes', () => {
    expect(getGroupKey(categoryFolders[0], 0)).toBe('category:Guides::/guide/a')
    expect(getGroupKeyByPath(categoryFolders, '/note/b')).toBe(
      'category:Notes::/note/a'
    )
  })

  test('keeps the same expanded group when routing inside the same group', () => {
    const guidesKey = getGroupKey(categoryFolders[0], 0)

    expect(
      getExpandedGroupKeysOnRouteChange({
        categoryFolders,
        path: '/guide/b',
        expandedGroupKeys: [guidesKey],
        exclusiveCollapse: true,
        keepStateOnRoute: true
      })
    ).toEqual([guidesKey])
  })

  test('switches directly to the target group when routing across groups in exclusive mode', () => {
    const guidesKey = getGroupKey(categoryFolders[0], 0)
    const notesKey = getGroupKey(categoryFolders[1], 1)

    expect(
      getExpandedGroupKeysOnRouteChange({
        categoryFolders,
        path: '/note/a',
        expandedGroupKeys: [guidesKey],
        exclusiveCollapse: true,
        keepStateOnRoute: true
      })
    ).toEqual([notesKey])
  })

  test('adds the target group without closing others when exclusive mode is disabled', () => {
    const guidesKey = getGroupKey(categoryFolders[0], 0)
    const notesKey = getGroupKey(categoryFolders[1], 1)

    expect(
      getExpandedGroupKeysOnRouteChange({
        categoryFolders,
        path: '/note/a',
        expandedGroupKeys: [guidesKey],
        exclusiveCollapse: false,
        keepStateOnRoute: true
      })
    ).toEqual([guidesKey, notesKey])
  })

  test('falls back to the first group when the route does not match any post', () => {
    expect(
      getExpandedGroupKeysOnRouteChange({
        categoryFolders,
        path: '/missing',
        expandedGroupKeys: [],
        exclusiveCollapse: true,
        keepStateOnRoute: true
      })
    ).toEqual([getGroupKey(categoryFolders[0], 0)])
  })

  test('drops stale expanded keys when the visible groups change', () => {
    expect(
      normalizeExpandedGroupKeys(
        ['category:Guides::/guide/a', 'category:Unknown::/other'],
        categoryFolders
      )
    ).toEqual(['category:Guides::/guide/a'])
  })
})
