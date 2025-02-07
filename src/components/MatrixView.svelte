<script>
  import { onMount } from 'svelte';
  import * as d3 from 'd3';
  import { generateSyntheticData } from '../utils/generateSyntheticData.js';
  import { theme } from '../stores/theme.js';

  let data = [];
  let syntheticData;
  let loading = true;
  let error = null;

  // View state
  let geographyType = 'region'; // 'region' or 'country'
  let selectedYear = '2020';
  let viewType = 'indicators'; // 'indicators' or 'categories'
  let selectedIndicators = [];

  // Available options
  let regions = [];
  let countries = [];
  let years = [];
  let indicators = [];
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
    'renewable_energy': {
      label: 'Renewable Energy',
      synthetic: true,
      unit: '%',
      category: 'environmental'
    },
    'gdp_ppi': {
      label: 'GDP per capita',
      synthetic: false,
      unit: 'PPS',
      category: 'economic'
    },
    'employment_rate': {
      label: 'Employment Rate',
      synthetic: false,
      unit: '%',
      category: 'economic'
    },
    'education_level': {
      label: 'Education Level',
      synthetic: true,
      unit: 'score',
      category: 'social'
    },
    'healthcare_access': {
      label: 'Healthcare Access',
      synthetic: true,
      unit: '%',
      category: 'social'
    },
    'digital_connectivity': {
      label: 'Digital Connectivity',
      synthetic: true,
      unit: '%',
      category: 'infrastructure'
    },
    'transport_access': {
      label: 'Transport Infrastructure',
      synthetic: true,
      unit: 'score',
      category: 'infrastructure'
    },
    'civic_participation': {
      label: 'Civic Participation',
      synthetic: true,
      unit: '%',
      category: 'governance'
    },
    'policy_effectiveness': {
      label: 'Policy Effectiveness',
      synthetic: true,
      unit: 'score',
      category: 'governance'
    }
  };

  // Get indicators by category
  function getIndicatorsByCategory(category) {
    return Object.entries(indicatorMeta)
      .filter(([_, meta]) => meta.category === category)
      .map(([id, _]) => id);
  }

  // Get category value (average of its indicators)
  function getCategoryValue(data, category) {
    const categoryIndicators = getIndicatorsByCategory(category);
    const values = categoryIndicators.map(ind => data[ind] || 0);
    return d3.mean(values);
  }

  onMount(async () => {
    try {
      const response = await fetch('/data/data_sample.csv');
      const text = await response.text();
      data = d3.csvParse(text);
      
      // Extract unique values
      countries = [...new Set(data.map(d => d.CODE.substring(0, 2)))].sort();
      regions = [...new Set(data.map(d => d.CODE))].sort();
      years = Array.from({length: 15}, (_, i) => (2008 + i).toString());
      indicators = Object.keys(indicatorMeta);
      selectedIndicators = indicators; // Start with all indicators
      
      // Generate synthetic data
      syntheticData = generateSyntheticData(regions);
      
      loading = false;
    } catch (e) {
      error = e.message;
      loading = false;
    }
  });

  $: geographies = geographyType === 'region' ? regions : countries;
  
  // Process data based on view type
  $: matrixData = viewType === 'categories' 
    ? processCategories(geographies, selectedYear)
    : processIndicators(geographies, selectedIndicators, selectedYear);

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

  function processCategories(geos, year) {
    if (!data.length || !syntheticData) return [];

    return geos.map(geo => {
      const row = { geography: geo };
      
      // First get all indicator values
      const indicatorValues = processIndicators([geo], indicators, year)[0];
      
      // Then calculate category averages
      categories.forEach(category => {
        row[category] = getCategoryValue(indicatorValues, category);
      });
      
      return row;
    });
  }

  // Calculate color scale for each indicator or category
  function getColorScale(key, values) {
    const colorSchemes = {
      economic: $theme === 'dark' ? d3.interpolateRdYlBu : d3.interpolateBlues,
      social: $theme === 'dark' ? d3.interpolateRdYlBu : d3.interpolateGreens,
      environmental: $theme === 'dark' ? d3.interpolateRdYlBu : d3.interpolateGreens,
      infrastructure: $theme === 'dark' ? d3.interpolateRdYlBu : d3.interpolateOranges,
      governance: $theme === 'dark' ? d3.interpolateRdYlBu : d3.interpolatePurples
    };

    const interpolator = colorSchemes[key] || 
      (indicatorMeta[key]?.category ? colorSchemes[indicatorMeta[key].category] : d3.interpolateBlues);

    return d3.scaleSequential()
      .domain([d3.min(values), d3.max(values)])
      .interpolator(interpolator);
  }
</script>

