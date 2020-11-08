<script>
    import Kana from "./pages/Kana.svelte";
    import Vocabulary from "./pages/Vocabulary.svelte";
    import Numbers from "./pages/Numbers.svelte";

    import Nav from "./components/Nav.svelte";
    import Links from "./components/Links.svelte";

    let type = "kana";

    const pages = {
        kana: { page: Kana, name: "Les Kana" },
        vocabulary: { page: Vocabulary, name: "Le Vocabulaire" },
        numbers: { page: Numbers, name: "Les Nombres" },
    };

    const handleChange = ({ detail }) => {
        type = detail.link;
    };

    $: page = pages[type].page;

    $: links = Object.keys(pages).map(link => {
        const name = pages[link].name;
        return { link, name }
    });
</script>

<Nav
    {links}
    currentLink={type}
    on:change={handleChange}
/>
{#if page}
<svelte:component this={page} />
{/if}
<Links />