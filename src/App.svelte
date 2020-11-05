<script>
    import Kana from "./pages/Kana.svelte";
    import Vocabulary from "./pages/Vocabulary.svelte";
    import Numbers from "./pages/Numbers.svelte";

    import Nav from "./components/Nav.svelte";

    let type = "kana";

    const pages = {
        kana: { page: Kana, name: "Kana" },
        vocabulary: { page: Vocabulary, name: "Vocabulary" },
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
<div class="youtube">
    <a class="youtube__link" target="_blank" href="https://www.youtube.com/channel/UChFfLNTK64xQj7NscGmLLLg">
        Julien Fontanier
    </a>
</div>

<style lang="scss">
    .youtube {
        position: fixed;

        bottom: 1em;
        right: 1em;

        &__link {
            box-sizing: border-box;
            display: block;

            text-decoration: none;
            padding: 1em 2em;
            border-radius: 2em;

            background-color: #ff3e00;
            color: white;
        }
    }
</style>