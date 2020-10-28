<script>
    import { slide } from "svelte/transition";

    export let shouldSlide = true;
</script>

{#if shouldSlide}
<h1 transition:slide><slot/></h1>
{:else}
<h1><slot/></h1>
{/if}

<style lang="scss">
    h1 {
        text-align: center;
    }
</style>