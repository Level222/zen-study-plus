<script lang='ts' module>
  import type { Snippet } from 'svelte';
  import type { HTMLAttributes, HTMLDetailsAttributes } from 'svelte/elements';
  import '@sjsf/form/fields/extra-components/title';

  declare module '@sjsf/form' {
    interface UiOptions {
      /**
       * Overrides the attributes of the accordion
       */
      accordion?: {
        details?: HTMLDetailsAttributes;
        summary?: HTMLAttributes<HTMLElement>;
      };
    }

    interface FoundationalComponents {
      accordion: {};
    }

    interface ComponentProps {
      accordion: ComponentCommonProps & {
        summary: Snippet;
        children: Snippet;
      };
    }

    interface ComponentBindings {
      accordion: '';
    }
  }
</script>

<script lang='ts'>
  import type { ComponentProps } from '@sjsf/form';
  import type { ComponentCommonProps } from '@sjsf/form/fields/components';
  import { getFormContext, uiOptionProps } from '@sjsf/form';

  const { config, summary, children }: ComponentProps['accordion'] = $props();

  const ctx = getFormContext();

  const accordionOptions = $derived(
    uiOptionProps('accordion')(
      {
        details: { open: true, class: 'sjsf-accordion' },
        summary: {},
      },
      config,
      ctx,
    ),
  );
</script>

<details {...accordionOptions.details}>
  <summary {...accordionOptions.summary}>{@render summary()}</summary>
  {@render children()}
</details>

<style>
  summary {
    display: flex;
    justify-content: space-between;
  }

  details[open] > summary {
    margin-bottom: calc(var(--pico-spacing) * 1.2);
  }
</style>
