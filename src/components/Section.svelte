<script>
  export let title;
  export let description;
</script>

<section class="section">
  <div class="section-header">
    <h2>{title}</h2>
    <p>{description}</p>
  </div>
  <slot></slot>
</section>

<style>
  .section {
    background: var(--chart-container-bg);
    border-radius: 8px;
    padding: 3rem;
    margin-bottom: 3rem;
  }

  .section-header {
    max-width: 700px;
    margin-bottom: 3rem;
  }

  h2 {
    color: var(--text-primary);
    font-size: 1.8rem;
    margin-bottom: 1rem;
    font-weight: 600;
    letter-spacing: -0.01em;
  }

  p {
    color: var(--text-secondary);
    line-height: 1.7;
    font-size: 1.1rem;
  }
</style> 