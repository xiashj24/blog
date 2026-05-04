<script lang="ts">
  interface MediaItem {
    slug: string;
    title: string;
    type: 'movie' | 'book' | 'game';
    status: 'completed' | 'dropped';
    date: string; // ISO string
    coverSrc: string | null;
    tags: string[];
    author: string | null;
    director: string | null;
    year: number | null;
    platform: string | null;
  }

  interface Props {
    items: MediaItem[];
  }

  const { items }: Props = $props();

  type FilterType = 'all' | 'movie' | 'book' | 'game';
  let activeFilter = $state<FilterType>('all');
  let activeYearMonth = $state<string | null>(null);

  const filtered = $derived(
    items.filter((item) => {
      const typeMatch = activeFilter === 'all' || item.type === activeFilter;
      if (!typeMatch) return false;
      if (activeYearMonth) {
        const d = new Date(item.date);
        const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        return ym === activeYearMonth;
      }
      return true;
    })
  );

  const yearMonthIndex = $derived(() => {
    const index = new Map<number, Set<number>>();
    const source = activeFilter === 'all' ? items : items.filter((i) => i.type === activeFilter);
    for (const item of source) {
      const d = new Date(item.date);
      const y = d.getFullYear();
      const m = d.getMonth() + 1;
      if (!index.has(y)) index.set(y, new Set());
      index.get(y)!.add(m);
    }
    return index;
  });

  const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  function formatYM(ym: string): string {
    const [y, m] = ym.split('-');
    return `${MONTH_NAMES[parseInt(m) - 1]} ${y}`;
  }

  function toggleYearMonth(ym: string) {
    activeYearMonth = activeYearMonth === ym ? null : ym;
  }

  const TYPE_LABELS: Record<string, string> = { movie: 'Movie', book: 'Book', game: 'Game' };
  const TYPE_ICONS: Record<string, string> = { movie: '🎬', book: '📚', game: '🎮' };
</script>

