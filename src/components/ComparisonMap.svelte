<script>
  import { onMount, onDestroy } from 'svelte';
  import 'leaflet/dist/leaflet.css';
  import L from 'leaflet';
  import * as d3 from 'd3';
  import { theme } from '../stores/theme.js';
  import { generateSyntheticData } from '../utils/generateSyntheticData.js';
  import * as topojson from 'topojson-client';

  let leftContainer;
  let rightContainer;
  let leftMap;
  let rightMap;
  let sliderContainer;
  let sliderMap;
  let leftLayer;
  let rightLayer;
  let sliderLeftLayer;
  let sliderRightLayer;
  let currentTopoJson;
  let isDragging = false;
  let sliderPosition = 50;

  let leftData = {
    year: '2008',
    indicator: 'gdppps'
  };

  let rightData = {
    year: '2022',
    indicator: 'env_emissions'
  };

  const indicators = [
    { id: 'gdppps', label: 'GDP PPS', unit: 'Index (EU=100)' },
    { id: 'env_emissions', label: 'CO2 Emissions', unit: 'tonnes/capita' },
    { id: 'renewable_energy', label: 'Renewable Energy', unit: '%' },
    { id: 'digital_connectivity', label: 'Digital Connectivity', unit: 'score' }
  ];

  const years = Array.from(
    { length: 2023 - 2008 }, 
    (_, i) => (2008 + i).toString()
  );

  function handleMouseDown(e) {
    e.preventDefault();
    e.stopPropagation();
    isDragging = true;
    updateSliderPosition(e);
  }

  function handleMouseMove(e) {
    if (isDragging) {
      e.preventDefault();
      e.stopPropagation();
      updateSliderPosition(e);
    }
  }

  function handleMouseUp() {
    isDragging = false;
  }

  function updateSliderPosition(e) {
    const rect = sliderContainer.getBoundingClientRect();
    const x = e.clientX - rect.left;
    sliderPosition = Math.max(0, Math.min(100, (x / rect.width) * 100));
  }

  onMount(() => {
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet.sync/L.Map.Sync.js';
    script.onload = async () => {
      initializeMaps();
      await updateMaps();
    };
    document.head.appendChild(script);
    
    // Add window event listeners for slider
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  });

  function initializeMaps() {
    // Initialize left map
    leftMap = L.map(leftContainer, {
      center: [48, 10],
      zoom: 4,
      zoomControl: false
    });

    // Initialize right map
    rightMap = L.map(rightContainer, {
      center: [48, 10],
      zoom: 4,
      zoomControl: false
    });

    // Add tile layers
    const darkTiles = 'https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png';
    const lightTiles = 'https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png';
    
    L.tileLayer($theme === 'dark' ? darkTiles : lightTiles).addTo(leftMap);
    L.tileLayer($theme === 'dark' ? darkTiles : lightTiles).addTo(rightMap);

    // Add zoom control to the right map only
    L.control.zoom({
      position: 'topright'
    }).addTo(rightMap);

    // Sync map movements
    leftMap.sync(rightMap);
    rightMap.sync(leftMap);

    // Initialize slider map
    sliderMap = L.map(sliderContainer, {
      center: [48, 10],
      zoom: 4,
      zoomControl: false
    });
    
    L.tileLayer($theme === 'dark' ? darkTiles : lightTiles).addTo(sliderMap);
    
    // Add zoom control
    L.control.zoom({
      position: 'topright'
    }).addTo(sliderMap);
  }

  async function loadTopoJson() {
    try {
      const response = await fetch('/data/nuts2_gdppps17_topo.json');
      const topoData = await response.json();
      currentTopoJson = topoData;
      return topojson.feature(topoData, topoData.objects.foo);
    } catch (error) {
      console.error('Error loading TopoJSON:', error);
      return null;
    }
  }

  // Helper function to generate data for a specific region
  function generateRegionData(regionId) {
    return {
      gdppps: Math.random() * 200,
      env_emissions: Math.random() * 20,
      renewable_energy: Math.random() * 100,
      digital_connectivity: Math.random() * 100
    };
  }

  // Generate synthetic data for all years
  function generateData(regions) {
    const data = {};
    for (let year = 2008; year <= 2022; year++) {
      data[year] = {};
      regions.forEach(region => {
        data[year][region] = generateRegionData(region);
      });
    }
    return data;
  }

  async function updateMaps() {
    try {
      const geojson = await loadTopoJson();
      if (!geojson) return;
      
      // Get all region IDs from the GeoJSON
      const regions = geojson.features.map(f => f.properties.NUTS_ID);
      const syntheticData = generateData(regions);
      
      // Update left map
      if (leftLayer) leftMap.removeLayer(leftLayer);
      leftLayer = L.geoJSON(geojson, {
        style: feature => ({
          fillColor: getColor(syntheticData[leftData.year]?.[feature.properties.NUTS_ID]?.[leftData.indicator] || 0),
          weight: 1,
          opacity: 1,
          color: $theme === 'dark' ? '#444' : '#fff',
          fillOpacity: 0.7
        }),
        onEachFeature: (feature, layer) => {
          const value = syntheticData[leftData.year]?.[feature.properties.NUTS_ID]?.[leftData.indicator];
          layer.bindTooltip(`
            ${feature.properties.NUTS_NAME}<br>
            Value: ${value ? value.toFixed(1) : 'N/A'}
          `);
        }
      }).addTo(leftMap);

      // Update right map
      if (rightLayer) rightMap.removeLayer(rightLayer);
      rightLayer = L.geoJSON(geojson, {
        style: feature => ({
          fillColor: getColor(syntheticData[rightData.year]?.[feature.properties.NUTS_ID]?.[rightData.indicator] || 0),
          weight: 1,
          opacity: 1,
          color: $theme === 'dark' ? '#444' : '#fff',
          fillOpacity: 0.7
        }),
        onEachFeature: (feature, layer) => {
          const value = syntheticData[rightData.year]?.[feature.properties.NUTS_ID]?.[rightData.indicator];
          layer.bindTooltip(`
            ${feature.properties.NUTS_NAME}<br>
            Value: ${value ? value.toFixed(1) : 'N/A'}
          `);
        }
      }).addTo(rightMap);

      // Update slider map layers
      if (sliderLeftLayer) sliderMap.removeLayer(sliderLeftLayer);
      if (sliderRightLayer) sliderMap.removeLayer(sliderRightLayer);
      
      sliderLeftLayer = L.geoJSON(geojson, {
        style: feature => ({
          fillColor: getColor(syntheticData[leftData.year]?.[feature.properties.NUTS_ID]?.[leftData.indicator] || 0),
          weight: 1,
          opacity: 1,
          color: $theme === 'dark' ? '#444' : '#fff',
          fillOpacity: 0.7
        }),
        onEachFeature: (feature, layer) => {
          const value = syntheticData[leftData.year]?.[feature.properties.NUTS_ID]?.[leftData.indicator];
          layer.bindTooltip(`
            ${feature.properties.NUTS_NAME}<br>
            Value: ${value ? value.toFixed(1) : 'N/A'}
          `);
        }
      }).addTo(sliderMap);
      
      sliderRightLayer = L.geoJSON(geojson, {
        style: feature => ({
          fillColor: getColor(syntheticData[rightData.year]?.[feature.properties.NUTS_ID]?.[rightData.indicator] || 0),
          weight: 1,
          opacity: 1,
          color: $theme === 'dark' ? '#444' : '#fff',
          fillOpacity: 0.7
        }),
        onEachFeature: (feature, layer) => {
          const value = syntheticData[rightData.year]?.[feature.properties.NUTS_ID]?.[rightData.indicator];
          layer.bindTooltip(`
            ${feature.properties.NUTS_NAME}<br>
            Value: ${value ? value.toFixed(1) : 'N/A'}
          `);
        }
      }).addTo(sliderMap);
    } catch (error) {
      console.error('Error updating maps:', error);
    }
  }

  function getColor(value) {
    // Simple color scale
    const scale = d3.scaleSequential()
      .domain([0, value > 100 ? 200 : 100]) // Adjust domain based on indicator range
      .interpolator($theme === 'dark' ? d3.interpolateRdYlBu : d3.interpolateBlues);
    return scale(value || 0);
  }

  onDestroy(() => {
    if (leftMap) leftMap.remove();
    if (rightMap) rightMap.remove();
    if (sliderMap) sliderMap.remove();
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);
  });

  // Watch for data changes
  $: if (leftData || rightData) {
    if (leftMap && rightMap) {
      updateMaps();
    }
  }
