<script>
  import { onMount } from 'svelte';
  import * as d3 from 'd3';
  import { tidyData, getDescriptiveStats, getRegionalTrends } from '../utils/dataProcessor';
  import Section from './Section.svelte';
  import GuideSection from './GuideSection.svelte';
  
  let stats = null;
  let trends = null;
  let regions = [];
  let loading = true;
  let error = null;

  onMount(async () => {
    try {
      const response = await fetch('/data/data_sample.csv');
      const text = await response.text();
      const rawData = d3.csvParse(text);
      
      const tidyRows = tidyData(rawData);
      stats = getDescriptiveStats(tidyRows);
      trends = getRegionalTrends(tidyRows);
      
      // Get unique regions
      regions = [...new Set(tidyRows.map(d => d.name))].sort();
      
      loading = false;
    } catch (e) {
      error = e.message;
      loading = false;
    }
  });

  function formatNumber(num, decimals = 2) {
    return new Intl.NumberFormat('en-US', {
      maximumFractionDigits: decimals
    }).format(num);
  }

  function getKeyInsights() {
    if (!stats) return [];
    
    const insights = [];
    
    // Household Income Insights
    const income = stats.household_income;
    insights.push({
      title: "Household Income Distribution",
      points: [
        `Average household income across regions: ${formatNumber(income.mean)} PPS`,
        `Income inequality (range): ${formatNumber(income.max - income.min)} PPS`,
        `Middle 50% of regions fall between ${formatNumber(income.q1)} and ${formatNumber(income.q3)} PPS`
      ]
    });

    // GDP Insights
    const gdp = stats.gdp;
    insights.push({
      title: "GDP Performance",
      points: [
        `Average GDP per capita: ${formatNumber(gdp.mean)} PPS`,
        `Highest performing region: ${formatNumber(gdp.max)} PPS`,
        `Economic disparity ratio: ${formatNumber(gdp.max / gdp.min, 1)}x`
      ]
    });

    // Employment Insights
    const employment = stats.employment_rate;
    insights.push({
      title: "Employment Patterns",
      points: [
        `Average employment rate: ${formatNumber(employment.mean)}%`,
        `Employment rate range: ${formatNumber(employment.min)}% - ${formatNumber(employment.max)}%`,
        `Standard deviation: ${formatNumber(employment.std)}%`
      ]
    });

    return insights;
  }
</script>

<div class="analysis">
  {#if loading}
    <p>Loading analysis...</p>
  {:else if error}
    <p class="error">Error: {error}</p>
  {:else}
    <Section 
      title="Regional Economic Analysis" 
      description="Comprehensive analysis of economic indicators across European regions">
      
      <div class="insights">
        {#each getKeyInsights() as insight}
          <div class="insight-card">
            <h3>{insight.title}</h3>
            <ul>
              {#each insight.points as point}
                <li>{point}</li>
              {/each}
            </ul>
          </div>
        {/each}
      </div>
    </Section>

    <GuideSection
      title="Regional Development Patterns"
      subtitle="Analysis of economic disparities and growth trends"
      date="2024">
      
      <h3>Key Findings</h3>
      <ul>
        <li>Significant economic disparities persist between regions, with a {formatNumber(stats.gdp.max / stats.gdp.min, 1)}x difference in GDP per capita</li>
        <li>Employment rates show relative stability, with a standard deviation of {formatNumber(stats.employment_rate.std)}%</li>
        <li>Household income distribution suggests a need for targeted development policies</li>
      </ul>

      <h3>Recommendations</h3>
      <div class="recommendations">
        <ol>
          <li>Focus on reducing regional disparities through targeted investment programs</li>
          <li>Implement policies to support regions with below-average employment rates</li>
          <li>Develop strategies to improve household income in lower-performing regions</li>
        </ol>
      </div>
    </GuideSection>
  {/if}
</div>

<style>
  .analysis {
    margin-top: 2rem;
  }

  .insights {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
  }

  .insight-card {
    background: var(--bg-secondary);
    padding: 1.5rem;
    border-radius: 8px;
  }

  .insight-card h3 {
    color: var(--text-primary);
    font-size: 1.2rem;
    margin-bottom: 1rem;
    font-weight: 500;
  }

  .insight-card ul {
    list-style: none;
    padding: 0;
  }

  .insight-card li {
    color: var(--text-secondary);
    margin-bottom: 0.8rem;
    font-size: 0.95rem;
    line-height: 1.5;
  }

  .recommendations {
    margin-top: 1.5rem;
  }

  .recommendations ol {
    padding-left: 1.2rem;
  }

  .recommendations li {
    margin-bottom: 1rem;
    color: var(--text-secondary);
  }

  .error {
    color: #ef4444;
    padding: 1rem;
    border-radius: 8px;
    background: rgba(239, 68, 68, 0.1);
  }
</style> 