<script>
  import ChartComponent from './ChartComponent.svelte';
  const recommendations = {
    dataVisualization: {
      title: "Data Visualization Strategies",
      items: [
        {
          title: "Interactive Choropleth Maps",
          description: "For spatial comparison of indicators across regions and countries",
          benefits: [
            "Immediate visual understanding of geographical patterns",
            "Color gradients to show value distributions",
            "Interactive tooltips for detailed information"
          ],
          example: {
            type: 'choropleth',
            data: {
              labels: ['FR', 'DE', 'ES', 'IT', 'PL'],
              datasets: [{
                label: 'CO2 Emissions',
                data: [8.2, 9.1, 7.3, 7.8, 8.9]
              }]
            },
            level: 0,
            note: "* CO2 emissions measured in tonnes per capita"
          }
        },
        {
          title: "Time Series Line Charts",
          description: "For temporal analysis and trend identification",
          benefits: [
            "Track changes over the 15-year period",
            "Compare multiple regions or indicators",
            "Identify convergence or divergence patterns"
          ],
          example: {
            type: 'line',
            data: {
              labels: ['2018', '2019', '2020', '2021', '2022'],
              datasets: [
                {
                  label: 'Northern Europe',
                  data: [85, 87, 82, 88, 91],
                  borderColor: 'rgba(54, 162, 235, 0.8)',
                  tension: 0.4
                },
                {
                  label: 'Southern Europe',
                  data: [75, 78, 73, 77, 80],
                  borderColor: 'rgba(255, 99, 132, 0.8)',
                  tension: 0.4
                }
              ]
            }
          }
        },
        {
          title: "Radar/Spider Charts",
          description: "For category-based comparisons",
          benefits: [
            "Compare performance across all 5 categories",
            "Easy to spot strengths and weaknesses",
            "Good for regional profiles"
          ],
          example: {
            type: 'radar',
            data: {
              labels: ['Economic', 'Social', 'Environmental', 'Infrastructure', 'Governance'],
              datasets: [
                {
                  label: 'Region A',
                  data: [85, 78, 92, 88, 76],
                  backgroundColor: 'rgba(54, 162, 235, 0.2)',
                  borderColor: 'rgba(54, 162, 235, 0.8)',
                  fill: true
                },
                {
                  label: 'Region B',
                  data: [72, 85, 68, 75, 82],
                  backgroundColor: 'rgba(255, 99, 132, 0.2)',
                  borderColor: 'rgba(255, 99, 132, 0.8)',
                  fill: true
                }
              ]
            }
          }
        }
      ]
    },
    analysisApproaches: {
      title: "Analysis Approaches",
      items: [
        {
          title: "Multi-level Comparison Framework",
          description: "Structured approach to compare across different dimensions",
          levels: [
            "Country-level aggregates for broad patterns",
            "Regional comparisons within countries",
            "Cross-border regional analysis",
            "Category-based performance assessment"
          ],
          example: {
            type: 'bar',
            data: {
              labels: ['France', 'Germany', 'Spain', 'Italy', 'Poland'],
              datasets: [
                {
                  label: 'Country Average',
                  data: [82, 85, 78, 80, 75],
                  backgroundColor: 'rgba(54, 162, 235, 0.7)',
                  order: 2
                },
                {
                  label: 'Best Performing Region',
                  data: [92, 95, 88, 89, 83],
                  type: 'line',
                  borderColor: 'rgba(75, 192, 192, 0.8)',
                  order: 1
                },
                {
                  label: 'Worst Performing Region',
                  data: [72, 75, 68, 71, 67],
                  type: 'line',
                  borderColor: 'rgba(255, 99, 132, 0.8)',
                  order: 0
                }
              ]
            }
          }
        },
        {
          title: "Temporal Pattern Analysis",
          description: "Understanding changes and trends",
          methods: [
            "Year-over-year growth rates",
            "Long-term trend analysis",
            "Crisis period impact assessment",
            "Recovery pattern identification"
          ],
          example: {
            type: 'line',
            data: {
              labels: ['2008', '2010', '2012', '2014', '2016', '2018', '2020', '2022'],
              datasets: [
                {
                  label: 'Actual Values',
                  data: [100, 95, 92, 96, 98, 102, 85, 99],
                  borderColor: 'rgba(54, 162, 235, 0.8)',
                  tension: 0.4,
                  fill: false
                },
                {
                  label: 'Long-term Trend',
                  data: [98, 97, 96, 97, 98, 99, 98, 100],
                  borderColor: 'rgba(75, 192, 192, 0.8)',
                  borderDash: [5, 5],
                  tension: 0.4,
                  fill: false
                }
              ]
            },
            note: "* Showing crisis impact (2020) and recovery patterns"
          }
        }
      ]
    },
    summaryMetrics: {
      title: "Summary Statistics and Indices",
      items: [
        {
          title: "Composite Indicators",
          description: "Create aggregate measures for easier comparison",
          examples: [
            "Overall Resilience Index",
            "Category-specific indices",
            "Progress indicators"
          ],
          example: {
            type: 'bar',
            data: {
              labels: ['Region A', 'Region B', 'Region C', 'Region D', 'Region E'],
              datasets: [
                {
                  label: 'Economic Resilience',
                  data: [75, 82, 68, 88, 71],
                  backgroundColor: 'rgba(54, 162, 235, 0.7)',
                  stack: 'Stack 0'
                },
                {
                  label: 'Social Resilience',
                  data: [82, 75, 85, 72, 78],
                  backgroundColor: 'rgba(75, 192, 192, 0.7)',
                  stack: 'Stack 0'
                },
                {
                  label: 'Environmental Resilience',
                  data: [68, 78, 72, 85, 80],
                  backgroundColor: 'rgba(255, 206, 86, 0.7)',
                  stack: 'Stack 0'
                }
              ]
            }
          }
        },
        {
          title: "Statistical Summaries",
          description: "Key statistical measures for quick insights",
          metrics: [
            "Regional disparities (variance, ranges)",
            "Central tendencies",
            "Distribution patterns",
            "Outlier identification"
          ],
          example: {
            type: 'boxplot',
            data: {
              labels: ['GDP per capita', 'Employment Rate', 'Innovation Index'],
              datasets: [{
                label: 'Distribution',
                data: [
                  {
                    min: 20000,
                    q1: 25000,
                    median: 30000,
                    q3: 35000,
                    max: 45000,
                    outliers: [18000, 48000]
                  },
                  {
                    min: 60,
                    q1: 65,
                    median: 70,
                    q3: 75,
                    max: 80,
                    outliers: [55, 85]
                  },
                  {
                    min: 30,
                    q1: 40,
                    median: 50,
                    q3: 60,
                    max: 70,
                    outliers: [25, 75]
                  }
                ],
                backgroundColor: 'rgba(54, 162, 235, 0.5)',
                borderColor: 'rgba(54, 162, 235, 0.8)'
              }]
            },
            note: `* Box plots show the distribution of values across regions:
              • Box: Contains 50% of the data (Q1 to Q3)
              • Line in box: Median value
              • Whiskers: Extend to min/max (excluding outliers)
              • Points: Individual outliers (values > 1.5 × IQR from box)`
          }
        }
      ]
    },
    presentationFormats: {
      title: "Presentation Formats",
      items: [
        {
          title: "Interactive Dashboard",
          features: [
            "Customizable views",
            "Drill-down capabilities",
            "Dynamic filtering",
            "Export functionality"
          ],
          example: {
            type: 'doughnut',
            data: {
              labels: ['Economic', 'Social', 'Environmental', 'Infrastructure', 'Governance'],
              datasets: [{
                data: [25, 20, 20, 15, 20],
                backgroundColor: [
                  'rgba(54, 162, 235, 0.7)',
                  'rgba(75, 192, 192, 0.7)',
                  'rgba(255, 206, 86, 0.7)',
                  'rgba(153, 102, 255, 0.7)',
                  'rgba(255, 99, 132, 0.7)'
                ]
              }]
            },
            note: "* Example of an overview chart from an interactive dashboard"
          }
        },
        {
          title: "Automated Reports",
          features: [
            "Regular status updates",
            "Trend analysis reports",
            "Custom comparison reports",
            "Policy briefings"
          ]
        }
      ]
    }
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 500
    },
    scales: {
      y: {
        grid: { color: 'var(--chart-grid-color)' },
        ticks: { color: 'var(--text-secondary)' }
      },
      x: {
        grid: { color: 'var(--chart-grid-color)' },
        ticks: { color: 'var(--text-secondary)' }
      }
    },
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: 'var(--text-primary)',
          padding: 20,
          font: { size: 12 }
        }
      },
      tooltip: {
        backgroundColor: 'var(--bg-secondary)',
        titleColor: 'var(--text-primary)',
        bodyColor: 'var(--text-primary)',
        borderColor: 'var(--border-color)',
        borderWidth: 1
      }
    }
  };
