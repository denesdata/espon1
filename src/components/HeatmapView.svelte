<script>
  import * as d3 from 'd3';
  import { onMount } from 'svelte';
  import { theme } from '../stores/theme.js';

  let geographyType = 'region'; // 'region' or 'country'
  let selectedYear = '2020';
  let selectedIndicators = [];
  let data = [];
  let loading = true;
  let error = null;

  // Available options
  let regions = [];
  let countries = [];
  const years = Array.from({length: 15}, (_, i) => (2008 + i).toString());

  // Group indicators by category
  const categories = {
    economic: {
      color: '#ff7f0e',
      indicators: [
        { id: 'gdp_per_capita', label: 'GDP per Capita' },
        { id: 'employment_rate', label: 'Employment Rate' },
        { id: 'rd_expenditure', label: 'R&D Expenditure' }
      ]
    },
    social: {
      color: '#2ca02c',
      indicators: [
        { id: 'education_attainment', label: 'Education Attainment' },
        { id: 'poverty_risk', label: 'Poverty Risk' },
        { id: 'life_expectancy', label: 'Life Expectancy' }
      ]
    },
    environmental: {
      color: '#1f77b4',
      indicators: [
        { id: 'emissions_per_capita', label: 'Emissions per Capita' },
        { id: 'renewable_energy', label: 'Renewable Energy' },
        { id: 'waste_recycling', label: 'Waste Recycling' }
      ]
    }
  };

  // Flatten indicators for data processing
  const indicators = Object.entries(categories).flatMap(([category, data]) => 
    data.indicators.map(ind => ({ ...ind, category }))
  );

  onMount(async () => {
    try {
      const response = await fetch('/data/data_sample.csv');
      const text = await response.text();
      const csvData = d3.csvParse(text);
      
      countries = [...new Set(csvData.map(d => d.CODE.substring(0, 2)))].sort();
      regions = [...new Set(csvData.map(d => d.CODE))].sort();
      
      data = csvData;
      loading = false;
    } catch (e) {
      error = e.message;
      loading = false;
    }
  });

  $: geographies = geographyType === 'region' ? regions : countries;
  $: matrixData = processData(data, selectedYear, geographies);

  function processData(data, year, geographies) {
    if (!data.length) return [];
    
    return geographies.map(geo => {
      const row = { geography: geo };
      
      indicators.forEach(indicator => {
        const filter = geographyType === 'region' 
          ? d => d.CODE === geo && d.year === year
          : d => d.CODE.startsWith(geo) && d.year === year;
        
        let value = 0;
        if (data.length) {
          const values = data.filter(filter).map(d => +d[indicator.id] || 0);
          value = geographyType === 'country' ? d3.mean(values) : values[0];
        }
        row[indicator.id] = value;
      });
      
      return row;
    });
  }

  function getColorScale(indicator, values) {
    const categoryColor = categories[indicators.find(i => i.id === indicator)?.category]?.color;
    return d3.scaleSequential()
      .domain([d3.min(values), d3.max(values)])
      .interpolator(d3.interpolateRgb(
        d3.color(categoryColor).copy({opacity: 0.2}), 
        d3.color(categoryColor).copy({opacity: 0.9})
      ));
  }
</script>

<div class="heatmap-view">
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
  </div>

  {#if loading}
    <p>Loading heatmap...</p>
  {:else if error}
    <p class="error">Error: {error}</p>
  {:else if matrixData.length}
    <div class="table-container">
      <div class="matrix-table">
        <table>
          <thead>
            <tr>
              <th>Geography</th>
              {#each Object.entries(categories) as [category, data]}
                <th 
                  class="category-header" 
                  colspan={data.indicators.length}
                  style:background-color={data.color}
                >
                  {category}
                </th>
              {/each}
            </tr>
            <tr>
              <th></th>
              {#each Object.values(categories) as category}
                {#each category.indicators as indicator}
                  <th title={indicator.label}>
                    {indicator.label.split(' ')[0]}
                  </th>
                {/each}
              {/each}
            </tr>
          </thead>
          <tbody>
            {#each matrixData as row}
              <tr>
                <td>{row.geography}</td>
                {#each indicators as indicator}
                  {@const values = matrixData.map(d => d[indicator.id])}
                  {@const colorScale = getColorScale(indicator.id, values)}
                  <td class="your-class-name" style:background-color={colorScale(row[indicator.id])}></td>
                {/each}
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </div>
  {:else}
    <p>No data available</p>
  {/if}
</div>

<style>
  .heatmap-view {
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

  .table-container {
    flex: 1;
    min-height: 400px;
    position: relative;
    overflow: hidden;
  }

  .matrix-table {
    position: absolute;
    inset: 0;
    overflow: auto;
  }

  table {
    border-collapse: collapse;
    width: 100%;
  }

  th, td {
    padding: 0;
    text-align: center;
    font-size: 12px;
    color: var(--text-primary);
  }

  td {
    width: 30px;
    height: 30px;
    transition: opacity 0.2s;
  }

  td:hover {
    opacity: 0.8;
  }

  td:first-child, th:first-child {
    position: sticky;
    left: 0;
    z-index: 2;
    min-width: 100px;
    text-align: left;
    background: var(--bg-primary);
    font-weight: 500;
    padding: 0.5rem;
  }

  th {
    position: sticky;
    top: 0;
    z-index: 1;
    background: var(--bg-primary);
    padding: 0.5rem;
  }

  th:first-child {
    z-index: 3;
  }

  .category-header {
    text-transform: capitalize;
    color: white;
    font-weight: 600;
  }
</style> 