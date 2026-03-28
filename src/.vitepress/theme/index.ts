import type { EnhanceAppContext } from 'vitepress'
import DefaultTheme from "vitepress/theme";

export default {
  ...DefaultTheme,
  enhanceApp: ({ router }: EnhanceAppContext) => {
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
