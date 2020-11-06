<script>
    import { slide } from "svelte/transition";

    export let shouldSlide = true;
    export let hover = true;
</script>

{#if shouldSlide}
<h1 class:hover={hover} transition:slide><slot/></h1>
{:else}
<h1 class:hover={hover}><slot/></h1>
{/if}

<style lang="scss">
    h1 { text-align: center }

    .hover {
        transition: 400ms;
        transition-property: transform padding;

        &:hover {
            transform: scale(1.1);
            padding: 1em 0;
        }

        &:first-child:hover { padding: 0 0 .5em 0 }
        &:last-child:hover { padding: .5em 0 0 0 }
    }
</style>