<script lang='ts'>
  import type { Snippet } from 'svelte';
  import type { HTMLAnchorAttributes } from 'svelte/elements';
  import { ExternalLinkIcon } from '@lucide/svelte';

  export type ExternalLinkProps = HTMLAnchorAttributes & {
    href: string;
    children?: Snippet;
  };

  const { children, ...props }: ExternalLinkProps = $props();
</script>

<a target='_blank' rel='noreferrer' {...props}>
  {#if children}
    {@render children()}
  {:else}
    {props.href}
  {/if}
  <ExternalLinkIcon size='0.85em' />
</a>
