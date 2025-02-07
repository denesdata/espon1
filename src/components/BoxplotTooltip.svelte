<script>
  export let visible = false;
  export let x = 0;
  export let y = 0;
</script>

{#if visible}
  <div 
    class="tooltip" 
    style="left: {x}px; top: {y}px"
  >
    <h4>Understanding Box Plots</h4>
    <ul>
      <li><strong>Box:</strong> Shows the interquartile range (IQR) containing the middle 50% of values</li>
      <li><strong>Median Line:</strong> The middle value dividing the data into two equal halves</li>
      <li><strong>Whiskers:</strong> Extend to the smallest/largest values within 1.5 × IQR</li>
      <li><strong>Outliers:</strong> Individual points beyond the whiskers, indicating unusual values</li>
    </ul>
    <div class="note">
      Outliers can indicate exceptional performance or potential data issues
    </div>
  </div>
{/if}

<style>
  .tooltip {
    position: absolute;
    background: var(--bg-primary);
    border: 1px solid var(--border-color);
    border-radius: 4px;
    padding: 1rem;
    width: 300px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    z-index: 1000;
    transform: translate(-50%, -100%);
    margin-top: -10px;
  }

  h4 {
    color: var(--text-primary);
    margin: 0 0 0.5rem;
    font-size: 1rem;
  }

  ul {
    margin: 0;
    padding-left: 1.2rem;
  }

  li {
    color: var(--text-secondary);
    font-size: 0.9rem;
    margin-bottom: 0.3rem;
  }

  .note {
    margin-top: 0.5rem;
    font-style: italic;
    color: var(--text-secondary);
    font-size: 0.9rem;
  }

  strong {
    color: var(--text-primary);
  }
</style> 