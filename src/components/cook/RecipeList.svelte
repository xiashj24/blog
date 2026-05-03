<script lang="ts">
  import type { RecipeSummary, Language } from '../../lib/cook-types';
  import type { Glossary } from '../../lib/glossary';
  import { translate } from '../../lib/glossary';
  import { i18n } from '../../lib/i18n';
  import { mergeShoppingList, scaleIngredientQuantity } from '../../lib/recipes';
  import LanguageSwitcher from './LanguageSwitcher.svelte';

  interface Props {
    recipes: RecipeSummary[];
    glossary: Glossary;
  }

  const { recipes, glossary }: Props = $props();

  let lang = $state<Language>('ja');
  let filterText = $state('');
  let selected = $state<Set<string>>(new Set());
  let listServings = $state<Record<string, number>>({});
  let showShoppingList = $state(false);
  let copied = $state(false);

  const t = $derived(i18n[lang]);

  const allIngredientNames = $derived(
    [...new Set(recipes.flatMap((r) => r.ingredients.map((i) => i.name.toLowerCase())))]
      .sort()
  );

  const filterTerms = $derived(
    filterText
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean)
  );

  function ingredientNames(name: string): string[] {
    return [
      name.toLowerCase(),
      translate(name, 'en', glossary).toLowerCase(),
      translate(name, 'zh', glossary).toLowerCase(),
      translate(name, 'ja', glossary).toLowerCase(),
    ];
  }

  const filtered = $derived(
    filterTerms.length === 0
      ? recipes
      : recipes.filter((r) =>
          filterTerms.every((term) =>
            r.ingredients.some((i) =>
              ingredientNames(i.name).some((n) => n.includes(term))
            )
          )
        )
  );

  const selectedRecipes = $derived(recipes.filter((r) => selected.has(r.slug)));

  const shoppingList = $derived(
    mergeShoppingList(
      selectedRecipes.map((r) => ({
        ...r,
        ingredients: r.ingredients.map((ing) => ({
          ...ing,
          quantity: scaleIngredientQuantity(
            ing.quantity,
            r.servings,
            listServings[r.slug] ?? 1
          ),
        })),
      }))
    )
  );

  function toggleSelect(slug: string) {
    const next = new Set(selected);
    if (next.has(slug)) {
      next.delete(slug);
      const { [slug]: _, ...rest } = listServings;
      listServings = rest;
    } else {
      next.add(slug);
      listServings = { ...listServings, [slug]: 1 };
    }
    selected = next;
  }

  function setListServings(slug: string, n: number) {
    listServings = { ...listServings, [slug]: Math.max(1, n) };
  }

  function formatQty(quantity: number | string, units: string): string {
    if (quantity === 'to taste' || units === '') return String(quantity);
    return `${quantity}${units ? ' ' + units : ''}`;
  }

  async function copyList() {
    const text = shoppingList
      .map((i) => {
        const name = translate(i.name, lang, glossary);
        return `- ${name}: ${formatQty(i.quantity, i.units)}`;
      })
      .join('\n');
    await navigator.clipboard.writeText(text);
    copied = true;
    setTimeout(() => (copied = false), 2000);
  }
</script>

<!-- Top bar -->
<div class="flex items-center justify-between mb-6 gap-3 flex-wrap">
  <h1 class="text-2xl font-bold text-gray-900 m-0">{t.recipes}</h1>
  <LanguageSwitcher {lang} onchange={(l) => (lang = l)} />
</div>

