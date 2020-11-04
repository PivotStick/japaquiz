<script>
    import Infinite from "./components/Infinite.svelte";
    import Kanji from "./components/Kanji.svelte";

    import Nav from "./components/Nav.svelte";

    let type = "infinite";

    const pages = {
        infinite: Infinite,
        kanji: Kanji
    };

    const handleChange = ({ detail }) => {
        type = detail.link;
    };

    $: page = pages[type];
</script>

<Nav currentLink={type} on:change={handleChange} />
{#if page}
<svelte:component this={page} />
{/if}