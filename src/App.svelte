<script>
    import Kana from "./pages/Kana.svelte";
    import Vocabulary from "./pages/Vocabulary.svelte";
    import Numbers from "./pages/Numbers.svelte";

    import Nav from "./components/Nav.svelte";

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
<div class="youtube">
    <a
        class="youtube__link"
        target="_blank"
        href="https://www.youtube.com/watch?v=Hs8oR3xDokA&list=PLC8UWZPWDAiW-v0OtWMAHdnqDwx7kQ8K-&index=1&t=0"
    >
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
            padding: .5em 2em;
            border-radius: 2em;

            transform-origin: right bottom;
            background-color: #ff3e00;
            color: white;

            transition: transform 200ms;

            &:hover { transform: scale(1.2) }
        }
    }
</style>