<!-- Filter -->
<div class="mb-6">
  <div class="flex gap-2 items-center">
    <input
      type="text"
      bind:value={filterText}
      placeholder={t.filterPlaceholder}
      class="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
    {#if filterText}
      <button
        onclick={() => (filterText = '')}
        class="px-3 py-2 text-sm text-gray-500 hover:text-gray-800"
      >
        {t.clearFilter}
      </button>
    {/if}
  </div>
</div>

<!-- Recipe grid -->
{#if filtered.length === 0}
  <p class="text-gray-500 text-center py-12">{t.noResults}</p>
{:else}
  <div class="grid gap-4 sm:grid-cols-2">
    {#each filtered as recipe (recipe.slug)}
      {@const isSelected = selected.has(recipe.slug)}
      <div
        class="rounded-xl border-2 transition-colors cursor-pointer
               {isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white hover:border-gray-300'}"
        onclick={() => toggleSelect(recipe.slug)}
        role="checkbox"
        aria-checked={isSelected}
        tabindex="0"
        onkeydown={(e) => e.key === ' ' || e.key === 'Enter' ? toggleSelect(recipe.slug) : null}
      >
        <!-- Recipe image -->
        {#if recipe.image}
          <img
            src={`/recipes/images/${recipe.image}`}
            alt={recipe.name}
            class="w-full h-40 object-cover rounded-t-xl"
          />
        {:else}
          <div class="w-full h-40 bg-gradient-to-br from-orange-100 to-amber-50 rounded-t-xl flex items-center justify-center">
            <span class="text-4xl">🍳</span>
          </div>
        {/if}

        <div class="p-4">
          <div class="flex items-start justify-between gap-2 mb-1">
            <a
              href={`/cook/${recipe.slug}`}
              class="font-semibold text-gray-900 hover:text-blue-600 no-underline text-lg leading-tight"
              onclick={(e) => e.stopPropagation()}
            >
              {recipe.name}
            </a>
            <div
              class="w-5 h-5 rounded border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-colors
                     {isSelected ? 'bg-blue-600 border-blue-600' : 'border-gray-400'}"
            >
              {#if isSelected}
                <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                </svg>
              {/if}
            </div>
          </div>

          {#if recipe.description}
            <p class="text-sm text-gray-600 mb-3 line-clamp-2 m-0">{recipe.description}</p>
          {/if}

          <div class="flex flex-wrap gap-1">
            {#each recipe.tags as tag}
              <span class="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">{tag}</span>
            {/each}
          </div>

          <div class="mt-2 text-xs text-gray-400">
            {recipe.ingredients.map((i) => translate(i.name, lang, glossary)).join(', ')}
          </div>
        </div>
      </div>
    {/each}
  </div>
{/if}

<!-- Shopping list bottom bar -->
{#if selected.size > 0}
  <div class="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-blue-500 shadow-lg z-50">
    <div class="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
      <span class="font-medium text-gray-800">{t.selectedCount(selected.size)}</span>
      <div class="flex gap-2">
        <button
          onclick={() => (selected = new Set())}
          class="px-3 py-2 text-sm text-gray-500 hover:text-gray-800"
        >
          {t.clearFilter}
        </button>
        <button
          onclick={() => (showShoppingList = true)}
          class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
        >
          {t.shoppingList}
        </button>
      </div>
    </div>
  </div>

  <!-- Spacer so content isn't hidden behind bar -->
  <div class="h-20"></div>
{/if}

<!-- Shopping list modal -->
{#if showShoppingList}
  <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
  <div
    class="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
    onclick={() => (showShoppingList = false)}
  >
    <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t.shoppingList}
      tabindex="-1"
      class="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl max-h-[85vh] flex flex-col"
      onclick={(e) => e.stopPropagation()}
      onkeydown={(e) => e.key === 'Escape' && (showShoppingList = false)}
    >
      <div class="flex items-center justify-between px-5 py-4 border-b gap-3">
        <div class="text-lg font-semibold min-w-0">{t.shoppingList}</div>
        <div class="flex gap-2 flex-shrink-0">
          <button
            onclick={copyList}
            class="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 whitespace-nowrap"
          >
            {copied ? t.copied : t.copyList}
          </button>
          <button
            onclick={() => (showShoppingList = false)}
            class="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-800 whitespace-nowrap"
          >
            {t.close}
          </button>
        </div>
      </div>

      <!-- Per-recipe serving controls -->
      <div class="px-5 py-3 border-b divide-y divide-gray-100">
        {#each selectedRecipes as recipe}
          <div class="py-2 flex items-center justify-between gap-3">
            <span class="text-sm text-gray-700 min-w-0 truncate">{recipe.name}</span>
            <div class="flex items-center gap-1 flex-shrink-0">
              <button
                onclick={() => setListServings(recipe.slug, (listServings[recipe.slug] ?? 1) - 1)}
                class="w-7 h-7 rounded-full border border-gray-300 bg-white text-gray-700 flex items-center justify-center hover:bg-gray-50"
              >−</button>
              <span class="w-6 text-center text-sm">{listServings[recipe.slug] ?? 1}</span>
              <button
                onclick={() => setListServings(recipe.slug, (listServings[recipe.slug] ?? 1) + 1)}
                class="w-7 h-7 rounded-full border border-gray-300 bg-white text-gray-700 flex items-center justify-center hover:bg-gray-50"
              >+</button>
              <span class="text-xs text-gray-400 ml-1">{t.servings}</span>
            </div>
          </div>
        {/each}
      </div>

      <!-- Merged ingredient list -->
      <ul class="overflow-y-auto px-5 py-3 flex-1 divide-y divide-gray-100">
        {#each shoppingList as item}
          <li class="py-3 flex justify-between items-baseline">
            <span>{translate(item.name, lang, glossary)}</span>
            <span class="text-gray-500 text-sm ml-4">{formatQty(item.quantity, item.units)}</span>
          </li>
        {/each}
      </ul>
    </div>
  </div>
{/if}
