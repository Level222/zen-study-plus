<script lang='ts'>
  import { CircleCheck } from '@lucide/svelte';
  import { theme } from '@sjsf/basic-theme';
  import { BasicForm, createForm, ON_CHANGE } from '@sjsf/form';
  import { createFormIdBuilder } from '@sjsf/form/id-builders/modern';
  import { fromRecord, overrideByRecord } from '@sjsf/form/lib/resolver';
  import { createFormMerger } from '@sjsf/form/mergers/modern';
  import { resolver } from '@sjsf/form/resolvers/basic';
  import { translation } from '@sjsf/form/translations/en';
  import { adapt } from '@sjsf/zod4-validator/classic';
  import { UserOptions } from '../../utils/sync-options';
  import Accordion from './Accordion.svelte';
  import ObjectTemplate from './ObjectTemplate.svelte';
  import optionsFormUiSchema from './options-form-ui-schema';
  import Title from './Title.svelte';

  export type OptionsFormProps = {
    initialOptions: UserOptions;
    onSubmit: (value: UserOptions) => void;
  };

  const { initialOptions, onSubmit }: OptionsFormProps = $props();

  let savedTimeoutId = $state<number | undefined>(undefined);

  const form = createForm({
    ...adapt(UserOptions),
    resolver,
    idBuilder: createFormIdBuilder,
    merger: createFormMerger,
    translation,
    theme: overrideByRecord(theme, {
      objectTemplate: ObjectTemplate,
      title: Title,
      accordion: Accordion,
    }),
    uiSchema: optionsFormUiSchema,
    fieldsValidationMode: ON_CHANGE,
    fieldsValidationDebounceMs: 100,
    extraUiOptions: fromRecord({
      submitButton: {
        get class() {
          return `sjsf-submit-button ${savedTimeoutId ? 'outline' : ''}`;
        },
      },
    }),
    icons: fromRecord({
      submit: submitContent,
    }),
    initialValue: initialOptions,
    onSubmit: (value) => {
      clearTimeout(savedTimeoutId);

      savedTimeoutId = setTimeout(() => {
        savedTimeoutId = undefined;
      }, 3000);

      onSubmit(value);
    },
  });
</script>

{#snippet submitContent()}
  {#if savedTimeoutId}
    <CircleCheck size='1.25rem' /> 保存しました
  {:else}
    保存する
  {/if}
{/snippet}

<div class='form'>
  <BasicForm {form} novalidate />
</div>

<style>
  .form :global {
    .sjsf-accordion > .sjsf-layout[data-layout="object-properties"] {
      margin-top: calc(var(--pico-spacing) * 0.5);
      margin-left: calc(var(--pico-spacing) * 0.25);
      padding-left: var(--pico-spacing);
      border-left: 1px solid var(--pico-accordion-border-color);
    }

    .sjsf-submit-button {
      position: sticky;
      bottom: calc(var(--pico-spacing) * 0.5);

      display: inline-flex;
      gap: calc(var(--pico-spacing) * 0.3);
      align-items: center;
      justify-content: center;

      padding: var(--pico-form-element-spacing-vertical) var(--pico-form-element-spacing-horizontal);

      &.outline {
        background-color: var(--document-background-color);
      }
    }
  }
</style>
