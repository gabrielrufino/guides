import type { EnhanceAppContext } from 'vitepress'
import DefaultTheme from "vitepress/theme";
import CopyOrDownloadAsMarkdownButtons from 'vitepress-plugin-llms/vitepress-components/CopyOrDownloadAsMarkdownButtons.vue'

export default {
  ...DefaultTheme,
  enhanceApp: ({ app, router }: EnhanceAppContext) => {
    app.component('CopyOrDownloadAsMarkdownButtons', CopyOrDownloadAsMarkdownButtons)

    if (typeof window !== 'undefined') {
      router.onAfterRouteChanged = (to) => {
        // @ts-ignore
        const _paq = window._paq = window._paq || [];
        _paq.push(['setCustomUrl', to])
        _paq.push(['setDocumentTitle', document.title])
        _paq.push(['trackPageView'])
      }
    }
  }
};