</script>

<section class="recommendations">
  {#each Object.entries(recommendations) as [key, section]}
    <div class="recommendation-section">
      <h2>{section.title}</h2>
      
      {#each section.items as item}
        <div class="recommendation-item">
          <div class="content">
            <h3>{item.title}</h3>
            {#if item.description}
              <p class="description">{item.description}</p>
            {/if}
            
            {#if item.benefits}
              <div class="benefits">
                <h4>Benefits:</h4>
                <ul>
                  {#each item.benefits as benefit}
                    <li>{benefit}</li>
                  {/each}
                </ul>
              </div>
            {/if}

            {#if item.levels}
              <div class="levels">
                <h4>Levels of Analysis:</h4>
                <ul>
                  {#each item.levels as level}
                    <li>{level}</li>
                  {/each}
                </ul>
              </div>
            {/if}

            {#if item.methods}
              <div class="methods">
                <h4>Methods:</h4>
                <ul>
                  {#each item.methods as method}
                    <li>{method}</li>
                  {/each}
                </ul>
              </div>
            {/if}

            {#if item.examples}
              <div class="examples">
                <h4>Examples:</h4>
                <ul>
                  {#each item.examples as example}
                    <li>{example}</li>
                  {/each}
                </ul>
              </div>
            {/if}

            {#if item.metrics}
              <div class="metrics">
                <h4>Key Metrics:</h4>
                <ul>
                  {#each item.metrics as metric}
                    <li>{metric}</li>
                  {/each}
                </ul>
              </div>
            {/if}

            {#if item.features}
              <div class="features">
                <h4>Key Features:</h4>
                <ul>
                  {#each item.features as feature}
                    <li>{feature}</li>
                  {/each}
                </ul>
              </div>
            {/if}
          </div>
          
          {#if item.example}
            <div class="chart-example">
              <h4>Example:</h4>
              <div class="chart-container" class:map-container={item.example.type === 'choropleth'}>
                <ChartComponent 
                  type={item.example.type}
                  data={item.example.data}
                  options={chartOptions}
                  level={item.example.level}
                />
                {#if item.example.note}
                  <p class="example-note">{item.example.note}</p>
                {/if}
              </div>
            </div>
          {/if}
        </div>
      {/each}
    </div>
  {/each}
</section>

<style>
  .recommendations {
    margin: 2rem 0;
  }

  .recommendation-section {
    margin-bottom: 3rem;
  }

  .recommendation-section h2 {
    color: var(--text-primary);
    font-size: 1.8rem;
    margin-bottom: 1.5rem;
    font-weight: 600;
    letter-spacing: -0.01em;
  }

  .recommendation-item {
    background: var(--bg-secondary);
    border-radius: 8px;
    padding: 1.5rem;
    margin-bottom: 1.5rem;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
    align-items: start;
  }

  .recommendation-item h3 {
    color: var(--text-primary);
    font-size: 1.3rem;
    margin-bottom: 1rem;
    font-weight: 500;
  }

  .recommendation-item h4 {
    color: var(--text-primary);
    font-size: 1rem;
    margin: 1rem 0 0.5rem;
    font-weight: 500;
  }

  .description {
    color: var(--text-secondary);
    font-size: 1.1rem;
    margin-bottom: 1rem;
    line-height: 1.5;
  }

  ul {
    list-style: none;
    padding-left: 1.5rem;
  }

  li {
    color: var(--text-secondary);
    margin-bottom: 0.5rem;
    position: relative;
    line-height: 1.4;
  }

  li::before {
    content: "•";
    color: var(--accent-color);
    position: absolute;
    left: -1.5rem;
  }

  .chart-example {
    background: var(--bg-primary);
    padding: 1rem;
    border-radius: 8px;
    border: 1px solid var(--border-color);
  }

  .chart-example h4 {
    color: var(--text-primary);
    margin-bottom: 1rem;
    font-size: 1rem;
  }

  .chart-container {
    height: 300px;
    position: relative;
  }

  @media (max-width: 1024px) {
    .recommendation-item {
      grid-template-columns: 1fr;
    }
  }

  .example-note {
    color: var(--text-secondary);
    font-size: 0.8rem;
    font-style: italic;
    margin-top: 1rem;
    text-align: center;
  }

  .map-container {
    height: 400px !important;
  }
</style> 