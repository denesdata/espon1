<script>
  import Dashboard from './components/Dashboard.svelte';
  import ThemeToggle from './components/ThemeToggle.svelte';
  import ComparisonMap from './components/ComparisonMap.svelte';
  import MatrixView from './components/MatrixView.svelte';
  import DistributionView from './components/DistributionView.svelte';
  import ComparisonTool from './components/ComparisonTool.svelte';
  import GuideSection from './components/GuideSection.svelte';
  import DataAnalysis from './components/DataAnalysis.svelte';
  import Visualizations from './components/Visualizations.svelte';
  import MapExplorer from './components/MapExplorer.svelte';
  import TweenView from './components/TweenView.svelte';
  import DataTable from './components/DataTable.svelte';
  import BeeswarmPlot from './components/BeeswarmPlot.svelte';
  import HeatmapView from './components/HeatmapView.svelte';
  import L from 'leaflet';
  import 'leaflet/dist/leaflet.css';
  import 'https://unpkg.com/leaflet.sync/L.Map.Sync.js';
  import { onMount } from 'svelte';

  const navigationTabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'guide', label: 'Presentation Guide' },
    { id: 'statistics', label: 'Descriptive Statistics' },
    { id: 'visualizations', label: 'Visualisations' },
    { id: 'map-explorer', label: 'Map Explorer' },
    { id: 'comparison-map', label: 'Comparison Map' },
    { id: 'matrix', label: 'Matrix View' },
    { id: 'heatmap', label: 'Heatmap' },
    { id: 'flower', label: 'Flower Charts' },
    { id: 'beeswarm', label: 'Distribution Plot' },
    { id: 'comparison', label: 'Comparison Tool' },
    { id: 'fusion', label: 'Fusion Charts' },
    { id: 'raw-data', label: 'Raw Data' }
  ];

  let activeTab = 'overview';

  const datasetInfo = {
    regions: 281,
    countries: 31,
    timespan: '2008-2023',
    categories: 5,
    indicators: 12
  };

  onMount(() => {
    // Your Leaflet initialization code here
    // Make sure map container exists before initializing
  });
</script>

