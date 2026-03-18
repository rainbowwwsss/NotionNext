import { render, screen } from '@testing-library/react'
import NavPostItem from '@/themes/gitbook/components/NavPostItem'

jest.mock('@/lib/config', () => ({
  siteConfig: jest.fn((key, defaultValue) => {
    if (key === 'GITBOOK_FOLDER_HOVER_EXPAND') {
      return false
    }

    if (key === 'GITBOOK_SIDEBAR_ANIMATE_COLLAPSE') {
      return false
    }

    if (key === 'GITBOOK_LATEST_POST_RED_BADGE') {
      return false
    }

    return defaultValue
  })
}))

jest.mock('@/themes/gitbook/components/BlogPostCard', () => {
  return function MockBlogPostCard({ post }) {
    return <div>{post.title}</div>
  }
})

describe('GitBook NavPostItem', () => {
  const group = {
    category: 'Guides',
    items: [
      { id: 'a', title: 'Guide A', href: '/guide/a' },
      { id: 'b', title: 'Guide B', href: '/guide/b' }
    ]
  }

  test('does not render group children when collapsed', () => {
    render(<NavPostItem group={group} expanded={false} toggleItem={jest.fn()} />)

    expect(screen.queryByText('Guide A')).not.toBeInTheDocument()
    expect(screen.queryByText('Guide B')).not.toBeInTheDocument()
  })

  test('renders group children directly when expanded with animation disabled', () => {
    render(<NavPostItem group={group} expanded={true} toggleItem={jest.fn()} />)

    expect(screen.getByText('Guide A')).toBeInTheDocument()
    expect(screen.getByText('Guide B')).toBeInTheDocument()
  })
})
