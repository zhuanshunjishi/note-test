import SharedTheme from '../../../.vitepress/theme/index.js'
import M1DocsVersion from './M1DocsVersion.vue'

export default {
  ...SharedTheme,
  enhanceApp({ app }) {
    app.component('M1DocsVersion', M1DocsVersion)
  },
}
