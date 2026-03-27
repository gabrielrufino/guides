import { defineConfig } from 'vitepress'
import { withMermaid } from 'vitepress-plugin-mermaid'

// https://vitepress.dev/reference/site-config
export default withMermaid(defineConfig({
  title: "Guides by Gabriel Rufino",
  description: "Technical guides on software architecture, databases, and application development.",

  locales: {
    root: {
      label: 'English',
      lang: 'en'
    }
  },

  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Guides', link: '/architecture' }
    ],

    sidebar: [
      {
        text: 'Architecture',
        link: '/architecture',
        items: [
          { text: 'Distributed Locks', link: '/architecture/distributed-locks' },
          { text: 'Idempotency Keys', link: '/architecture/idempotency-keys' },
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
      { icon: 'github', link: 'https://github.com/gabrielrufino/guides' }
    ],

    search: {
      provider: 'local'
    }
  }
}))
