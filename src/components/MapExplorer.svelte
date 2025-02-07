<script>
  import { onMount } from 'svelte';
  import * as d3 from 'd3';
  import ChoroplethChart from './charts/ChoroplethChart.svelte';
  import Section from './Section.svelte';
  import { generateSyntheticData } from '../utils/generateSyntheticData.js';
  import { onDestroy } from 'svelte';

  // Helper to check if a value is effectively empty (NaN, null, 0, etc)
  function isEmptyValue(value) {
    return value === null || value === undefined || isNaN(value) || value === 0;
  }

  let selectedLevel = 2; // Start with NUTS2 regions
  let selectedYear = '2017';
  let selectedIndicator = 'env_emissions';
  
  let mapData = {
    labels: [],
    datasets: [{
      label: 'CO2 Emissions',
      data: []
    }]
  };
  let regions = [];
  let syntheticData;
  let realData = {};
  let stats = {
    average: 'Loading...',
    median: 'Loading...',
    range: 'Loading...',
    stdDev: 'Loading...'
  };

  const indicators = [
    { id: 'gdppps', label: 'GDP PPS', unit: 'Index (EU=100)' },
    { id: 'env_emissions', label: 'CO2 Emissions', unit: 'tonnes/capita', synthetic: true },
    { id: 'renewable_energy', label: 'Renewable Energy', unit: '%', synthetic: true },
    { id: 'digital_connectivity', label: 'Digital Connectivity', unit: 'score', synthetic: true }
  ];

  const years = {
    min: 2008,
    max: 2022,
    current: 2017
  };
  $: yearOptions = Array.from(
    {length: years.max - years.min + 1}, 
    (_, i) => (years.min + i).toString()
  );

  onMount(async () => {
    try {
      // Load real data
      const response = await fetch('/data/data_sample.csv');
      const text = await response.text();
      const data = d3.csvParse(text);
      
      // Get all regions
      regions = [...new Set(data.map(d => d.CODE))];
      
      // Generate synthetic data first
      syntheticData = generateSyntheticData(regions);
      
      // Process real data into a more usable format
      data.forEach(row => {
        const regionCode = row.CODE;
        if (!realData[regionCode]) {
          realData[regionCode] = {};
        }
        Object.keys(row).forEach(key => {
          if (key !== 'CODE') {
            const [indicator, year] = key.split('_');
            if (!realData[regionCode][year]) {
              realData[regionCode][year] = {};
            }
            const value = +row[key];
            // If real value is empty/invalid, use synthetic data
            if (isEmptyValue(value)) {
              realData[regionCode][year][indicator] = 
                syntheticData[year]?.[regionCode]?.[indicator] || 0;
            } else {
              realData[regionCode][year][indicator] = value;
            }
          }
        });
      });
      
      // Update map data initially
      updateMapData();
    } catch (error) {
      console.error('Error loading data:', error);
    }
  });

  // Update map data when selections change
  $: if (selectedLevel !== undefined && selectedYear && selectedIndicator && regions.length > 0) {
    updateMapData();
  }

  function updateMapData() {
    if (!regions.length) return;

    const indicator = indicators.find(i => i.id === selectedIndicator);
    const filteredRegions = selectedLevel === 0 
      ? [...new Set(regions.map(r => r.substring(0, 2)))]
      : regions;

    // Use synthetic data if indicator is marked synthetic or if real data is empty
    const realValue = selectedLevel === 0
      ? d3.mean(regions.filter(r => r.startsWith(filteredRegions[0]))
          .map(r => realData[r]?.[selectedYear]?.[selectedIndicator]))
      : realData[filteredRegions[0]]?.[selectedYear]?.[selectedIndicator];

    if (indicator.synthetic || isEmptyValue(realValue)) {
      const values = filteredRegions.map(region => syntheticData[selectedYear]?.[region]?.[selectedIndicator] || 0);
      mapData = {
        labels: filteredRegions,
        datasets: [{
          label: indicator.label,
          data: values
        }]
      };
    } else {
      const values = filteredRegions.map(region => realValue);
      mapData = {
        labels: filteredRegions,
        datasets: [{
          label: indicator.label,
          data: values
        }]
      };
    }
  }

  // Update statistics when data changes
  $: if (mapData.datasets[0].data.length > 0) {
    const values = mapData.datasets[0].data.filter(v => v > 0);
    const mean = d3.mean(values);
    const median = d3.median(values);
    const max = d3.max(values);
    const min = d3.min(values);
    const deviation = d3.deviation(values);
    
    stats = {
      average: mean ? mean.toFixed(1) : 'N/A',
      median: median ? median.toFixed(1) : 'N/A',
      range: (max && min) ? (max - min).toFixed(1) : 'N/A',
      stdDev: deviation ? deviation.toFixed(1) : 'N/A'
    };
  }

  let isPlaying = false;
  let playbackInterval;
  
  function togglePlayback() {
    isPlaying = !isPlaying;
    if (isPlaying) {
      playbackInterval = setInterval(() => {
        selectedYear = parseInt(selectedYear) + 1;
        if (selectedYear > years.max) {
          selectedYear = years.min;
        }
      }, 1000);
    } else {
      clearInterval(playbackInterval);
    }
  }
  
  onDestroy(() => {
    if (playbackInterval) {
      clearInterval(playbackInterval);
    }
  });
</script>

