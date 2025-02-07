<script>
  import ChartComponent from './ChartComponent.svelte';
  import { theme } from '../stores/theme.js';

  // Example data for comparing visualization methods
  const regionalData = {
    labels: ['Economic', 'Social', 'Environmental', 'Institutional', 'Digital'],
    datasets: [
      {
        label: 'Northern Region',
        data: [85, 78, 92, 88, 76],
        backgroundColor: 'rgba(54, 162, 235, 0.7)',
        borderColor: 'rgba(54, 162, 235, 0.7)',
      },
      {
        label: 'Southern Region',
        data: [72, 85, 68, 75, 82],
        backgroundColor: 'rgba(255, 99, 132, 0.7)',
        borderColor: 'rgba(255, 99, 132, 0.7)',
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

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
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
        borderWidth: 1
      }
    },
    scales: {
      r: {
        grid: {
          color: 'var(--chart-grid-color)',
        },
        ticks: {
          color: 'var(--text-secondary)',
          backdropColor: 'transparent'
        },
        pointLabels: {
          color: 'var(--text-primary)',
        }
      },
      x: {
        grid: {
          color: 'var(--chart-grid-color)',
        },
        ticks: {
          color: 'var(--text-secondary)',
        }
      },
      y: {
        grid: {
          color: 'var(--chart-grid-color)',
        },
        ticks: {
          color: 'var(--text-secondary)',
        }
      }
    }
  };
</script>

<div class="visualizations">
  <h2>Data Visualization Methods</h2>
  <p class="description">
    Compare different visualization methods for the same regional data to understand their strengths and use cases.
  </p>

  <div class="charts-grid">
    <div class="chart-card">
      <h3>Radar Chart</h3>
      <p>Best for comparing multiple variables across categories</p>
      <div class="chart">
        <ChartComponent 
          type="radar"
          data={radarData}
          options={chartOptions}
        />
      </div>
    </div>

    <div class="chart-card">
      <h3>Bar Chart</h3>
      <p>Ideal for direct value comparisons between regions</p>
      <div class="chart">
        <ChartComponent 
          type="bar"
          data={barData}
          options={chartOptions}
        />
      </div>
    </div>

    <div class="chart-card">
      <h3>Line Chart</h3>
      <p>Effective for showing trends and patterns</p>
      <div class="chart">
        <ChartComponent 
          type="line"
          data={lineData}
          options={chartOptions}
        />
      </div>
    </div>
  </div>
</div>

<style>
  .visualizations {
    padding: 2rem;
    background: var(--card-bg);
    border-radius: var(--radius-lg);
    border: 1px solid var(--border-color);
  }

  h2 {
    color: var(--text-primary);
    font-size: 2rem;
    margin-bottom: 1rem;
  }

  .description {
    color: var(--text-secondary);
    font-size: 1.1rem;
    margin-bottom: 2rem;
    max-width: 800px;
  }

  .charts-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: 2rem;
  }

  .chart-card {
    background: var(--bg-secondary);
    padding: 1.5rem;
    border-radius: var(--radius-md);
  }

  .chart-card h3 {
    color: var(--text-primary);
    font-size: 1.25rem;
    margin-bottom: 0.5rem;
  }

  .chart-card p {
    color: var(--text-secondary);
    margin-bottom: 1.5rem;
    font-size: 0.9rem;
  }

  .chart {
    height: 300px;
  }
</style> 