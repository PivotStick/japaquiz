<script>
    import Infinite from "./components/Infinite.svelte";

    let type = "infinite";
</script>

{#if type === "infinite"}
<Infinite />
{/if}