<script>
  import ChartComponent from './ChartComponent.svelte';
  import { theme } from '../stores/theme.js';

  // Example data for visualization demos
  const exampleData = {
    radar: {
      labels: ['Economic', 'Social', 'Environmental', 'Infrastructure', 'Governance'],
      datasets: [{
        label: 'Region A',
        data: [85, 78, 92, 88, 76],
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 0.8)',
        fill: true
      }]
    },
    bar: {
      labels: ['GDP', 'Employment', 'Education', 'Health', 'Innovation'],
      datasets: [{
        label: 'Indicators',
        data: [72, 85, 68, 75, 82],
        backgroundColor: 'rgba(75, 192, 192, 0.8)'
      }]
    },
    line: {
      labels: ['2018', '2019', '2020', '2021', '2022'],
      datasets: [{
        label: 'Trend',
        data: [65, 70, 62, 75, 81],
        borderColor: 'rgba(255, 99, 132, 0.8)',
        tension: 0.4,
        fill: false
      }]
    }
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    }
  };

  const sections = [
    {
      title: "Overview",
      content: "The TERRES Dashboard provides comprehensive insights into territorial resilience across European regions.",
      tips: [
        "Start with the Overview tab to introduce the scope and scale of the data",
        "Highlight the key metrics: 281 regions, 31 countries, 15 years of data",
        "Explain the five main categories of indicators"
      ],
      esriPossible: true,
      esriNotes: "Can be implemented as a Story Map with dynamic statistics and scrolling narrative"
    },
    {
      title: "Data Analysis Tools",
      content: "The dashboard offers multiple ways to analyze and visualize territorial resilience data:",
      tools: [
        {
          name: "Matrix View",
          description: "Complete overview of all indicators",
          esriPossible: true,
          esriTool: "Feature attribute table with conditional formatting"
        },
        {
          name: "Heatmap",
          description: "Compact visualization of data patterns",
          esriPossible: true,
          esriTool: "Custom visualization using Arcade expressions"
        },
        {
          name: "Flower Charts",
          description: "Category-based regional comparisons",
          esriPossible: false,
          esriNote: "Not available in ESRI. Alternative: Use multiple bar/line charts for category comparisons"
        },
        {
          name: "Distribution Plot",
          description: "Statistical distribution of indicators",
          esriPossible: true,
          esriTool: "Charts widget with histogram configuration"
        }
      ]
    },
    {
      title: "Map-based Analysis",
      content: "Spatial visualization tools for understanding regional patterns:",
      tools: [
        {
          name: "Map Explorer",
          description: "Interactive choropleth maps",
          esriPossible: true,
          esriTool: "Web Map with smart mapping capabilities"
        },
        {
          name: "Comparison Map",
          description: "Side-by-side regional comparison",
          esriPossible: true,
          esriTool: "Side-by-side map configuration in Experience Builder"
        }
      ]
    },
    {
      title: "Advanced Features",
      content: "Specialized tools for deeper analysis:",
      features: [
        {
          name: "Time Series Analysis",
          description: "Track changes over time",
          esriPossible: true,
          esriTool: "Time Slider widget"
        },
        {
          name: "Regional Comparisons",
          description: "Direct comparison of regions",
          esriPossible: true,
          esriTool: "Dashboard with comparative widgets"
        },
        {
          name: "Data Export",
          description: "Raw data access",
          esriPossible: true,
          esriTool: "Feature layer download capabilities"
        }
      ]
    }
  ];
</script>

