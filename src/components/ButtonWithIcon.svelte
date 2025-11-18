<script lang='ts'>
  import type { Snippet } from 'svelte';
  import type { HTMLButtonAttributes } from 'svelte/elements';

  export type ButtonWithIconProps = HTMLButtonAttributes & {
    children: Snippet;
  };

  const { children, ...props }: ButtonWithIconProps = $props();
</script>

<button {...props}>
  {@render children()}
</button>

<style>
  button {
    display: inline-flex;
    gap: calc(var(--pico-spacing) * 0.3);
    align-items: center;
    justify-content: center;
  }
</style>
