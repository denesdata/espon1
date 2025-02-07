<script>
  import { onMount, onDestroy } from 'svelte';
  import L from 'leaflet';
  import 'leaflet/dist/leaflet.css';
  import * as d3 from 'd3';
  import * as topojson from 'topojson-client';
  import { theme } from '../../stores/theme.js';

  export let data;
  export let level = 2; // 0 for countries, 2 for NUTS2 regions
  let map;
  let mapElement;
  let geoJsonLayer;
  let legend;
  let currentTopoJson;
  let currentLevel = level;

  const colorScales = {
    light: [
      '#edf8fb',
      '#b2e2e2',
      '#66c2a4',
      '#2ca25f',
      '#006d2c'
    ],
    dark: [
      '#2c7fb8',
      '#41b6c4',
      '#7fcdbb',
      '#c7e9b4',
      '#ffffcc'
    ]
  };

  onMount(async () => {
    if (!data?.datasets?.[0]?.data) {
      return;
    }

    await loadTopoJson();
  });

  async function loadTopoJson() {
    // Load TopoJSON data based on level
    const response = await fetch(`/data/nuts${currentLevel}_gdppps17_topo.json`);
    const topoData = await response.json();
    currentTopoJson = topoData;
    await initializeMap();
  }

  async function initializeMap() {
    if (!currentTopoJson || !data?.datasets?.[0]?.data) return;
    
    const geojson = topojson.feature(currentTopoJson, currentTopoJson.objects.foo);

    // Create value lookup
    const valueLookup = {};
    data.datasets[0].data.forEach((value, index) => {
      valueLookup[data.labels[index]] = value;
    });

    // Color scale
    const getColor = d3.scaleQuantile()
      .domain([
        d3.min(data.datasets[0].data),
        d3.max(data.datasets[0].data)
      ])
      .range($theme === 'dark' ? colorScales.dark : colorScales.light);

    // Initialize map if not already initialized
    if (!map) {
      map = L.map(mapElement, {
        attributionControl: false  // Disable default attribution control
      }).setView([48, 10], currentLevel === 0 ? 3 : 4);
      
      // Add custom attribution without the flag
      L.control.attribution({
        prefix: 'Leaflet'
      }).addTo(map);

      // Use different tile layers based on theme
      const lightTiles = 'https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png';
      const darkTiles = 'https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png';
      
      const tileLayer = L.tileLayer($theme === 'dark' ? darkTiles : lightTiles, {
        attribution: '© OpenStreetMap contributors, © CARTO'
      }).addTo(map);

      // Add labels layer on top
      const labelsLayer = L.tileLayer(
        $theme === 'dark' 
          ? 'https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png'
          : 'https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png'
      ).addTo(map);

      // Update tiles when theme changes
      theme.subscribe(newTheme => {
        if (map) {
          tileLayer.setUrl(newTheme === 'dark' ? darkTiles : lightTiles);
          labelsLayer.setUrl(
            newTheme === 'dark'
              ? 'https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png'
              : 'https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png'
          );
        }
      });
    } else {
      // Update zoom level when switching between country and NUTS2
      map.setZoom(currentLevel === 0 ? 3 : 4);
    }

    // Update or create GeoJSON layer
    if (geoJsonLayer) {
      map.removeLayer(geoJsonLayer);
    }

    geoJsonLayer = L.geoJSON(geojson, {
      style: feature => ({
        fillColor: getColor(valueLookup[feature.properties.NUTS_ID] || 0),
        weight: 1,
        opacity: 1,
        color: $theme === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
        fillOpacity: $theme === 'dark' ? 0.8 : 0.7
      }),
      onEachFeature: (feature, layer) => {
        layer.bindTooltip(`
          ${feature.properties.NUTS_NAME}<br>
          ${data.datasets[0].label}: ${valueLookup[feature.properties.NUTS_ID]?.toFixed(1) || 'N/A'}
        `);
      }
    }).addTo(map);

    // Update or create legend
    if (legend) {
      map.removeControl(legend);
    }
    legend = L.control({ position: 'bottomright' });
    legend.onAdd = () => {
      const div = L.DomUtil.create('div', 'legend');
      const quantiles = getColor.quantiles();

      div.innerHTML = `
        <h4>${data.datasets[0].label}</h4>
        ${($theme === 'dark' ? colorScales.dark : colorScales.light).map((color, i) => `
          <i style="background:${color}"></i>
          ${i === 0 ? '< ' + Math.round(quantiles[0]) :
            i === colorScales.light.length - 1 ? '> ' + Math.round(quantiles[quantiles.length - 1]) :
            Math.round(quantiles[i-1]) + ' - ' + Math.round(quantiles[i])}
        `).join('<br>')}
      `;
      div.className = `legend ${$theme}`;
      return div;
    };
    legend.addTo(map);
  }

  // Watch for data changes
  $: if (data?.datasets?.[0]?.data && currentTopoJson) {
    initializeMap();
  }

  // Watch for level changes
  $: if (level !== currentLevel) {
    currentLevel = level;
    loadTopoJson();
  }

  // Clean up on destroy
  onDestroy(() => {
    if (map) {
      map.remove();
    }
  });
</script>

<div class="map-container" bind:this={mapElement}></div>

<style>
  .map-container {
    height: 100%;
    min-height: 300px;
    width: 100%;
    border-radius: 4px;
    overflow: hidden;
  }

  :global(.legend) {
    background: var(--bg-primary);
    padding: 10px;
    border-radius: 4px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.2);
    color: var(--text-primary);
  }

  :global(.legend.dark) {
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
  }

  :global(.legend i) {
    width: 18px;
    height: 18px;
    float: left;
    margin-right: 8px;
    opacity: 0.7;
  }

  :global(.legend h4) {
    margin: 0 0 10px;
    font-size: 14px;
    color: var(--text-primary);
  }

  :global(.leaflet-tooltip) {
    background: var(--bg-primary);
    color: var(--text-primary);
    border-color: var(--border-color);
  }

  :global(.leaflet-tooltip-left::before) {
    border-left-color: var(--border-color);
  }

  :global(.leaflet-tooltip-right::before) {
    border-right-color: var(--border-color);
  }
</style> 