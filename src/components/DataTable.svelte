<script>
  import { onMount } from 'svelte';
  import * as d3 from 'd3';
  
  let data = [];
  let tidyData = [];
  let loading = true;
  let error = null;
  let currentPage = 1;
  let itemsPerPage = 10;
  let searchTerm = '';
  let uniqueIndicators = [];
  let indicatorCount = 0;

  // European country codes mapping
  const countryMap = {
    'BE': 'Belgium',
    'BG': 'Bulgaria',
    'CZ': 'Czech Republic',
    'DK': 'Denmark',
    'DE': 'Germany',
    'EE': 'Estonia',
    'IE': 'Ireland',
    'EL': 'Greece',
    'ES': 'Spain',
    'FR': 'France',
    'HR': 'Croatia',
    'IT': 'Italy',
    'CY': 'Cyprus',
    'LV': 'Latvia',
    'LT': 'Lithuania',
    'LU': 'Luxembourg',
    'HU': 'Hungary',
    'MT': 'Malta',
    'NL': 'Netherlands',
    'AT': 'Austria',
    'PL': 'Poland',
    'PT': 'Portugal',
    'RO': 'Romania',
    'SI': 'Slovenia',
    'SK': 'Slovakia',
    'FI': 'Finland',
    'SE': 'Sweden',
    'NO': 'Norway',
    'IS': 'Iceland',
    'LI': 'Liechtenstein',
    'CH': 'Switzerland'
  };

  // Indicator metadata with expanded categories
  const indicatorMeta = {
    // Natural Resources and Environment
    'env_emissions': {
      prettyName: 'CO2 Emissions',
      category: 'Natural Resources and Environment',
      description: 'CO2 emissions per capita in tonnes',
      generated: true
    },
    'renewable_energy': {
      prettyName: 'Renewable Energy Share',
      category: 'Natural Resources and Environment',
      description: 'Percentage of renewable energy in final consumption',
      generated: true
    },
    
    // Health and Basic Needs
    'hhinc_disinc_pps': {
      prettyName: 'Household Income',
      category: 'Health and Basic Needs',
      description: 'Disposable household income in purchasing power standards',
      generated: false
    },
    'poverty_risk': {
      prettyName: 'Poverty Risk',
      category: 'Health and Basic Needs',
      description: 'At risk of poverty rate',
      generated: false
    },
    'healthcare_access': {
      prettyName: 'Healthcare Access',
      category: 'Health and Basic Needs',
      description: 'Population with access to healthcare services (%)',
      generated: true
    },
    
    // Economy and Society
    'gdp_ppi': {
      prettyName: 'GDP per Capita',
      category: 'Economy and Society',
      description: 'Gross Domestic Product per capita in purchasing power standards',
      generated: false
    },
    'gva_tot': {
      prettyName: 'Gross Value Added',
      category: 'Economy and Society',
      description: 'Total gross value added at basic prices',
      generated: false
    },
    'lfst_r_lfe2emprt': {
      prettyName: 'Employment Rate',
      category: 'Economy and Society',
      description: 'Employment rate of population aged 15-64',
      generated: false
    },
    
    // Infrastructure and Society
    'digital_connectivity': {
      prettyName: 'Digital Connectivity',
      category: 'Infrastructure and Society',
      description: 'Percentage of households with broadband access',
      generated: true
    },
    'transport_access': {
      prettyName: 'Transport Infrastructure',
      category: 'Infrastructure and Society',
      description: 'Public transport accessibility score',
      generated: true
    },
    
    // Governance and Policy
    'civic_participation': {
      prettyName: 'Civic Participation',
      category: 'Governance, Policy and Participation',
      description: 'Voter turnout in regional elections (%)',
      generated: true
    },
    'policy_effectiveness': {
      prettyName: 'Policy Effectiveness',
      category: 'Governance, Policy and Participation',
      description: 'Regional policy implementation effectiveness score',
      generated: true
    }
  };

  // Categories for grouping
  const categories = [
    'Natural Resources and Environment',
    'Health and Basic Needs',
    'Economy and Society',
    'Infrastructure and Society',
    'Governance, Policy and Participation'
  ];

  function getPrettyIndicatorName(indicator) {
    return indicatorMeta[indicator]?.prettyName || indicator;
  }

  function getIndicatorCategory(indicator) {
    return indicatorMeta[indicator]?.category || 'Other';
  }

  // Function to generate realistic random data
  function generateValue(indicator, year) {
    const ranges = {
      'env_emissions': { min: 2, max: 15, decimals: 1 },
      'renewable_energy': { min: 5, max: 60, decimals: 1 },
      'healthcare_access': { min: 75, max: 100, decimals: 1 },
      'digital_connectivity': { min: 60, max: 95, decimals: 1 },
      'transport_access': { min: 40, max: 100, decimals: 1 },
      'civic_participation': { min: 45, max: 85, decimals: 1 },
      'policy_effectiveness': { min: 3, max: 9, decimals: 1 }
    };

    const range = ranges[indicator] || { min: 0, max: 100, decimals: 1 };
    const value = range.min + Math.random() * (range.max - range.min);
    return +value.toFixed(range.decimals);
  }

  function transformToTidy(rawData) {
    const tidyRows = [];
    const years = Array.from({length: 15}, (_, i) => 2008 + i); // 2008-2022
    
    rawData.forEach(row => {
      const countryCode = row.CODE.substring(0, 2);
      const countryName = countryMap[countryCode] || 'Unknown';

      // Process existing indicators
      Object.entries(indicatorMeta).forEach(([indicator, meta]) => {
        years.forEach(year => {
          const existingValue = row[`${indicator}_${year}`];
          const value = meta.generated ? 
            generateValue(indicator, year) : 
            (existingValue !== ':' && existingValue !== '' ? +existingValue : generateValue(indicator, year));

          tidyRows.push({
            countryCode,
            country: countryName,
            regionCode: row.CODE,
            region: row.NAME,
            indicator,
            indicatorName: meta.prettyName,
            category: meta.category,
            year,
            value,
            isGenerated: meta.generated || (existingValue === ':' || existingValue === '')
          });
        });
      });
    });
    
    return tidyRows;
  }

  function getUniqueIndicators(tidyRows) {
    const indicators = [...new Set(tidyRows.map(row => row.indicator))];
    return indicators.sort();
  }

  onMount(async () => {
    try {
      const response = await fetch('/data/data_sample.csv');
      const text = await response.text();
      data = d3.csvParse(text);
      tidyData = transformToTidy(data);
      uniqueIndicators = getUniqueIndicators(tidyData);
      indicatorCount = uniqueIndicators.length;
      loading = false;
    } catch (e) {
      error = e.message;
      loading = false;
    }
  });

  // Add column configuration
  const columnConfig = {
    countryCode: { label: 'Country Code', visible: true },
    country: { label: 'Country', visible: true },
    regionCode: { label: 'Region Code', visible: true },
    region: { label: 'Region Name', visible: true },
    indicator: { label: 'Indicator', visible: true },
    category: { label: 'Category', visible: true },
    year: { label: 'Year', visible: true },
    value: { label: 'Value', visible: true },
    isGenerated: { label: 'Source', visible: true }
  };

  let visibleColumns = Object.keys(columnConfig);
  let showColumnSelector = false;

  // Filter for data source
  let showGenerated = true;
  let showRecorded = true;

  function toggleColumn(column) {
    columnConfig[column].visible = !columnConfig[column].visible;
    visibleColumns = Object.keys(columnConfig).filter(col => columnConfig[col].visible);
  }

  // Update filtered data to include source filtering
  $: filteredData = tidyData.filter(row => {
    const matchesSearch = Object.values(row).some(value => 
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    );
    const matchesSource = (row.isGenerated && showGenerated) || (!row.isGenerated && showRecorded);
    return matchesSearch && matchesSource;
  });

  $: paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  $: totalPages = Math.ceil(filteredData.length / itemsPerPage);

  function nextPage() {
    if (currentPage < totalPages) currentPage++;
  }

  function prevPage() {
    if (currentPage > 1) currentPage--;
  }

  function formatValue(value) {
    if (typeof value === 'number') {
      return value.toLocaleString('en-US', {
        maximumFractionDigits: 2
      });
    }
    return value;
  }

  // Group indicators by category
  function getGroupedIndicators(indicators) {
    const grouped = {};
    categories.forEach(category => {
      grouped[category] = indicators.filter(ind => 
        indicatorMeta[ind]?.category === category
      );
    });
    return grouped;
  }
