import { h } from 'vue'
import SharedTheme from '../../../.vitepress/theme/index.js'
import SdkVersionSelect from './SdkVersionSelect.vue'

export default {
  ...SharedTheme,
  Layout() {
    return h(SharedTheme.Layout, null, {
      'sidebar-nav-before': () => h(SdkVersionSelect),
    })
  },
}
