<script>
  import { onMount } from 'svelte';
  import * as d3 from 'd3';
  import ChartComponent from './ChartComponent.svelte';
  import { generateSyntheticData, indicatorConfig } from '../utils/generateSyntheticData.js';
  
  // Track chart instance for updates
  let chart;
  
  let data = [];
  let syntheticData;
  let loading = true;
  let error = null;
  
  // Selection state
  let comparisonType = 'region'; // 'region' or 'country'
  let selection1 = '';
  let selection2 = '';
  let selectedYear = '2020';
  let selectedIndicators = [];
  let indicatorMeta = {};
  
  // Available options
  let regions = [];
  let countries = [];
  let years = [];
  let indicators = [];
  
  // Helper function to calculate z-scores
  function calculateZScores(values) {
    const mean = d3.mean(values);
    const std = d3.deviation(values);
    return values.map(v => (v - mean) / (std || 1)); // avoid division by 0
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
      
      // Generate synthetic data
      syntheticData = generateSyntheticData(regions);
      
      // Create metadata for indicators including synthetic data
      indicatorMeta = {
        'env_emissions': {
          label: 'CO2 Emissions',
          synthetic: true,
          unit: 'tonnes/capita'
        },
        'renewable_energy': {
          label: 'Renewable Energy',
          synthetic: true,
          unit: '%'
        },
        'gdp_ppi': {
          label: 'GDP per capita',
          synthetic: false,
          unit: 'PPS'
        },
        'hhinc_disinc_pps': {
          label: 'Household Income',
          synthetic: false,
          unit: 'PPS'
        },
        'healthcare_access': {
          label: 'Healthcare Access',
          synthetic: true,
          unit: '%'
        },
        'digital_connectivity': {
          label: 'Digital Connectivity',
          synthetic: true,
          unit: '%'
        },
        'transport_access': {
          label: 'Transport Infrastructure',
          synthetic: true,
          unit: 'score'
        },
        'civic_participation': {
          label: 'Civic Participation',
          synthetic: true,
          unit: '%'
        },
        'policy_effectiveness': {
          label: 'Policy Effectiveness',
          synthetic: true,
          unit: 'score'
        }
      };
      
      indicators = Object.keys(indicatorMeta);
      selectedIndicators = indicators.slice(0, 3);
      loading = false;
    } catch (e) {
      error = e.message;
      loading = false;
    }
  });

  $: comparisonOptions = comparisonType === 'region' ? regions : countries;
  
  $: comparisonData = getComparisonData(selection1, selection2, selectedYear, selectedIndicators);
  
  function getComparisonData(sel1, sel2, year, selectedInds) {
    if (!sel1 || !sel2 || !data.length) return null;
    
    // Reset chart if selections change
    if (chart) {
      chart.clear();
    }
    
    const getData = (selection) => {
      const isCountry = comparisonType === 'country';
      const filter = isCountry 
        ? d => d.CODE.startsWith(selection)
        : d => d.CODE === selection;
      
      const filteredData = data.filter(filter);
      
      return selectedInds.map(indicator => {
        let value;
        if (indicatorMeta[indicator].synthetic) {
          value = isCountry
            ? d3.mean(regions.filter(r => r.startsWith(selection))
                .map(r => syntheticData[year]?.[r]?.[indicator] || 0))
            : syntheticData[year]?.[selection]?.[indicator] || 0;
        } else {
          const values = filteredData.map(d => +d[`${indicator}_${year}`] || 0);
          value = isCountry ? d3.mean(values) : values[0];
        }
        return { indicator, value };
      });
    };
    
    // Get data for both selections
    const data1 = getData(sel1);
    const data2 = getData(sel2);
    
    // Combine values for z-score calculation
    const normalizedData = selectedInds.map((ind, i) => {
      const values = [data1[i].value, data2[i].value];
      const zScores = calculateZScores(values);
      return {
        indicator: ind,
        zScores,
        originalValues: values
      };
    });
    
    return {
      labels: selectedInds.map(ind => indicatorMeta[ind].label),
      datasets: [
        {
          label: sel1,
          data: normalizedData.map(d => d.zScores[0]),
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          borderColor: 'rgba(54, 162, 235, 0.7)',
          pointBackgroundColor: 'rgba(54, 162, 235, 1)',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: 'rgba(54, 162, 235, 1)',
          fill: true
        },
        {
          label: sel2,
          data: normalizedData.map(d => d.zScores[1]),
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          borderColor: 'rgba(255, 99, 132, 0.7)',
          pointBackgroundColor: 'rgba(255, 99, 132, 1)',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: 'rgba(255, 99, 132, 1)',
          fill: true,
          originalValues: normalizedData.map(d => d.originalValues[1])
        }
      ],
      originalValues: normalizedData.map(d => d.originalValues)
    };
  }

  // Update chart when any of these values change
  $: {
    if (chart && comparisonData) {
      const updateTrigger = {
        comparisonType,
        selection1,
        selection2,
        selectedYear,
        selectedIndicators
      };
      
      requestAnimationFrame(() => {
        chart.update('resize');
      });
    }
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 500
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: 'var(--text-primary)',
          padding: 20,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        backgroundColor: 'var(--bg-secondary)',
        titleColor: 'var(--text-primary)',
        bodyColor: 'var(--text-primary)',
        borderColor: 'var(--border-color)',
        borderWidth: 1,
        callbacks: {
          label: function(context) {
            const indicator = selectedIndicators[context.dataIndex];
            const originalValue = comparisonData?.originalValues?.[context.dataIndex]?.[context.datasetIndex] ?? 0;
            return `${context.dataset.label}: ${context.raw.toFixed(2)}σ (${originalValue.toFixed(2)} ${indicatorMeta[indicator].unit})`;
          }
        }
      }
    },
    scales: {
      r: {
        beginAtZero: false,  // Allow negative values for z-scores
        grid: {
          color: 'var(--chart-grid-color)',
        },
        ticks: {
          color: 'var(--text-secondary)',
          backdropColor: 'transparent',
          callback: function(value) {
            return value.toFixed(1) + 'σ';  // Show standard deviations
          }
        },
        pointLabels: {
          color: 'var(--text-primary)',
          font: {
            size: 12
          }
        },
        min: -3,  // Typical z-score range
        max: 3
      }
    }
  };
