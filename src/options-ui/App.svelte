<script lang='ts'>
  import { defaultSyncOptions } from '../utils/default-options';
  import { getSyncStorage, setSyncStorage } from '../utils/storage';
  import { SyncOptions, UserOptions } from '../utils/sync-options';
  import ConfirmationDialog from './ConfirmationDialog.svelte';
  import Glossary from './Glossary.svx';
  import OptionsForm from './options-form/OptionsForm.svelte';
  import './app.scss';
  import '@sjsf/basic-theme/css/pico.css';

  let initialSyncOptions = $state<SyncOptions>();
  let syncOptionsLoadingFailed = $state(false);

  const loadSyncOptions = async () => {
    try {
      const unknownStorage = await getSyncStorage('options');
      initialSyncOptions = SyncOptions.parse(unknownStorage.options);
      syncOptionsLoadingFailed = false;
    } catch {
      syncOptionsLoadingFailed = true;
    }
  };

  $effect(() => {
    loadSyncOptions();
  });

  let resettingDialogOpen = $state(false);

  const onSubmit = async (userOptions: UserOptions) => {
    if (!initialSyncOptions) {
      return;
    }

    await setSyncStorage({
      options: {
        ...initialSyncOptions,
        user: userOptions,
      },
    });
  };
</script>

<main class='container'>
  <section>
    <h1>ZEN Study + オプション</h1>
    {#if initialSyncOptions}
      {#key initialSyncOptions}
        <OptionsForm
          initialOptions={initialSyncOptions.user}
          {onSubmit}
        />
      {/key}
    {:else if !syncOptionsLoadingFailed}
      <p aria-busy='true'>オプションを読み込み中</p>
    {/if}
    {#if syncOptionsLoadingFailed}
      <p class='error'>
        オプションの読み込みに失敗しました。リセットにより解決できるかもしれません。
      </p>
    {/if}
    <p>
      <button
        type='button'
        class='secondary'
        onclick={() => {
          resettingDialogOpen = true;
        }}
      >
        すべてのオプションをリセット
      </button>
    </p>
  </section>
  <section>
    <h2>用語</h2>
    <Glossary />
  </section>
  <ConfirmationDialog
    open={resettingDialogOpen}
    yes='リセット'
    no='キャンセル'
    onclose={(isConfirmed) => {
      resettingDialogOpen = false;

      if (isConfirmed) {
        setSyncStorage({ options: defaultSyncOptions }).then(() => {
          loadSyncOptions();
        });
      }
    }}
  >
    <h2>オプションのリセット</h2>
    <p>本当にリセットしますか？</p>
  </ConfirmationDialog>
</main>

<style>
  .error {
    color: var(--pico-del-color);
  }
</style>
