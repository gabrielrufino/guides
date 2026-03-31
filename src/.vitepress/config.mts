import { defineConfig } from 'vitepress'
import { withMermaid } from 'vitepress-plugin-mermaid'

// https://vitepress.dev/reference/site-config
export default withMermaid(defineConfig({
  title: "Guides by Gabriel Rufino",
  description: "Technical guides on software architecture, databases, and application development.",
  head: [
    [
      'script',
      {},
      `
      var _paq = window._paq = window._paq || [];
      _paq.push(['trackPageView']);
      _paq.push(['enableLinkTracking']);
      (function() {
        var u="https://matomo.gabrielrufino.com/";
        _paq.push(['setTrackerUrl', u+'matomo.php']);
        _paq.push(['setSiteId', '1']);
        var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
        g.async=true; g.src=u+'matomo.js'; s.parentNode.insertBefore(g,s);
      })();
      `
    ]
  ],

  locales: {
    root: {
      label: 'English',
      lang: 'en'
    }
  },

  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    logo: '/logo.png',
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Guides', link: '/architecture' },
    ],

    sidebar: [
      {
        text: 'Architecture',
        link: '/architecture',
        items: [
          { text: 'Distributed Locks', link: '/architecture/distributed-locks' },
          { text: 'Idempotency Keys', link: '/architecture/idempotency-keys' },
          { text: 'Multi-tenancy', link: '/architecture/multi-tenancy' },
          { text: 'Orchestration vs. Choreography', link: '/architecture/orchestration-vs-choreography' }
        ]
      },
      {
        text: 'JavaScript',
        link: '/javascript',
        items: [
          { text: 'Mutation tests in JavaScript', link: '/javascript/mutation-tests-in-javascript' }
        ]
      },
      {
        text: 'MongoDB',
        link: '/mongodb',
        items: [
          { text: 'Data Duplication in MongoDB', link: '/mongodb/data-duplication-in-mongodb' }
        ]
      },
      {
        text: 'Observability',
        link: '/observability',
        items: [
          { text: 'Logs in JSON', link: '/observability/logs-in-json' }
        ]
      },
      {
        text: 'SQL',
        link: '/sql',
        items: [
          { text: 'Horizontal vs. Vertical Partitioning', link: '/sql/horizontal-vs-vertical-partitioning' }
        ]
      },
      {
        text: 'TypeScript',
        link: '/typescript',
        items: [
          { text: 'Mixins in TypeScript', link: '/typescript/mixins-in-typescript' }
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/gabrielrufino/guides' },
      { icon: 'linkedin', link: 'https://linkedin.com/in/gabrielrufinojs' }
    ],

    search: {
      provider: 'local'
    },

    footer: {
      message: 'Written with ❤️ by <a href="https://gabrielrufino.com" target="_blank">Gabriel Rufino</a>.',
    }
  }
}))
