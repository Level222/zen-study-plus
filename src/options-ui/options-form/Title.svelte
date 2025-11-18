<script lang='ts'>
  import type { ComponentProps } from '@sjsf/form';
  import { getFormContext, titleAttributes } from '@sjsf/form';

  const { title, config, templateType }: ComponentProps['title'] = $props();

  const ctx = getFormContext();
</script>

<div
  {...titleAttributes(ctx, config, 'titleAttributes', {
    'class': 'sjsf-title',
    'data-template': templateType,
  })}
>
  {title}
</div>
