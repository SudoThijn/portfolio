<script setup lang="ts">
import PasswordLab from './PasswordLab.vue'
import SectionHead from './SectionHead.vue'

const repos = [
  {
    href: 'https://github.com/SudoThijn/extension-template',
    kind: 'Open source · JavaScript',
    name: 'extension-template',
    text: 'A starting point for browser extensions, built on WXT.',
    go: 'View repo →',
    more: false,
  },
  {
    href: 'https://github.com/SudoThijn',
    kind: 'GitHub',
    name: 'github.com/SudoThijn',
    text: 'I publish my code so others can use it, read it and improve it.',
    go: 'Open profile →',
    more: true,
  },
]
</script>

<template>
  <section class="section" id="builds" aria-labelledby="builds-title">
    <div class="wrap">
      <SectionHead tag="Sec.Builds" title="Builds" kana="ビルド" title-id="builds-title" />

      <article class="card feature" data-reveal>
        <div class="feature__info">
          <span class="block block--magenta block--sm"><span>Featured build</span></span>
          <h3 class="feature__title">Password manager browser extension</h3>
          <p>
            At Conduction I led the development of a password manager that lives in the browser,
            from the first idea to a working product. The work sits where security and usability
            meet: a vault that stays locked down, in a tool people are happy to use every day.
          </p>
          <dl class="feature__facts">
            <div>
              <dt class="mono">Role</dt>
              <dd>Lead developer</dd>
            </div>
            <div>
              <dt class="mono">Platform</dt>
              <dd>Browser extension</dd>
            </div>
            <div>
              <dt class="mono">Scope</dt>
              <dd>Idea → product</dd>
            </div>
          </dl>
          <p class="feature__note mono">
            Company project, so the code is private. The lab on the right is a small demo in the
            same spirit.
          </p>
        </div>

        <PasswordLab />
      </article>

      <div class="repos">
        <a
          v-for="repo in repos"
          :key="repo.href"
          class="card repo"
          :class="{ 'repo--more': repo.more }"
          :href="repo.href"
          target="_blank"
          rel="noopener"
          data-reveal
        >
          <span class="repo__kind mono">{{ repo.kind }}</span>
          <h3 class="repo__name">{{ repo.name }}</h3>
          <p>{{ repo.text }}</p>
          <span class="repo__go mono">{{ repo.go }}</span>
        </a>
      </div>
    </div>
  </section>
</template>
