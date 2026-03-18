import BLOG from '@/blog.config'

export const routeTransitionBootStyles = `
html {
  background-color: #ffffff;
  color-scheme: light;
}

html.dark {
  background-color: #000000;
  color-scheme: dark;
}

body,
#__next {
  min-height: 100vh;
  background-color: inherit;
}
`

export const routeTransitionBootScript = `
(function() {
  var darkMode = localStorage.getItem('darkMode');
  var prefersDark =
    window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  var defaultAppearance = '${BLOG.APPEARANCE || 'auto'}';
  var shouldBeDark = darkMode === 'true' || darkMode === 'dark';

  if (darkMode === null) {
    if (defaultAppearance === 'dark') {
      shouldBeDark = true;
    } else if (defaultAppearance === 'auto') {
      var date = new Date();
      var hours = date.getHours();
      var darkTimeStart = ${BLOG.APPEARANCE_DARK_TIME ? BLOG.APPEARANCE_DARK_TIME[0] : 18};
      var darkTimeEnd = ${BLOG.APPEARANCE_DARK_TIME ? BLOG.APPEARANCE_DARK_TIME[1] : 6};
      shouldBeDark = prefersDark || (hours >= darkTimeStart || hours < darkTimeEnd);
    }
  }

  var backgroundColor = shouldBeDark ? '#000000' : '#ffffff';
  var textColor = shouldBeDark ? '#ffffff' : '#111111';
  var root = document.documentElement;

  root.classList.add(shouldBeDark ? 'dark' : 'light');
  root.style.backgroundColor = backgroundColor;
  root.style.colorScheme = shouldBeDark ? 'dark' : 'light';
  root.style.setProperty('--fix-route-bg', backgroundColor);
  root.style.setProperty('--fix-route-text', textColor);
  root.style.setProperty('--fix-route-current-bg', backgroundColor);
  root.style.setProperty('--fix-route-current-text', textColor);
})();
`
