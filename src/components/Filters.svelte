<script>
    import { slide } from "svelte/transition";
    import { createEventDispatcher, onMount } from "svelte";
    import Button from "./Button.svelte";

    export let choicesObject = {};

    const dispatch = createEventDispatcher();
    const possibilities = Object.keys(choicesObject);

    let showFilters = false;
    let choices = possibilities.map((choice, i) => ({
        choice,
        ref: choicesObject[choice].ref,
        selected: i === 0,
    }));

    const handleClick = (index) => () => {
        const activeCount = choices.filter((choice) => choice.selected).length;
        const choice = choices[index];
        if (activeCount <= 1 && choice.selected === true) return;

        choice.selected = !choice.selected;
        choices = choices;
    };

    $: {
        const selectedChoices = choices.filter(({ selected }) => selected);
        const mappedChoices = selectedChoices.map(({ choice }) => choice);
        dispatch("change", mappedChoices);
    }

    onMount(() => {
        choices = choices;
    });
</script>

<div class="filters">
    <Button on:click={() => (showFilters = !showFilters)}>
        {showFilters ? 'Cacher' : 'Montrer'}
        les Filtres
    </Button>
    {#if showFilters}
        <ul transition:slide class="filters__items">
            {#each choices as { choice, selected, ref }, index}
                <li class="filters__item">
                    <a
                        class="filters__item--link"
                        class:disabled={ref === ""}
                        target="_blank"
                        href={ref}>
                       ︎ {ref === "" ? "❋" : "↩︎"}
                    </a>
                    <div
                        class="filters__item--button"
                        on:click={handleClick(index)}
                        class:-selected={selected}
                    >
                        {choice}
                    </div>
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

        z-index: 25;

        &__items {
            padding: 1.5em;
            border-radius: 0.5em;
            box-shadow: 0 0.5em 1.5em rgba(black, 0.15);

            background-color: white;
        }

        &__item {

            display: flex;
            align-items: center;

            &:not(:last-child) { margin-bottom: 0.5em; }

            &--button {
                cursor: pointer;

                user-select: none;
                background-color: rgba(orange, 0.25);
                border: 0.15em solid transparent;

                flex: 1;

                padding: 0.25em 1em;
                border-radius: 0.25em;
                transform-origin: center left;

                transition-duration: 200ms;
                transition-property:
                    background-color
                    border-color
                    transform
                    color;

                &:hover {
                    background-color: transparent;
                    border-color: #ff3e00;
                    transform: scale(1.05);
                }

                &:active { transform: scale(1); }

                &.-selected {
                    background-color: #ff3e00;
                    color: white;
                }
            }

            &--link {
                color: #ff3e00;
                margin-right: 1em;

                &.disabled {
                    pointer-events: none;
                    color: #DDD;
                }
            }
        }
    }
</style>