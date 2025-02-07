<script>
  import { onMount } from 'svelte';
  import * as d3 from 'd3';
  import { tidyData, getDescriptiveStats, getRegionalTrends } from '../utils/dataProcessor';
  
  let stats = null;
  let trends = null;

  onMount(async () => {
    const response = await fetch('/data/data_sample.csv');
    const text = await response.text();
    const rawData = d3.csvParse(text);
    
    const tidyRows = tidyData(rawData);
    stats = getDescriptiveStats(tidyRows);
    trends = getRegionalTrends(tidyRows);
  });

  function formatNumber(num) {
    return new Intl.NumberFormat('en-US', {
      maximumFractionDigits: 2
    }).format(num);
  }
</script>

<section class="stats-section">
  <h2>Descriptive Statistics</h2>
  
  {#if stats}
    {#each Object.entries(stats) as [indicator, stat]}
      <div class="stat-card">
        <h3>{indicator.replace(/_/g, ' ').toUpperCase()}</h3>
        <div class="stat-grid">
          <div class="stat-item">
            <span class="label">Count</span>
            <span class="value">{formatNumber(stat.count)}</span>
          </div>
          <div class="stat-item">
            <span class="label">Mean</span>
            <span class="value">{formatNumber(stat.mean)}</span>
          </div>
          <div class="stat-item">
            <span class="label">Median</span>
            <span class="value">{formatNumber(stat.median)}</span>
          </div>
          <div class="stat-item">
            <span class="label">Std Dev</span>
            <span class="value">{formatNumber(stat.std)}</span>
          </div>
          <div class="stat-item">
            <span class="label">Min</span>
            <span class="value">{formatNumber(stat.min)}</span>
          </div>
          <div class="stat-item">
            <span class="label">Max</span>
            <span class="value">{formatNumber(stat.max)}</span>
          </div>
          <div class="stat-item">
            <span class="label">Q1</span>
            <span class="value">{formatNumber(stat.q1)}</span>
          </div>
          <div class="stat-item">
            <span class="label">Q3</span>
            <span class="value">{formatNumber(stat.q3)}</span>
          </div>
        </div>
      </div>
    {/each}
  {/if}
</section>

<style>
  .stats-section {
    margin-top: 2rem;
  }

  .stat-card {
    background: var(--chart-container-bg);
    border-radius: 8px;
    padding: 2rem;
    margin-bottom: 2rem;
  }

  h3 {
    color: var(--text-primary);
    font-size: 1.2rem;
    margin-bottom: 1.5rem;
  }

  .stat-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1.5rem;
  }

  .stat-item {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .label {
    color: var(--text-secondary);
    font-size: 0.9rem;
  }

  .value {
    color: var(--text-primary);
    font-size: 1.1rem;
    font-weight: 500;
  }
</style> 