<script lang="ts">
  interface MediaItem {
    slug: string;
    title: string;
    type: 'movie' | 'book' | 'game' | 'album' | 'live';
    status: 'completed' | 'interested';
    date: string; // ISO string
    coverSrc: string | null;
    tags: string[];
    author: string | null;
    director: string | null;
    year: number | null;
    platform: string | null;
    artist: string | null;
    venue: string | null;
    artists: string[] | null;
  }

  interface Props {
    items: MediaItem[];
  }

  const { items }: Props = $props();

  type FilterType = 'all' | 'movie' | 'book' | 'game' | 'album' | 'live';
  let activeFilter = $state<FilterType>('all');
  let activeYearMonth = $state<string | null>(null);
  let activeYear = $state<number | null>(null);
  let activeTag = $state<string | null>(null);
  let activeStatus = $state<string | null>(null);

  const filtered = $derived(
    items.filter((item) => {
      const typeMatch = activeFilter === 'all' || item.type === activeFilter;
      if (!typeMatch) return false;
      if (activeStatus && item.status !== activeStatus) return false;
      if (activeTag && !item.tags.includes(activeTag)) return false;
      const d = new Date(item.date);
      if (activeYearMonth) {
        const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        return ym === activeYearMonth;
      }
      if (activeYear && d.getFullYear() !== activeYear) return false;
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

  const tagIndex = $derived(() => {
    const source = activeFilter === 'all' ? items : items.filter((i) => i.type === activeFilter);
    const tags = new Set<string>();
    for (const item of source) for (const tag of item.tags) tags.add(tag);
    return [...tags].sort();
  });

  const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  function formatYM(ym: string): string {
    const [y, m] = ym.split('-');
    return `${MONTH_NAMES[parseInt(m) - 1]} ${y}`;
  }

  function toggleYear(y: number) {
    if (activeYear === y) { activeYear = null; }
    else { activeYear = y; activeYearMonth = null; }
  }

  function toggleYearMonth(ym: string) {
    if (activeYearMonth === ym) { activeYearMonth = null; }
    else { activeYearMonth = ym; activeYear = null; }
  }

  const TYPE_LABELS: Record<string, string> = { movie: 'Movie', book: 'Book', game: 'Game', album: 'Album', live: 'Live' };
  const TYPE_ICONS: Record<string, string> = { movie: '🎬', book: '📚', game: '🎮', album: '🎵', live: '🎤' };

  let filtersOpen = $state(false);
</script>

<div class="shelf-layout">
  <!-- Sidebar -->
  <button class="filters-toggle" onclick={() => filtersOpen = !filtersOpen}>
    Filters {filtersOpen ? '▲' : '▼'}
  </button>
  <aside class="shelf-sidebar" class:shelf-sidebar--open={filtersOpen}>
    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.5rem;">
      <div class="sidebar-label" style="margin-bottom: 0;">Filter</div>
      {#if activeFilter !== 'all' || activeStatus || activeTag || activeYear || activeYearMonth}
        <button
          onclick={() => { activeFilter = 'all'; activeStatus = null; activeTag = null; activeYear = null; activeYearMonth = null; }}
          class="clear-btn"
        >× clear all</button>
      {/if}
    </div>
    <div style="display: flex; flex-direction: column; gap: 0.25rem; margin-bottom: 1.5rem;">
      {#each (['all', 'movie', 'book', 'game', 'album', 'live'] as FilterType[]) as ft}
        <button
          onclick={() => { activeFilter = ft; activeYearMonth = null; activeYear = null; activeTag = null; activeStatus = null; }}
          class="filter-btn {activeFilter === ft ? 'filter-btn--active' : ''}"
        >
          {ft === 'all' ? 'All' : `${TYPE_ICONS[ft]} ${TYPE_LABELS[ft]}`}
        </button>
      {/each}
    </div>

    <div class="sidebar-label" style="margin-top: 1rem;">By Status</div>
    <div style="display: flex; flex-direction: column; gap: 0.125rem; margin-bottom: 1.5rem;">
      {#each ['completed', 'interested'] as s}
        <button
          onclick={() => { activeStatus = activeStatus === s ? null : s; }}
          class="month-btn {activeStatus === s ? 'month-btn--active' : ''}"
        >
          {s === 'completed' ? 'Completed' : 'Interested'}
        </button>
      {/each}
    </div>

    {#if tagIndex().length > 0}
      <div class="sidebar-label" style="margin-top: 1rem;">By Tag</div>
      <div style="display: flex; flex-direction: column; gap: 0.125rem; margin-bottom: 1.5rem;">
        {#each tagIndex() as tag}
          <button
            onclick={() => { activeTag = activeTag === tag ? null : tag; }}
            class="month-btn {activeTag === tag ? 'month-btn--active' : ''}"
          >
            {tag}
          </button>
        {/each}
      </div>
    {/if}

    <div class="sidebar-label">By Time</div>
    {#each [...yearMonthIndex()].sort((a, b) => b[0] - a[0]) as [year, months]}
      <div style="margin-bottom: 0.75rem;">
        <button onclick={() => toggleYear(year)} class="year-label {activeYear === year ? 'year-label--active' : ''}">{year}</button>
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
  <div class="shelf-content">
    {#if activeYearMonth || activeYear || activeTag}
      <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1rem; flex-wrap: wrap;">
        {#if activeYear}
          <div style="display: flex; align-items: center; gap: 0.375rem;">
            <h2 style="font-size: 1.125rem; font-weight: 600; margin: 0;">{activeYear}</h2>
            <button onclick={() => (activeYear = null)} class="clear-btn">× clear</button>
          </div>
        {/if}
        {#if activeYearMonth}
          <div style="display: flex; align-items: center; gap: 0.375rem;">
            <h2 style="font-size: 1.125rem; font-weight: 600; margin: 0;">{formatYM(activeYearMonth)}</h2>
            <button onclick={() => (activeYearMonth = null)} class="clear-btn">× clear</button>
          </div>
        {/if}
        {#if activeTag}
          <div style="display: flex; align-items: center; gap: 0.375rem;">
            <span style="font-size: 1.125rem; font-weight: 600;">#{activeTag}</span>
            <button onclick={() => (activeTag = null)} class="clear-btn">× clear</button>
          </div>
        {/if}
      </div>
    {/if}

    {#if filtered.length === 0}
      <p style="color: rgb(var(--gray)); text-align: center; padding: 3rem 0;">Nothing here yet.</p>
    {:else}
      <div style="display: flex; flex-direction: column; gap: 1rem;">
        {#each filtered as item (item.slug)}
          <a href={`/media/${item.slug}`} class="media-card">
            <!-- Info -->
            <div style="flex: 1; min-width: 0;">
              <h3 class="media-title">{item.title}</h3>

              <div style="display: flex; align-items: center; flex-wrap: wrap; gap: 0.375rem; margin-top: 0.25rem;">
                <span class="type-badge">
                  {TYPE_ICONS[item.type]} {TYPE_LABELS[item.type]}
                </span>
                {#if item.status === 'interested'}
                  <span class="interested-badge">Interested</span>
                {/if}
                <span class="media-date">
                  {new Date(item.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </span>
              </div>

              {#if item.author}
                <p class="media-meta">by {item.author}</p>
              {:else if item.director}
                <p class="media-meta">dir. {item.director}{item.year ? ` (${item.year})` : ''}</p>
              {:else if item.platform}
                <p class="media-meta">on {item.platform}</p>
              {:else if (item.artists || item.artist) && item.venue}
                <p class="media-meta">{item.artists ? item.artists.join(', ') : item.artist} at {item.venue}</p>
              {:else if item.artists}
                <p class="media-meta">{item.artists.join(', ')}</p>
              {:else if item.artist}
                <p class="media-meta">by {item.artist}</p>
              {:else if item.venue}
                <p class="media-meta">at {item.venue}</p>
              {:else}
                <p class="media-meta media-meta--missing">no info</p>
              {/if}

              {#if item.tags.length > 0}
                <div style="display: flex; flex-wrap: wrap; gap: 0.25rem; margin-top: 0.5rem;">
                  {#each item.tags as tag}
                    <span
                      class="tag {activeTag === tag ? 'tag--active' : ''}"
                      role="button"
                      tabindex="0"
                      onclick={(e) => { e.preventDefault(); e.stopPropagation(); activeTag = activeTag === tag ? null : tag; }}
                      onkeydown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); activeTag = activeTag === tag ? null : tag; } }}
                    >{tag}</span>
                  {/each}
                </div>
              {/if}
            </div>

            <!-- Cover -->
            <div class="media-cover">
              {#if item.coverSrc}
                <img src={item.coverSrc} alt={item.title} style="height: 100%; width: auto; display: block;" loading="lazy" />
              {:else}
                <span style="font-size: 1.5rem;">{TYPE_ICONS[item.type]}</span>
              {/if}
            </div>
          </a>
        {/each}
      </div>
    {/if}
  </div>
</div>

<style>
  .shelf-layout {
    display: flex;
    gap: 1.5rem;
    align-items: flex-start;
  }

  .shelf-sidebar {
    width: 9rem;
    flex-shrink: 0;
    position: sticky;
    top: 1.5rem;
  }

  .shelf-content {
    flex: 1;
    min-width: 0;
  }

  .filters-toggle {
    display: none;
  }

  @media (max-width: 640px) {
    .shelf-layout {
      flex-direction: column;
      gap: 0.75rem;
    }

    .filters-toggle {
      display: flex;
      align-items: center;
      gap: 0.375rem;
      font-size: 0.875rem;
      font-weight: 600;
      padding: 0.375rem 0.75rem;
      border: 1px solid rgba(var(--gray-light), 1);
      border-radius: 0.5rem;
      background: white;
      cursor: pointer;
      color: rgb(var(--black));
    }

    .shelf-sidebar {
      display: none;
      width: 100%;
      position: static;
    }

    .shelf-sidebar--open {
      display: block;
    }

    .shelf-content {
      width: 100%;
    }
  }

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
    display: block;
    width: 100%;
    text-align: left;
    font-size: 0.875rem;
    font-weight: 600;
    color: rgb(var(--black));
    margin-bottom: 0.25rem;
    padding: 0.125rem 0.5rem;
    border: none;
    border-radius: 0.25rem;
    cursor: pointer;
    background: transparent;
    transition: color 0.15s, background 0.15s;
  }

  .year-label:hover {
    background: rgba(var(--gray-light), 1);
  }

  .year-label--active {
    background: transparent;
    color: #ea580c;
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
    background: transparent;
    color: #ea580c;
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
    gap: 0.75rem;
    align-items: center;
    border-radius: 0.75rem;
    border: 1px solid rgba(var(--gray-light), 1);
    background: white;
    padding: 0.75rem;
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
    width: auto;
    height: 7rem;
    border-radius: 0.5rem;
    overflow: hidden;
    background: transparent;
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

  .interested-badge {
    font-size: 0.7rem;
    padding: 0.125rem 0.5rem;
    background: #fef9c3;
    color: #a16207;
    border-radius: 9999px;
  }

  .media-meta {
    font-size: 0.875rem;
    color: rgb(var(--gray));
    margin: 0.25rem 0 0;
  }

  .media-meta--missing {
    color: rgba(var(--gray), 0.4);
    font-style: italic;
  }

  .tag {
    font-size: 0.7rem;
    padding: 0.125rem 0.375rem;
    background: transparent;
    border: 1px solid rgba(var(--gray-light), 1);
    color: rgb(var(--gray));
    border-radius: 0.25rem;
    cursor: pointer;
    user-select: none;
  }

  .tag:hover {
    border-color: rgba(var(--gray), 0.4);
    color: rgb(var(--black));
  }

  .tag--active {
    background: rgba(var(--accent-dark), 0.1);
    border-color: var(--accent-dark);
    color: var(--accent-dark);
  }
</style>
