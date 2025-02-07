<script>
  import { onMount } from 'svelte';
  import * as d3 from 'd3';
  import Section from './Section.svelte';
  import { theme } from '../stores/theme.js';

  let container;
  let data = [];
  let isPlaying = false;
  let currentYear = 2008;
  let animationFrame;

  const years = {
    min: 2008,
    max: 2022
  };

  onMount(() => {
    // Initial visualization setup
  });

  function togglePlayback() {
    isPlaying = !isPlaying;
    if (isPlaying) {
      animate();
    } else {
      cancelAnimationFrame(animationFrame);
    }
  }

  function animate() {
    // Animation logic will go here
  }

  onDestroy(() => {
    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
    }
  });
</script>

<div class="tween-view">
  <div class="controls">
    <div class="control-group">
      <label>
        Indicator:
        <select>
          <option>GDP per capita</option>
          <option>Employment Rate</option>
          <option>Innovation Index</option>
        </select>
      </label>

      <div class="playback-controls">
        <button 
          class="play-button"
          on:click={togglePlayback}
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? '⏸' : '▶'}
        </button>
        <span class="year-display">{currentYear}</span>
      </div>
    </div>

    <div class="timeline">
      <input 
        type="range" 
        min={years.min} 
        max={years.max} 
        bind:value={currentYear}
        class="year-slider"
      />
      <div class="year-marks">
        <span>{years.min}</span>
        <span>{years.max}</span>
      </div>
    </div>
  </div>

  <div class="visualization" bind:this={container}>
    <!-- Animated visualization will be rendered here -->
  </div>

  <div class="info-panel">
    <div class="stat-cards">
      <div class="stat-card">
        <span class="label">Change Rate</span>
        <span class="value">+2.3%</span>
      </div>
      <div class="stat-card">
        <span class="label">Volatility</span>
        <span class="value">Medium</span>
      </div>
      <div class="stat-card">
        <span class="label">Trend</span>
        <span class="value">Upward</span>
      </div>
    </div>
  </div>
</div>

<style>
  .tween-view {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .controls {
    background: var(--bg-secondary);
    padding: 1.5rem;
    border-radius: 8px;
  }

  .control-group {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
  }

  .playback-controls {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .play-button {
    background: var(--bg-primary);
    border: 1px solid var(--border-color);
    color: var(--text-primary);
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
  }

  .play-button:hover {
    background: var(--accent-color);
    color: white;
    border-color: var(--accent-color);
  }

  .year-display {
    font-size: 1.2rem;
    color: var(--text-primary);
    font-weight: 500;
    min-width: 4rem;
    text-align: center;
  }

  .timeline {
    margin-top: 1rem;
  }

  .year-slider {
    width: 100%;
    -webkit-appearance: none;
    height: 4px;
    background: var(--border-color);
    border-radius: 2px;
    outline: none;
    margin-bottom: 0.5rem;
  }

  .year-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: var(--accent-color);
    cursor: pointer;
    transition: transform 0.1s;
  }

  .year-slider::-webkit-slider-thumb:hover {
    transform: scale(1.2);
  }

  .year-marks {
    display: flex;
    justify-content: space-between;
    color: var(--text-secondary);
    font-size: 0.9rem;
  }

  .visualization {
    background: var(--bg-secondary);
    padding: 1.5rem;
    border-radius: 8px;
    height: 500px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .info-panel {
    background: var(--bg-secondary);
    padding: 1.5rem;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }

  .stat-cards {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
  }

  .stat-card {
    background: var(--bg-primary);
    padding: 1rem;
    border-radius: 6px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    transition: transform 0.2s;
  }

  .stat-card:hover {
    transform: translateY(-2px);
  }

  .stat-card .label {
    color: var(--text-secondary);
    font-size: 0.9rem;
  }

  .stat-card .value {
    color: var(--text-primary);
    font-size: 1.4rem;
    font-weight: 600;
  }

  select {
    padding: 0.5rem;
    border-radius: 4px;
    border: 1px solid var(--border-color);
    background: var(--bg-primary);
    color: var(--text-primary);
    min-width: 200px;
  }

  label {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    color: var(--text-secondary);
  }
</style> 