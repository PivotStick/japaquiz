<script>
    import { slide } from "svelte/transition";
    import Answer from "./Answer.svelte";

    export let data;

    let hidden = true;

    $: [lastAnswer, ...rest] = data;
</script>

<Answer answer={lastAnswer} />
{#if data.length > 1}
<button transition:slide on:click={() => hidden = !hidden}>
    {hidden
        ? "詳細「しょうさい」"
        : "隠す「かくす」"}
</button>
{/if}
{#if !hidden}
{#each rest as answer}
<Answer animate={false} answer={answer} />
{/each}
{/if}

<style lang="scss">
    button {
        cursor: pointer;

        color: #ff3e00;
        border: 2px solid currentColor;

        background: none;
        padding: .5em 2em;

        margin-top: 2em;
    }
</style>