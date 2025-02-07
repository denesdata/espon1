<script>
  import { onMount } from 'svelte';
  import * as d3 from 'd3';
  import BoxplotTooltip from '../BoxplotTooltip.svelte';

  export let data;
  export let width = 600;
  export let height = 300;

  let svg;
  let tooltipVisible = false;
  let tooltipX = 0;
  let tooltipY = 0;

  onMount(() => {
    const margin = { top: 20, right: 20, bottom: 40, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Create SVG
    const svgElement = d3.select(svg)
      .attr('width', width)
      .attr('height', height);

    const g = svgElement.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Scales
    const x = d3.scaleBand()
      .domain(data.labels)
      .range([0, innerWidth])
      .padding(0.1);

    const y = d3.scaleLinear()
      .domain([
        d3.min(data.datasets[0].data, d => d.min),
        d3.max(data.datasets[0].data, d => d.max)
      ])
      .range([innerHeight, 0])
      .nice();

    // Draw boxes
    data.datasets[0].data.forEach((d, i) => {
      const boxGroup = g.append('g')
        .attr('transform', `translate(${x(data.labels[i])},0)`);

      // Box
      boxGroup.append('rect')
        .attr('x', x.bandwidth() * 0.25)
        .attr('width', x.bandwidth() * 0.5)
        .attr('y', y(d.q3))
        .attr('height', y(d.q1) - y(d.q3))
        .attr('fill', data.datasets[0].backgroundColor)
        .attr('stroke', data.datasets[0].borderColor);

      // Median line
      boxGroup.append('line')
        .attr('x1', x.bandwidth() * 0.25)
        .attr('x2', x.bandwidth() * 0.75)
        .attr('y1', y(d.median))
        .attr('y2', y(d.median))
        .attr('stroke', data.datasets[0].borderColor)
        .attr('stroke-width', 2);

      // Whiskers
      boxGroup.append('line')
        .attr('x1', x.bandwidth() * 0.5)
        .attr('x2', x.bandwidth() * 0.5)
        .attr('y1', y(d.q3))
        .attr('y2', y(d.max))
        .attr('stroke', data.datasets[0].borderColor);

      boxGroup.append('line')
        .attr('x1', x.bandwidth() * 0.5)
        .attr('x2', x.bandwidth() * 0.5)
        .attr('y1', y(d.q1))
        .attr('y2', y(d.min))
        .attr('stroke', data.datasets[0].borderColor);

      // Outliers
      if (d.outliers) {
        d.outliers.forEach(outlier => {
          boxGroup.append('circle')
            .attr('cx', x.bandwidth() * 0.5)
            .attr('cy', y(outlier))
            .attr('r', 3)
            .attr('fill', data.datasets[0].borderColor);
        });
      }
    });

    // Axes
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x))
      .selectAll('text')
      .attr('fill', 'var(--text-secondary)');

    g.append('g')
      .call(d3.axisLeft(y))
      .selectAll('text')
      .attr('fill', 'var(--text-secondary)');

    // Add hover area for tooltip
    g.append('rect')
      .attr('class', 'tooltip-trigger')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', innerWidth)
      .attr('height', innerHeight)
      .attr('fill', 'transparent')
      .on('mousemove', (event) => {
        tooltipX = event.pageX;
        tooltipY = event.pageY;
        tooltipVisible = true;
      })
      .on('mouseleave', () => {
        tooltipVisible = false;
      });
  });
</script>

<div class="chart-wrapper">
  <svg bind:this={svg}></svg>
  <BoxplotTooltip 
    visible={tooltipVisible}
    x={tooltipX}
    y={tooltipY}
  />
</div>

<style>
  .chart-wrapper {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  svg {
    max-width: 100%;
  }
</style> 