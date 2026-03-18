const CONFIG = {
  GITBOOK_INDEX_PAGE: 'about', // Doc homepage slug.

  GITBOOK_AUTO_SORT: process.env.NEXT_PUBLIC_GITBOOK_AUTO_SORT || true, // Auto-group posts by category name.

  GITBOOK_LATEST_POST_RED_BADGE:
    process.env.NEXT_PUBLIC_GITBOOK_LATEST_POST_RED_BADGE || true, // Show a badge for latest posts.

  // Menu
  GITBOOK_MENU_CATEGORY: true,
  GITBOOK_BOOK_MENU_TAG: true,
  GITBOOK_MENU_ARCHIVE: true,
  GITBOOK_MENU_SEARCH: true,

  // Sidebar navigation
  GITBOOK_EXCLUSIVE_COLLAPSE: true, // Only keep one category expanded at a time.
  GITBOOK_SIDEBAR_KEEP_STATE_ON_ROUTE: true, // Keep the current expanded category state during route changes.
  GITBOOK_SIDEBAR_ANIMATE_COLLAPSE: false, // Disable sidebar collapse animation by default for seamless route changes.
  GITBOOK_FOLDER_HOVER_EXPAND: false, // Expand category on hover instead of click.

  // Widget
  GITBOOK_WIDGET_REVOLVER_MAPS:
    process.env.NEXT_PUBLIC_WIDGET_REVOLVER_MAPS || 'false',
  GITBOOK_WIDGET_TO_TOP: true
}

export default CONFIG
