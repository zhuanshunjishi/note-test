import { h } from 'vue'
import DefaultTheme from 'vitepress/theme'
import genisomaiLogo from '../../pages/assets/genisomai-logo.png'
import eaiLogo from '../../pages/assets/eai-logo.png'
import './style.css'

export default {
  extends: DefaultTheme,
  Layout() {
    return h(DefaultTheme.Layout, null, {
      'nav-bar-title-before': () => h('span', { class: 'docs-brand-logos' }, [
        h('img', { src: genisomaiLogo, alt: 'GenisomAI', width: 480, height: 136 }),
        h('img', { src: eaiLogo, alt: 'EAI Academy', width: 240, height: 145 }),
      ]),
    })
  },
}
