<script>
    import { slide } from "svelte/transition";

    export let choices = [];
    export let group;

    let showFilters = false;
</script>

<div class="filters">
    <button class="filters__btn" on:click={() => showFilters = !showFilters}>Show Filters</button>
    {#if showFilters}
    <ul transition:slide class="filters__items">
        {#each choices as choice}
        <li class="filters__item">
            <label>
                <input type="checkbox" bind:group value={choice}>
                {choice}
            </label>
        </li>
        {/each}
    </ul>
    {/if}
</div>

<style lang="scss">
    .filters {
        position: fixed;

        top: 0;
        left: 0;

        &__items {
            padding: 1.5em;
            border-radius: .5em;
            box-shadow: 0 .5em 1.5em rgba(black, 0.15);
        }

        &__item {
            cursor: pointer;

            border: .2em solid #ff3e00;

            padding: .25em 1em;
            border-radius: .25em;

            &:not(:last-child) { margin-bottom: .5em }
        }
    }
</style>