import { Recipe } from '@cooklang/cooklang-ts';
import type { RecipeDetail, RecipeSummary, RecipeIngredient, StepToken } from './cook-types';

const cookFiles = import.meta.glob<string>('/src/content/recipes/*.cook', {
  query: '?raw',
  import: 'default',
});

function parseFile(path: string, content: string): RecipeDetail {
  const recipe = new Recipe(content);
  const slug = path.split('/').pop()!.replace('.cook', '');

  const steps = recipe.steps.map((step) => step as unknown as StepToken[]);
  const ingredients = recipe.ingredients as unknown as RecipeIngredient[];

  return {
    slug,
    name: recipe.metadata['name'] ?? slug,
    description: recipe.metadata['description'] ?? '',
    servings: parseInt(recipe.metadata['servings'] ?? '2', 10),
    image: recipe.metadata['image'] as string | undefined,
    tags: recipe.metadata['tags']
      ? recipe.metadata['tags'].split(',').map((t: string) => t.trim())
      : [],
    steps,
    ingredients,
  };
}

export async function getAllRecipes(): Promise<RecipeSummary[]> {
  const results = await Promise.all(
    Object.entries(cookFiles).map(async ([path, load]) => {
      const content = await load();
      const detail = parseFile(path, content);
      const { steps: _steps, ...summary } = detail;
      return summary as RecipeSummary;
    })
  );
  return results.sort((a, b) => a.name.localeCompare(b.name));
}

export async function getAllRecipeDetails(): Promise<RecipeDetail[]> {
  const results = await Promise.all(
    Object.entries(cookFiles).map(async ([path, load]) => {
      const content = await load();
      return parseFile(path, content);
    })
  );
  return results;
}

export function mergeShoppingList(
  recipes: RecipeSummary[]
): { name: string; quantity: number | string; units: string }[] {
  const map = new Map<string, { name: string; quantity: number | string; units: string }>();

  for (const recipe of recipes) {
    for (const ing of recipe.ingredients) {
      const key = `${ing.name.toLowerCase().trim()}||${ing.units}`;
      const existing = map.get(key);
      if (existing) {
        if (typeof existing.quantity === 'number' && typeof ing.quantity === 'number') {
          map.set(key, { ...existing, quantity: existing.quantity + ing.quantity });
        }
      } else {
        map.set(key, { name: ing.name, quantity: ing.quantity, units: ing.units });
      }
    }
  }

  return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
}

export function scaleIngredientQuantity(
  quantity: number | string,
  baseServings: number,
  targetServings: number
): number | string {
  if (typeof quantity !== 'number') return quantity;
  const scaled = (quantity / baseServings) * targetServings;
  return Math.round(scaled * 100) / 100;
}
