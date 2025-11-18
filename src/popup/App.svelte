<script lang='ts'>
  import { Github, MessageCircleQuestionMark, Settings } from '@lucide/svelte';
  import ButtonWithIcon from '../components/ButtonWithIcon.svelte';
  import ExternalLink from '../components/ExternalLink.svelte';
  import './app.scss';

  const version = chrome.runtime.getManifest().version;
</script>

<main class='container-fluid'>
  <section>
    <h1>
      ZEN Study +
      <small>v{version}</small>
    </h1>
  </section>
  <section>
    <ButtonWithIcon
      class='outline'
      onclick={() => {
        chrome.runtime.openOptionsPage();
      }}
    >
      <Settings />
      オプションページを開く
    </ButtonWithIcon>
  </section>
  <section>
    <div class='links'>
      <ExternalLink class='secondary' href='https://github.com/Level222/zen-study-plus'>
        <Github />
        Webサイト・ソースコード
      </ExternalLink>
      <ExternalLink class='secondary' href='https://github.com/Level222/zen-study-plus/issues'>
        <MessageCircleQuestionMark />
        バグ報告・機能リクエスト等
      </ExternalLink>
    </div>
  </section>
</main>

<style>
  main {
    width: 350px;
  }

  .links {
    display: flex;
    flex-direction: column;
    gap: calc(var(--pico-spacing) * 0.5);
  }
</style>
