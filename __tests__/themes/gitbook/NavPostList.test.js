import {
  getDefaultOpenIndexByPath,
  getExpandedGroupsOnRouteChange,
  getInitialExpandedGroups
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

  test('opens the current group on first render when keep-state is enabled', () => {
    expect(
      getInitialExpandedGroups({
        categoryFolders,
        path: '/guide/b',
        exclusiveCollapse: true,
        keepStateOnRoute: true
      })
    ).toEqual([0])
  })

  test('keeps the expanded group unchanged when routing inside the same group', () => {
    expect(
      getExpandedGroupsOnRouteChange({
        categoryFolders,
        path: '/guide/b',
        expandedGroups: [0],
        exclusiveCollapse: true,
        keepStateOnRoute: true
      })
    ).toEqual([0])
  })

  test('switches to the target group when routing across groups in exclusive mode', () => {
    expect(
      getExpandedGroupsOnRouteChange({
        categoryFolders,
        path: '/note/a',
        expandedGroups: [0],
        exclusiveCollapse: true,
        keepStateOnRoute: true
      })
    ).toEqual([1])
  })

  test('adds the target group without closing others when exclusive mode is disabled', () => {
    expect(
      getExpandedGroupsOnRouteChange({
        categoryFolders,
        path: '/note/a',
        expandedGroups: [0],
        exclusiveCollapse: false,
        keepStateOnRoute: true
      })
    ).toEqual([0, 1])
  })

  test('falls back to the first group when the route does not match any post', () => {
    expect(getDefaultOpenIndexByPath(categoryFolders, '/missing')).toBe(0)
  })

  test('starts collapsed when keep-state is disabled so legacy timing can take over', () => {
    expect(
      getInitialExpandedGroups({
        categoryFolders,
        path: '/guide/a',
        exclusiveCollapse: true,
        keepStateOnRoute: false
      })
    ).toEqual([])
  })
})