</script>

<div class="table-container">
  <div class="table-info">
    <h3>Data Summary</h3>
    <p>Total Indicators: {indicatorCount}</p>
    <details>
      <summary>View Indicators by Category</summary>
      {#each categories as category}
        <div class="category-group">
          <h4>{category}</h4>
          <ul>
            {#each uniqueIndicators.filter(ind => getIndicatorCategory(ind) === category) as indicator}
              <li>
                <strong>{getPrettyIndicatorName(indicator)}</strong>
                <span class="indicator-code">({indicator})</span>
                {#if indicatorMeta[indicator]?.description}
                  <p class="indicator-description">{indicatorMeta[indicator].description}</p>
                {/if}
              </li>
            {/each}
          </ul>
        </div>
      {/each}
    </details>
  </div>

  <div class="table-controls">
    <div class="search-controls">
      <input
        type="text"
        placeholder="Search regions, indicators..."
        bind:value={searchTerm}
        class="search-input"
      />
      <select bind:value={itemsPerPage} class="items-per-page">
        <option value={10}>10 per page</option>
        <option value={25}>25 per page</option>
        <option value={50}>50 per page</option>
      </select>
    </div>

    <div class="filter-controls">
      <button 
        class="column-selector-btn"
        on:click={() => showColumnSelector = !showColumnSelector}>
        Column Settings
      </button>

      <div class="source-filter">
        <label>
          <input 
            type="checkbox" 
            bind:checked={showRecorded}
          > Recorded Data
        </label>
        <label>
          <input 
            type="checkbox" 
            bind:checked={showGenerated}
          > Generated Data
        </label>
      </div>
    </div>

    {#if showColumnSelector}
      <div class="column-selector">
        <h4>Visible Columns</h4>
        {#each Object.entries(columnConfig) as [column, config]}
          <label>
            <input 
              type="checkbox" 
              checked={config.visible}
              on:change={() => toggleColumn(column)}
            >
            {config.label}
          </label>
        {/each}
      </div>
    {/if}
  </div>

  {#if loading}
    <p>Loading data...</p>
  {:else if error}
    <p class="error">Error: {error}</p>
  {:else}
    <div class="table-wrapper">
      <table>
        <thead>
          <tr>
            {#if columnConfig.countryCode.visible}<th>Country Code</th>{/if}
            {#if columnConfig.country.visible}<th>Country</th>{/if}
            {#if columnConfig.regionCode.visible}<th>Region Code</th>{/if}
            {#if columnConfig.region.visible}<th>Region Name</th>{/if}
            {#if columnConfig.indicator.visible}<th>Indicator</th>{/if}
            {#if columnConfig.category.visible}<th>Category</th>{/if}
            {#if columnConfig.year.visible}<th>Year</th>{/if}
            {#if columnConfig.value.visible}<th>Value</th>{/if}
            {#if columnConfig.isGenerated.visible}<th>Source</th>{/if}
          </tr>
        </thead>
        <tbody>
          {#each paginatedData as row}
            <tr>
              {#if columnConfig.countryCode.visible}<td>{row.countryCode}</td>{/if}
              {#if columnConfig.country.visible}<td>{row.country}</td>{/if}
              {#if columnConfig.regionCode.visible}<td>{row.regionCode}</td>{/if}
              {#if columnConfig.region.visible}<td>{row.region}</td>{/if}
              {#if columnConfig.indicator.visible}
                <td>
                  <span class="indicator-name">{row.indicatorName}</span>
                  <span class="indicator-code">({row.indicator})</span>
                </td>
              {/if}
              {#if columnConfig.category.visible}
                <td>
                  <span class="category-tag">{row.category}</span>
                </td>
              {/if}
              {#if columnConfig.year.visible}<td>{row.year}</td>{/if}
              {#if columnConfig.value.visible}<td class="value">{formatValue(row.value)}</td>{/if}
              {#if columnConfig.isGenerated.visible}
                <td>
                  {#if row.isGenerated}
                    <span class="generated">Generated</span>
                  {:else}
                    <span class="recorded">Recorded</span>
                  {/if}
                </td>
              {/if}
            </tr>
          {/each}
        </tbody>
      </table>
    </div>

    <div class="pagination">
      <button on:click={prevPage} disabled={currentPage === 1}>Previous</button>
      <span>Page {currentPage} of {totalPages}</span>
      <button on:click={nextPage} disabled={currentPage === totalPages}>Next</button>
    </div>
  {/if}
</div>

<style>
  .table-container {
    margin: 2rem 0;
  }

  .table-controls {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .search-controls {
    display: flex;
    gap: 1rem;
    flex: 1;
  }

  .filter-controls {
    display: flex;
    gap: 1rem;
    align-items: center;
  }

  .search-input {
    padding: 0.5rem;
    border: 1px solid var(--border-color);
    border-radius: 4px;
    background: var(--bg-secondary);
    color: var(--text-primary);
    flex: 1;
  }

  .items-per-page {
    padding: 0.5rem;
    border: 1px solid var(--border-color);
    border-radius: 4px;
    background: var(--bg-secondary);
    color: var(--text-primary);
  }

  .table-wrapper {
    overflow-x: auto;
    border-radius: 8px;
    background: var(--bg-secondary);
  }

  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.9rem;
  }

  th {
    white-space: nowrap;
    background: var(--bg-secondary);
    color: var(--text-primary);
    font-weight: 500;
    text-align: left;
    padding: 1rem;
    border-bottom: 1px solid var(--border-color);
    position: sticky;
    top: 0;
  }

  td {
    padding: 0.75rem 1rem;
    color: var(--text-secondary);
    border-bottom: 1px solid var(--border-color);
    white-space: nowrap;
  }

  td:nth-child(4) {
    white-space: normal; /* Allow region names to wrap */
    min-width: 200px;
  }

  tr:hover td {
    background: var(--bg-primary);
  }

  .pagination {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    margin-top: 1rem;
  }

  .pagination button {
    padding: 0.5rem 1rem;
    border: 1px solid var(--border-color);
    border-radius: 4px;
    background: var(--bg-secondary);
    color: var(--text-primary);
    cursor: pointer;
  }

  .pagination button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .error {
    color: #ef4444;
    padding: 1rem;
    border-radius: 8px;
    background: rgba(239, 68, 68, 0.1);
  }

  .value {
    font-family: monospace;
    text-align: right;
  }

  .table-info {
    margin-bottom: 2rem;
    padding: 1rem;
    background: var(--bg-secondary);
    border-radius: 8px;
  }

  .table-info h3 {
    color: var(--text-primary);
    margin-bottom: 0.5rem;
  }

  .table-info p {
    color: var(--text-secondary);
    margin-bottom: 1rem;
  }

  details {
    color: var(--text-secondary);
  }

  summary {
    cursor: pointer;
    color: var(--accent-color);
    margin-bottom: 0.5rem;
  }

  ul {
    list-style: none;
    padding-left: 1rem;
  }

  li {
    margin-bottom: 0.5rem;
  }

  .category-group {
    margin-bottom: 1.5rem;
  }

  .category-group h4 {
    color: var(--text-primary);
    margin-bottom: 0.5rem;
    font-size: 1rem;
  }

  .indicator-code {
    color: var(--text-secondary);
    font-size: 0.8rem;
    margin-left: 0.5rem;
  }

  .indicator-description {
    color: var(--text-secondary);
    font-size: 0.9rem;
    margin-top: 0.25rem;
    margin-left: 1rem;
  }

  .indicator-name {
    color: var(--text-primary);
    font-weight: 500;
  }

  .generated {
    color: var(--accent-color);
    font-size: 0.8rem;
    padding: 0.2rem 0.4rem;
    border-radius: 4px;
    background: rgba(59, 130, 246, 0.1);
  }

  .recorded {
    color: var(--text-secondary);
    font-size: 0.8rem;
  }

  .source-filter {
    display: flex;
    gap: 1rem;
    align-items: center;
  }

  .source-filter label {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    color: var(--text-secondary);
    font-size: 0.9rem;
  }

  .column-selector-btn {
    padding: 0.5rem 1rem;
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: 4px;
    color: var(--text-primary);
    cursor: pointer;
  }

  .column-selector {
    position: absolute;
    right: 0;
    top: 100%;
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: 4px;
    padding: 1rem;
    margin-top: 0.5rem;
    z-index: 10;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .column-selector h4 {
    color: var(--text-primary);
    margin-bottom: 0.5rem;
  }

  .column-selector label {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    color: var(--text-secondary);
    padding: 0.25rem 0;
  }

  .category-tag {
    font-size: 0.85rem;
    padding: 0.2rem 0.5rem;
    border-radius: 4px;
    background: var(--bg-primary);
    color: var(--text-secondary);
    white-space: nowrap;
  }
</style> 