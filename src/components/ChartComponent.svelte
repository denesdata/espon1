<script>
  import { onMount } from 'svelte';
  import Chart from 'chart.js/auto';
  import BoxPlotChart from './charts/BoxPlotChart.svelte';
  import ChoroplethChart from './charts/ChoroplethChart.svelte';
  
  export let type = 'bar';
  export let data = {};
  export let options = {};
  export let chart;
  
  let canvas;
  
  onMount(() => {
    if (type === 'boxplot' || type === 'choropleth') return;
    
    chart = new Chart(canvas, {
      type,
      data,
      options: {
        ...options,
        responsive: true,
        maintainAspectRatio: false
      }
    });

    return () => {
      chart.destroy();
    };
  });
</script>

{#if type === 'boxplot'}
  <BoxPlotChart {data} />
{:else if type === 'choropleth'}
  <ChoroplethChart {data} />
{:else}
  <canvas bind:this={canvas}></canvas>
{/if} 