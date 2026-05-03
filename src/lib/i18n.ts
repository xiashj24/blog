import type { Language } from './cook-types';

type I18nStrings = {
  recipes: string;
  filterPlaceholder: string;
  shoppingList: string;
  servings: string;
  ingredients: string;
  steps: string;
  noResults: string;
  selectedCount: (n: number) => string;
  clearFilter: string;
  close: string;
  copyList: string;
  copied: string;
  tags: string;
  baseServings: string;
};

export const i18n: Record<Language, I18nStrings> = {
  en: {
    recipes: 'Recipes',
    filterPlaceholder: 'Filter by ingredient…',
    shoppingList: 'Shopping List',
    servings: 'servings',
    ingredients: 'Ingredients',
    steps: 'Steps',
    noResults: 'No recipes match your filter.',
    selectedCount: (n) => `${n} recipe${n === 1 ? '' : 's'} selected`,
    clearFilter: 'Clear',
    close: 'Close',
    copyList: 'Copy list',
    copied: 'Copied!',
    tags: 'Tags',
    baseServings: 'Base servings',
  },
  zh: {
    recipes: '食谱',
    filterPlaceholder: '按食材筛选…',
    shoppingList: '购物清单',
    servings: '人份',
    ingredients: '食材',
    steps: '步骤',
    noResults: '没有符合条件的食谱。',
    selectedCount: (n) => `已选 ${n} 个食谱`,
    clearFilter: '清除',
    close: '关闭',
    copyList: '复制清单',
    copied: '已复制！',
    tags: '标签',
    baseServings: '基础份量',
  },
  ja: {
    recipes: 'レシピ',
    filterPlaceholder: '材料で絞り込む…',
    shoppingList: '買い物リスト',
    servings: '人前',
    ingredients: '材料',
    steps: '手順',
    noResults: '該当するレシピがありません。',
    selectedCount: (n) => `${n}品選択中`,
    clearFilter: 'クリア',
    close: '閉じる',
    copyList: 'リストをコピー',
    copied: 'コピーしました！',
    tags: 'タグ',
    baseServings: '基準の分量',
  },
};
