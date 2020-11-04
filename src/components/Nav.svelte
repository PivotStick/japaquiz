<script>
    import { createEventDispatcher } from "svelte";

    export let currentLink;

    const dispatch = createEventDispatcher();
    const links = [
        { name: "Infinite Kana", link: "infinite" },
        { name: "Infinite Kanji", link: "kanji" },
    ];

    const handleClick = link => () => {
        isVisible = false;
        dispatch("change", { link });
    };

    $: filteredLinks = links.filter(({ link }) => link !== currentLink);

    let isVisible = false;
</script>

<nav class="nav">
    <button class="nav__button" on:click={() => isVisible = !isVisible}>
        {isVisible ? "Close" : "Open"}
    </button>
{#if isVisible}
    <ul class="nav__links">
        {#each filteredLinks as { name, link }}
        <li class="nav__link" on:click={handleClick(link)}>{name}</li>
        {/each}
    </ul>
{/if}
</nav>

<style lang="scss">
    .nav {
        position: fixed;

        top: 0;
        right: 0;

        &__button {
            position: absolute;

            top: 0;
            right: 0;
        }

        &__links {
            position: absolute;
            top: 3em;
            right: 0;
        }

        &__link {
            cursor: pointer;

            padding: 1em;
            background-color: rgba(orange, .25);
            border-radius: .5em;
        }
    }
</style>