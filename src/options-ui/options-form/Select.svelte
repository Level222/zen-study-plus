<script lang='ts'>
  import type { ComponentProps, Config } from '@sjsf/form';
  import Select from '@sjsf/basic-theme/widgets/select.svelte';

  let {
    value = $bindable(),
    config,
    ...props
  }: ComponentProps['selectWidget'] = $props();

  const newConfig: Config = $derived({
    ...config,
    schema: {
      ...config.schema,
      default: null,
    },
  });
</script>

<Select bind:value config={newConfig} {...props} />
