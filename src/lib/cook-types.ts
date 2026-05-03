export type Language = 'en' | 'zh' | 'ja';

export interface TokenText {
  type: 'text';
  value: string;
}

export interface TokenIngredient {
  type: 'ingredient';
  name: string;
  quantity: number | string;
  units: string;
}

export interface TokenCookware {
  type: 'cookware';
  name: string;
  quantity: number | string;
}

export interface TokenTimer {
  type: 'timer';
  name: string;
  quantity: number | string;
  units: string;
}

export type StepToken = TokenText | TokenIngredient | TokenCookware | TokenTimer;

export interface RecipeIngredient {
  type: 'ingredient';
  name: string;
  quantity: number | string;
  units: string;
}

export interface RecipeSummary {
  slug: string;
  name: string;
  description: string;
  servings: number;
  image?: string;
  tags: string[];
  ingredients: RecipeIngredient[];
}

export interface RecipeDetail extends RecipeSummary {
  steps: StepToken[][];
}
