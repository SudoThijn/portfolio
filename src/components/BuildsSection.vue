<script setup lang="ts">
import { t } from '@/i18n'
import PasswordLab from './PasswordLab.vue'
import SectionHead from './SectionHead.vue'

const extensionUrl = 'https://github.com/ConductionNL/keepiq/tree/development/browser-extension'
</script>

<template>
  <section class="section" id="builds" aria-labelledby="builds-title">
    <div class="wrap">
      <SectionHead
        :tag="t('builds.tag')"
        :title="t('builds.title')"
        kana="ビルド"
        title-id="builds-title"
      />

      <article class="card feature" data-reveal>
        <div class="feature__info">
          <div class="feature__tags">
            <span class="block block--magenta block--sm"
              ><span>{{ t('builds.featured') }}</span></span
            >
            <span class="block block--cyan block--sm"><span>WIP</span></span>
          </div>
          <h3 class="feature__title">{{ t('builds.keepiqTitle') }}</h3>
          <p>{{ t('builds.keepiqText') }}</p>
          <dl class="feature__facts">
            <div>
              <dt class="mono">{{ t('builds.role') }}</dt>
              <dd>{{ t('builds.roleValue') }}</dd>
            </div>
            <div>
              <dt class="mono">{{ t('builds.platform') }}</dt>
              <dd>{{ t('builds.platformValue') }}</dd>
            </div>
            <div>
              <dt class="mono">{{ t('builds.status') }}</dt>
              <dd>{{ t('builds.statusValue') }}</dd>
            </div>
          </dl>
          <p class="feature__note mono">{{ t('builds.note') }}</p>
          <a class="btn btn--ghost btn--small" :href="extensionUrl" target="_blank" rel="noopener">
            <span>{{ t('builds.viewCode') }}</span>
          </a>
        </div>

        <PasswordLab />
      </article>

      <div class="repos">
        <a
          class="card repo"
          href="https://github.com/SudoThijn"
          target="_blank"
          rel="noopener"
          data-reveal
        >
          <span class="repo__kind mono">GitHub</span>
          <h3 class="repo__name">github.com/SudoThijn</h3>
          <p>{{ t('builds.githubText') }}</p>
          <span class="repo__go mono">{{ t('builds.openProfile') }}</span>
        </a>
      </div>
    </div>
  </section>
</template>
