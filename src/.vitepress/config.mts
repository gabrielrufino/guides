import { defineConfig } from 'vitepress'
import { withMermaid } from 'vitepress-plugin-mermaid'
import llmstxt, { copyOrDownloadAsMarkdownButtons } from 'vitepress-plugin-llms'

// https://vitepress.dev/reference/site-config
export default withMermaid(defineConfig({
  title: "Guides by Gabriel Rufino",
  description: "Technical guides on software architecture, databases, and application development.",
  sitemap: {
    hostname: 'https://guides.gabrielrufino.com'
  },
  markdown: {
    config(md) {
      md.use(copyOrDownloadAsMarkdownButtons)
    }
  },
  vite: {
    plugins: [llmstxt()]
  },
  lastUpdated: true,
  head: [
    ['link', { rel: 'icon', href: '/public/favicon.svg' }],
    [
      'script',
      { async: '', src: 'https://www.googletagmanager.com/gtag/js?id=G-WVKHG5P6Q0' }
    ],
    [
      'script',
      {},
      `window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());

      gtag('config', 'G-WVKHG5P6Q0');`
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
    lastUpdated: {
      text: 'Last Updated',
      formatOptions: {
        dateStyle: 'full'
      }
    },
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
        text: 'MongoDB',
        link: '/mongodb',
        items: [
          { text: 'Data Duplication in MongoDB', link: '/mongodb/data-duplication-in-mongodb' }
        ]
      },
      {
        text: 'Node.js',
        link: '/nodejs',
        items: [
          { text: 'Workers vs. Processes', link: '/nodejs/worker-vs-processes-in-nodejs' }
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
          { text: 'Mixins in TypeScript', link: '/typescript/mixins-in-typescript' },
          { text: 'Mutation tests in TypeScript', link: '/typescript/mutation-tests-in-typescript' }
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