<div class="map-explorer">
  <div class="controls">
    <div class="control-group">
      <label>
        Geographic Level:
        <select bind:value={selectedLevel}>
          <option value={2}>NUTS2 Regions</option>
          <option value={0}>Countries (Aggregated)</option>
        </select>
      </label>

      <label>
        Indicator:
        <select bind:value={selectedIndicator}>
          {#each indicators as indicator}
            <option value={indicator.id}>
              {indicator.label}
              {#if indicator.synthetic}
                (Synthetic)
              {/if}
            </option>
          {/each}
        </select>
      </label>
    </div>

    <div class="year-control">
      <div class="year-label">
        <span class="label">Year: {selectedYear}</span>
        <button 
          class="play-button"
          on:click={togglePlayback}
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? '⏸' : '▶'}
        </button>
      </div>
      <div class="slider-container">
        <span class="year-mark">{years.min}</span>
        <input 
          type="range" 
          min={years.min} 
          max={years.max} 
          bind:value={selectedYear}
          class="year-slider"
        />
        <span class="year-mark">{years.max}</span>
      </div>
    </div>

    <div class="indicator-info">
      {#if selectedIndicator}
        {@const indicator = indicators.find(i => i.id === selectedIndicator)}
        <div class="info-item">
          <span class="label">Unit:</span>
          <span class="value">{indicator.unit}</span>
        </div>
        {#if indicator.synthetic}
          <div class="synthetic-badge">
            Synthetic Data
          </div>
        {/if}
      {/if}
    </div>
  </div>

  <div class="map-container">
    <ChoroplethChart 
      data={mapData}
      level={selectedLevel}
    />
  </div>

  <div class="stats-panel">
    <h3>Statistics</h3>
    <div class="stats-grid">
      <div class="stat-card">
        <span class="label">Average</span>
        <span class="value">{stats.average}</span>
      </div>
      <div class="stat-card">
        <span class="label">Median</span>
        <span class="value">{stats.median}</span>
      </div>
      <div class="stat-card">
        <span class="label">Range</span>
        <span class="value">{stats.range}</span>
      </div>
      <div class="stat-card">
        <span class="label">Std Dev</span>
        <span class="value">{stats.stdDev}</span>
      </div>
    </div>
  </div>
</div>

<style>
  .map-explorer {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    max-width: 1200px;
    margin: 0 auto;
  }

  .controls {
    background: var(--card-bg);
    padding: 1.5rem;
    border-radius: var(--radius-lg);
    backdrop-filter: blur(10px);
    box-shadow: var(--shadow-lg);
    border: 1px solid var(--border-color);
  }

  .control-group {
    display: flex;
    gap: 2rem;
    flex-wrap: wrap;
  }

  label {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    color: var(--text-secondary);
    min-width: 200px;
  }

  select {
    padding: 0.5rem;
    border-radius: 4px;
    border: 1px solid var(--border-color);
    background: var(--bg-primary);
    color: var(--text-primary);
  }

  .indicator-info {
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid var(--border-color);
    display: flex;
    align-items: center;
    gap: 2rem;
  }

  .info-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .info-item .label {
    color: var(--text-secondary);
    font-size: 0.9rem;
  }

  .info-item .value {
    color: var(--text-primary);
    font-weight: 500;
  }

  .synthetic-badge {
    background: var(--accent-color);
    color: white;
    padding: 0.2rem 0.6rem;
    border-radius: 4px;
    font-size: 0.8rem;
  }

  .map-container {
    height: 600px;
    background: linear-gradient(
      135deg,
      var(--gradient-start),
      var(--gradient-end)
    );
    border-radius: var(--radius-lg);
    padding: 1.5rem;
    box-shadow: var(--shadow-lg);
    overflow: hidden;
    border: 1px solid var(--border-color);
    backdrop-filter: blur(10px);
  }

  .stats-panel {
    background: var(--bg-secondary);
    padding: 1.5rem;
    border-radius: 8px;
  }

  .stats-panel h3 {
    color: var(--text-primary);
    margin-bottom: 1rem;
    font-size: 1.2rem;
    font-weight: 500;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 1rem;
  }

  .stat-card {
    background: var(--card-bg);
    padding: 1.5rem;
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-md);
    border: 1px solid var(--border-color);
    transition: transform 0.2s;
  }

  .stat-card:hover {
    transform: translateY(-2px);
    background: var(--card-bg-hover);
  }

  .stat-card .label {
    color: var(--text-secondary);
    font-size: 0.9rem;
  }

  .stat-card .value {
    color: var(--text-primary);
    font-size: 1.8rem;
    font-weight: 600;
    background: linear-gradient(
      135deg,
      var(--text-primary) 0%,
      var(--accent-color) 100%
    );
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .year-control {
    margin-top: 1.5rem;
    padding-top: 1.5rem;
    border-top: 1px solid var(--border-color);
  }
  
  .year-label {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0.5rem;
  }
  
  .slider-container {
    display: flex;
    align-items: center;
    gap: 1rem;
  }
  
  .year-mark {
    color: var(--text-secondary);
    font-size: 0.9rem;
    min-width: 3rem;
  }
  
  .year-slider {
    flex: 1;
    -webkit-appearance: none;
    height: 4px;
    background: var(--border-color);
    border-radius: 2px;
    outline: none;
  }
  
  .year-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: var(--accent-color);
    cursor: pointer;
    transition: transform 0.1s;
  }
  
  .year-slider::-webkit-slider-thumb:hover {
    transform: scale(1.2);
  }
  
  .play-button {
    background: var(--bg-primary);
    border: 1px solid var(--border-color);
    color: var(--text-primary);
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .play-button:hover {
    background: var(--accent-color);
    color: white;
    border-color: var(--accent-color);
  }
</style> 