<script>
  import ChartComponent from './ChartComponent.svelte';
  import Section from './Section.svelte';
  import DataAnalysis from './DataAnalysis.svelte';
  import DataTable from './DataTable.svelte';
  import { theme } from '../stores/theme.js';
  import { onDestroy } from 'svelte';
  import GuideSection from './GuideSection.svelte';
  import Recommendations from './Recommendations.svelte';
  import MapExplorer from './MapExplorer.svelte';
  import BeeswarmPlot from './BeeswarmPlot.svelte';
  import TweenView from './TweenView.svelte';

  // Updated chart colors for better theme compatibility
  const chartColors = {
    light: [
      'rgba(54, 162, 235, 0.7)',
      'rgba(75, 192, 192, 0.7)',
      'rgba(255, 206, 86, 0.7)',
      'rgba(255, 99, 132, 0.7)',
      'rgba(153, 102, 255, 0.7)'
    ],
    dark: [
      'rgba(54, 162, 235, 0.8)',
      'rgba(75, 192, 192, 0.8)',
      'rgba(255, 206, 86, 0.8)',
      'rgba(255, 99, 132, 0.8)',
      'rgba(153, 102, 255, 0.8)'
    ]
  };

  // Chart data with theme-aware colors
  const distributionData = {
    labels: ['France', 'Germany', 'Spain', 'Italy', 'Poland'],
    datasets: [{
      label: 'GDP Distribution',
      data: [2.603, 3.806, 1.281, 1.886, 0.592],
      backgroundColor: chartColors.dark,
      borderWidth: 1
    }]
  };

  const trendData = {
    labels: ['2018', '2019', '2020', '2021', '2022'],
    datasets: [{
      label: 'EU Average',
      data: [85, 87, 82, 89, 91],
      borderColor: chartColors.dark[1],
      tension: 0.4,
      fill: false
    }]
  };

  const comparisonData = {
    labels: ['Education', 'Healthcare', 'Infrastructure', 'Research'],
    datasets: [
      {
        label: 'Northern Europe',
        data: [85, 89, 92, 88],
        backgroundColor: chartColors.dark[0],
      },
      {
        label: 'Southern Europe',
        data: [76, 82, 78, 74],
        backgroundColor: chartColors.dark[3],
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: 'var(--chart-text-color)',
          padding: 20,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        backgroundColor: 'var(--chart-container-bg)',
        titleColor: 'var(--text-primary)',
        bodyColor: 'var(--text-primary)',
        borderColor: 'var(--chart-grid-color)',
        borderWidth: 1
      }
    },
    scales: {
      x: {
        grid: {
          color: 'var(--chart-grid-color)',
          borderColor: 'var(--chart-grid-color)'
        },
        ticks: {
          color: 'var(--chart-text-color)'
        }
      },
      y: {
        grid: {
          color: 'var(--chart-grid-color)',
          borderColor: 'var(--chart-grid-color)'
        },
        ticks: {
          color: 'var(--chart-text-color)'
        }
      }
    }
  };

  // Example data for comparing visualization methods
  const regionalData = {
    labels: ['Economic', 'Social', 'Environmental', 'Institutional', 'Digital'],
    datasets: [
      {
        label: 'Northern Region',
        data: [85, 78, 92, 88, 76],
        backgroundColor: chartColors.dark[0],
        borderColor: chartColors.dark[0],
      },
      {
        label: 'Southern Region',
        data: [72, 85, 68, 75, 82],
        backgroundColor: chartColors.dark[1],
        borderColor: chartColors.dark[1],
      }
    ]
  };

  // Different visualization options for the same data
  const radarData = {
    ...regionalData,
    datasets: regionalData.datasets.map(dataset => ({
      ...dataset,
      fill: true,
      opacity: 0.5
    }))
  };

  const barData = {
    ...regionalData
  };

  const lineData = {
    ...regionalData,
    datasets: regionalData.datasets.map(dataset => ({
      ...dataset,
      fill: false,
      tension: 0.4
    }))
  };

  let activeTab = 'overview';
  
  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'analysis', label: 'Data Analysis' },
    { id: 'map', label: 'Map Explorer' },
    { id: 'matrix', label: 'Matrix View' },
    { id: 'comparison', label: 'Comparison Map' },
    { id: 'beeswarm', label: 'Distribution' },
    { id: 'tween', label: 'Animation' },
    { id: 'compare', label: 'Compare' },
    { id: 'charts', label: 'Visualizations' },
    { id: 'data', label: 'Raw Data' },
    { id: 'recommendations', label: 'Presentation Guide' }
  ];
