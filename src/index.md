---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: Guides
  text: Engineering Knowledge base
  tagline: Technical deep-dives on architecture, database strategies, and building resilient systems.
  image: 
    src: /logo.png
    alt: Logo
  actions:
    - theme: brand
      text: Get Started
      link: /architecture
    - theme: alt
      text: Contribute
      link: https://github.com/gabrielrufino/guides

features:
  - icon: 🏗️
    title: Architecture
    details: System design principles, distributed locks, idempotency, and orchestration templates.
    link: /architecture
  - icon: 🍃
    title: MongoDB
    details: Deep dives into data replication, duplication strategies, and NoSQL best practices.
    link: /mongodb
  - icon: 🗄️
    title: SQL
    details: Horizontal vs. Vertical partitioning, database management strategies, and relational patterns.
    link: /sql
  - icon: 📊
    title: Observability
    details: Logs in JSON, application monitoring, and writing resilient, observable applications.
    link: /observability
  - icon: 🟨
    title: JavaScript
    details: Best practices for JavaScript, including mutation tests and modern patterns.
    link: /javascript
  - icon: 🟦
    title: TypeScript
    details: Advanced TypeScript techniques like Mixins and resilient type systems.
    link: /typescript
---
