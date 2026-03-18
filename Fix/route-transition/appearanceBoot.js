import BLOG from '@/blog.config'

export const routeTransitionBootStyles = `
html {
  background-color: #ffffff;
  color-scheme: light;
}

html.dark,
html[data-appearance-mode='dark'] {
  background-color: #000000;
  color-scheme: dark;
}

html.light,
html[data-appearance-mode='light'] {
  background-color: #ffffff;
  color-scheme: light;
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
  var appearanceMode = shouldBeDark ? 'dark' : 'light';

  root.classList.remove('dark', 'light');
  root.classList.add(appearanceMode);
  root.setAttribute('data-appearance-mode', appearanceMode);
  root.style.backgroundColor = backgroundColor;
  root.style.colorScheme = appearanceMode;
  root.style.setProperty('--fix-route-bg', backgroundColor);
  root.style.setProperty('--fix-route-text', textColor);
  root.style.setProperty('--fix-route-current-bg', backgroundColor);
  root.style.setProperty('--fix-route-current-text', textColor);
})();
`
