<script>
    import { slide } from "svelte/transition";
    import { createEventDispatcher } from "svelte";

    export let currentLink;
    export let links = [];

    const dispatch = createEventDispatcher();

    const handleClick = link => () => {
        isVisible = false;
        dispatch("change", { link });
    };

    $: filteredLinks = links.filter(({ link }) => link !== currentLink);

    let isVisible = false;
</script>

<nav class="nav">
    <button class="nav__button" on:click={() => isVisible = !isVisible}>
        {isVisible ? "Close" : "Menu"}
    </button>
{#if isVisible}
    <ul transition:slide class="nav__links">
        {#each filteredLinks as { name, link }}
        <li class="nav__link" on:click={handleClick(link)}>{name}</li>
        {/each}
    </ul>
{/if}
</nav>

<style lang="scss">
    .nav {
        position: fixed;

        top: 1em;
        right: 1em;

        &__button {
            position: absolute;

            top: 0;
            right: 0;
        }

        &__links {
            position: absolute;
            top: 3em;
            right: 0;

            display: flex;
            flex-direction: column;
            align-items: flex-end;

            background-color: white;
            box-shadow: 0 .25em 1em rgba(orange, 0.25);
            padding: 1em;
            border-radius: 1em;
        }

        &__link {
            cursor: pointer;

            padding: .25em 1em;
            background-color: rgba(orange, .25);

            border: .15em solid transparent;
            border-radius: .5em;

            transform-origin: center right;

            transition-duration: 200ms;
            transition-property: border-color background-color transform;

            &:hover {
                border-color: currentColor;
                background-color: transparent;
                transform: scale(1.05);
            }

            &:active { transform: scale(1) }

            &:not(:last-child) { margin-bottom: .5em }
        }
    }
</style>