</script>

<div class="comparison-tool">
  <div class="controls">
    <div class="control-group">
      <label>
        Compare by:
        <select bind:value={comparisonType}>
          <option value="region">Region</option>
          <option value="country">Country</option>
        </select>
      </label>
    </div>
    
    <div class="control-group">
      <label>
        Selection 1:
        <select 
          bind:value={selection1}
          class:has-value={selection1}>
          <option value="">Select {comparisonType}</option>
          {#each comparisonOptions as option}
            <option value={option}>{option}</option>
          {/each}
        </select>
      </label>
      
      <label>
        Selection 2:
        <select 
          bind:value={selection2}
          class:has-value={selection2}>
          <option value="">Select {comparisonType}</option>
          {#each comparisonOptions as option}
            <option value={option}>{option}</option>
          {/each}
        </select>
      </label>
    </div>
    
    <div class="control-group">
      <label>
        Year:
        <select bind:value={selectedYear}>
          {#each years as year}
            <option value={year}>{year}</option>
          {/each}
        </select>
      </label>
    </div>
    
    <div class="control-group indicators">
      <span class="label">Indicators:</span>
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
            <span class="unit">({indicatorMeta[indicator].unit})</span>
          </span>
        </label>
      {/each}
    </div>
  </div>

  <div class="comparison-view">
    {#if loading}
      <p>Loading comparison tool...</p>
    {:else if error}
      <p class="error">Error: {error}</p>
    {:else if !selection1 || !selection2}
      <p class="instruction">Select two {comparisonType}s to compare</p>
    {:else}
      <div class="comparison-table">
        <table>
          <thead>
            <tr>
              <th>Indicator</th>
              <th>{selection1}</th>
              <th>{selection2}</th>
              <th>Difference</th>
              <th>Type</th>
            </tr>
          </thead>
          <tbody>
            {#each selectedIndicators as indicator, i}
              {@const val1 = comparisonData?.originalValues?.[i]?.[0] ?? 0}
              {@const val2 = comparisonData?.originalValues?.[i]?.[1] ?? 0}
              <tr>
                <td>
                  {indicatorMeta[indicator].label}
                  <span class="unit">({indicatorMeta[indicator].unit})</span>
                </td>
                <td>{val1.toFixed(2)}</td>
                <td>{val2.toFixed(2)}</td>
                <td class:positive={val1 > val2} class:negative={val1 < val2}>
                  {(val1 - val2).toFixed(2)}
                </td>
                <td>
                  {#if indicatorMeta[indicator].synthetic}
                    <span class="synthetic-badge">Synthetic</span>
                  {:else}
                    <span class="recorded-badge">Recorded</span>
                  {/if}
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>

      <div class="chart-container">
        <ChartComponent 
          type="radar"
          data={comparisonData}
          options={chartOptions}
          bind:chart
          key={`${comparisonType}-${selection1}-${selection2}-${selectedYear}-${selectedIndicators.join('-')}`}
        />
      </div>
    {/if}
  </div>
</div>

<style>
  .comparison-tool {
    margin: 2rem 0;
  }

  .controls {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    margin-bottom: 2rem;
    background: var(--bg-secondary);
    padding: 1.5rem;
    border-radius: 8px;
  }

  .control-group {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
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
    min-width: 200px;
  }

  .indicators {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .indicators .label {
    color: var(--text-secondary);
    margin-bottom: 0.5rem;
  }

  .checkbox {
    flex-direction: row;
    align-items: center;
  }

  .chart-container {
    height: 400px;
    margin-top: 2rem;
    background: var(--bg-secondary);
    padding: 1.5rem;
    border-radius: 8px;
  }

  .comparison-table {
    background: var(--bg-secondary);
    border-radius: 8px;
    overflow: hidden;
    margin-bottom: 2rem;
  }

  table {
    width: 100%;
    border-collapse: collapse;
  }

  th, td {
    padding: 1rem;
    text-align: left;
    border-bottom: 1px solid var(--border-color);
  }

  th {
    background: var(--bg-primary);
    color: var(--text-primary);
    font-weight: 500;
  }

  td {
    color: var(--text-secondary);
  }

  .positive {
    color: #10b981;
  }

  .negative {
    color: #ef4444;
  }

  .instruction {
    color: var(--text-secondary);
    text-align: center;
    padding: 2rem;
    background: var(--bg-secondary);
    border-radius: 8px;
  }

  .synthetic-badge {
    background: var(--accent-color);
    color: white;
    font-size: 0.7rem;
    padding: 0.1rem 0.4rem;
    border-radius: 4px;
    margin-left: 0.5rem;
  }

  .recorded-badge {
    background: var(--text-secondary);
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

  .indicator-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  select.has-value {
    border-color: var(--accent-color);
  }
</style> 