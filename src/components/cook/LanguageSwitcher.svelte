<script lang="ts">
  import type { Language } from '../../lib/cook-types';

  interface Props {
    lang: Language;
    onchange: (lang: Language) => void;
  }

  const { lang, onchange }: Props = $props();

  const langs: { code: Language; label: string }[] = [
    { code: 'ja', label: '日' },
    { code: 'zh', label: '中' },
    { code: 'en', label: 'EN' },
  ];
</script>

<div class="flex gap-1">
  {#each langs as l}
    <button
      onclick={() => onchange(l.code)}
      class="px-2 py-1 rounded text-sm font-medium transition-colors
             {lang === l.code
               ? 'bg-blue-600 text-white'
               : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}"
      aria-pressed={lang === l.code}
    >
      {l.label}
    </button>
  {/each}
</div>
