<script>
  import * as d3 from 'd3';
  import { onMount } from 'svelte';
  import { theme } from '../stores/theme.js';

  let geographyType = 'region'; // 'region' or 'country'
  let selectedYear = '2020';
  let selectedIndicator = 'gdp_per_capita';
  let data = [];
  let loading = true;
  let error = null;
  let rawData = [];

  // Available options
  let years = Array.from({length: 15}, (_, i) => (2008 + i).toString());
  let indicators = [
    { id: 'gdp_per_capita', label: 'GDP per Capita', category: 'economic' },
    { id: 'employment_rate', label: 'Employment Rate', category: 'economic' },
    { id: 'rd_expenditure', label: 'R&D Expenditure', category: 'economic' },
    { id: 'education_attainment', label: 'Education Attainment', category: 'social' },
    { id: 'poverty_risk', label: 'Poverty Risk', category: 'social' },
    { id: 'life_expectancy', label: 'Life Expectancy', category: 'social' },
    { id: 'emissions_per_capita', label: 'Emissions per Capita', category: 'environmental' },
    { id: 'renewable_energy', label: 'Renewable Energy', category: 'environmental' },
    { id: 'waste_recycling', label: 'Waste Recycling', category: 'environmental' }
  ];

  $: width = 900;
  $: height = 400;
  $: margin = { top: 20, right: 30, bottom: 40, left: 40 };

  $: xScale = d3.scaleLinear()
    .domain(data.length ? d3.extent(data, d => d.value) : [0, 100])
    .range([margin.left, width - margin.right]);

  $: simulation = data.length ? d3.forceSimulation(data)
    .force("x", d3.forceX(d => xScale(d.value)).strength(1))
    .force("y", d3.forceY(height / 2))
    .force("collide", d3.forceCollide(5))
    .stop() : null;

  $: if (simulation) {
    simulation.tick(300);
  }

  onMount(async () => {
    try {
      const response = await fetch('/data/data_sample.csv');
      const text = await response.text();
      const csvData = d3.csvParse(text);
      rawData = csvData;
      data = processData(csvData);
      runSimulation();
      loading = false;
      console.log('Initial data:', data);
    } catch (e) {
      console.error('Error loading data:', e);
      error = e.message;
      loading = false;
    }
  });

  function processData(rawData) {
    return rawData
      .filter(d => d.year === selectedYear)
      .map(d => ({
        id: d.code,
        name: d.name,
        value: +d[selectedIndicator],
        category: d.category,
        x: xScale(+d[selectedIndicator]),
        y: height / 2
      }))
      .filter(d => !isNaN(d.value));
  }

  function runSimulation() {
    if (data.length && simulation) {
      simulation.stop();
      simulation
        .nodes(data)
        .force("x", d3.forceX(d => xScale(d.value)).strength(1))
        .force("y", d3.forceY(height / 2))
        .force("collide", d3.forceCollide(5));
      
      simulation.alpha(1).restart();
      for (let i = 0; i < 120; ++i) simulation.tick();
      
      data = [...data];
    }
  }

  function updateData() {
    if (!data.length) return;
    
    xScale.domain(d3.extent(data, d => d.value));
    
    runSimulation();
  }

  $: {
    selectedIndicator;
    selectedYear;
    if (data.length) {
      data = processData(rawData);
    }
    updateData();
  }
</script>

<div class="beeswarm">
  <h2>Distribution of {indicators.find(i => i.id === selectedIndicator)?.label}</h2>
  <p class="description">
    Explore the distribution of values across regions and countries. Each dot represents a region,
    and its position shows the value for the selected indicator.
  </p>

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

      <label>
        Indicator:
        <select bind:value={selectedIndicator}>
          {#each indicators as indicator}
            <option value={indicator.id}>{indicator.label}</option>
          {/each}
        </select>
      </label>
    </div>
  </div>

  {#if loading}
    <p>Loading beeswarm plot...</p>
  {:else if error}
    <p class="error">Error: {error}</p>
  {:else}
    <div class="plot">
      <svg {width} {height}>
        <!-- X-axis -->
        <g transform={`translate(0,${height - margin.bottom})`}>
          {#each xScale.ticks() as tick}
            <g transform={`translate(${xScale(tick)},0)`}>
              <line y2="6" stroke="var(--text-secondary)" />
              <text
                y="20"
                text-anchor="middle"
                fill="var(--text-secondary)"
                font-size="12"
              >{tick}</text>
            </g>
          {/each}
        </g>

        <!-- Points -->
        {#each data as d}
          <circle
            cx={d.x || xScale(d.value)}
            cy={d.y || height / 2}
            r="5"
            fill={d3.schemeTableau10[indicators.findIndex(i => i.id === selectedIndicator) % 10]}
            stroke="var(--bg-primary)"
            stroke-width="1"
          >
            <title>{d.name}: {d.value}</title>
          </circle>
        {/each}

        <!-- Axis labels -->
        <text
          x={width / 2}
          y={height - 5}
          text-anchor="middle"
          fill="var(--text-secondary)"
        >
          {indicators.find(i => i.id === selectedIndicator)?.label}
        </text>
      </svg>
    </div>
  {/if}
</div>

<style>
  .beeswarm {
    padding: 2rem;
    background: var(--card-bg);
    border-radius: var(--radius-lg);
    border: 1px solid var(--border-color);
  }

  .controls {
    margin-bottom: 2rem;
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

  .plot {
    background: var(--bg-secondary);
    padding: 1rem;
    border-radius: var(--radius-md);
    overflow: hidden;
  }

  svg {
    width: 100%;
    height: auto;
  }

  circle {
    transition: r 0.2s;
  }

  circle:hover {
    r: 8;
  }

  h2 {
    color: var(--text-primary);
    font-size: 1.5rem;
    margin-bottom: 1rem;
  }

  .description {
    color: var(--text-secondary);
    font-size: 1rem;
    margin-bottom: 2rem;
    line-height: 1.5;
  }
</style> 