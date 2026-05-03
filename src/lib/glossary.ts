import type { Language } from './cook-types';

export type GlossaryEntry = { en: string; zh: string; ja: string };
export type Glossary = Record<string, GlossaryEntry>;

export const glossary: Glossary = {
  'rice': { en: 'rice', zh: '米', ja: '米' },
  'soy sauce': { en: 'soy sauce', zh: '酱油', ja: '醤油' },
  'eggs': { en: 'eggs', zh: '鸡蛋', ja: '卵' },
  'egg': { en: 'egg', zh: '鸡蛋', ja: '卵' },
  'oil': { en: 'oil', zh: '食用油', ja: '食用油' },
  'cooking oil': { en: 'cooking oil', zh: '食用油', ja: '食用油' },
  'olive oil': { en: 'olive oil', zh: '橄榄油', ja: 'オリーブオイル' },
  'salt': { en: 'salt', zh: '盐', ja: '塩' },
  'pepper': { en: 'pepper', zh: '胡椒', ja: 'こしょう' },
  'garlic': { en: 'garlic', zh: '大蒜', ja: 'にんにく' },
  'onion': { en: 'onion', zh: '洋葱', ja: '玉ねぎ' },
  'tomato': { en: 'tomato', zh: '番茄', ja: 'トマト' },
  'tomatoes': { en: 'tomatoes', zh: '番茄', ja: 'トマト' },
  'pasta': { en: 'pasta', zh: '意大利面', ja: 'パスタ' },
  'basil': { en: 'basil', zh: '罗勒', ja: 'バジル' },
  'butter': { en: 'butter', zh: '黄油', ja: 'バター' },
  'sugar': { en: 'sugar', zh: '糖', ja: '砂糖' },
  'water': { en: 'water', zh: '水', ja: '水' },
  'chicken': { en: 'chicken', zh: '鸡肉', ja: '鶏肉' },
  'pork': { en: 'pork', zh: '猪肉', ja: '豚肉' },
  'beef': { en: 'beef', zh: '牛肉', ja: '牛肉' },
  'tofu': { en: 'tofu', zh: '豆腐', ja: '豆腐' },
  'miso': { en: 'miso', zh: '味噌', ja: '味噌' },
  'dashi': { en: 'dashi', zh: '出汁', ja: '出汁' },
  'mirin': { en: 'mirin', zh: '味醂', ja: 'みりん' },
  'sake': { en: 'sake', zh: '料酒', ja: '酒' },
  'sesame oil': { en: 'sesame oil', zh: '芝麻油', ja: 'ごま油' },
  'green onion': { en: 'green onion', zh: '葱', ja: 'ネギ' },
  'scallion': { en: 'scallion', zh: '葱', ja: '葱' },
  'ginger': { en: 'ginger', zh: '生姜', ja: '生姜' },
  'oyster sauce': { en: 'oyster sauce', zh: '蚝油', ja: 'オイスターソース' },
  'wakame': {en: 'wakame', zh: '海带', ja: 'ワカメ'},
};

export function translate(name: string, lang: Language, g: Glossary = glossary): string {
  const key = name.toLowerCase().trim();
  const direct = g[key];
  if (direct) return direct[lang] ?? name;
  const entry = Object.values(g).find((e) =>
    Object.values(e).some((v) => v?.toLowerCase() === key)
  );
  return entry?.[lang] ?? name;
}