</script>

<div class="comparison-container">
  <div class="controls">
    <div class="control-group">
      <div class="left-controls">
        <label>
          Left Indicator:
          <select bind:value={leftData.indicator}>
            {#each indicators as indicator}
              <option value={indicator.id}>{indicator.label}</option>
            {/each}
          </select>
        </label>
        <label>
          Year:
          <select bind:value={leftData.year}>
            {#each years as year}
              <option value={year}>{year}</option>
            {/each}
          </select>
        </label>
      </div>

      <div class="right-controls">
        <label>
          Right Indicator:
          <select bind:value={rightData.indicator}>
            {#each indicators as indicator}
              <option value={indicator.id}>{indicator.label}</option>
            {/each}
          </select>
        </label>
        <label>
          Year:
          <select bind:value={rightData.year}>
            {#each years as year}
              <option value={year}>{year}</option>
            {/each}
          </select>
        </label>
      </div>
    </div>
  </div>

  <div class="maps-container">
    <div class="map-wrapper">
      <h3>{indicators.find(i => i.id === leftData.indicator)?.label} ({leftData.year})</h3>
      <div class="map" bind:this={leftContainer}></div>
    </div>
    <div class="map-wrapper">
      <h3>{indicators.find(i => i.id === rightData.indicator)?.label} ({rightData.year})</h3>
      <div class="map" bind:this={rightContainer}></div>
    </div>
  </div>

  <div class="slider-section">
    <h3>Compare {indicators.find(i => i.id === leftData.indicator)?.label} ({leftData.year}) with {indicators.find(i => i.id === rightData.indicator)?.label} ({rightData.year})</h3>
    <div 
      class="slider-container" 
      bind:this={sliderContainer}
      role="button"
      tabindex="0"
      on:mousedown={handleMouseDown}
      on:keydown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleMouseDown(e);
        }
      }}
    >
      <div 
        class="slider-handle"
        style="left: {sliderPosition}%"
      >
        <div class="slider-line"></div>
        <div class="slider-button">
          <span class="slider-arrow">◄</span>
          <span class="slider-arrow">►</span>
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  .comparison-container {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .controls {
    background: var(--card-bg);
    padding: 1.5rem;
    border-radius: var(--radius-lg);
    border: 1px solid var(--border-color);
  }

  .control-group {
    display: flex;
    justify-content: space-between;
    gap: 2rem;
  }

  .left-controls, .right-controls {
    display: flex;
    gap: 1rem;
    flex: 1;
  }

  .maps-container {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
  }

  .map-wrapper {
    background: var(--card-bg);
    padding: 1.5rem;
    border-radius: var(--radius-lg);
    border: 1px solid var(--border-color);
  }

  .map-wrapper h3 {
    color: var(--text-primary);
    margin-bottom: 1rem;
    font-size: 1.1rem;
    font-weight: 500;
  }

  .map {
    height: 500px;
    border-radius: var(--radius-md);
    overflow: hidden;
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

  .slider-section {
    background: var(--card-bg);
    padding: 1.5rem;
    border-radius: var(--radius-lg);
    border: 1px solid var(--border-color);
  }

  .slider-container {
    position: relative;
    height: 500px;
    border-radius: var(--radius-md);
    overflow: hidden;
  }

  .slider-handle {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 40px;
    margin-left: -20px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: col-resize;
    z-index: 1000;
  }

  .slider-line {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 2px;
    background: var(--accent-color);
    box-shadow: 0 0 4px rgba(0, 0, 0, 0.2);
  }

  .slider-button {
    position: absolute;
    width: 40px;
    height: 40px;
    background: var(--accent-color);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
    transform: scale(1);
    transition: transform 0.2s;
  }

  .slider-handle:hover .slider-button {
    transform: scale(1.1);
  }

  .slider-arrow {
    font-size: 0.8rem;
    margin: 0 2px;
  }
</style> 