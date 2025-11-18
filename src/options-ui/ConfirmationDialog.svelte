<script lang='ts'>
  import type { Snippet } from 'svelte';

  export type ConfirmationDialogProps = {
    open: boolean;
    yes: string;
    no: string;
    onclose: (isConfirmed: boolean) => void;
    children: Snippet;
  };

  const { open, yes, no, onclose, children }: ConfirmationDialogProps = $props();

  let dialog: HTMLDialogElement;

  $effect(() => {
    if (open) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  });
</script>

<dialog
  bind:this={dialog}
  onclose={() => {
    onclose(false);
  }}
>
  <article>
    {@render children()}
    <footer>
      <button type='button' class='secondary' onclick={() => onclose(false)}>{no}</button>
      <button type='button' onclick={() => onclose(true)}>{yes}</button>
    </footer>
  </article>
</dialog>

<style>
  article {
    max-width: 500px;
  }

  button {
    margin-bottom: 0;
  }
</style>