</script>

<div class="dashboard">
  <div class="overview">
    <h2>Welcome to TERRES Dashboard</h2>
    <p class="intro">
      Explore territorial resilience data through various interactive visualizations:
    </p>
    
    <div class="overview-grid">
      <div class="metric-card">
        <h3>Total Regions</h3>
        <div class="value">281</div>
        <p>Analyzed regions across Europe</p>
      </div>
      <div class="metric-card">
        <h3>Time Period</h3>
        <div class="value">2008-2023</div>
        <p>15 years of economic data</p>
      </div>
      <div class="metric-card">
        <h3>Key Indicators</h3>
        <div class="value">12</div>
        <p>Across 5 categories</p>
      </div>
    </div>

    <div class="features">
      <div class="feature">
        <h3>Data Analysis</h3>
        <p>Examine statistical distributions and patterns across regions and time periods.</p>
      </div>
      <div class="feature">
        <h3>Visual Comparisons</h3>
        <p>Compare regions and countries using interactive maps and charts.</p>
      </div>
      <div class="feature">
        <h3>Temporal Trends</h3>
        <p>Track changes and developments over the 15-year period from 2008 to 2023.</p>
      </div>
    </div>

    <div class="charts-preview">
      <h3>Data Preview</h3>
      <div class="charts-grid">
        <div class="chart">
          <h4>GDP Distribution</h4>
          <ChartComponent 
            type="bar"
            data={distributionData}
            options={chartOptions} 
          />
        </div>
        <div class="chart">
          <h4>Employment Trends</h4>
          <ChartComponent 
            type="line"
            data={trendData}
            options={chartOptions} 
          />
        </div>
        <div class="chart">
          <h4>Regional Comparison</h4>
          <ChartComponent 
            type="radar"
            data={comparisonData}
            options={chartOptions} 
          />
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  .dashboard {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .overview {
    background: var(--card-bg);
    padding: 2rem;
    border-radius: var(--radius-lg);
    border: 1px solid var(--border-color);
  }

  h2 {
    color: var(--text-primary);
    font-size: 2rem;
    margin-bottom: 1rem;
  }

  .intro {
    color: var(--text-secondary);
    font-size: 1.1rem;
    margin-bottom: 2rem;
  }

  .overview-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1.5rem;
    margin-bottom: 3rem;
  }

  .metric-card {
    background: var(--bg-secondary);
    padding: 1.5rem;
    border-radius: var(--radius-md);
    text-align: center;
  }

  .metric-card h3 {
    color: var(--text-secondary);
    font-size: 0.9rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 0.5rem;
  }

  .metric-card .value {
    color: var(--accent-color);
    font-size: 2.5rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
  }

  .metric-card p {
    color: var(--text-secondary);
    font-size: 0.9rem;
  }

  .charts-preview {
    margin-top: 3rem;
  }

  .charts-preview h3 {
    color: var(--text-primary);
    font-size: 1.5rem;
    margin-bottom: 1.5rem;
  }

  .charts-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1.5rem;
  }

  .chart {
    background: var(--bg-secondary);
    padding: 1.5rem;
    border-radius: var(--radius-md);
    height: 300px;
  }

  .chart h4 {
    color: var(--text-primary);
    margin-bottom: 1rem;
    font-size: 1.1rem;
  }
</style> 