<script>
    import { slide } from "svelte/transition";
    import { createEventDispatcher, onMount } from "svelte";
    import Button from "./Button.svelte";

    export let choicesObject = {};

    const dispatch = createEventDispatcher();
    const possibilities = Object.keys(choicesObject);

    let showFilters = false;
    let choices = possibilities.map((choice, i) => ({
        choice, selected: i === 0
    }));

    const handleClick = index => () => {
        const activeCount = choices.filter(choice => choice.selected).length;
        const choice = choices[index];
        if (activeCount <= 1 && choice.selected === true)
            return

        choice.selected = !choice.selected;
        choices = choices;
    };

    $: {
        const selectedChoices = choices.filter(({ selected }) => selected);
        const mappedChoices = selectedChoices.map(({ choice }) => choice)
        dispatch("change", mappedChoices);
    }

    onMount(() => {
        choices = choices;
    });
</script>

<div class="filters">
    <Button on:click={() => showFilters = !showFilters}>
        Show Filters
    </Button>
    {#if showFilters}
    <ul transition:slide class="filters__items">
        {#each choices as { choice, selected }, index}
        <li
            class="filters__item"
            class:-selected={selected}
            on:click={handleClick(index)}
        >
            {choice}
        </li>
        {/each}
    </ul>
    {/if}
</div>

<style lang="scss">
    .filters {
        position: fixed;

        top: 1em;
        left: 1em;

        &__items {
            padding: 1.5em;
            border-radius: .5em;
            box-shadow: 0 .5em 1.5em rgba(black, 0.15);

            background-color: white;
        }

        &__item {
            cursor: pointer;

            user-select: none;
            background-color: rgba(orange, .25);
            border: .15em solid transparent;

            padding: .25em 1em;
            border-radius: .25em;
            transform-origin: center left;

            transition-duration: 200ms;
            transition-property: background-color border-color transform color;

            &:not(:last-child) { margin-bottom: .5em }
            &:hover {
                background-color: transparent;
                border-color:  #ff3e00;
                transform: scale(1.05);
            }
            &:active { transform: scale(1) }

            &.-selected {
                background-color: #ff3e00;
                color: white;
            }
        }
    }
</style>