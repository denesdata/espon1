<script>
  import { onMount } from 'svelte';
  import * as d3 from 'd3';
  import ChartComponent from './ChartComponent.svelte';
  import { generateSyntheticData } from '../utils/generateSyntheticData.js';
  import { theme } from '../stores/theme.js';

  let data = [];
  let syntheticData;
  let loading = true;
  let error = null;

  // View state
  let geographyType = 'region'; // 'region' or 'country'
  let selectedYear = '2020';
  let selectedGeographies = [];

  // Available options
  let regions = [];
  let countries = [];
  let years = [];
  let categories = [
    'economic',
    'social',
    'environmental',
    'infrastructure',
    'governance'
  ];

  let indicatorMeta = {
    'env_emissions': {
      label: 'CO2 Emissions',
      synthetic: true,
      unit: 'tonnes/capita',
      category: 'environmental'
    },
    // ... same indicator meta as MatrixView
  };

  // Color scale for geographies
  const colorScale = d3.scaleOrdinal(d3.schemeTableau10);

  onMount(async () => {
    try {
      const response = await fetch('/data/data_sample.csv');
      const text = await response.text();
      data = d3.csvParse(text);
      
      countries = [...new Set(data.map(d => d.CODE.substring(0, 2)))].sort();
      regions = [...new Set(data.map(d => d.CODE))].sort();
      years = Array.from({length: 15}, (_, i) => (2008 + i).toString());
      
      syntheticData = generateSyntheticData(regions);
      loading = false;
    } catch (e) {
      error = e.message;
      loading = false;
    }
  });

  $: geographies = geographyType === 'region' ? regions : countries;

  // Get indicators by category
  function getIndicatorsByCategory(category) {
    return Object.entries(indicatorMeta)
      .filter(([_, meta]) => meta.category === category)
      .map(([id, _]) => id);
  }

  // Get category value for a geography
  function getCategoryValue(geo, category, year) {
    const categoryIndicators = getIndicatorsByCategory(category);
    const geoData = processIndicators([geo], categoryIndicators, year)[0];
    return d3.mean(categoryIndicators.map(ind => geoData[ind] || 0));
  }

  function processIndicators(geos, inds, year) {
    if (!data.length || !syntheticData) return [];

    return geos.map(geo => {
      const row = { geography: geo };
      
      inds.forEach(indicator => {
        let value;
        if (indicatorMeta[indicator].synthetic) {
          value = geographyType === 'country'
            ? d3.mean(regions.filter(r => r.startsWith(geo))
                .map(r => syntheticData[year]?.[r]?.[indicator] || 0))
            : syntheticData[year]?.[geo]?.[indicator] || 0;
        } else {
          const filter = geographyType === 'country'
            ? d => d.CODE.startsWith(geo)
            : d => d.CODE === geo;
          const values = data.filter(filter).map(d => +d[`${indicator}_${year}`] || 0);
          value = geographyType === 'country' ? d3.mean(values) : values[0];
        }
        row[indicator] = value;
      });
      
      return row;
    });
  }

  // Prepare radar chart data for a single geography
  function getRadarDataForGeography(geo) {
    return {
      labels: categories.map(c => c.charAt(0).toUpperCase() + c.slice(1)),
      datasets: [{
        label: geo,
        data: categories.map(category => 
          getCategoryValue(geo, category, selectedYear)
        ),
        backgroundColor: `${colorScale(geo)}33`,
        borderColor: colorScale(geo),
        pointBackgroundColor: colorScale(geo),
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: colorScale(geo),
        fill: true
      }]
    };
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: {
        top: 20,
        bottom: 10,
        left: 10,
        right: 10
      }
    },
    scales: {
      r: {
        beginAtZero: true,
        grid: {
          color: 'var(--chart-grid-color)',
        },
        ticks: {
          color: 'var(--text-secondary)',
          backdropColor: 'transparent',
          showLabelBackdrop: false,
          z: 1
        },
        pointLabels: {
          color: 'var(--text-primary)',
          font: {
            size: 11
          }
        }
      }
    },
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        color: 'var(--text-primary)',
        padding: {
          top: 0,
          bottom: 10
        },
        font: {
          size: 14,
          weight: 500
        }
      }
    }
  };
</script>

<div class="distribution-view">
  <div class="controls">
    <div class="control-group">
      <label>
        Geography Level:
        <select bind:value={geographyType}>
          <option value="region">Regions</option>
          <option value="country">Countries</option>
        </select>
      </label>

      <label>
        Year:
        <select bind:value={selectedYear}>
          {#each years as year}
            <option value={year}>{year}</option>
          {/each}
        </select>
      </label>
    </div>

    <div class="geography-selection">
      <span class="label">Select Geographies to Compare:</span>
      <div class="geography-grid">
        {#each geographies as geography}
          <label class="checkbox">
            <input
              type="checkbox"
              value={geography}
              bind:group={selectedGeographies}
            >
            <span class="geography-label">
              {geography}
            </span>
          </label>
        {/each}
      </div>
    </div>
  </div>

  {#if loading}
    <p>Loading distribution view...</p>
  {:else if error}
    <p class="error">Error: {error}</p>
  {:else if selectedGeographies.length === 0}
    <p class="instruction">Select geographies to view their distribution</p>
  {:else}
    <div class="charts-grid">
      {#each selectedGeographies as geo}
        <div class="chart-container">
          <ChartComponent 
            type="radar"
            data={getRadarDataForGeography(geo)}
            options={{
              ...chartOptions,
              plugins: {
                ...chartOptions.plugins,
                title: {
                  ...chartOptions.plugins.title,
                  text: geo
                }
              }
            }}
          />
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .distribution-view {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    min-height: 600px;
  }

  .controls {
    background: var(--card-bg);
    padding: 1.5rem;
    border-radius: var(--radius-lg);
    border: 1px solid var(--border-color);
  }

  .control-group {
    display: flex;
    gap: 1rem;
    margin-bottom: 1.5rem;
  }

  .geography-selection {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .geography-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 0.5rem;
  }

  .chart-container {
    background: var(--card-bg);
    padding: 1.5rem;
    border-radius: var(--radius-lg);
    border: 1px solid var(--border-color);
    aspect-ratio: 1;
    min-height: 300px;
    display: flex;
    flex-direction: column;
  }

  .chart-container :global(canvas) {
    width: 100% !important;
    height: 100% !important;
  }

  label {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    color: var(--text-secondary);
  }

  select {
    padding: 0.5rem;
    border-radius: 4px;
    border: 1px solid var(--border-color);
    background: var(--bg-primary);
    color: var(--text-primary);
    min-width: 150px;
  }

  .checkbox {
    flex-direction: row;
    align-items: center;
    gap: 0.5rem;
  }

  .geography-label {
    font-family: monospace;
  }

  .instruction {
    color: var(--text-secondary);
    text-align: center;
    padding: 2rem;
    background: var(--bg-secondary);
    border-radius: 8px;
  }

  .charts-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1.5rem;
    flex: 1;
    min-height: 0;
    padding: 1rem;
  }
</style> 