<div class="guide">
  <h2>Presentation Guide</h2>
  <p class="intro">
    This guide provides structured recommendations for presenting territorial resilience data and notes on ESRI implementation possibilities.
  </p>

  <div class="sections">
    {#each sections as section}
      <div class="section-card">
        <h3>{section.title}</h3>
        <p class="content">{section.content}</p>
        
        {#if section.tips}
          <div class="tips">
            <h4>Presentation Tips:</h4>
            <ul>
              {#each section.tips as tip}
                <li>{tip}</li>
              {/each}
            </ul>
          </div>
        {/if}

        {#if section.tools}
          <div class="tools">
            {#each section.tools as tool}
              <div class="tool">
                <div class="tool-header">
                  <h5>{tool.name}</h5>
                  <span class="esri-badge" class:not-possible={!tool.esriPossible}>
                    {tool.esriPossible ? 'ESRI Compatible' : 'Custom Development'}
                  </span>
                </div>
                <p>{tool.description}</p>
                {#if tool.name === 'Matrix View' || tool.name === 'Heatmap'}
                  <div class="example-viz matrix-example">
                    <div class="matrix-grid">
                      {#each Array(5) as _, i}
                        {#each Array(8) as _, j}
                          <div class="matrix-cell" 
                            style="opacity: {0.2 + Math.random() * 0.8}"
                          ></div>
                        {/each}
                      {/each}
                    </div>
                  </div>
                {:else if tool.name === 'Flower Charts'}
                  <div class="example-viz">
                    <ChartComponent 
                      type="radar"
                      data={exampleData.radar}
                      options={chartOptions}
                    />
                  </div>
                {:else if tool.name === 'Distribution Plot'}
                  <div class="example-viz">
                    <ChartComponent 
                      type="bar"
                      data={exampleData.bar}
                      options={chartOptions}
                    />
                  </div>
                {/if}
                {#if tool.esriTool}
                  <p class="esri-note">ESRI Implementation: {tool.esriTool}</p>
                {/if}
              </div>
            {/each}
          </div>
        {/if}

        {#if section.features}
          <div class="features">
            {#each section.features as feature}
              <div class="feature">
                <div class="feature-header">
                  <h5>{feature.name}</h5>
                  <span class="esri-badge" class:not-possible={!feature.esriPossible}>
                    {feature.esriPossible ? 'ESRI Compatible' : 'Custom Development'}
                  </span>
                </div>
                <p>{feature.description}</p>
                {#if feature.esriTool}
                  <p class="esri-note">ESRI Implementation: {feature.esriTool}</p>
                {/if}
              </div>
            {/each}
          </div>
        {/if}
      </div>
    {/each}
  </div>
</div>

<style>
  .guide {
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

  .intro {
    color: var(--text-secondary);
    font-size: 1.1rem;
    margin-bottom: 2rem;
    max-width: 800px;
    line-height: 1.6;
  }

  .sections {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    gap: 1.5rem;
  }

  .section-card {
    background: var(--bg-secondary);
    padding: 1.5rem;
    border-radius: var(--radius-md);
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  h3 {
    color: var(--text-primary);
    font-size: 1.25rem;
    margin-bottom: 0.5rem;
  }

  .content {
    color: var(--text-secondary);
    line-height: 1.5;
  }

  .tips, .tools, .features {
    background: var(--bg-primary);
    padding: 1rem;
    border-radius: var(--radius-sm);
  }

  h4, h5 {
    color: var(--text-primary);
    font-size: 1rem;
    margin-bottom: 0.5rem;
  }

  ul {
    list-style-type: none;
    padding: 0;
    margin: 0;
  }

  li {
    color: var(--text-secondary);
    margin-bottom: 0.5rem;
    padding-left: 1.5rem;
    position: relative;
  }

  li::before {
    content: "•";
    color: var(--accent-color);
    position: absolute;
    left: 0;
  }

  .tool, .feature {
    margin-bottom: 1rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid var(--border-color);
  }

  .tool:last-child, .feature:last-child {
    margin-bottom: 0;
    padding-bottom: 0;
    border-bottom: none;
  }

  .tool-header, .feature-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
  }

  .esri-badge {
    font-size: 0.8rem;
    padding: 0.2rem 0.5rem;
    border-radius: var(--radius-sm);
    background: var(--accent-color);
    color: white;
  }

  .esri-badge.not-possible {
    background: var(--bg-hover);
    color: var(--text-secondary);
  }

  .esri-note {
    font-size: 0.9rem;
    color: var(--accent-color);
    margin-top: 0.5rem;
  }

  .example-viz {
    height: 150px;
    margin: 1rem 0;
    background: var(--bg-primary);
    border-radius: var(--radius-sm);
    overflow: hidden;
  }

  .matrix-example {
    padding: 0.5rem;
  }

  .matrix-grid {
    display: grid;
    grid-template-columns: repeat(8, 1fr);
    gap: 2px;
    height: 100%;
  }

  .matrix-cell {
    background: var(--accent-color);
    border-radius: 2px;
  }
</style> 