<div class="matrix-view">
  <div class="controls">
    <div class="control-group">
      <label>
        View Type:
        <select bind:value={viewType}>
          <option value="indicators">Indicators</option>
          <option value="categories">Categories</option>
        </select>
      </label>

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

    {#if viewType === 'indicators'}
      <div class="indicators-selection">
        <span class="label">Select Indicators:</span>
        <div class="indicators-grid">
          {#each indicators as indicator}
            <label class="checkbox">
              <input
                type="checkbox"
                value={indicator}
                bind:group={selectedIndicators}
              >
              <span class="indicator-label">
                {indicatorMeta[indicator].label}
                {#if indicatorMeta[indicator].synthetic}
                  <span class="synthetic-badge">Synthetic</span>
                {/if}
                <span class="category-badge">{indicatorMeta[indicator].category}</span>
              </span>
            </label>
          {/each}
        </div>
      </div>
    {/if}
  </div>

  {#if loading}
    <p>Loading matrix view...</p>
  {:else if error}
    <p class="error">Error: {error}</p>
  {:else if matrixData.length}
    <div class="table-container">
      <div class="matrix-table">
        <table>
          <thead>
            <tr>
              <th>Geography</th>
              {#if viewType === 'indicators'}
                {#each selectedIndicators as indicator}
                  <th>
                    {indicatorMeta[indicator].label}
                    <span class="unit">({indicatorMeta[indicator].unit})</span>
                  </th>
                {/each}
              {:else}
                {#each categories as category}
                  <th>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                    <span class="unit">(avg)</span>
                  </th>
                {/each}
              {/if}
            </tr>
          </thead>
          <tbody>
            {#each matrixData as row}
              <tr>
                <td>{row.geography}</td>
                {#if viewType === 'indicators'}
                  {#each selectedIndicators as indicator}
                    {@const values = matrixData.map(d => d[indicator])}
                    {@const colorScale = getColorScale(indicator, values)}
                    <td 
                      style:background-color={colorScale(row[indicator])}
                      style:color={$theme === 'dark' ? 'white' : 'black'}
                    >
                      {row[indicator].toFixed(2)}
                    </td>
                  {/each}
                {:else}
                  {#each categories as category}
                    {@const values = matrixData.map(d => d[category])}
                    {@const colorScale = getColorScale(category, values)}
                    <td
                      style:background-color={colorScale(row[category])}
                      style:color={$theme === 'dark' ? 'white' : 'black'}
                    >
                      {row[category].toFixed(2)}
                    </td>
                  {/each}
                {/if}
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </div>
  {:else}
    <p class="instruction">Select indicators to view the matrix</p>
  {/if}
</div>

<style>
  .matrix-view {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    min-height: 600px;  /* Give it a minimum height */
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

  .indicators-selection {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .indicators-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 0.5rem;
  }

  .table-container {
    flex: 1;
    min-height: 400px;  /* Minimum height for the table container */
    position: relative;
    overflow: hidden;
    background: var(--card-bg);
    padding: 1.5rem;
    border-radius: var(--radius-lg);
    border: 1px solid var(--border-color);
  }

  .matrix-table {
    width: 100%;
    height: 100%;
    overflow: auto;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.9rem;
  }

  th, td {
    padding: 0.75rem;
    text-align: right;
    border: 1px solid var(--border-color);
    min-width: 150px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  td:first-child, th:first-child {
    position: sticky;
    left: 0;
    z-index: 2;
    min-width: 180px;
    text-align: left;
    background: var(--bg-primary);
    font-weight: 500;
  }

  th {
    position: sticky;
    top: 0;
    z-index: 1;
    background: var(--bg-primary);
    color: var(--text-primary);
    font-weight: 500;
    white-space: nowrap;
  }

  /* Corner header - needs to be above other sticky elements */
  th:first-child {
    z-index: 3;
  }

  /* Add shadow to sticky elements */
  td:first-child::after,
  th:first-child::after {
    content: '';
    position: absolute;
    top: 0;
    right: -4px;
    bottom: 0;
    width: 4px;
    background: linear-gradient(to right, rgba(0,0,0,0.1), transparent);
    pointer-events: none;
  }

  th::after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    bottom: -4px;
    height: 4px;
    background: linear-gradient(to bottom, rgba(0,0,0,0.1), transparent);
    pointer-events: none;
  }

  .synthetic-badge {
    background: var(--accent-color);
    color: white;
    font-size: 0.7rem;
    padding: 0.1rem 0.4rem;
    border-radius: 4px;
    margin-left: 0.5rem;
  }

  .unit {
    color: var(--text-secondary);
    font-size: 0.8rem;
    margin-left: 0.3rem;
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

  .indicator-label {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.3rem;
  }

  .category-badge {
    background: var(--bg-secondary);
    color: var(--text-secondary);
    font-size: 0.7rem;
    padding: 0.1rem 0.4rem;
    border-radius: 4px;
    margin-left: 0.5rem;
  }
</style> 