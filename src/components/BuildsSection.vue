<script setup lang="ts">
import PasswordLab from './PasswordLab.vue'
import SectionHead from './SectionHead.vue'

const extensionUrl = 'https://github.com/ConductionNL/keepiq/tree/development/browser-extension'
</script>

<template>
  <section class="section" id="builds" aria-labelledby="builds-title">
    <div class="wrap">
      <SectionHead tag="Sec.Builds" title="Builds" kana="ビルド" title-id="builds-title" />

      <article class="card feature" data-reveal>
        <div class="feature__info">
          <div class="feature__tags">
            <span class="block block--magenta block--sm"><span>Featured build</span></span>
            <span class="block block--cyan block--sm"><span>WIP</span></span>
          </div>
          <h3 class="feature__title">Keepiq browser extension</h3>
          <p>
            Keepiq is Conduction's encrypted password manager for Nextcloud. I lead the frontend of
            its browser extension, which fills in logins, passkeys and one-time codes on any site
            and saves new ones as you go. Everything is encrypted, so your master password and
            secrets never reach the server.
          </p>
          <dl class="feature__facts">
            <div>
              <dt class="mono">Role</dt>
              <dd>Lead frontend developer</dd>
            </div>
            <div>
              <dt class="mono">Platform</dt>
              <dd>Chrome and Firefox</dd>
            </div>
            <div>
              <dt class="mono">Status</dt>
              <dd>Work in progress, not released yet</dd>
            </div>
          </dl>
          <p class="feature__note mono">
            The code is public on the development branch. The password lab is a small demo in the
            same spirit.
          </p>
          <a class="btn btn--ghost btn--small" :href="extensionUrl" target="_blank" rel="noopener">
            <span>View the code →</span>
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
          <p>I publish my code so others can use it, read it and improve it.</p>
          <span class="repo__go mono">Open profile →</span>
        </a>
      </div>
    </div>
  </section>
</template>
