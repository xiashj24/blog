<script lang="ts">
  import type { RecipeDetail, Language, StepToken } from '../../lib/cook-types';
  import type { Glossary } from '../../lib/glossary';
  import { translate } from '../../lib/glossary';
  import { i18n } from '../../lib/i18n';
  import { scaleIngredientQuantity } from '../../lib/recipes';
  import LanguageSwitcher from './LanguageSwitcher.svelte';

  interface Props {
    recipe: RecipeDetail;
    glossary: Glossary;
  }

  const { recipe, glossary }: Props = $props();

  let lang = $state<Language>('ja');
  const baseServings = recipe.servings;
  let servings = $state(baseServings);

  const t = $derived(i18n[lang]);

  function formatQty(quantity: number | string, units: string): string {
    const scaled = scaleIngredientQuantity(quantity, baseServings, servings);
    if (scaled === 'to taste' || units === '') return String(scaled);
    return `${scaled}${units ? ' ' + units : ''}`;
  }

  function tokenText(token: StepToken): string {
    if (token.type === 'ingredient') return token.name;
    if (token.type === 'cookware') return token.name;
    if (token.type === 'timer') return `${token.quantity}${token.units ? ' ' + token.units : ''}`;
    return token.value;
  }

  function scaledIngredientLabel(token: StepToken & { type: 'ingredient' }): string {
    const qty = scaleIngredientQuantity(token.quantity, baseServings, servings);
    const name = translate(token.name, lang, glossary);
    if (qty === 'to taste' || token.units === '') return `${name}${qty !== '' ? ' (' + qty + ')' : ''}`;
    return `${name} (${qty}${token.units ? ' ' + token.units : ''})`;
  }
</script>

<div class="pb-8">
  <!-- Top bar -->
  <div class="flex items-center justify-between mb-6 gap-3 flex-wrap">
    <a href="/cook" class="text-sm text-blue-600 hover:underline">← {t.recipes}</a>
    <LanguageSwitcher {lang} onchange={(l) => (lang = l)} />
  </div>

  <!-- Ingredients panel -->
  <div class="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-8">
    <div class="flex items-center justify-between mb-4 flex-wrap gap-3">
      <div class="text-lg font-semibold">{t.ingredients}</div>
      <!-- Serving scaler -->
      <div class="flex items-center gap-3">
        <span class="text-sm text-gray-600">{t.servings}:</span>
        <div class="flex items-center gap-1">
          <button
            onclick={() => (servings = Math.max(1, servings - 1))}
            class="w-8 h-8 rounded-full border border-gray-300 bg-white text-gray-700 text-lg leading-none hover:bg-gray-50 flex items-center justify-center font-medium"
            aria-label="decrease servings"
          >−</button>
          <span class="w-8 text-center font-semibold text-lg">{servings}</span>
          <button
            onclick={() => (servings = servings + 1)}
            class="w-8 h-8 rounded-full border border-gray-300 bg-white text-gray-700 text-lg leading-none hover:bg-gray-50 flex items-center justify-center font-medium"
            aria-label="increase servings"
          >+</button>
        </div>
      </div>
    </div>

    <ul class="divide-y divide-amber-200">
      {#each recipe.ingredients as ing}
        <li class="py-2 flex justify-between items-baseline">
          <span>{translate(ing.name, lang, glossary)}</span>
          <span class="text-gray-600 text-sm ml-4">{formatQty(ing.quantity, ing.units)}</span>
        </li>
      {/each}
    </ul>
  </div>

  <!-- Steps -->
  <div class="text-lg font-semibold mb-4">{t.steps}</div>
  <ol class="space-y-5">
    {#each recipe.steps as step, i}
      <li class="flex gap-4">
        <span class="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white text-sm font-bold flex items-center justify-center">
          {i + 1}
        </span>
        <p class="m-0 pt-1 text-gray-800 leading-relaxed">
          {#each step as token}
            {#if token.type === 'ingredient'}
              <span
                class="inline-block px-1.5 py-0.5 rounded bg-green-100 text-green-800 font-medium text-[0.95em]"
                title={scaledIngredientLabel(token)}
              >{translate(token.name, lang, glossary)}</span>
            {:else if token.type === 'cookware'}
              <span class="inline-block px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-medium text-[0.95em]"
              >{token.name}</span>
            {:else if token.type === 'timer'}
              <span class="inline-block px-1.5 py-0.5 rounded bg-orange-100 text-orange-700 font-medium text-[0.95em]"
              >⏱ {token.quantity}{token.units ? ' ' + token.units : ''}</span>
            {:else}
              {token.value}
            {/if}
          {/each}
        </p>
      </li>
    {/each}
  </ol>
</div>
