<script>
  import { slide } from "svelte/transition";

  export let shouldSlide = true;
  export let hover = true;
</script>

{#if shouldSlide}
  <h1 class:hover transition:slide><slot /></h1>
{:else}
  <h1 class:hover><slot /></h1>
{/if}

<style lang="scss">
  h1 {
    text-align: center;
  }

  .hover {
    margin-top: 0.25em;
    transition-property: transform;

    &:hover {
      transform: scale(1.05);
    }
  }
</style>