<main>
  <div class="container">
    <ThemeToggle />
    <header>
      <h1>TERRES</h1>
      <p class="subtitle">Territorial Resilience Dashboard (TRD)</p>
      <p class="description">
        A comprehensive analysis of {datasetInfo.regions} regions across {datasetInfo.countries} European countries, 
        tracking {datasetInfo.indicators} key indicators in {datasetInfo.categories} major categories from {datasetInfo.timespan}. 
        Covering economic, social, environmental, and governance dimensions of territorial resilience.
      </p>
      <div class="key-metrics">
        <div class="metric">
          <span class="value">{datasetInfo.regions}</span>
          <span class="label">Regions</span>
        </div>
        <div class="metric">
          <span class="value">{datasetInfo.countries}</span>
          <span class="label">Countries</span>
        </div>
        <div class="metric">
          <span class="value">{datasetInfo.indicators}</span>
          <span class="label">Indicators</span>
        </div>
        <div class="metric">
          <span class="value">15</span>
          <span class="label">Years</span>
        </div>
      </div>
    </header>
    <nav class="tabs">
      {#each navigationTabs as tab}
        <button
          class:active={activeTab === tab.id}
          on:click={() => activeTab = tab.id}
        >
          {tab.label}
        </button>
      {/each}
    </nav>

    <div class="content">
      {#if activeTab === 'overview'}
        <Dashboard />
      {:else if activeTab === 'guide'}
        <GuideSection />
      {:else if activeTab === 'statistics'}
        <DataAnalysis />
      {:else if activeTab === 'visualizations'}
        <Visualizations />
      {:else if activeTab === 'map-explorer'}
        <MapExplorer />
      {:else if activeTab === 'comparison-map'}
        <ComparisonMap />
      {:else if activeTab === 'matrix'}
        <MatrixView />
      {:else if activeTab === 'heatmap'}
        <HeatmapView />
      {:else if activeTab === 'flower'}
        <DistributionView />
      {:else if activeTab === 'beeswarm'}
        <BeeswarmPlot />
      {:else if activeTab === 'comparison'}
        <ComparisonTool />
      {:else if activeTab === 'fusion'}
        <TweenView />
      {:else if activeTab === 'raw-data'}
        <DataTable />
      {/if}
    </div>
  </div>
</main>

<style>
  main {
    max-width: 1400px;
    margin: 0 auto;
    padding: 2rem;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  .container {
    position: relative;
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  header {
    margin: 6rem 0;
    flex-shrink: 0;
  }

  h1 {
    color: var(--text-primary);
    font-size: 3rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
    letter-spacing: -0.02em;
  }

  .subtitle {
    color: var(--accent-color);
    font-size: 1.25rem;
    margin-bottom: 1rem;
    font-weight: 500;
  }

  .description {
    color: var(--text-secondary);
    font-size: 1.1rem;
    max-width: 800px;
    line-height: 1.6;
    margin-bottom: 2rem;
  }

  .key-metrics {
    display: flex;
    gap: 2rem;
    margin-top: 3rem;
  }

  .metric {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
  }

  .metric .value {
    color: var(--text-primary);
    font-size: 2rem;
    font-weight: 600;
  }

  .metric .label {
    color: var(--text-secondary);
    font-size: 0.9rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  :root {
    --spacing-xs: 0.5rem;
    --spacing-sm: 1rem;
    --spacing-md: 1.5rem;
    --spacing-lg: 2rem;
    --spacing-xl: 2.5rem;
    
    --shadow-sm: 0 1px 3px rgba(0,0,0,0.05);
    --shadow-md: 0 2px 4px rgba(0,0,0,0.1);
    --shadow-lg: 0 4px 6px rgba(0,0,0,0.1);
    
    --radius-sm: 4px;
    --radius-md: 8px;
    --radius-lg: 12px;
    
    --bg-hover: rgba(0,0,0,0.05);
    --bg-primary-rgb: 255, 255, 255;
    --bg-secondary-rgb: 245, 245, 245;
    --accent-rgb: 54, 162, 235;
    --accent-color-light: #64b5f6;
    
    /* Theme Colors */
    --gradient-start: rgba(255, 255, 255, 0.8);
    --gradient-end: rgba(245, 245, 245, 0.9);
    --card-bg: rgba(255, 255, 255, 0.9);
    --card-bg-hover: rgba(255, 255, 255, 0.95);
    --text-on-dark: rgba(255, 255, 255, 0.9);
    --text-on-light: rgba(0, 0, 0, 0.9);
    --border-light: rgba(255, 255, 255, 0.1);
    --border-dark: rgba(0, 0, 0, 0.1);
    
    --gradient-primary: linear-gradient(
      135deg,
      var(--gradient-start) 0%,
      var(--gradient-end) 100%
    );
  }

  :global([data-theme="dark"]) {
    --bg-hover: rgba(255,255,255,0.05);
    --bg-primary-rgb: 18, 18, 18;
    --bg-secondary-rgb: 30, 30, 30;
    --accent-color-light: #90caf9;
    
    --gradient-start: rgba(18, 18, 18, 0.8);
    --gradient-end: rgba(30, 30, 30, 0.9);
    --card-bg: rgba(30, 30, 30, 0.9);
    --card-bg-hover: rgba(40, 40, 40, 0.95);
    --text-color: var(--text-on-dark);
    --border-color: var(--border-light);
  }

  .tabs {
    display: flex;
    gap: 0.5rem;
    padding: 0 1rem;
    margin-bottom: 2rem;
    overflow-x: auto;
    scrollbar-width: none;
    -ms-overflow-style: none;
  }

  .tabs::-webkit-scrollbar {
    display: none;
  }

  .tabs button {
    padding: 0.75rem 1.25rem;
    border: none;
    background: var(--bg-secondary);
    color: var(--text-secondary);
    border-radius: var(--radius-md);
    cursor: pointer;
    white-space: nowrap;
    transition: all 0.2s;
  }

  .tabs button:hover {
    background: var(--bg-hover);
    color: var(--text-primary);
  }

  .tabs button.active {
    background: var(--accent-color);
    color: white;
  }

  .content {
    margin-top: 2rem;
  }

  :global(.leaflet-container) {
    height: 100%;
    width: 100%;
  }
</style>