<div style="display: flex; gap: 1.5rem; align-items: flex-start;">
  <!-- Sidebar -->
  <aside style="width: 9rem; flex-shrink: 0; position: sticky; top: 1.5rem;">
    <div class="sidebar-label">Filter</div>
    <div style="display: flex; flex-direction: column; gap: 0.25rem; margin-bottom: 1.5rem;">
      {#each (['all', 'movie', 'book', 'game'] as FilterType[]) as ft}
        <button
          onclick={() => { activeFilter = ft; activeYearMonth = null; }}
          class="filter-btn {activeFilter === ft ? 'filter-btn--active' : ''}"
        >
          {ft === 'all' ? 'All' : `${TYPE_ICONS[ft]} ${TYPE_LABELS[ft]}`}
        </button>
      {/each}
    </div>

    <div class="sidebar-label">By Month</div>
    {#each [...yearMonthIndex()].sort((a, b) => b[0] - a[0]) as [year, months]}
      <div style="margin-bottom: 0.75rem;">
        <div class="year-label">{year}</div>
        <div style="display: flex; flex-direction: column; gap: 0.125rem;">
          {#each [...months].sort((a, b) => b - a) as month}
            {@const ym = `${year}-${String(month).padStart(2, '0')}`}
            <button
              onclick={() => toggleYearMonth(ym)}
              class="month-btn {activeYearMonth === ym ? 'month-btn--active' : ''}"
            >
              {MONTH_NAMES[month - 1]}
            </button>
          {/each}
        </div>
      </div>
    {/each}
  </aside>

  <!-- Timeline -->
  <div style="flex: 1; min-width: 0;">
    {#if activeYearMonth}
      <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem;">
        <h2 style="font-size: 1.125rem; font-weight: 600; margin: 0;">{formatYM(activeYearMonth)}</h2>
        <button onclick={() => (activeYearMonth = null)} class="clear-btn">× clear</button>
      </div>
    {/if}

    {#if filtered.length === 0}
      <p style="color: rgb(var(--gray)); text-align: center; padding: 3rem 0;">Nothing here yet.</p>
    {:else}
      <div style="display: flex; flex-direction: column; gap: 1rem;">
        {#each filtered as item (item.slug)}
          <a href={`/media/${item.slug}`} class="media-card">
            <!-- Cover -->
            <div class="media-cover">
              {#if item.coverSrc}
                <img src={item.coverSrc} alt={item.title} style="width: 100%; height: 100%; object-fit: cover;" loading="lazy" />
              {:else}
                <span style="font-size: 1.5rem;">{TYPE_ICONS[item.type]}</span>
              {/if}
            </div>

            <!-- Info -->
            <div style="flex: 1; min-width: 0;">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 0.5rem;">
                <h3 class="media-title">{item.title}</h3>
                <span class="media-date">
                  {new Date(item.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </span>
              </div>

              <div style="display: flex; align-items: center; flex-wrap: wrap; gap: 0.375rem; margin-top: 0.25rem;">
                <span class="type-badge">
                  {TYPE_ICONS[item.type]} {TYPE_LABELS[item.type]}
                </span>
                {#if item.status === 'dropped'}
                  <span class="dropped-badge">Dropped</span>
                {/if}
              </div>

              {#if item.author}
                <p class="media-meta">by {item.author}</p>
              {:else if item.director}
                <p class="media-meta">dir. {item.director}{item.year ? ` (${item.year})` : ''}</p>
              {:else if item.platform}
                <p class="media-meta">on {item.platform}</p>
              {/if}

              {#if item.tags.length > 0}
                <div style="display: flex; flex-wrap: wrap; gap: 0.25rem; margin-top: 0.5rem;">
                  {#each item.tags as tag}
                    <span class="tag">{tag}</span>
                  {/each}
                </div>
              {/if}
            </div>
          </a>
        {/each}
      </div>
    {/if}
  </div>
</div>

<style>
  .sidebar-label {
    font-size: 0.7rem;
    font-weight: 600;
    color: rgb(var(--gray));
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 0.5rem;
  }

  .filter-btn {
    text-align: left;
    padding: 0.375rem 0.75rem;
    border-radius: 0.5rem;
    font-size: 0.875rem;
    font-weight: 500;
    border: none;
    cursor: pointer;
    background: transparent;
    color: rgb(var(--black));
    transition: background 0.15s;
  }

  .filter-btn:hover {
    background: rgba(var(--gray-light), 1);
  }

  .filter-btn--active {
    background: var(--accent);
    color: white;
  }

  .filter-btn--active:hover {
    background: var(--accent);
  }

  .year-label {
    font-size: 0.875rem;
    font-weight: 600;
    color: rgb(var(--black));
    margin-bottom: 0.25rem;
  }

  .month-btn {
    text-align: left;
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
    font-size: 0.75rem;
    border: none;
    cursor: pointer;
    background: transparent;
    color: rgb(var(--gray));
    transition: color 0.15s, background 0.15s;
  }

  .month-btn:hover {
    color: rgb(var(--black));
    background: rgba(var(--gray-light), 1);
  }

  .month-btn--active {
    background: rgba(var(--accent-dark), 0.1);
    color: var(--accent-dark);
    font-weight: 500;
  }

  .clear-btn {
    font-size: 0.75rem;
    color: rgb(var(--gray));
    border: none;
    background: none;
    cursor: pointer;
    padding: 0 0.25rem;
  }

  .clear-btn:hover {
    color: rgb(var(--black));
  }

  .media-card {
    display: flex;
    gap: 1rem;
    border-radius: 0.75rem;
    border: 1px solid rgba(var(--gray-light), 1);
    background: white;
    padding: 1rem;
    text-decoration: none;
    color: inherit;
    transition: border-color 0.15s, box-shadow 0.15s;
  }

  .media-card:hover {
    border-color: rgba(var(--gray), 0.4);
    box-shadow: 0 1px 4px rgba(var(--black), 0.06);
  }

  .media-cover {
    flex-shrink: 0;
    width: 4rem;
    height: 6rem;
    border-radius: 0.5rem;
    overflow: hidden;
    background: rgba(var(--gray-light), 1);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .media-title {
    font-size: 1rem;
    font-weight: 600;
    color: rgb(var(--black));
    margin: 0;
    line-height: 1.3;
  }

  .media-card:hover .media-title {
    color: var(--accent);
  }

  .media-date {
    font-size: 0.75rem;
    color: rgb(var(--gray));
    flex-shrink: 0;
    margin-top: 0.125rem;
  }

  .type-badge {
    font-size: 0.7rem;
    padding: 0.125rem 0.5rem;
    background: rgba(var(--gray-light), 1);
    color: rgb(var(--gray));
    border-radius: 9999px;
  }

  .dropped-badge {
    font-size: 0.7rem;
    padding: 0.125rem 0.5rem;
    background: #fee2e2;
    color: #dc2626;
    border-radius: 9999px;
  }

  .media-meta {
    font-size: 0.875rem;
    color: rgb(var(--gray));
    margin: 0.25rem 0 0;
  }

  .tag {
    font-size: 0.7rem;
    padding: 0.125rem 0.375rem;
    background: transparent;
    border: 1px solid rgba(var(--gray-light), 1);
    color: rgb(var(--gray));
    border-radius: 0.25rem;
  }
</style>
