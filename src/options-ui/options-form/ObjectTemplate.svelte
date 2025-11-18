<script lang='ts'>
  import type { ComponentProps, Config, UiOption } from '@sjsf/form';
  import { getComponent, getFormContext } from '@sjsf/form';

  const getTemplateProps = (uiOption: UiOption, config: Config) => {
    return {
      title: config.title,
      showMeta: uiOption('hideTitle') !== true,
      description: uiOption('description') ?? config.schema.description,
    };
  };

  const ctx = getFormContext();

  const templateType = 'objectTemplate';

  const {
    config,
    children,
    addButton,
    action,
    errors,
    uiOption,
  }: ComponentProps[typeof templateType] = $props();

  const Layout = $derived(getComponent(ctx, 'layout', config));
  const Title = $derived(getComponent(ctx, 'title', config));
  const Description = $derived(getComponent(ctx, 'description', config));
  const ErrorsList = $derived(getComponent(ctx, 'errorsList', config));
  const Accordion = $derived(getComponent(ctx, 'accordion', config));

  const { title, description, showMeta } = $derived(
    getTemplateProps(uiOption, config),
  );

  const isRoot = $derived(config.path.length === 0);
</script>

{#snippet content()}
  <Layout type='object-properties' {config} {errors}>
    {@render children()}
  </Layout>
  {@render addButton?.()}
  {#if errors.length > 0}
    <ErrorsList {errors} {config} />
  {/if}
{/snippet}

<Layout type='object-field' {config} {errors}>
  {#if isRoot}
    {#if showMeta && (title || description)}
      <Layout type='object-field-meta' {config} {errors}>
        {#if title}
          <Layout type='object-field-title-row' {config} {errors}>
            <Title {templateType} {title} {config} {errors} />
            {@render action?.()}
          </Layout>
        {/if}
        {#if description}
          <Description {templateType} {description} {config} {errors} />
        {/if}
      </Layout>
    {/if}
    {@render content()}
  {:else}
    <Accordion {config} {errors}>
      {#snippet summary()}
        {#if title}
          <Title {templateType} {title} {config} {errors} />
        {/if}
      {/snippet}
      {#if showMeta && description}
        <Layout type='object-field-meta' {config} {errors}>
          {@render action?.()}
          {#if description}
            <Description {templateType} {description} {config} {errors} />
          {/if}
        </Layout>
      {/if}
      {@render content()}
    </Accordion>
  {/if}
</Layout>
